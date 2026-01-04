
import * as crypto from 'crypto';

/**
 * rewriteHlsPlaylist
 * Parses an M3U8 string and rewrites all relative URIs to point back through our proxy.
 * This ensures the player never sees the actual VOD origin domain.
 */
export const rewriteHlsPlaylist = (
  manifest: string, 
  sessionId: string, 
  proxyBaseUrl: string
): string => {
  const lines = manifest.split('\n');
  const rewritten = lines.map(line => {
    const trimmed = line.trim();
    
    // Ignore empty lines or metadata lines that don't contain URIs
    if (!trimmed || (trimmed.startsWith('#') && !trimmed.startsWith('#EXT-X-STREAM-INF') && !trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF'))) {
      return line;
    }

    // Handle URI lines (usually follow #EXTINF)
    if (!trimmed.startsWith('#')) {
      // If it's already an absolute URL, we proxy it
      // Otherwise, we treat it as a relative path
      return `${proxyBaseUrl}/${sessionId}/${trimmed}`;
    }

    // Handle playlist references in Master Manifests
    if (trimmed.startsWith('#EXT-X-STREAM-INF') || trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF')) {
      const uriMatch = trimmed.match(/URI="([^"]+)"/);
      if (uriMatch) {
        const originalUri = uriMatch[1];
        const proxiedUri = `${proxyBaseUrl}/${sessionId}/${originalUri}`;
        return line.replace(`URI="${originalUri}"`, `URI="${proxiedUri}"`);
      }
    }

    return line;
  });

  return rewritten.join('\n');
};

/**
 * generateUserAgentHash
 * Binds a sessionId to a specific device fingerprint to prevent token reuse across machines.
 */
export const generateUserAgentHash = (ua: string, uid: string): string => {
  return crypto
    .createHmac('sha256', process.env.SESSION_BINDING_SECRET || 'fallback_secret')
    .update(`${ua}:${uid}`)
    .digest('hex');
};

/**
 * getUpstreamUrl
 * Reconstructs the original VOD provider URL based on the proxied segment path.
 */
export const getUpstreamUrl = (baseSignedUrl: string, segmentPath: string): string => {
  const url = new URL(baseSignedUrl);
  const basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
  
  // Combine base path with segment relative path
  url.pathname = `${basePath}/${segmentPath}`;
  return url.toString();
};
