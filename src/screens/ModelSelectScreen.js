import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Icon, GeminiLogo } from '../components/common';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { useModel, AVAILABLE_MODELS } from '../context/ModelContext';
import { COLORS, BORDER_RADIUS } from '../config/theme';

import { searchHuggingFaceModels, getModelFiles } from '../services/HuggingFaceService';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return 'Unknown Size';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getQuantizationLabel = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes('q4_k_m') || lower.includes('q5_k_m')) return { label: 'Recommended', color: COLORS.success };
  if (lower.includes('q2') || lower.includes('q3')) return { label: 'Fastest', color: COLORS.warning };
  if (lower.includes('q6') || lower.includes('q8')) return { label: 'High Quality', color: COLORS.brand[500] };
  return null;
};

export default function ModelSelectScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const {
    downloadModel,
    selectModel,
    deleteModel,
    stopDownload,
    isDownloading,
    currentDownloadId,
    downloadProgress,
    isModelDownloaded,
    selectedModel,
  } = useModel();
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [showHuggingFaceModal, setShowHuggingFaceModal] = useState(false);
  const [customModelUrl, setCustomModelUrl] = useState('');
  const [customModelName, setCustomModelName] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHfModel, setSelectedHfModel] = useState(null);
  const [modelFiles, setModelFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else if (searchQuery === '') {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setSelectedHfModel(null);
    try {
      const results = await searchHuggingFaceModels(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHfModelSelect = async (model) => {
    setSelectedHfModel(model);
    setIsLoadingFiles(true);
    try {
      const files = await getModelFiles(model.id);
      setModelFiles(files);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDownloadHfFile = async (file) => {
    // Construct model object for context
    const modelToDownload = {
      id: selectedHfModel.id + '-' + file.filename, // Unique ID
      name: selectedHfModel.name + ' (' + (file.filename.length > 20 ? '...' + file.filename.slice(-15) : file.filename) + ')',
      description: `Imported from ${selectedHfModel.id}`,
      size: formatBytes(file.size),
      sizeBytes: file.size,
      ramRequired: 'Unknown',
      quality: 3,
      speed: 3,
      recommended: false,
      downloadUrl: file.downloadUrl,
      filename: selectedHfModel.name + '_' + file.filename, // Local filename
    };

    setShowHuggingFaceModal(false);

    // Check if locally exists
    // (Logic simplified for brevity, ideally check existing downloads)

    try {
      await downloadModel(modelToDownload);
      Alert.alert('Download Started', `Downloading ${modelToDownload.name}. You can track progress in the main list.`);
    } catch (e) {
      Alert.alert('Error', 'Could not start download');
    }
  };

  const handleSelectModel = async (model) => {
    if (isModelDownloaded(model.id)) {
      await selectModel(model);
      navigation.goBack();
    } else {
      setSelectedModelId(model.id);
      try {
        await downloadModel(model);
        await selectModel(model);
        navigation.goBack();
      } catch (error) {
        Alert.alert('Download Failed', 'Please check your internet connection and try again.');
      }
    }
  };

  const handleStopDownload = () => {
    Alert.alert(
      'Stop Download',
      'Are you sure you want to cancel this download?',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Stop', style: 'destructive', onPress: () => stopDownload() },
      ]
    );
  };

  const handleDeleteModel = (model) => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete ${model.name}? You can download it again later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteModel(model.id) },
      ]
    );
  };

  // Filter models into sections
  const downloadedModels = AVAILABLE_MODELS.filter((m) => isModelDownloaded(m.id));
  const recommendedModels = AVAILABLE_MODELS.filter((m) => m.recommended && !isModelDownloaded(m.id));
  const otherModels = AVAILABLE_MODELS.filter((m) => !m.recommended && !isModelDownloaded(m.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={[COLORS.logoGradient.start, COLORS.logoGradient.middle, COLORS.logoGradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientIcon}
            >
              <Icon name="cpu" size={45} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>AI Models</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Download and manage AI models. All models run 100% offline on your device.
          </Text>
        </Animated.View>

        {/* Device Info */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={[styles.deviceInfo, { backgroundColor: colors.surface }]}
        >
          <Icon name="smartphone" size={20} color={COLORS.logoGradient.start} />
          <Text style={[styles.deviceInfoText, { color: colors.textSecondary }]}>
            Optimized for 4GB RAM devices
          </Text>
        </Animated.View>

        {/* Downloaded Models Section */}
        {downloadedModels.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250).duration(600)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Downloaded
              </Text>
              <View style={[styles.downloadedBadge, { backgroundColor: COLORS.success + '20' }]}>
                <Text style={[styles.downloadedBadgeText, { color: COLORS.success }]}>
                  {downloadedModels.length} model{downloadedModels.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {downloadedModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                colors={colors}
                isDownloaded={true}
                isSelected={selectedModel?.id === model.id}
                isDownloading={isDownloading && currentDownloadId === model.id}
                progress={downloadProgress[model.id] || 0}
                onSelect={() => handleSelectModel(model)}
                onDelete={() => handleDeleteModel(model)}
                onStopDownload={handleStopDownload}
              />
            ))}
          </Animated.View>
        )}

        {/* Hugging Face Custom Download */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
          <TouchableOpacity
            style={[styles.huggingFaceButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowHuggingFaceModal(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.huggingFaceIcon, { backgroundColor: '#FFD21E20' }]}>
              <Text style={styles.huggingFaceEmoji}>🤗</Text>
            </View>
            <View style={styles.huggingFaceInfo}>
              <Text style={[styles.huggingFaceName, { color: colors.text }]}>
                Import from Hugging Face
              </Text>
              <Text style={[styles.huggingFaceDesc, { color: colors.textSecondary }]}>
                Download any GGUF model with a custom URL
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Recommended Models */}
        {recommendedModels.length > 0 && (
          <Animated.View entering={FadeInUp.delay(350).duration(600)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recommended
            </Text>
            {recommendedModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                colors={colors}
                isDownloaded={false}
                isSelected={false}
                isDownloading={isDownloading && currentDownloadId === model.id}
                progress={downloadProgress[model.id] || 0}
                onSelect={() => handleSelectModel(model)}
                onStopDownload={handleStopDownload}
              />
            ))}
          </Animated.View>
        )}

        {/* Other Models */}
        {otherModels.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500).duration(600)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Other Models
            </Text>
            {otherModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                colors={colors}
                isDownloaded={false}
                isSelected={false}
                isDownloading={isDownloading && currentDownloadId === model.id}
                progress={downloadProgress[model.id] || 0}
                onSelect={() => handleSelectModel(model)}
                onStopDownload={handleStopDownload}
              />
            ))}
          </Animated.View>
        )}

        {/* Info Section */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={[styles.infoSection, { backgroundColor: colors.surface }]}
        >
          <Icon name="info" size={24} color={COLORS.logoGradient.start} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Models are downloaded once and stored locally. You can delete them
            to free up space anytime.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Hugging Face Modal */}
      <Modal
        visible={showHuggingFaceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHuggingFaceModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Full Screen Modal Content */}
          <View style={[styles.modalContent, { backgroundColor: colors.surface, flex: 1, maxHeight: '100%', marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: 40 }]}>
            <View style={styles.modalHeader}>
              {!selectedHfModel ? (
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Search Hugging Face
                </Text>
              ) : (
                <TouchableOpacity onPress={() => setSelectedHfModel(null)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="arrow-left" size={20} color={colors.text} />
                  <Text style={[styles.modalTitle, { color: colors.text, marginLeft: 8 }]}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowHuggingFaceModal(false)} style={styles.closeButton}>
                <Icon name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {!selectedHfModel ? (
              <>
                <View style={styles.searchContainer}>
                  <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Icon name="search" size={20} color={colors.textTertiary} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={[styles.modalSearchInput, { color: colors.text }]}
                      placeholder="Search models (e.g. llama, mistral)..."
                      placeholderTextColor={colors.textTertiary}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                    />
                    {isSearching ? (
                      <ActivityIndicator size="small" color={COLORS.logoGradient.start} style={{ marginRight: 12 }} />
                    ) : searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                        <Icon name="x-circle" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                  {searchResults.map(model => (
                    <TouchableOpacity
                      key={model.id}
                      style={[styles.searchResultCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => handleHfModelSelect(model)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.searchResultHeader}>
                        <View style={[styles.modelIconSmall, { backgroundColor: COLORS.logoGradient.start + '15' }]}>
                          <Text style={{ fontSize: 16 }}>🤗</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>{model.name}</Text>
                          <Text style={[styles.searchResultAuthor, { color: colors.textSecondary }]}>{model.author}</Text>
                        </View>
                      </View>
                      <View style={styles.searchResultStats}>
                        <View style={styles.statBadge}>
                          <Icon name="heart" size={12} color={COLORS.error} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>{model.likes.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statBadge}>
                          <Icon name="download" size={12} color={COLORS.success} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>{model.downloads.toLocaleString()}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {searchResults.length === 0 && !isSearching && searchQuery && (
                    <View style={styles.emptySearchState}>
                      <Icon name="search" size={48} color={colors.border} />
                      <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>No GGUF models found matching "{searchQuery}"</Text>
                    </View>
                  )}
                  {searchResults.length === 0 && !isSearching && !searchQuery && (
                    <View style={styles.emptySearchState}>
                      <View style={[styles.emptyIconBg, { backgroundColor: COLORS.logoGradient.start + '10' }]}>
                        <Icon name="globe" size={32} color={COLORS.logoGradient.start} />
                      </View>
                      <Text style={[styles.emptySearchTitle, { color: colors.text }]}>Explore Hugging Face</Text>
                      <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                        Search for thousands of community-created GGUF models directly from the Hugging Face Hub.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={[styles.selectedModelHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.selectedModelName, { color: colors.text }]}>{selectedHfModel.name}</Text>
                  <Text style={[styles.selectedModelId, { color: colors.textSecondary }]}>{selectedHfModel.id}</Text>
                </View>

                {isLoadingFiles ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyItems: 'center', paddingTop: 60 }}>
                    <ActivityIndicator size="large" color={COLORS.logoGradient.start} style={{ marginBottom: 16 }} />
                    <Text style={{ color: colors.textSecondary }}>Fetching file list...</Text>
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionSubtitle, { color: colors.text }]}>Select a Quantization</Text>
                    <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                      Lower quantizations (Q4_K_M) are faster and smaller. Higher (Q8_0) differ in quality.
                    </Text>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                      {modelFiles.map((file, idx) => {
                        const badge = getQuantizationLabel(file.filename);
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.fileCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => handleDownloadHfFile(file)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.fileIcon, { backgroundColor: colors.surface }]}>
                              <Icon name="file-text" size={20} color={colors.textSecondary} />
                            </View>
                            <View style={{ flex: 1, paddingRight: 12 }}>
                              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{file.filename}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatBytes(file.size)}</Text>
                                {badge && (
                                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: badge.color + '20', borderRadius: 4 }}>
                                    <Text style={{ color: badge.color, fontSize: 10, fontWeight: '700' }}>{badge.label}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <Icon name="download-cloud" size={20} color={COLORS.logoGradient.start} />
                          </TouchableOpacity>
                        );
                      })}
                      {modelFiles.length === 0 && (
                        <View style={styles.emptySearchState}>
                          <Icon name="alert-circle" size={48} color={colors.border} />
                          <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>No .gguf files found in this model repository.</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModelCard({
  model,
  index,
  colors,
  isDownloaded,
  isSelected,
  isDownloading,
  progress,
  onSelect,
  onDelete,
  onStopDownload,
}) {
  const qualityStars = Array(5).fill(0).map((_, i) => i < model.quality);
  const speedBars = Array(5).fill(0).map((_, i) => i < model.speed);

  return (
    <Animated.View entering={SlideInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity
        style={[
          styles.modelCard,
          { backgroundColor: colors.surface },
          isSelected && { borderColor: COLORS.logoGradient.start, borderWidth: 2 },
        ]}
        onPress={onSelect}
        disabled={isDownloading}
        activeOpacity={0.8}
      >
        {/* Model Icon */}
        <View style={[styles.modelIcon, { backgroundColor: COLORS.logoGradient.start + '20' }]}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={COLORS.logoGradient.start} />
          ) : (
            <Icon
              name={isDownloaded ? 'check-circle' : 'download-cloud'}
              size={24}
              color={isDownloaded ? COLORS.success : COLORS.logoGradient.start}
            />
          )}
        </View>

        {/* Model Info */}
        <View style={styles.modelInfo}>
          <View style={styles.modelHeader}>
            <Text style={[styles.modelName, { color: colors.text }]}>
              {model.name}
            </Text>
            {model.recommended && !isDownloaded && (
              <View style={[styles.badge, { backgroundColor: COLORS.logoGradient.start }]}>
                <Text style={styles.badgeText}>Best</Text>
              </View>
            )}
            {isSelected && (
              <View style={[styles.badge, { backgroundColor: COLORS.success }]}>
                <Text style={styles.badgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={[styles.modelDesc, { color: colors.textSecondary }]}>
            {model.description}
          </Text>

          {/* Specs */}
          <View style={styles.specs}>
            <View style={styles.specItem}>
              <Icon name="hard-drive" size={14} color={colors.textSecondary} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                {model.size}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="cpu" size={14} color={colors.textSecondary} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                {model.ramRequired} RAM
              </Text>
            </View>
          </View>

          {/* Ratings */}
          <View style={styles.ratings}>
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
                Quality:
              </Text>
              <View style={styles.stars}>
                {qualityStars.map((filled, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={12}
                    color={filled ? COLORS.warning : colors.border}
                  />
                ))}
              </View>
            </View>
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
                Speed:
              </Text>
              <View style={styles.stars}>
                {speedBars.map((filled, i) => (
                  <View
                    key={i}
                    style={[
                      styles.speedBar,
                      {
                        backgroundColor: filled
                          ? COLORS.success
                          : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Download Progress or Action */}
        <View style={styles.modelAction}>
          {isDownloading ? (
            <TouchableOpacity onPress={onStopDownload} style={styles.progressContainer}>
              <View style={styles.stopButton}>
                <Icon name="x" size={14} color={COLORS.error} />
              </View>
              <Text style={[styles.progressText, { color: COLORS.logoGradient.start }]}>
                {progress}%
              </Text>
            </TouchableOpacity>
          ) : isDownloaded ? (
            <View style={styles.downloadedActions}>
              <TouchableOpacity
                style={[styles.downloadedBadgeBtn, { backgroundColor: COLORS.success + '20' }]}
                onPress={onSelect}
              >
                <Text style={[styles.downloadedBtnText, { color: COLORS.success }]}>
                  {isSelected ? 'Active' : 'Use'}
                </Text>
              </TouchableOpacity>
              {onDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                  <Icon name="trash-2" size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradientIcon: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  deviceInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  downloadedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  downloadedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  huggingFaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  huggingFaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  huggingFaceEmoji: {
    fontSize: 24,
  },
  huggingFaceInfo: {
    flex: 1,
  },
  huggingFaceName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  huggingFaceDesc: {
    fontSize: 13,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modelIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modelInfo: {
    flex: 1,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  specs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratings: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabel: {
    fontSize: 11,
    marginRight: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  speedBar: {
    width: 6,
    height: 10,
    borderRadius: 2,
  },
  modelAction: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  stopButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B3020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  downloadedActions: {
    alignItems: 'center',
    gap: 8,
  },
  downloadedBadgeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  downloadedBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
  },
  searchResultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchResultHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modelIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  searchResultAuthor: {
    fontSize: 13,
  },
  searchResultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptySearchState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySearchText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedModelHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  selectedModelName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedModelId: {
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 16,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
});


// prakash 1/2/3/5