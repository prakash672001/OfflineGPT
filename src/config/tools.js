/**
 * Tools Configuration
 * All available tools in the app
 * Easy to enable/disable or add new tools
 */

import { FEATURES } from './features';
import { COLORS } from './theme';

export const TOOLS = [
  {
    id: 'smart_notes',
    name: 'Notes',
    description: 'AI extracts tasks, expenses & reminders from your notes',
    icon: 'edit-3',
    color: COLORS.tools.notes,
    screen: 'SmartNotes',
    enabled: FEATURES.SMART_NOTES,
    requiresInternet: false,
    isHub: true,
  },
  {
    id: 'day_planner',
    name: 'Planner',
    description: 'Track meetings, tasks & events',
    icon: 'calendar',
    color: COLORS.tools.planner,
    screen: 'DayPlanner',
    enabled: FEATURES.DAY_PLANNER,
    requiresInternet: false,
  },
  {
    id: 'money_tracker',
    name: 'Money',
    description: 'Track expenses with dashboard & export',
    icon: 'dollar-sign',
    color: COLORS.tools.money,
    screen: 'MoneyTracker',
    enabled: FEATURES.MONEY_TRACKER,
    requiresInternet: false,
  },
  {
    id: 'fitness_tracker',
    name: 'Fitness',
    description: 'Track workouts & health activities',
    icon: 'heart',
    color: COLORS.tools.fitness,
    screen: 'FitnessTracker',
    enabled: FEATURES.FITNESS_TRACKER,
    requiresInternet: false,
  },
  {
    id: 'email_templates',
    name: 'Email',
    description: 'AI generates email templates',
    icon: 'mail',
    color: COLORS.tools.email,
    screen: 'EmailTemplates',
    enabled: FEATURES.EMAIL_TEMPLATES,
    requiresInternet: true, // Uses Gemini for better quality
  },
  {
    id: 'notifications',
    name: 'Reminder',
    description: 'Set reminders & notifications',
    icon: 'bell',
    color: COLORS.tools.notifications,
    screen: 'Reminders',
    enabled: FEATURES.NOTIFICATIONS,
    requiresInternet: false,
  },
  {
    id: 'translator',
    name: 'Translate',
    description: 'Translate text between languages',
    icon: 'globe',
    color: COLORS.tools.translator,
    screen: 'Translator',
    enabled: FEATURES.TRANSLATOR,
    requiresInternet: true, // Uses Gemini for accuracy
  },
];

// Get enabled tools only
export const getEnabledTools = () => {
  return TOOLS.filter((tool) => tool.enabled);
};

// Get tools for landing page (max 8)
export const getLandingPageTools = () => {
  return getEnabledTools().slice(0, 8);
};

// Get tool by ID
export const getToolById = (id) => {
  return TOOLS.find((tool) => tool.id === id);
};

// Welcome suggestions for empty chat
export const WELCOME_SUGGESTIONS = [
  {
    text: 'Help me write an email',
    icon: 'mail',
  },
  {
    text: 'Explain a concept simply',
    icon: 'book-open',
  },
  {
    text: 'Generate creative ideas',
    icon: 'zap',
  },
  {
    text: 'Help me code something',
    icon: 'code',
  },
];

// Quick actions for chat input
export const INPUT_ACTIONS = [
  {
    id: 'camera',
    icon: 'camera',
    label: 'Take Photo',
    requiresPermission: true,
  },
  {
    id: 'image',
    icon: 'image',
    label: 'Upload Image',
    requiresPermission: true,
  },
  {
    id: 'document',
    icon: 'file-text',
    label: 'Upload Document',
    requiresPermission: true,
  },
  {
    id: 'mic',
    icon: 'mic',
    label: 'Voice Input',
    requiresPermission: true,
  },
];
