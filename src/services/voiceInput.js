/**
 * Voice Input Service
 * Speech-to-text functionality using expo-speech-recognition
 */

import { Audio } from 'expo-av';
import { Platform, Alert } from 'react-native';

class VoiceInputService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.hasPermission = false;
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return false;
    }
  }

  /**
   * Check if voice input is available
   */
  isAvailable() {
    return this.hasPermission;
  }

  /**
   * Start recording audio
   */
  async startRecording(onRecordingStatusUpdate) {
    try {
      if (!this.hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          Alert.alert('Permission Required', 'Microphone access is required for voice input');
          return false;
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        onRecordingStatusUpdate
      );

      this.recording = recording;
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and get the audio URI
   */
  async stopRecording() {
    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      this.recording = null;
      this.isRecording = false;

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Cancel current recording
   */
  async cancelRecording() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    } finally {
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Get recording status
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      hasPermission: this.hasPermission,
    };
  }
}

// Export singleton instance
export const voiceInput = new VoiceInputService();
export default voiceInput;
