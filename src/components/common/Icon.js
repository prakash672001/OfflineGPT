/**
 * Icon Component
 * Unified icon component using Lucide icons
 */

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../config/theme';

// Helper to convert kebab-case to PascalCase
// e.g. "edit-3" -> "Edit3", "arrow-left" -> "ArrowLeft"
const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const Icon = ({
  name,
  size = 24,
  color,
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const defaultColor = isDark ? COLORS.dark.icon : COLORS.light.icon;

  // Convert name and find icon
  // Handle edge cases where name might already be PascalCase or simple string
  const iconName = toPascalCase(name);
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    if (__DEV__) {
      console.warn(`Icon not found: ${name} (converted to: ${iconName})`);
    }
    // Return empty view or fallback to avoid crash
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color || defaultColor}
      style={style}
      {...props}
    />
  );
};

// Common icon presets for quick access
// These wrapper components ensure we can still import { Icons } elsewhere
export const Icons = {
  // Navigation
  Menu: (props) => <Icon name="menu" {...props} />,
  Back: (props) => <Icon name="arrow-left" {...props} />,
  Close: (props) => <Icon name="x" {...props} />,
  ChevronRight: (props) => <Icon name="chevron-right" {...props} />,
  ChevronDown: (props) => <Icon name="chevron-down" {...props} />,
  ChevronUp: (props) => <Icon name="chevron-up" {...props} />,

  // Actions
  Plus: (props) => <Icon name="plus" {...props} />,
  Send: (props) => <Icon name="send" {...props} />,
  Edit: (props) => <Icon name="edit-2" {...props} />,
  Delete: (props) => <Icon name="trash-2" {...props} />,
  Copy: (props) => <Icon name="copy" {...props} />,
  Share: (props) => <Icon name="share" {...props} />,
  Download: (props) => <Icon name="download" {...props} />,
  Upload: (props) => <Icon name="upload" {...props} />,
  Refresh: (props) => <Icon name="refresh-cw" {...props} />,
  Stop: (props) => <Icon name="square" {...props} />,

  // Chat
  Message: (props) => <Icon name="message-square" {...props} />,
  Mic: (props) => <Icon name="mic" {...props} />,
  MicOff: (props) => <Icon name="mic-off" {...props} />,
  Headphones: (props) => <Icon name="headphones" {...props} />,
  Volume: (props) => <Icon name="volume-2" {...props} />,

  // Media
  Camera: (props) => <Icon name="camera" {...props} />,
  Image: (props) => <Icon name="image" {...props} />,
  File: (props) => <Icon name="file-text" {...props} />,
  Video: (props) => <Icon name="video" {...props} />,

  // Status
  Check: (props) => <Icon name="check" {...props} />,
  CheckCircle: (props) => <Icon name="check-circle" {...props} />,
  AlertCircle: (props) => <Icon name="alert-circle" {...props} />,
  Info: (props) => <Icon name="info" {...props} />,
  Lock: (props) => <Icon name="lock" {...props} />,
  Unlock: (props) => <Icon name="unlock" {...props} />,

  // Settings
  Settings: (props) => <Icon name="settings" {...props} />,
  User: (props) => <Icon name="user" {...props} />,
  Users: (props) => <Icon name="users" {...props} />,
  Sun: (props) => <Icon name="sun" {...props} />,
  Moon: (props) => <Icon name="moon" {...props} />,
  Bell: (props) => <Icon name="bell" {...props} />,
  BellOff: (props) => <Icon name="bell-off" {...props} />,

  // Tools
  Calendar: (props) => <Icon name="calendar" {...props} />,
  Clock: (props) => <Icon name="clock" {...props} />,
  DollarSign: (props) => <Icon name="dollar-sign" {...props} />,
  Heart: (props) => <Icon name="heart" {...props} />,
  Mail: (props) => <Icon name="mail" {...props} />,
  Globe: (props) => <Icon name="globe" {...props} />,
  Search: (props) => <Icon name="search" {...props} />,
  Filter: (props) => <Icon name="filter" {...props} />,

  // AI
  Cpu: (props) => <Icon name="cpu" {...props} />,
  Zap: (props) => <Icon name="zap" {...props} />,
  Brain: (props) => <Icon name="activity" {...props} />, // Using activity as brain alternative
  Sparkles: (props) => <Icon name="star" {...props} />,

  // Network
  Wifi: (props) => <Icon name="wifi" {...props} />,
  WifiOff: (props) => <Icon name="wifi-off" {...props} />,
  Cloud: (props) => <Icon name="cloud" {...props} />,
  CloudOff: (props) => <Icon name="cloud-off" {...props} />,

  // Other
  Pin: (props) => <Icon name="bookmark" {...props} />,
  Incognito: (props) => <Icon name="eye-off" {...props} />,
  LogOut: (props) => <Icon name="log-out" {...props} />,
  ExternalLink: (props) => <Icon name="external-link" {...props} />,
  MoreVertical: (props) => <Icon name="more-vertical" {...props} />,
  MoreHorizontal: (props) => <Icon name="more-horizontal" {...props} />,
};

export default Icon;
