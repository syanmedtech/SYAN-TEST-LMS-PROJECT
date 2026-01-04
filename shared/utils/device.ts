/**
 * Device Utilities for SYAN LMS
 * Provides reliable detection for mobile platforms and specific browser capabilities
 * to optimize video playback and touch interactions.
 */

export const isMobile = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  // Checks for touch capabilities as primary indicator
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Fallback to user agent for specific mobile browsers
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return hasCoarsePointer || isTouchDevice || isMobileUA;
};

export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad OS
};

export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const vendor = navigator.vendor || '';
  const agent = navigator.userAgent || '';
  return vendor.includes('Apple') && agent.includes('Safari') && !agent.includes('Chrome');
};

export const supportsPiP = (): boolean => {
  if (typeof document === 'undefined') return false;
  return !!document.pictureInPictureEnabled;
};

export const supportsAirPlay = (): boolean => {
  return (window as any).WebKitPlaybackTargetAvailabilityEvent !== undefined;
};

export const supportsCast = (): boolean => {
  // Check for basic Cast API existence if integrated
  return (window as any).chrome !== undefined && (window as any).chrome.cast !== undefined;
};

export const getDeviceData = () => ({
  mobile: isMobile(),
  ios: isIOS(),
  android: isAndroid(),
  safari: isSafari(),
  pip: supportsPiP(),
  airplay: supportsAirPlay(),
  cast: supportsCast()
});
