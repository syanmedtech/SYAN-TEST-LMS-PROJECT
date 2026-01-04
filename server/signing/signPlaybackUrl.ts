
import * as crypto from 'crypto';

interface SignParams {
  provider: 'gumlet' | 'generic';
  playbackBaseUrl: string;
  uid: string;
  videoId: string;
  expiresAt: number; // Unix timestamp in milliseconds
  allowedDomain?: string;
}

/**
 * signPlaybackUrl
 * Server-side module to generate short-lived, cryptographically signed playback URLs.
 * This prevents URL sharing and unauthorized access to premium medical video content.
 * 
 * Example Signed URL Formats:
 * Gumlet:  https://video.gumlet.io/assetId/index.m3u8?token=a1b2c3...&expires=1729850000&uid=user_123
 * Generic: https://cdn.syanmedical.com/vid_001.mp4?sig=e5f6g7...&expires=1729850000&uid=user_123
 */
export const signPlaybackUrl = (params: SignParams): string => {
  const { provider, playbackBaseUrl, uid, videoId, expiresAt } = params;
  
  if (!playbackBaseUrl) {
    throw new Error('Missing playbackBaseUrl');
  }

  const url = new URL(playbackBaseUrl);

  // 1. Gumlet-specific Signing Logic
  // Signature includes the URL path and essential query parameters
  if (provider === 'gumlet') {
    const key = process.env.GUMLET_SIGNING_KEY;
    if (!key) {
      throw new Error('Environment variable GUMLET_SIGNING_KEY is not defined.');
    }

    // Path includes the asset ID and file extension (e.g., /654321/index.m3u8)
    const path = url.pathname;
    
    // We sign the combination of path, expiry, and user identity
    const signPayload = `${path}?expires=${expiresAt}&uid=${uid}`;
    
    const token = crypto
      .createHmac('sha256', key)
      .update(signPayload)
      .digest('hex');

    url.searchParams.set('token', token);
    url.searchParams.set('expires', expiresAt.toString());
    url.searchParams.set('uid', uid);
  } 
  
  // 2. Generic HMAC Signing Logic
  // Used for custom CDNs or internal storage proxies
  else if (provider === 'generic') {
    const secret = process.env.GENERIC_SIGNING_SECRET;
    if (!secret) {
      throw new Error('Environment variable GENERIC_SIGNING_SECRET is not defined.');
    }

    // Strict payload: videoId + uid + expiry timestamp
    const signPayload = `${videoId}:${uid}:${expiresAt}`;
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signPayload)
      .digest('hex');

    url.searchParams.set('sig', signature);
    url.searchParams.set('expires', expiresAt.toString());
    url.searchParams.set('uid', uid);
    
    if (params.allowedDomain) {
      url.searchParams.set('domain', params.allowedDomain);
    }
  }

  return url.toString();
};

/**
 * STRICT VERIFICATION APPROACH (For use in Middleware/Edge Functions)
 * 
 * To verify a generic signed URL:
 * 1. Extract sig, expires, and uid from query params.
 * 2. Check if Date.now() > Number(expires). If so, 403 Expired.
 * 3. Re-calculate hmac('sha256', secret, videoId + ":" + uid + ":" + expires).
 * 4. Use crypto.timingSafeEqual to compare re-calculated signature with provided 'sig'.
 */
