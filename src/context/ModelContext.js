import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const ModelContext = createContext();

// Best models for 4GB RAM devices (ordered by quality/speed balance)
export const AVAILABLE_MODELS = [
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 2.5 0.5B',
    description: 'Ultra-fast, great for quick responses',
    size: '400 MB',
    sizeBytes: 400 * 1024 * 1024,
    ramRequired: '1 GB',
    quality: 3,
    speed: 5,
    recommended: true,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    filename: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
  },
  {
    id: 'smollm2-1.7b',
    name: 'SmolLM2 1.7B',
    description: 'Best balance of size and intelligence',
    size: '1.0 GB',
    sizeBytes: 1024 * 1024 * 1024,
    ramRequired: '2 GB',
    quality: 4,
    speed: 4,
    recommended: true,
    downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF/resolve/main/smollm2-1.7b-instruct-q4_k_m.gguf',
    filename: 'smollm2-1.7b-instruct-q4_k_m.gguf',
  },
  {
    id: 'llama3.2-1b',
    name: 'Llama 3.2 1B',
    description: 'Meta\'s mobile-optimized model',
    size: '700 MB',
    sizeBytes: 700 * 1024 * 1024,
    ramRequired: '1.5 GB',
    quality: 4,
    speed: 5,
    recommended: true,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'llama3.2-3b',
    name: 'Llama 3.2 3B',
    description: 'Higher quality, needs more RAM',
    size: '2.0 GB',
    sizeBytes: 2048 * 1024 * 1024,
    ramRequired: '3 GB',
    quality: 5,
    speed: 3,
    recommended: false,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'phi3-mini',
    name: 'Phi-3 Mini 3.8B',
    description: 'Microsoft\'s efficient reasoning model',
    size: '2.3 GB',
    sizeBytes: 2300 * 1024 * 1024,
    ramRequired: '3.5 GB',
    quality: 5,
    speed: 3,
    recommended: false,
    downloadUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
    filename: 'Phi-3-mini-4k-instruct-q4.gguf',
  },
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama 1.1B',
    description: 'Compact and fast for basic tasks',
    size: '700 MB',
    sizeBytes: 700 * 1024 * 1024,
    ramRequired: '1.5 GB',
    quality: 3,
    speed: 5,
    recommended: false,
    downloadUrl: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    filename: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
  },
  {
    id: 'gemma-2b',
    name: 'Gemma 2B',
    description: 'Google\'s lightweight open model',
    size: '1.5 GB',
    sizeBytes: 1500 * 1024 * 1024,
    ramRequired: '2.5 GB',
    quality: 4,
    speed: 4,
    recommended: false,
    downloadUrl: 'https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf',
    filename: 'gemma-2b-it-q4_k_m.gguf',
  },
];

export function ModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [downloadedModels, setDownloadedModels] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);
  const [downloadTask, setDownloadTask] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  const modelsDir = FileSystem.documentDirectory + 'models/';

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = async () => {
    try {
      // Ensure models directory exists
      const dirInfo = await FileSystem.getInfoAsync(modelsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelsDir, { intermediates: true });
      }

      // Load downloaded models list
      const savedModels = await AsyncStorage.getItem('downloadedModels');
      if (savedModels) {
        setDownloadedModels(JSON.parse(savedModels));
      }

      // Load selected model
      const savedSelected = await AsyncStorage.getItem('selectedModel');
      if (savedSelected) {
        setSelectedModel(JSON.parse(savedSelected));
      }
    } catch (error) {
      console.log('Error initializing models:', error);
    }
  };

  const downloadModel = async (model) => {
    try {
      setIsDownloading(true);
      setCurrentDownloadId(model.id);
      setDownloadProgress((prev) => ({ ...prev, [model.id]: 0 }));

      const downloadPath = modelsDir + model.filename;

      const downloadResumable = FileSystem.createDownloadResumable(
        model.downloadUrl,
        downloadPath,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress((prev) => ({
            ...prev,
            [model.id]: Math.round(progress * 100),
          }));
        }
      );

      setDownloadTask(downloadResumable);

      const { uri } = await downloadResumable.downloadAsync();

      // Add to downloaded models
      const newDownloaded = [...downloadedModels, model.id];
      setDownloadedModels(newDownloaded);
      await AsyncStorage.setItem('downloadedModels', JSON.stringify(newDownloaded));

      setIsDownloading(false);
      setCurrentDownloadId(null);
      setDownloadTask(null);
      setDownloadProgress((prev) => ({ ...prev, [model.id]: 100 }));

      return uri;
    } catch (error) {
      console.log('Error downloading model:', error);
      setIsDownloading(false);
      setCurrentDownloadId(null);
      setDownloadTask(null);
      setDownloadProgress((prev) => ({ ...prev, [model.id]: 0 }));
      throw error;
    }
  };

  const stopDownload = async () => {
    try {
      if (downloadTask) {
        await downloadTask.pauseAsync();
        // Clean up partial download
        if (currentDownloadId) {
          const model = AVAILABLE_MODELS.find((m) => m.id === currentDownloadId);
          if (model) {
            const downloadPath = modelsDir + model.filename;
            await FileSystem.deleteAsync(downloadPath, { idempotent: true });
          }
          setDownloadProgress((prev) => ({ ...prev, [currentDownloadId]: 0 }));
        }
      }
      setIsDownloading(false);
      setCurrentDownloadId(null);
      setDownloadTask(null);
    } catch (error) {
      console.log('Error stopping download:', error);
      setIsDownloading(false);
      setCurrentDownloadId(null);
      setDownloadTask(null);
    }
  };

  const selectModel = async (model) => {
    try {
      setSelectedModel(model);
      await AsyncStorage.setItem('selectedModel', JSON.stringify(model));
      setModelLoaded(false);
    } catch (error) {
      console.log('Error selecting model:', error);
    }
  };

  const deleteModel = async (modelId) => {
    try {
      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (model) {
        const modelPath = modelsDir + model.filename;
        await FileSystem.deleteAsync(modelPath, { idempotent: true });

        const newDownloaded = downloadedModels.filter((id) => id !== modelId);
        setDownloadedModels(newDownloaded);
        await AsyncStorage.setItem('downloadedModels', JSON.stringify(newDownloaded));

        if (selectedModel?.id === modelId) {
          setSelectedModel(null);
          await AsyncStorage.removeItem('selectedModel');
        }
      }
    } catch (error) {
      console.log('Error deleting model:', error);
    }
  };

  const getModelPath = (model) => {
    return modelsDir + model.filename;
  };

  const isModelDownloaded = (modelId) => {
    return downloadedModels.includes(modelId);
  };

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        downloadedModels,
        downloadProgress,
        isDownloading,
        currentDownloadId,
        modelLoaded,
        setModelLoaded,
        downloadModel,
        stopDownload,
        selectModel,
        deleteModel,
        getModelPath,
        isModelDownloaded,
        availableModels: AVAILABLE_MODELS,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}




// prakash 1/2/3/5/c