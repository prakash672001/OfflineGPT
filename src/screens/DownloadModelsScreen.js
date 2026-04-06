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
import { useModel, DOWNLOADABLE_MODELS } from '../context/ModelContext';

export default function DownloadModelsScreen({ navigation }) {
  const { isDark, theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const {
    downloadModel,
    deleteModel,
    stopDownload,
    isDownloading,
    currentDownloadId,
    downloadProgress,
    isModelDownloaded,
  } = useModel();

  const startDownload = async (model) => {
    try {
      await downloadModel(model);
    } catch (error) {
      Alert.alert('Download Failed', error.message || 'Please check your internet connection.');
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
      `Are you sure you want to delete ${model.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteModel(model.id) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Extra Models</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Available to Download</Text>
          {DOWNLOADABLE_MODELS.map((model, index) => {
            const downloaded = isModelDownloaded(model.id);
            return (
              <Animated.View key={model.id} entering={SlideInRight.delay(index * 50).duration(400)}>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.cardPadding}>
                    {/* Top Row: Icon + Title/Size/Badges */}
                    <View style={styles.topRow}>
                      <View style={[styles.leadingIcon, { backgroundColor: theme.secondary + '15' }]}>
                        {isDownloading && currentDownloadId === model.id ? (
                          <ActivityIndicator size="small" color={theme.secondary} />
                        ) : (
                          <Icon
                            name={downloaded ? 'check-circle' : 'hard-drive'}
                            size={18}
                            color={downloaded ? theme.success : theme.secondary}
                          />
                        )}
                      </View>

                      <View style={styles.titleCol}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.modelName, { color: theme.text }]} numberOfLines={1}>
                            {model.name}
                          </Text>
                          <View style={[styles.sizeBadge, { backgroundColor: theme.cardBackground }]}>
                            <Text style={[styles.sizeText, { color: theme.textSecondary }]}>{model.size}</Text>
                          </View>
                        </View>

                        <View style={styles.statusRow}>
                          {model.ramRequired && (
                            <View style={[styles.statusChip, { backgroundColor: theme.cardBackground, marginRight: 6 }]}>
                              <Icon name="cpu" size={10} color={theme.textSecondary} />
                              <Text style={[styles.statusChipText, { color: theme.textSecondary }]}>{model.ramRequired} RAM</Text>
                            </View>
                          )}
                          {downloaded && (
                            <View style={[styles.statusChip, { backgroundColor: theme.success + '20' }]}>
                              <Icon name="check" size={10} color={theme.success} />
                              <Text style={[styles.statusChipText, { color: theme.success }]}>Installed</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Action Row */}
                    <View style={styles.actionRow}>
                      <View style={{ flex: 1 }}>
                        {isDownloading && currentDownloadId === model.id && (
                          <View style={{ width: '80%' }}>
                            <Text style={{ fontSize: 11, color: theme.primary, marginBottom: 4 }}>
                              Downloading... {downloadProgress[model.id] || 0}%
                            </Text>
                            <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 2 }}>
                              <View style={{ height: 4, backgroundColor: theme.primary, borderRadius: 2, width: `${downloadProgress[model.id] || 0}%` }} />
                            </View>
                          </View>
                        )}
                      </View>

                      <View style={styles.actionButtons}>
                        {isDownloading && currentDownloadId === model.id ? (
                          <TouchableOpacity style={[styles.stopBtn, { backgroundColor: theme.error + '15' }]} onPress={handleStopDownload}>
                            <Icon name="x" size={16} color={theme.error} />
                            <Text style={[styles.actionBtnText, { color: theme.error }]}>Cancel</Text>
                          </TouchableOpacity>
                        ) : downloaded ? (
                          <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.error + '15' }]} onPress={() => handleDeleteModel(model)}>
                            <Icon name="trash-2" size={16} color={theme.error} />
                            <Text style={[styles.actionBtnText, { color: theme.error }]}>Delete</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.secondary }]} onPress={() => startDownload(model)}>
                            <Icon name="download" size={16} color="#fff" />
                            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Download</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardPadding: { padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  leadingIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modelName: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  sizeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sizeText: { fontSize: 10, fontWeight: '500' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, minHeight: 18 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, gap: 4 },
  statusChipText: { fontSize: 10, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingLeft: 48 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});
