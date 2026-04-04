export const searchHuggingFaceModels = async (query) => {
    try {
        const response = await fetch(
            `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=gguf&limit=15&full=true`
        );

        if (!response.ok) {
            console.log('Search API returned status:', response.status);
            return [];
        }

        const data = await response.json();

        // Validate that data is an array before mapping
        if (!Array.isArray(data)) {
            console.log('Unexpected API response format:', typeof data);
            return [];
        }

        return data.map(model => ({
            id: model.id,
            name: model.id.split('/').pop(),
            author: model.author,
            likes: model.likes,
            downloads: model.downloads,
            tags: model.tags,
        }));
    } catch (error) {
        console.error('Error searching models:', error);
        return [];
    }
};

export const getModelFiles = async (modelId) => {
    try {
        // Use the tree API to get file sizes
        const response = await fetch(`https://huggingface.co/api/models/${modelId}/tree/main?recursive=true`);

        // If tree API fails (some models might not support main branch or have different structure), 
        // fall back or handle error. 
        if (!response.ok) {
            throw new Error('Failed to fetch model tree');
        }

        const data = await response.json();

        // Filter for .gguf files
        return data
            .filter(file => file.path.endsWith('.gguf'))
            .map(file => ({
                filename: file.path,
                downloadUrl: `https://huggingface.co/${modelId}/resolve/main/${file.path}`,
                size: file.size, // Size in bytes
            }))
            .sort((a, b) => {
                // Sort by name for consistency
                return a.filename.localeCompare(b.filename);
            });
    } catch (error) {
        console.error('Error getting model files:', error);
        // Fallback? Or just return empty.
        return [];
    }
};
