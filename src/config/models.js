/**
 * AI Models Configuration
 * Best models based on community feedback and benchmarks
 * Ordered by: Quality/Size ratio for 4GB RAM devices
 */

export const AVAILABLE_MODELS = [
  // TOP TIER - Best for most users
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M',
    description: 'Ultra-fast, surprisingly capable for its size',
    size: '240 MB',
    sizeBytes: 240 * 1024 * 1024,
    ramRequired: '512 MB',
    quality: 3,
    speed: 5,
    tier: 'nano',
    recommended: true,
    communityRating: 4.5,
    downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q8_0.gguf',
    filename: 'smollm2-360m-instruct-q8_0.gguf',
    features: ['Fast responses', 'Low memory', 'Basic tasks'],
  },
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 2.5 0.5B',
    description: 'Best tiny model, excellent quality',
    size: '400 MB',
    sizeBytes: 400 * 1024 * 1024,
    ramRequired: '1 GB',
    quality: 4,
    speed: 5,
    tier: 'lite',
    recommended: true,
    communityRating: 4.8,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    filename: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
    features: ['Smart responses', 'Code help', 'Multilingual'],
  },
  {
    id: 'llama3.2-1b',
    name: 'Llama 3.2 1B',
    description: 'Meta\'s latest mobile model',
    size: '700 MB',
    sizeBytes: 700 * 1024 * 1024,
    ramRequired: '1.5 GB',
    quality: 4,
    speed: 4,
    tier: 'lite',
    recommended: true,
    communityRating: 4.7,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    features: ['Reasoning', 'Following instructions', 'Natural chat'],
  },

  // MID TIER - Better quality, more RAM
  {
    id: 'smollm2-1.7b',
    name: 'SmolLM2 1.7B',
    description: 'Best balance of size and quality',
    size: '1.0 GB',
    sizeBytes: 1024 * 1024 * 1024,
    ramRequired: '2 GB',
    quality: 4,
    speed: 4,
    tier: 'standard',
    recommended: false,
    communityRating: 4.6,
    downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF/resolve/main/smollm2-1.7b-instruct-q4_k_m.gguf',
    filename: 'smollm2-1.7b-instruct-q4_k_m.gguf',
    features: ['Complex reasoning', 'Code generation', 'Creative writing'],
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen 2.5 1.5B',
    description: 'Excellent reasoning and coding',
    size: '1.1 GB',
    sizeBytes: 1100 * 1024 * 1024,
    ramRequired: '2 GB',
    quality: 5,
    speed: 4,
    tier: 'standard',
    recommended: false,
    communityRating: 4.8,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    filename: 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
    features: ['Math', 'Coding', 'Multilingual', 'Analysis'],
  },

  // PRO TIER - For 6GB+ RAM devices
  {
    id: 'llama3.2-3b',
    name: 'Llama 3.2 3B',
    description: 'High quality, needs more RAM',
    size: '2.0 GB',
    sizeBytes: 2048 * 1024 * 1024,
    ramRequired: '3 GB',
    quality: 5,
    speed: 3,
    tier: 'pro',
    recommended: false,
    communityRating: 4.7,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    filename: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    features: ['Complex tasks', 'Long context', 'Professional use'],
  },
  {
    id: 'phi3-mini',
    name: 'Phi-3 Mini',
    description: 'Microsoft\'s reasoning powerhouse',
    size: '2.3 GB',
    sizeBytes: 2300 * 1024 * 1024,
    ramRequired: '3.5 GB',
    quality: 5,
    speed: 3,
    tier: 'pro',
    recommended: false,
    isPremium: true,
    communityRating: 4.9,
    downloadUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
    filename: 'Phi-3-mini-4k-instruct-q4.gguf',
    features: ['Deep reasoning', 'Math', 'Science', 'Analysis'],
  },
];

// Get models by tier
export const getModelsByTier = (tier) => {
  return AVAILABLE_MODELS.filter((m) => m.tier === tier);
};

// Get recommended models
export const getRecommendedModels = () => {
  return AVAILABLE_MODELS.filter((m) => m.recommended);
};

// Get model by ID
export const getModelById = (id) => {
  return AVAILABLE_MODELS.find((m) => m.id === id);
};

// Model tiers for display
export const MODEL_TIERS = {
  nano: { name: 'Nano', description: 'For 2-3GB RAM', color: '#22c55e' },
  lite: { name: 'Lite', description: 'For 3-4GB RAM', color: '#3b82f6' },
  standard: { name: 'Standard', description: 'For 4-6GB RAM', color: '#8b5cf6' },
  pro: { name: 'Pro', description: 'For 6GB+ RAM', color: '#f59e0b' },
};
