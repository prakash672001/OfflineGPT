/**
 * Document Reader Service
 * Read and extract text from various document types
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

// Supported document types
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/json': 'json',
  'text/csv': 'csv',
  'application/rtf': 'rtf',
};

class DocumentReaderService {
  /**
   * Pick a document and read its content
   */
  async pickAndReadDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/*',
          'application/pdf',
          'application/json',
          'application/rtf',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];
      return await this.readDocument(file.uri, file.mimeType, file.name);
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Error', 'Failed to pick document');
      return null;
    }
  }

  /**
   * Read document content from URI
   */
  async readDocument(uri, mimeType, fileName) {
    try {
      // For text-based files, read directly
      if (this.isTextFile(mimeType)) {
        const content = await FileSystem.readAsStringAsync(uri);
        return {
          success: true,
          content,
          fileName,
          mimeType,
          type: this.getDocType(mimeType),
        };
      }

      // For PDFs, we need to handle specially
      // Note: Full PDF parsing requires additional libraries
      // This is a basic implementation that returns a message
      if (mimeType === 'application/pdf') {
        return {
          success: true,
          content: `[PDF Document: ${fileName}]\n\nPDF text extraction requires the document to be processed. Please copy and paste the text content you want to discuss.`,
          fileName,
          mimeType,
          type: 'pdf',
          isPdf: true,
        };
      }

      return {
        success: false,
        error: 'Unsupported file type',
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('Failed to read document:', error);
      return {
        success: false,
        error: error.message,
        fileName,
        mimeType,
      };
    }
  }

  /**
   * Check if file is text-based
   */
  isTextFile(mimeType) {
    return (
      mimeType?.startsWith('text/') ||
      mimeType === 'application/json' ||
      mimeType === 'application/rtf'
    );
  }

  /**
   * Get document type from MIME type
   */
  getDocType(mimeType) {
    return SUPPORTED_TYPES[mimeType] || 'unknown';
  }

  /**
   * Parse JSON content
   */
  parseJson(content) {
    try {
      return {
        success: true,
        data: JSON.parse(content),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON',
      };
    }
  }

  /**
   * Parse CSV content into rows
   */
  parseCsv(content) {
    try {
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          rows.push(row);
        }
      }

      return {
        success: true,
        headers,
        rows,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse CSV',
      };
    }
  }

  /**
   * Summarize document content for preview
   */
  summarizeContent(content, maxLength = 500) {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Get word count
   */
  getWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get line count
   */
  getLineCount(content) {
    return content.split('\n').length;
  }

  /**
   * Get document stats
   */
  getDocumentStats(content) {
    return {
      characters: content.length,
      words: this.getWordCount(content),
      lines: this.getLineCount(content),
    };
  }
}

// Export singleton instance
export const documentReader = new DocumentReaderService();
export default documentReader;
