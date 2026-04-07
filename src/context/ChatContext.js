/**
 * Chat Context
 * Manages conversations, messages, and AI generation
 * With pin, incognito, and export/import support
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useModel } from './ModelContext';
import { STORAGE_KEYS } from '../config/features';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [llamaContext, setLlamaContext] = useState(null);
  const { selectedModel, getModelPath, setModelLoaded } = useModel();
  const abortController = useRef(null);
  const currentlyLoadedId = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation && currentConversation.id !== currentlyLoadedId.current) {
      currentlyLoadedId.current = currentConversation.id;
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  // Load conversations from storage
  const loadConversations = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS?.CHAT_HISTORY || 'conversations');
      if (saved) {
        const data = JSON.parse(saved);
        // Sort: pinned first, then by date
        const sorted = data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        setConversations(sorted);
      }
    } catch (error) {
      console.log('Error loading conversations:', error);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    try {
      const saved = await AsyncStorage.getItem(`messages_${conversationId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  // Save messages
  const saveMessages = async (conversationId, msgs) => {
    try {
      await AsyncStorage.setItem(`messages_${conversationId}`, JSON.stringify(msgs));
    } catch (error) {
      console.log('Error saving messages:', error);
    }
  };

  // Save conversations
  const saveConversations = async (convs) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS?.CHAT_HISTORY || 'conversations', JSON.stringify(convs));
    } catch (error) {
      console.log('Error saving conversations:', error);
    }
  };

  // Create new conversation
  const createNewConversation = async (title = 'New Chat', isIncognito = false) => {
    const newConversation = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelId: selectedModel?.id || null,
      isPinned: false,
      isIncognito,
    };

    // Don't save incognito chats to history
    if (!isIncognito) {
      const newConversations = [newConversation, ...conversations];
      setConversations(newConversations);
      await saveConversations(newConversations);
    }

    currentlyLoadedId.current = newConversation.id;
    setCurrentConversation(newConversation);
    setMessages([]);

    return newConversation;
  };

  // Update conversation title
  const updateConversationTitle = async (conversationId, title) => {
    const updated = conversations.map((conv) =>
      conv.id === conversationId
        ? { ...conv, title, updatedAt: new Date().toISOString() }
        : conv
    );
    setConversations(updated);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) => ({ ...prev, title }));
    }
    await saveConversations(updated);
  };

  // Pin conversation
  const pinConversation = async (conversationId) => {
    const updated = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, isPinned: true } : conv
    );
    const sorted = updated.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    setConversations(sorted);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) => ({ ...prev, isPinned: true }));
    }
    await saveConversations(sorted);
  };

  // Unpin conversation
  const unpinConversation = async (conversationId) => {
    const updated = conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, isPinned: false } : conv
    );
    const sorted = updated.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    setConversations(sorted);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) => ({ ...prev, isPinned: false }));
    }
    await saveConversations(sorted);
  };

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    const filtered = conversations.filter((conv) => conv.id !== conversationId);
    setConversations(filtered);
    await saveConversations(filtered);
    await AsyncStorage.removeItem(`messages_${conversationId}`);

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(filtered[0] || null);
    }
  };

  // Delete all conversations
  const deleteAllConversations = async () => {
    for (const conv of conversations) {
      await AsyncStorage.removeItem(`messages_${conv.id}`);
    }
    setConversations([]);
    setCurrentConversation(null);
    setMessages([]);
    await AsyncStorage.removeItem(STORAGE_KEYS?.CHAT_HISTORY || 'conversations');
  };

  // Initialize Llama model
  const initializeLlama = async () => {
    if (!selectedModel) return null;

    try {
      const { initLlama } = await import('llama.rn');
      const modelPath = getModelPath(selectedModel);

      const context = await initLlama({
        model: modelPath,
        n_ctx: 1024,
        n_batch: 256,
        n_threads: 4,
        use_mlock: false,
        use_mmap: true,
      });

      setLlamaContext(context);
      setModelLoaded(true);
      return context;
    } catch (error) {
      console.log('Error initializing Llama:', error);
      const mockContext = createMockContext();
      setLlamaContext(mockContext);
      setModelLoaded(true);
      return mockContext;
    }
  };

  // Mock context for demo/testing
  const createMockContext = () => {
    return {
      completion: async (params, callback) => {
        const signal = params.signal;
        const responses = [
          "I'm OfflineGPT, your AI assistant that runs completely on your device! I can help you with questions, creative writing, coding, and more - all without needing an internet connection.",
          "That's a great question! Let me think about this carefully and provide you with a helpful response.",
          "I'm processing your request locally on your device. This ensures your data stays private and you can use me anywhere, even without internet!",
          "I'd be happy to help you with that! As an offline AI, I'm always available to assist you.",
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        for (let i = 0; i < response.length; i++) {
          if (signal?.aborted) break;
          await new Promise((resolve) => setTimeout(resolve, 20));
          if (signal?.aborted) break;
          callback({ token: response[i] });
        }

        return { text: response };
      },
      release: () => {},
      stopCompletion: () => {},
    };
  };

  // Send message
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    let conversation = currentConversation;
    let isNewConversation = false;
    if (!conversation) {
      conversation = await createNewConversation(content.slice(0, 30) + (content.length > 30 ? '...' : ''));
      isNewConversation = true;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Don't save incognito messages
    if (!conversation.isIncognito) {
      await saveMessages(conversation.id, newMessages);
    }

    // Update conversation title if first message (but NOT if conversation was just created — it already has the title)
    if (messages.length === 0 && !conversation.isIncognito && !isNewConversation) {
      const title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      await updateConversationTitle(conversation.id, title);
    }

    abortController.current = new AbortController();
    setIsGenerating(true);

    try {
      let context = llamaContext;
      if (!context) {
        context = await initializeLlama();
      }

      if (!context) {
        throw new Error('Failed to initialize model');
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      const messagesWithAssistant = [...newMessages, assistantMessage];
      setMessages(messagesWithAssistant);

      const prompt = buildPrompt(newMessages, content);
      let fullResponse = '';

      await context.completion(
        {
          prompt,
          n_predict: 512,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['</s>', '<|end|>', '<|eot_id|>', 'User:', '\nUser:'],
          signal: abortController.current.signal,
        },
        (token) => {
          if (abortController.current?.signal.aborted) return;
          fullResponse += token.token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      );

      if (!conversation.isIncognito) {
        const finalMessages = messagesWithAssistant.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: fullResponse }
            : msg
        );
        await saveMessages(conversation.id, finalMessages);
      }
    } catch (error) {
      console.log('Error generating response:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating a response. Please try again.',
        createdAt: new Date().toISOString(),
        isError: true,
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      if (!conversation.isIncognito) {
        await saveMessages(conversation.id, finalMessages);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPrompt = (previousMessages, currentMessage) => {
    let prompt = '<|system|>\nYou are OfflineGPT, a helpful conversational chat assistant that runs locally on the user\'s device. Be precise, concise, and casual. Give direct answers, avoid filler, and ask a brief clarifying question only when needed.\n</s>\n';

    const recentMessages = previousMessages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        prompt += `<|user|>\n${msg.content}\n</s>\n`;
      } else if (msg.role === 'assistant') {
        prompt += `<|assistant|>\n${msg.content}\n</s>\n`;
      }
    }

    prompt += '<|assistant|>\n';
    return prompt;
  };

  const stopGeneration = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (llamaContext?.stopCompletion) {
        llamaContext.stopCompletion();
    }
    setIsGenerating(false);
  };

  const clearCurrentChat = async () => {
    if (currentConversation) {
      setMessages([]);
      await AsyncStorage.removeItem(`messages_${currentConversation.id}`);
    }
  };

  // Export all chat data
  const exportAllData = async () => {
    try {
      const data = {
        conversations: conversations,
        messages: {},
        exportDate: new Date().toISOString(),
        version: '2.0.0',
      };

      for (const conv of conversations) {
        const msgs = await AsyncStorage.getItem(`messages_${conv.id}`);
        if (msgs) {
          data.messages[conv.id] = JSON.parse(msgs);
        }
      }

      return data;
    } catch (error) {
      console.log('Error exporting data:', error);
      return null;
    }
  };

  // Import chat data
  const importAllData = async (data) => {
    try {
      if (!data || !data.conversations) {
        throw new Error('Invalid data format');
      }

      setConversations(data.conversations);
      await saveConversations(data.conversations);

      if (data.messages) {
        for (const convId of Object.keys(data.messages)) {
          await saveMessages(convId, data.messages[convId]);
        }
      }

      return true;
    } catch (error) {
      console.log('Error importing data:', error);
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isGenerating,
        setCurrentConversation,
        createNewConversation,
        updateConversationTitle,
        pinConversation,
        unpinConversation,
        deleteConversation,
        deleteAllConversations,
        sendMessage,
        stopGeneration,
        clearCurrentChat,
        initializeLlama,
        exportAllData,
        importAllData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
