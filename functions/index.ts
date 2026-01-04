
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { rewriteHlsPlaylist, generateUserAgentHash, getUpstreamUrl } from "../server/proxy/hlsProxy";
import { FEATURES } from "../config/features";

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * POST /api/video/playbackToken
 * Generates a sessionId bound to the user's environment.
 */
export const playbackToken = onRequest(async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return; }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).send("Unauthorized"); return; }

  const idToken = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    res.status(401).send("Unauthorized"); return;
  }

  const uid = decodedToken.uid;
  const { videoId } = req.body;
  const userAgent = req.headers["user-agent"] || "unknown";
  
  // Security: Capture the request origin for domain binding
  const origin = req.get('origin') || req.get('referer') || "";
  const allowedDomain = origin ? new URL(origin).hostname : "localhost";

  try {
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.subscription?.status !== "active") {
      res.status(403).send("Forbidden: Active subscription required"); return;
    }

    const videoDoc = await db.collection("videos").doc(videoId).get();
    if (!videoDoc.exists) { res.status(404).send("Not Found"); return; }
    
    const videoData = videoDoc.data()!;
    const playbackId = videoData.providerAssetId || videoData.gumletPlaybackId;
    const signingKey = process.env.VIDEO_SIGNING_KEY || "fallback_key";
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 Hour
    const sessionId = crypto.randomBytes(16).toString("hex");

    // Generate internal signed URL
    const cdnBase = process.env.CDN_BASE_URL || "https://video.gumlet.io";
    const rawPath = `/${playbackId}/index.m3u8`;
    const signature = crypto.createHmac("sha256", signingKey)
      .update(`${rawPath}${expiresAt}${uid}${sessionId}`).digest("hex");
    const upstreamUrl = `${cdnBase}${rawPath}?token=${signature}&expires=${expiresAt}&sid=${sessionId}`;

    // Session Binding Data
    const uaHash = generateUserAgentHash(userAgent, uid);
    
    // Optional: IP Hashing for additional binding if running behind a trusted proxy
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown";
    const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex');

    await db.collection("videoSessions").doc(sessionId).set({
      uid,
      videoId,
      userAgentHash: uaHash,
      ipHash,
      domain: allowedDomain,
      upstreamUrl,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    const proxyBase = `${req.protocol}://${req.get('host')}/stream`;
    const finalPlaybackUrl = FEATURES.videoProxyEnabled 
      ? `${proxyBase}/${sessionId}/index.m3u8`
      : upstreamUrl;

    res.json({
      playbackUrl: finalPlaybackUrl,
      expiresAt,
      watermarkText: decodedToken.email,
      sessionId
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * GET /stream/:sessionId/*
 * Validates session binding before proxying content.
 */
export const hlsProxy = onRequest(async (req, res) => {
  const parts = req.path.split('/').filter(Boolean);
  const sessionId = parts[0];
  const resourcePath = parts.slice(1).join('/');

  if (!sessionId || !resourcePath) { res.status(400).send("Invalid Request"); return; }

  try {
    const db = admin.firestore();
    const sessionDoc = await db.collection("videoSessions").doc(sessionId).get();
    const session = sessionDoc.data();

    if (!sessionDoc.exists || !session || !session.active || session.expiresAt < Date.now()) {
      res.status(403).send("Session expired or invalid"); return;
    }

    // 1. User Agent Binding Check
    const currentUaHash = generateUserAgentHash(req.headers["user-agent"] || "unknown", session.uid);
    if (currentUaHash !== session.userAgentHash) {
      await db.collection("violations").add({
        type: "VIDEO_SESSION_MISMATCH",
        userId: session.uid,
        sessionId,
        reason: "UA_HASH_MISMATCH",
        meta: { expected: session.userAgentHash, actual: currentUaHash },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(403).send("Security Check Failed: Device mismatch"); return;
    }

    // 2. Domain/Referer Binding Check
    const origin = req.get('origin') || req.get('referer') || "";
    const currentDomain = origin ? new URL(origin).hostname : "";
    if (currentDomain && session.domain && currentDomain !== session.domain) {
        await db.collection("violations").add({
            type: "VIDEO_DOMAIN_VIOLATION",
            userId: session.uid,
            sessionId,
            reason: "DOMAIN_MISMATCH",
            meta: { allowed: session.domain, actual: currentDomain },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(403).send("Security Check Failed: Domain unauthorized"); return;
    }

    const upstreamUrl = getUpstreamUrl(session.upstreamUrl, resourcePath);
    const upstreamRes = await fetch(upstreamUrl);

    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).send("Upstream error"); return;
    }

    const contentType = upstreamRes.headers.get("content-type") || "";

    if (resourcePath.endsWith(".m3u8") || contentType.includes("mpegurl")) {
      const manifest = await upstreamRes.text();
      const proxyBaseUrl = `${req.protocol}://${req.get('host')}/stream`;
      const rewritten = rewriteHlsPlaylist(manifest, sessionId, proxyBaseUrl);
      
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(rewritten);
    } else {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      
      const body = upstreamRes.body;
      if (body) {
        const reader = body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();
    }

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).send("Streaming Error");
  }
});
