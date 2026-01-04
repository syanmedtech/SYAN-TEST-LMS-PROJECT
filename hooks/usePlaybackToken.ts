
import { useState, useEffect, useRef, useCallback } from 'react';

interface PlaybackData {
  url: string;
  watermark: string;
  expiresAt: number;
}

/**
 * usePlaybackToken
 * Manages secure video playback sessions by fetching short-lived signed URLs from the backend.
 * Implements automatic refresh 60 seconds before token expiration.
 */
export const usePlaybackToken = (videoId: string | undefined, idToken: string | null) => {
  const [data, setData] = useState<PlaybackData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  const fetchToken = useCallback(async () => {
    if (!videoId || !idToken) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/video/playbackToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Failed to authorize video playback');
      }

      const result = await response.json();
      
      // Store in memory only
      setData({
        url: result.playbackUrl,
        watermark: result.watermarkText,
        expiresAt: result.expiresAt
      });
      setError(null);

      // Schedule refresh: (Expiry - Now) - 60 seconds buffer
      const timeoutMs = (result.expiresAt - Date.now()) - 60000;
      
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => {
        fetchToken();
      }, Math.max(0, timeoutMs));

    } catch (err: any) {
      setError(err.message || 'Session expired or unauthorized');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, idToken]);

  useEffect(() => {
    if (videoId && idToken) {
      fetchToken();
    }
    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, [videoId, idToken, fetchToken]);

  return { 
    playbackUrl: data?.url, 
    watermarkText: data?.watermark, 
    isLoading, 
    error 
  };
};
