/**
 * Google Gemini API Service
 * Used for online tools (Smart Notes analysis, Translator, Email Templates, etc.)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../config/features';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-pro';

class GeminiApiService {
  constructor() {
    this.apiKey = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the service with stored API key
   */
  async initialize() {
    try {
      const storedKey = await AsyncStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
      if (storedKey) {
        this.apiKey = storedKey;
        this.isInitialized = true;
      }
      return this.isInitialized;
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      return false;
    }
  }

  /**
   * Set the API key
   */
  async setApiKey(key) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
      this.apiKey = key;
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  }

  /**
   * Clear the API key
   */
  async clearApiKey() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
      this.apiKey = null;
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Failed to clear API key:', error);
      return false;
    }
  }

  /**
   * Check if API is available
   */
  isAvailable() {
    return this.isInitialized && this.apiKey;
  }

  /**
   * Make a request to Gemini API
   */
  async generateContent(prompt, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API not configured. Please add your API key in settings.');
    }

    const {
      temperature = 0.7,
      maxOutputTokens = 2048,
      systemInstruction = null,
    } = options;

    try {
      const requestBody = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
          topK: 40,
          topP: 0.95,
        },
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(
        `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Translate text to a target language
   */
  async translate(text, targetLanguage, sourceLanguage = 'auto') {
    const prompt = sourceLanguage === 'auto'
      ? `Translate the following text to ${targetLanguage}. Only provide the translation, no explanations:\n\n${text}`
      : `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only provide the translation, no explanations:\n\n${text}`;

    return this.generateContent(prompt, {
      temperature: 0.3,
      systemInstruction: 'You are a professional translator. Provide accurate, natural translations.',
    });
  }

  /**
   * Generate email template
   */
  async generateEmailTemplate(type, context) {
    const prompt = `Generate a professional ${type} email based on the following context:
${context}

Provide a complete email with subject line and body. Format as:
Subject: [subject]

[email body]`;

    return this.generateContent(prompt, {
      temperature: 0.7,
      systemInstruction: 'You are an expert at writing professional emails. Keep emails concise and appropriate for the context.',
    });
  }

  /**
   * Extract structured data from notes (for Smart Notes)
   */
  async extractFromNotes(noteText) {
    const prompt = `Analyze the following note and extract any structured data. Look for:
- Tasks/To-dos (with any mentioned dates/deadlines)
- Expenses/Money amounts (with categories if mentioned)
- Events/Appointments (with dates/times)
- Reminders
- Health/Fitness data (workouts, calories, steps, etc.)

Return the data in JSON format:
{
  "tasks": [{"text": "...", "dueDate": "..." or null, "priority": "high/medium/low"}],
  "expenses": [{"amount": number, "description": "...", "category": "..."}],
  "events": [{"title": "...", "date": "...", "time": "..." or null}],
  "reminders": [{"text": "...", "datetime": "..." or null}],
  "fitness": [{"type": "workout/calories/steps/etc", "value": "...", "notes": "..."}]
}

If no data of a type is found, return an empty array for that type.

Note text:
${noteText}`;

    const response = await this.generateContent(prompt, {
      temperature: 0.3,
      systemInstruction: 'You are a data extraction assistant. Extract structured data accurately from notes. Return only valid JSON.',
    });

    try {
      // Try to parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { tasks: [], expenses: [], events: [], reminders: [], fitness: [] };
    } catch (error) {
      console.error('Failed to parse extracted data:', error);
      return { tasks: [], expenses: [], events: [], reminders: [], fitness: [] };
    }
  }

  /**
   * Summarize text
   */
  async summarize(text, maxLength = 200) {
    const prompt = `Summarize the following text in ${maxLength} words or less. Be concise but capture the key points:\n\n${text}`;

    return this.generateContent(prompt, {
      temperature: 0.5,
      systemInstruction: 'You are an expert summarizer. Create clear, concise summaries.',
    });
  }

  /**
   * Generate fitness advice
   */
  async getFitnessAdvice(data) {
    const prompt = `Based on the following fitness data, provide brief, actionable advice:
${JSON.stringify(data, null, 2)}

Keep the advice practical and encouraging. Limit to 2-3 key points.`;

    return this.generateContent(prompt, {
      temperature: 0.7,
      systemInstruction: 'You are a friendly fitness coach. Provide supportive, practical advice.',
    });
  }

  /**
   * Generate day plan suggestions
   */
  async suggestDayPlan(tasks, preferences = {}) {
    const prompt = `Based on these tasks and preferences, suggest an optimal daily schedule:

Tasks:
${JSON.stringify(tasks, null, 2)}

Preferences:
${JSON.stringify(preferences, null, 2)}

Provide a time-blocked schedule with brief explanations for the ordering.`;

    return this.generateContent(prompt, {
      temperature: 0.7,
      systemInstruction: 'You are a productivity expert. Create realistic, efficient schedules.',
    });
  }
}

// Export singleton instance
export const geminiApi = new GeminiApiService();
export default geminiApi;
