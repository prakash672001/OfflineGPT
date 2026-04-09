import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/common';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useModel } from '../context/ModelContext';

const formatBytes = (bytesStr) => {
  return bytesStr; // Since model.size is already formatted like "2.64 GB"
};

export default function ModelSelectScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const insets = useSafeAreaInsets();
  
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
    availableModels,
    customModels = [],
  } = useModel();

  const handleSelectModel = async (model) => {
    if (isModelDownloaded(model.id)) {
      await selectModel(model);
      navigation.goBack();
    } else {
      Alert.alert(
        'Not Installed',
        `Please download ${model.name} before selecting it.`,
        [{ text: 'OK' }]
      );
    }
  };

  const startDownload = async (model) => {
    try {
      await downloadModel(model);
    } catch (error) {
      Alert.alert('Download Failed', error.message || 'Please check your internet connection.');
    }
  };

  const handleStopDownload = () => {
    stopDownload();
  };

  const handleDeleteModel = (model) => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete ${model.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteModel(model.id) },
      ]
    );
  };

  const liteModels = availableModels.filter(m => m.category === 'Lite');
  const proModels = availableModels.filter(m => m.category === 'Pro');
  const proMaxModels = availableModels.filter(m => m.category === 'Pro Max');
  const thinkingModels = availableModels.filter(m => m.category === 'Thinking');
  const ultraThinkingModels = availableModels.filter(m => m.category === 'Ultra Thinking');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Model Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Lite Models</Text>
          {liteModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              theme={theme}
              isDownloaded={isModelDownloaded(model.id)}
              isSelected={selectedModel?.id === model.id}
              isDownloading={isDownloading && currentDownloadId === model.id}
              progress={downloadProgress[model.id] || 0}
              onSelect={() => handleSelectModel(model)}
              onDownload={() => startDownload(model)}
              onDelete={isModelDownloaded(model.id) ? () => handleDeleteModel(model) : null}
              onStopDownload={handleStopDownload}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>Pro Models</Text>
          {proModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              theme={theme}
              isDownloaded={isModelDownloaded(model.id)}
              isSelected={selectedModel?.id === model.id}
              isDownloading={isDownloading && currentDownloadId === model.id}
              progress={downloadProgress[model.id] || 0}
              onSelect={() => handleSelectModel(model)}
              onDownload={() => startDownload(model)}
              onDelete={isModelDownloaded(model.id) ? () => handleDeleteModel(model) : null}
              onStopDownload={handleStopDownload}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>Pro Max Models</Text>
          {proMaxModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              theme={theme}
              isDownloaded={isModelDownloaded(model.id)}
              isSelected={selectedModel?.id === model.id}
              isDownloading={isDownloading && currentDownloadId === model.id}
              progress={downloadProgress[model.id] || 0}
              onSelect={() => handleSelectModel(model)}
              onDownload={() => startDownload(model)}
              onDelete={isModelDownloaded(model.id) ? () => handleDeleteModel(model) : null}
              onStopDownload={handleStopDownload}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>Thinking Models</Text>
          {thinkingModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              theme={theme}
              isDownloaded={isModelDownloaded(model.id)}
              isSelected={selectedModel?.id === model.id}
              isDownloading={isDownloading && currentDownloadId === model.id}
              progress={downloadProgress[model.id] || 0}
              onSelect={() => handleSelectModel(model)}
              onDownload={() => startDownload(model)}
              onDelete={isModelDownloaded(model.id) ? () => handleDeleteModel(model) : null}
              onStopDownload={handleStopDownload}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>Ultra Thinking Models</Text>
          {ultraThinkingModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              index={index}
              theme={theme}
              isDownloaded={isModelDownloaded(model.id)}
              isSelected={selectedModel?.id === model.id}
              isDownloading={isDownloading && currentDownloadId === model.id}
              progress={downloadProgress[model.id] || 0}
              onSelect={() => handleSelectModel(model)}
              onDownload={() => startDownload(model)}
              onDelete={isModelDownloaded(model.id) ? () => handleDeleteModel(model) : null}
              onStopDownload={handleStopDownload}
            />
          ))}
        </Animated.View>

        {customModels.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600).duration(500)}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 10 }]}>Custom Models</Text>
            {customModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                theme={theme}
                isDownloaded={true}
                isSelected={selectedModel?.id === model.id}
                isDownloading={isDownloading && currentDownloadId === model.id}
                progress={downloadProgress[model.id] || 0}
                onSelect={() => handleSelectModel(model)}
                onDownload={null}
                onDelete={() => handleDeleteModel(model)}
                onStopDownload={handleStopDownload}
              />
            ))}
          </Animated.View>
        )}

        {/* Download More Button */}
        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <TouchableOpacity
            style={[styles.downloadMoreBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('DownloadModels')}
            activeOpacity={0.8}
          >
            <View style={[styles.downloadMoreIcon, { backgroundColor: theme.primary + '20' }]}>
              <Icon name="download-cloud" size={24} color={theme.primary} />
            </View>
            <View style={styles.downloadMoreBody}>
              <Text style={[styles.downloadMoreTitle, { color: theme.text }]}>Download More Models</Text>
              <Text style={[styles.downloadMoreSub, { color: theme.textSecondary }]}>Browse available custom models</Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ModelCard({
  model,
  index,
  theme,
  capabilities = [],
  isDownloaded,
  isSelected,
  isDownloading,
  progress,
  onSelect,
  onDownload,
  onDelete,
  onStopDownload,
}) {
  return (
    <Animated.View entering={SlideInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: isSelected ? theme.success : theme.border },
          isSelected && { borderWidth: 1.5 }
        ]}
        onPress={isDownloaded ? onSelect : undefined}
        activeOpacity={isDownloaded ? 0.8 : 1}
      >
        <View style={styles.cardPadding}>
          {/* Top Row: Icon + Title/Size/Badges */}
          <View style={styles.topRow}>
            {/* Leading Icon */}
            <View style={[styles.leadingIcon, { backgroundColor: theme.primary + '15' }]}>
              {isDownloading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Icon
                  name={isDownloaded ? 'check-circle' : 'box'}
                  size={18}
                  color={isDownloaded ? theme.success : theme.primary}
                />
              )}
            </View>

            {/* Title Column */}
            <View style={styles.titleCol}>
              <View style={styles.titleRow}>
                <Text style={[styles.modelName, { color: theme.text, flex: 1 }]} numberOfLines={1}>
                  {model.name}
                </Text>
                {!isDownloading && (
                  isDownloaded ? (
                    <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
                      <Icon name="trash-2" size={18} color={theme.error} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.iconButton} onPress={onDownload}>
                      <Icon name="download" size={18} color={theme.primary} />
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.statusRow}>
                {model.ramRequired && (
                  <View style={[styles.statusChip, { backgroundColor: theme.cardBackground, marginRight: 6 }]}>
                    <Icon name="cpu" size={10} color={theme.textSecondary} />
                    <Text style={[styles.statusChipText, { color: theme.textSecondary }]}>{model.ramRequired} RAM</Text>
                  </View>
                )}
                <View style={[styles.statusChip, { backgroundColor: theme.cardBackground, marginRight: 6 }]}>
                  <Icon name="database" size={10} color={theme.textSecondary} />
                  <Text style={[styles.statusChipText, { color: theme.textSecondary }]}>{formatBytes(model.size)}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.statusChip, { backgroundColor: theme.success + '20' }]}>
                    <Icon name="check-circle" size={10} color={theme.success} />
                    <Text style={[styles.statusChipText, { color: theme.success }]}>Active</Text>
                  </View>
                )}
                {!isSelected && isDownloaded && (
                  <View style={[styles.statusChip, { backgroundColor: theme.primary + '20' }]}>
                    <Icon name="check" size={10} color={theme.primary} />
                    <Text style={[styles.statusChipText, { color: theme.primary }]}>Installed</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Capability Pills */}
          {capabilities.length > 0 && (
            <View style={styles.capRow}>
              {capabilities.includes('Thinking') && (
                <View style={[styles.capPill, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.capPillText}>Thinking</Text>
                </View>
              )}
              {capabilities.includes('Reasoning') && (
                <View style={[styles.capPill, { backgroundColor: theme.primary }]}>
                  <Text style={styles.capPillText}>Reasoning</Text>
                </View>
              )}
            </View>
          )}

          {isDownloading && (
            <View style={styles.progressContainer}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 11, color: theme.primary, marginBottom: 4 }}>
                  Downloading... {progress}%
                </Text>
                <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 2 }}>
                  <View style={{ height: 4, backgroundColor: theme.primary, borderRadius: 2, width: `${progress}%` }} />
                </View>
              </View>
              <TouchableOpacity style={styles.cancelIconBtn} onPress={onStopDownload}>
                <Icon name="x-circle" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  sizeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    minHeight: 18,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingLeft: 48,
  },
  capPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  capPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 48,
    marginTop: 12,
  },
  cancelIconBtn: {
    padding: 4,
  },
  iconButton: {
    padding: 4,
  },
  downloadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  downloadMoreIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  downloadMoreBody: {
    flex: 1,
  },
  downloadMoreTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  downloadMoreSub: {
    fontSize: 12,
  },
});