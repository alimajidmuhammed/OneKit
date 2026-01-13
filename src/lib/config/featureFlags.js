/**
 * Feature Flags Configuration
 * 
 * Use these flags to enable/disable features for A/B testing
 * or gradual rollout of new functionality.
 */

export const FEATURE_FLAGS = {
    // Growth & Marketing
    showReferralBanner: false, // TODO: Implement referral system
    enableNewPricingLayout: false, // TODO: Design new pricing page

    // User Experience
    showUsageInsights: true, // Show usage stats on dashboard
    enableDarkModeToggle: true, // Allow users to toggle dark mode

    // Performance
    enableLazyLoading: true, // Lazy load heavy editor components

    // Future Features
    enableTemplateMarketplace: false, // TODO: Build marketplace UI
    enableBulkOperations: false, // TODO: Implement CSV import
    enableRealTimeCollab: false, // TODO: WebSocket infrastructure
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature flag
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureName) => {
    return FEATURE_FLAGS[featureName] || false;
};

/**
 * Get all enabled features
 * @returns {string[]}
 */
export const getEnabledFeatures = () => {
    return Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key]);
};
