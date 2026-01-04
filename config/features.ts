
export interface FeatureFlags {
  packagesEnabled: boolean;
  aiTutorBeta: boolean;
  offlineMode: boolean;
  mockPapersEnabled: boolean;
  enforceQuizControls: boolean;
  notesTemplateEnabled: boolean;
  videoProxyEnabled: boolean;
}

/**
 * FEATURE FLAGS
 * Set packagesEnabled to true only when ready to switch the student-facing
 * pricing UI to the new "Packages" system implemented in the admin.
 */
export const FEATURES: FeatureFlags = {
  packagesEnabled: false, 
  aiTutorBeta: true,
  offlineMode: false,
  mockPapersEnabled: false, 
  enforceQuizControls: false, // Default: OFF (Anti-cheat & Navigation Enforcement)
  notesTemplateEnabled: false, // Default: OFF for clinical note templates
  videoProxyEnabled: true,     // Enable HLS proxy streaming
};
