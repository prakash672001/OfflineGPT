import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const ModelContext = createContext();

export const AVAILABLE_MODELS = [
  {
    id: 'gemma-2-2b-it-q4_k_m',
    name: 'Gemma 2 2B (Q4_K_M)',
    description: 'Lite - Fast, efficient general purpose model (Safe for 4GB)',
    size: '1.63 GB',
    sizeBytes: 1.63 * 1024 * 1024 * 1024,
    ramRequired: '4 GB',
    category: 'Lite',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    filename: 'gemma-2-2b-it-Q4_K_M.gguf',
  },
  {
    id: 'llama-3.2-3b-q4_k_m',
    name: 'LLaMA 3.2 3B (Q4_K_M)',
    description: 'Pro - Balanced for mid-range CPU (Safe for 6GB)',
    size: '1.95 GB',
    sizeBytes: 1.95 * 1024 * 1024 * 1024,
    ramRequired: '6 GB',
    category: 'Pro',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'gemma-2-2b-it-q6_k',
    name: 'Gemma 2 2B (Q6_K)',
    description: 'Pro Max - High precision logic (Borderline heat)',
    size: '2.15 GB',
    sizeBytes: 2.15 * 1024 * 1024 * 1024,
    ramRequired: '8 GB',
    category: 'Pro Max',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q6_K.gguf',
    filename: 'gemma-2-2b-it-Q6_K.gguf',
  },
  {
    id: 'llama-3.2-3b-q6_k',
    name: 'LLaMA 3.2 3B (Q6_K)',
    description: 'Thinking - Very smooth high-end SWE sweet spot',
    size: '2.64 GB',
    sizeBytes: 2.64 * 1024 * 1024 * 1024,
    ramRequired: '12 GB',
    category: 'Thinking',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q6_K.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q6_K.gguf',
  },
  {
    id: 'phi-3.5-mini-q6_k',
    name: 'Phi-3.5 Mini 3.8B (Q6_K)',
    description: 'Ultra Thinking - Top tier native reasoning and coding',
    size: '3.10 GB',
    sizeBytes: 3.10 * 1024 * 1024 * 1024,
    ramRequired: '16 GB',
    category: 'Ultra Thinking',
    downloadUrl: 'https://huggingface.co/MaziyarPanahi/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct.Q6_K.gguf',
    filename: 'Phi-3.5-mini-instruct.Q6_K.gguf',
  },
];

export const DOWNLOADABLE_MODELS = [
  // 4GB RAM Tier
  {
    id: 'llama-3.2-1b-q4_k_m',
    name: 'LLaMA 3.2 1B (Q4_K_M)',
    size: '0.80 GB',
    ramRequired: '4 GB',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'tinyllama-1.1b-q4_k_m',
    name: 'TinyLLaMA 1.1B (Q4_K_M)',
    size: '0.68 GB',
    ramRequired: '4 GB',
    downloadUrl: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    filename: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
  },
  {
    id: 'phi-2-2.7b-q4_k_m',
    name: 'Phi-2 2.7B (Q4_K_M)',
    size: '1.66 GB',
    ramRequired: '4 GB',
    downloadUrl: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf',
    filename: 'phi-2.Q4_K_M.gguf',
  },
  // 6GB RAM Tier
  {
    id: 'gemma-2-2b-it-q4_k_m-6gb',
    name: 'Gemma 2 2B (Q4_K_M)',
    size: '1.63 GB',
    ramRequired: '6 GB',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    filename: 'gemma-2-2b-it-Q4_K_M.gguf',
  },
  {
    id: 'phi-2-2.7b-q4_k_m-6gb',
    name: 'Phi-2 2.7B (Q4_K_M)',
    size: '1.66 GB',
    ramRequired: '6 GB',
    downloadUrl: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf',
    filename: 'phi-2.Q4_K_M.gguf',
  },
  {
    id: 'qwen-2.5-1.5b-q4_k_m',
    name: 'Qwen 2.5 1.5B (Q4_K_M)',
    size: '1.10 GB',
    ramRequired: '6 GB',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    filename: 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
  },
  // 8GB RAM Tier
  {
    id: 'llama-3.2-3b-q4_k_m-8gb',
    name: 'LLaMA 3.2 3B (Q4_K_M)',
    size: '1.95 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'phi-2-2.7b-q6_k',
    name: 'Phi-2 2.7B (Q6_K)',
    size: '2.28 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q6_K.gguf',
    filename: 'phi-2.Q6_K.gguf',
  },
  {
    id: 'qwen-2.5-3b-q4_k_m',
    name: 'Qwen 2.5 3B (Q4_K_M)',
    size: '1.90 GB',
    ramRequired: '8 GB',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf',
    filename: 'qwen2.5-3b-instruct-q4_k_m.gguf',
  },
  // 12GB RAM Tier
  {
    id: 'gemma-2-2b-it-q8_0',
    name: 'Gemma 2 2B (Q8_0)',
    size: '2.80 GB',
    ramRequired: '12 GB',
    downloadUrl: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q8_0.gguf',
    filename: 'gemma-2-2b-it-Q8_0.gguf',
  },
  {
    id: 'qwen-2.5-3b-q6_k',
    name: 'Qwen 2.5 3B (Q6_K)',
    size: '2.53 GB',
    ramRequired: '12 GB',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q6_k.gguf',
    filename: 'qwen2.5-3b-instruct-q6_k.gguf',
  },
  {
    id: 'phi-2-2.7b-q8_0',
    name: 'Phi-2 2.7B (Q8_0)',
    size: '2.96 GB',
    ramRequired: '12 GB',
    downloadUrl: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q8_0.gguf',
    filename: 'phi-2.Q8_0.gguf',
  },
  // 16GB RAM Tier
  {
    id: 'llama-3.2-3b-q6_k-16gb',
    name: 'LLaMA 3.2 3B (Q6_K)',
    size: '2.64 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q6_K.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q6_K.gguf',
  },
  {
    id: 'llama-3.1-8b-q4_k_m',
    name: 'LLaMA 3.1 8B (Q4_K_M)',
    size: '4.90 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    filename: 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
  },
  {
    id: 'qwen-2.5-7b-q4_k_m',
    name: 'Qwen 2.5 7B (Q4_K_M)',
    size: '4.50 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf',
    filename: 'Qwen2.5-7B-Instruct-Q4_K_M.gguf',
  },
  // Experimental Models
  {
    id: 'gemma-3n-e2b-q8_0',
    name: 'Gemma 3n E2B (Q8_0)',
    size: '4.46 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/ggml-org/gemma-3n-E2B-it-GGUF/resolve/main/gemma-3n-E2B-it-Q8_0.gguf',
    filename: 'gemma-3n-E2B-it-Q8_0.gguf',
  },
  {
    id: 'gemma-3n-e4b-q4_k_m',
    name: 'Gemma 3n E4B (Q4_K_M)',
    size: '4.23 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-3n-E4B-it-GGUF/resolve/main/gemma-3n-E4B-it-Q4_K_M.gguf',
    filename: 'gemma-3n-E4B-it-Q4_K_M.gguf',
  },
  {
    id: 'gemma-4-e2b-q6_k',
    name: 'Gemma 4 E2B (Q6_K)',
    size: '4.19 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q6_K.gguf',
    filename: 'gemma-4-E2B-it-Q6_K.gguf',
  },
  {
    id: 'gemma-4-e4b-q4_k_m',
    name: 'Gemma 4 E4B (Q4_K_M)',
    size: '4.64 GB',
    ramRequired: '16 GB',
    downloadUrl: 'https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf',
    filename: 'gemma-4-E4B-it-Q4_K_M.gguf',
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

      const result = await downloadResumable.downloadAsync();

      if (!result) {
        // Expo downloadAsync can return null/undefined when cancelled
        throw new Error('Download was canceled');
      }

      const { uri, status } = result;

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
      
      // If the error is due to cancellation, just return normally
      if (error && error.message && error.message.toLowerCase().includes('cancel')) {
        console.log('Download was intentionally canceled.');
        return null; // Return null to indicate it didn't complete, without throwing an alert
      }

      throw error;
    }
  };

  const stopDownload = async () => {
    try {
      if (downloadTask) {
        // Save the ID before cancelling, because cancelling might immediately trigger the catch block in downloadModel
        const idToCancel = currentDownloadId;
        
        try {
          await downloadTask.cancelAsync();
        } catch (cancelError) {
          console.log('Cancel async threw: ', cancelError);
        }

        // Clean up partial download reliably
        if (idToCancel) {
          let model = AVAILABLE_MODELS.find((m) => m.id === idToCancel) || 
                      DOWNLOADABLE_MODELS.find((m) => m.id === idToCancel) ||
                      customModels.find((m) => m.id === idToCancel);

          if (model) {
            const downloadPath = modelsDir + model.filename;
            try {
              const fileInfo = await FileSystem.getInfoAsync(downloadPath);
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(downloadPath, { idempotent: true });
                console.log(`Successfully deleted partial download file for ${model.name}`);
              }
            } catch (err) {
              console.log('Error deleting partial download file:', err);
            }
          }
          setDownloadProgress((prev) => ({ ...prev, [idToCancel]: 0 }));
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