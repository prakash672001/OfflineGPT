/**
 * Feature Flags Configuration
 * Toggle features on/off easily for different builds
 * Set to false to disable/comment out any tool
 */

export const FEATURES = {
  // Core Features (Always enabled)
  OFFLINE_CHAT: true,
  CHAT_HISTORY: true,
  INCOGNITO_MODE: true,

  // Input Methods
  VOICE_INPUT: true,
  DOCUMENT_INPUT: true,
  CAMERA_INPUT: true,

  // Tools - Set to false to disable any tool
  TOOLS_ENABLED: true,
  SMART_NOTES: true,
  DAY_PLANNER: true,
  MONEY_TRACKER: true,
  FITNESS_TRACKER: true,
  EMAIL_TEMPLATES: true,
  NOTIFICATIONS: true,
  TRANSLATOR: true,

  // Online Features (requires internet)
  GEMINI_API: true,
  GOOGLE_AUTH: true,

  // Premium Features
  PREMIUM_MODELS: true,
  CLOUD_SYNC: false, // Future feature
};

// API Configuration
export const API_CONFIG = {
  GEMINI_API_KEY: '', // User will add their key in settings
  GEMINI_MODEL: 'gemini-1.5-flash', // Free tier model
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: '@offlinegpt_user',
  SETTINGS: '@offlinegpt_settings',
  CHAT_HISTORY: '@offlinegpt_chats',
  TOOLS_DATA: '@offlinegpt_tools',
  ONBOARDING: '@offlinegpt_onboarded',
  SELECTED_MODEL: '@offlinegpt_model',
  DOWNLOADED_MODELS: '@offlinegpt_downloaded',
  NOTES: '@offlinegpt_notes',
  PLANNER: '@offlinegpt_planner',
  EXPENSES: '@offlinegpt_expenses',
  FITNESS: '@offlinegpt_fitness',
  REMINDERS: '@offlinegpt_reminders',
};

// App Info
export const APP_INFO = {
  NAME: 'OfflineGPT',
  VERSION: '2.0.0',
  BUILD: '1',
};
