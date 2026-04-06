import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const ModelContext = createContext();

export const AVAILABLE_MODELS = [
  {
    id: 'llama-3.2-3b-instruct',
    name: 'Llama-3.2-3B-Instruct (Q6_K)',
    description: 'Lite - Fast, efficient general purpose model',
    size: '2.64 GB',
    sizeBytes: 2.64 * 1024 * 1024 * 1024,
    ramRequired: '4 GB',
    quality: 4,
    speed: 5,
    recommended: true,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q6_K.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q6_K.gguf',
    category: 'Lite',
  },
  {
    id: 'phi-3.5-mini-instruct',
    name: 'Phi-3.5-mini-instruct (Q4_K_M)',
    description: 'Pro - Microsoft\'s highly capable reasoning model',
    size: '2.39 GB',
    sizeBytes: 2.39 * 1024 * 1024 * 1024,
    ramRequired: '4 GB',
    quality: 4,
    speed: 4,
    recommended: true,
    downloadUrl: 'https://huggingface.co/MaziyarPanahi/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct.Q4_K_M.gguf',
    filename: 'Phi-3.5-mini-instruct.Q4_K_M.gguf',
    category: 'Pro',
  },
  {
    id: 'qwen2.5-3b-instruct',
    name: 'Qwen2.5-3B-Instruct (Q5_K_M)',
    description: 'Thinking - Advanced reasoning and coding capabilities',
    size: '2.44 GB',
    sizeBytes: 2.44 * 1024 * 1024 * 1024,
    ramRequired: '4 GB',
    quality: 5,
    speed: 3,
    recommended: true,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q5_k_m.gguf',
    filename: 'qwen2.5-3b-instruct-q5_k_m.gguf',
    category: 'Thinking',
  },
];

export const DOWNLOADABLE_MODELS = [
  {
    id: 'smolvlm-500m-instruct-q8',
    name: 'SmolVLM-500M-Instruct (Q8_0)',
    size: '436.81 MB',
    ramRequired: '2 GB',
    downloadUrl: 'https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF/resolve/main/SmolVLM-500M-Instruct-Q8_0.gguf',
    filename: 'SmolVLM-500M-Instruct-Q8_0.gguf',
  },
  {
    id: 'llama-3.2-1b-instruct-q8',
    name: 'Llama-3.2-1B-Instruct (Q8_0)',
    size: '1.32 GB',
    ramRequired: '2 GB',
    downloadUrl: 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF/resolve/main/llama-3.2-1b-instruct-q8_0.gguf',
    filename: 'llama-3.2-1b-instruct-q8_0.gguf',
  },
  {
    id: 'qwen2.5-1.5b-instruct-q8',
    name: 'Qwen2.5-1.5B-Instruct (Q8_0)',
    size: '1.80 GB',
    ramRequired: '2 GB',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q8_0.gguf',
    filename: 'qwen2.5-1.5b-instruct-q8_0.gguf',
  },
  {
    id: 'smollm2-1.7b-instruct-q8',
    name: 'SmolLM2-1.7B-Instruct (Q8_0)',
    size: '1.82 GB',
    ramRequired: '2 GB',
    downloadUrl: 'https://huggingface.co/bartowski/SmolLM2-1.7B-Instruct-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Q8_0.gguf',
    filename: 'SmolLM2-1.7B-Instruct-Q8_0.gguf',
  },
  {
    id: 'gemma-2-2b-it-q6',
    name: 'Gemma-2-2B-it (Q6_K)',
    size: '2.15 GB',
    ramRequired: '4 GB',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q6_K.gguf',
    filename: 'gemma-2-2b-it-Q6_K.gguf',
  },
  {
    id: 'gemmasutra-mini-2b-v1-q6',
    name: 'Gemmasutra-Mini-2B-v1 (Q6_K)',
    size: '2.15 GB',
    ramRequired: '4 GB',
    downloadUrl: 'https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1-GGUF/resolve/main/Gemmasutra-Mini-2B-v1-Q6_K.gguf',
    filename: 'Gemmasutra-Mini-2B-v1-Q6_K.gguf',
  },
  {
    id: 'gemma-4-e2b-it',
    name: 'Gemma 4 E2B (Q6_K)',
    size: '4.19 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q6_K.gguf',
    filename: 'gemma-4-E2B-it-Q6_K.gguf',
  },
  {
    id: 'gemma-3n-e4b-it',
    name: 'Gemma 3n E4B (Q4_K_M)',
    size: '4.23 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-3n-E4B-it-GGUF/resolve/main/gemma-3n-E4B-it-Q4_K_M.gguf',
    filename: 'gemma-3n-E4B-it-Q4_K_M.gguf',
  },
  {
    id: 'gemma-3n-e2b-it',
    name: 'Gemma 3n E2B (Q8_0)',
    size: '4.46 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-3n-E2B-it-GGUF/resolve/main/gemma-3n-E2B-it-Q8_0.gguf',
    filename: 'gemma-3n-E2B-it-Q8_0.gguf',
  },
  {
    id: 'gemma-2-9b-it-q4',
    name: 'Gemma-2-9B-it (Q4_K_M)',
    size: '5.62 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-9b-it-GGUF/resolve/main/gemma-2-9b-it-Q4_K_M.gguf',
    filename: 'gemma-2-9b-it-Q4_K_M.gguf',
  },
  {
    id: 'gemma-4-e4b-it',
    name: 'Gemma 4 E4B (Q4_K_M)',
    size: '4.64 GB',
    ramRequired: '12 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf',
    filename: 'gemma-4-e4b-it-Q4_K_M.gguf',
  }
];

export function ModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [downloadedModels, setDownloadedModels] = useState([]);
  const [customModels, setCustomModels] = useState([]);
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

      // Load custom models
      const savedCustomModels = await AsyncStorage.getItem('customModels');
      if (savedCustomModels) {
        setCustomModels(JSON.parse(savedCustomModels));
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

      const { uri, status } = await downloadResumable.downloadAsync();

      if (status !== 200) {
        await FileSystem.deleteAsync(downloadPath, { idempotent: true });
        throw new Error(`Download failed with status ${status}`);
      }

      // Add to downloaded models
      const newDownloaded = [...downloadedModels, model.id];
      setDownloadedModels(newDownloaded);
      await AsyncStorage.setItem('downloadedModels', JSON.stringify(newDownloaded));

      // If it's a custom model (not in AVAILABLE_MODELS), save it in customModels
      const isBuiltIn = AVAILABLE_MODELS.some(m => m.id === model.id);
      if (!isBuiltIn) {
        const isAlreadyCustom = customModels.some(m => m.id === model.id);
        if (!isAlreadyCustom) {
          const newCustoms = [...customModels, model];
          setCustomModels(newCustoms);
          await AsyncStorage.setItem('customModels', JSON.stringify(newCustoms));
        }
      }

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
        await downloadTask.cancelAsync();
        // Clean up partial download
        if (currentDownloadId) {
          let model = AVAILABLE_MODELS.find((m) => m.id === currentDownloadId);
          if (!model) {
            model = DOWNLOADABLE_MODELS.find((m) => m.id === currentDownloadId);
          }
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
      let model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!model) {
        model = customModels.find((m) => m.id === modelId);
      }
      
      if (model) {
        const modelPath = modelsDir + model.filename;
        await FileSystem.deleteAsync(modelPath, { idempotent: true });

        const newDownloaded = downloadedModels.filter((id) => id !== modelId);
        setDownloadedModels(newDownloaded);
        await AsyncStorage.setItem('downloadedModels', JSON.stringify(newDownloaded));

        if (!AVAILABLE_MODELS.some(m => m.id === modelId)) {
          const newCustoms = customModels.filter(m => m.id !== modelId);
          setCustomModels(newCustoms);
          await AsyncStorage.setItem('customModels', JSON.stringify(newCustoms));
        }

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
        customModels,
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