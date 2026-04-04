/**
 * Smart Notes Screen
 * Central hub that extracts tasks, expenses, reminders from daily notes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../config/theme';
import { STORAGE_KEYS } from '../../config/features';
import { Icon, Badge } from '../../components/common';
import { geminiApi } from '../../services/geminiApi';

const NOTES_STORAGE_KEY = '@smart_notes';

export default function SmartNotesScreen({ navigation }) {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showExtracted, setShowExtracted] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;

    const now = new Date();
    const noteData = {
      id: editingNoteId || Date.now().toString(),
      content: currentNote.trim(),
      createdAt: editingNoteId
        ? notes.find(n => n.id === editingNoteId)?.createdAt
        : now.toISOString(),
      updatedAt: now.toISOString(),
      extractedData: null,
    };

    let updatedNotes;
    if (editingNoteId) {
      updatedNotes = notes.map(n => n.id === editingNoteId ? noteData : n);
    } else {
      updatedNotes = [noteData, ...notes];
    }

    await saveNotes(updatedNotes);
    setCurrentNote('');
    setIsEditing(false);
    setEditingNoteId(null);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note.content);
    setEditingNoteId(note.id);
    setIsEditing(true);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedNotes = notes.filter(n => n.id !== noteId);
            await saveNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const handleExtractData = async (note) => {
    if (!geminiApi.isAvailable()) {
      Alert.alert(
        'API Key Required',
        'Please add your Gemini API key in Settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await geminiApi.extractFromNotes(note.content);
      setExtractedData({ noteId: note.id, data: extracted });
      setShowExtracted(true);

      // Save extracted data to the note
      const updatedNotes = notes.map(n =>
        n.id === note.id ? { ...n, extractedData: extracted } : n
      );
      await saveNotes(updatedNotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to extract data. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendToTool = async (type, items) => {
    // Save extracted items to the appropriate tool's storage
    try {
      switch (type) {
        case 'tasks':
          const existingTasks = await AsyncStorage.getItem('@day_planner_tasks');
          const tasks = existingTasks ? JSON.parse(existingTasks) : [];
          const newTasks = items.map(item => ({
            id: Date.now().toString() + Math.random(),
            text: item.text,
            dueDate: item.dueDate,
            priority: item.priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
          }));
          await AsyncStorage.setItem('@day_planner_tasks', JSON.stringify([...newTasks, ...tasks]));
          Alert.alert('Success', `${items.length} task(s) added to Day Planner`);
          break;

        case 'expenses':
          const existingExpenses = await AsyncStorage.getItem('@money_tracker_expenses');
          const expenses = existingExpenses ? JSON.parse(existingExpenses) : [];
          const newExpenses = items.map(item => ({
            id: Date.now().toString() + Math.random(),
            amount: item.amount,
            description: item.description,
            category: item.category || 'Other',
            date: new Date().toISOString(),
          }));
          await AsyncStorage.setItem('@money_tracker_expenses', JSON.stringify([...newExpenses, ...expenses]));
          Alert.alert('Success', `${items.length} expense(s) added to Money Tracker`);
          break;

        case 'reminders':
          const existingReminders = await AsyncStorage.getItem('@reminders');
          const reminders = existingReminders ? JSON.parse(existingReminders) : [];
          const newReminders = items.map(item => ({
            id: Date.now().toString() + Math.random(),
            text: item.text,
            datetime: item.datetime,
            completed: false,
            createdAt: new Date().toISOString(),
          }));
          await AsyncStorage.setItem('@reminders', JSON.stringify([...newReminders, ...reminders]));
          Alert.alert('Success', `${items.length} reminder(s) added`);
          break;

        case 'fitness':
          const existingFitness = await AsyncStorage.getItem('@fitness_tracker');
          const fitness = existingFitness ? JSON.parse(existingFitness) : [];
          const newFitness = items.map(item => ({
            id: Date.now().toString() + Math.random(),
            type: item.type,
            value: item.value,
            notes: item.notes,
            date: new Date().toISOString(),
          }));
          await AsyncStorage.setItem('@fitness_tracker', JSON.stringify([...newFitness, ...fitness]));
          Alert.alert('Success', `${items.length} fitness entry(s) added`);
          break;
      }
      setShowExtracted(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderExtractedData = () => {
    if (!extractedData?.data) return null;
    const { tasks, expenses, events, reminders, fitness } = extractedData.data;

    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.extractedContainer}>
        <View style={[styles.extractedCard, { backgroundColor: colors.surface }]}>
          <View style={styles.extractedHeader}>
            <Text style={[styles.extractedTitle, { color: colors.text }]}>
              Extracted Data
            </Text>
            <TouchableOpacity onPress={() => setShowExtracted(false)}>
              <Icon name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {tasks?.length > 0 && (
            <View style={styles.extractedSection}>
              <View style={styles.extractedSectionHeader}>
                <Icon name="check-square" size={16} color={COLORS.success} />
                <Text style={[styles.extractedSectionTitle, { color: colors.text }]}>
                  Tasks ({tasks.length})
                </Text>
              </View>
              {tasks.map((task, i) => (
                <Text key={i} style={[styles.extractedItem, { color: colors.textSecondary }]}>
                  • {task.text}
                </Text>
              ))}
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: `${COLORS.success}15` }]}
                onPress={() => handleSendToTool('tasks', tasks)}
              >
                <Text style={[styles.sendButtonText, { color: COLORS.success }]}>
                  Add to Day Planner
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {expenses?.length > 0 && (
            <View style={styles.extractedSection}>
              <View style={styles.extractedSectionHeader}>
                <Icon name="dollar-sign" size={16} color={COLORS.warning} />
                <Text style={[styles.extractedSectionTitle, { color: colors.text }]}>
                  Expenses ({expenses.length})
                </Text>
              </View>
              {expenses.map((expense, i) => (
                <Text key={i} style={[styles.extractedItem, { color: colors.textSecondary }]}>
                  • ${expense.amount} - {expense.description}
                </Text>
              ))}
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: `${COLORS.warning}15` }]}
                onPress={() => handleSendToTool('expenses', expenses)}
              >
                <Text style={[styles.sendButtonText, { color: COLORS.warning }]}>
                  Add to Money Tracker
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {reminders?.length > 0 && (
            <View style={styles.extractedSection}>
              <View style={styles.extractedSectionHeader}>
                <Icon name="bell" size={16} color={COLORS.info} />
                <Text style={[styles.extractedSectionTitle, { color: colors.text }]}>
                  Reminders ({reminders.length})
                </Text>
              </View>
              {reminders.map((reminder, i) => (
                <Text key={i} style={[styles.extractedItem, { color: colors.textSecondary }]}>
                  • {reminder.text}
                </Text>
              ))}
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: `${COLORS.info}15` }]}
                onPress={() => handleSendToTool('reminders', reminders)}
              >
                <Text style={[styles.sendButtonText, { color: COLORS.info }]}>
                  Add to Reminders
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {fitness?.length > 0 && (
            <View style={styles.extractedSection}>
              <View style={styles.extractedSectionHeader}>
                <Icon name="heart" size={16} color={COLORS.error} />
                <Text style={[styles.extractedSectionTitle, { color: colors.text }]}>
                  Fitness ({fitness.length})
                </Text>
              </View>
              {fitness.map((item, i) => (
                <Text key={i} style={[styles.extractedItem, { color: colors.textSecondary }]}>
                  • {item.type}: {item.value}
                </Text>
              ))}
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: `${COLORS.error}15` }]}
                onPress={() => handleSendToTool('fitness', fitness)}
              >
                <Text style={[styles.sendButtonText, { color: COLORS.error }]}>
                  Add to Fitness Tracker
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!tasks?.length && !expenses?.length && !reminders?.length && !fitness?.length && (
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
              No structured data found in this note.
            </Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Smart Notes</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={[styles.addButton, { backgroundColor: COLORS.brand[500] }]}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Note Editor */}
      {isEditing && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.editorContainer, { backgroundColor: colors.surface }]}
        >
          <TextInput
            value={currentNote}
            onChangeText={setCurrentNote}
            placeholder="Write your note here... Include tasks, expenses, reminders and AI will extract them!"
            placeholderTextColor={colors.textTertiary}
            style={[styles.noteInput, { color: colors.text }]}
            multiline
            autoFocus
          />
          <View style={styles.editorActions}>
            <TouchableOpacity
              style={[styles.editorButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setIsEditing(false);
                setCurrentNote('');
                setEditingNoteId(null);
              }}
            >
              <Text style={[styles.editorButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editorButton, { backgroundColor: COLORS.brand[500] }]}
              onPress={handleSaveNote}
            >
              <Text style={[styles.editorButtonText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Extracted Data Modal */}
      {showExtracted && renderExtractedData()}

      {/* Notes List */}
      <ScrollView
        style={styles.notesList}
        contentContainerStyle={styles.notesContent}
        showsVerticalScrollIndicator={false}
      >
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-text" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No notes yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Write daily notes and AI will extract tasks, expenses, and reminders automatically.
            </Text>
          </View>
        ) : (
          notes.map((note, index) => (
            <Animated.View
              key={note.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
            >
              <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
                <View style={styles.noteHeader}>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {formatDate(note.createdAt)}
                  </Text>
                  {note.extractedData && (
                    <Badge variant="success" size="small">Extracted</Badge>
                  )}
                </View>
                <Text
                  style={[styles.noteContent, { color: colors.text }]}
                  numberOfLines={4}
                >
                  {note.content}
                </Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => handleExtractData(note)}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <ActivityIndicator size="small" color={COLORS.brand[500]} />
                    ) : (
                      <>
                        <Icon name="cpu" size={16} color={COLORS.brand[500]} />
                        <Text style={[styles.noteActionText, { color: COLORS.brand[500] }]}>
                          Extract
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => handleEditNote(note)}
                  >
                    <Icon name="edit-2" size={16} color={colors.textSecondary} />
                    <Text style={[styles.noteActionText, { color: colors.textSecondary }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Icon name="trash-2" size={16} color={COLORS.error} />
                    <Text style={[styles.noteActionText, { color: COLORS.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Editor
  editorContainer: {
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  noteInput: {
    fontSize: FONT_SIZES.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  editorButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  editorButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  // Notes List
  notesList: {
    flex: 1,
  },
  notesContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  noteCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  noteDate: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  noteActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: SPACING.lg,
  },
  noteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  noteActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  // Extracted Data
  extractedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  extractedCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  extractedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  extractedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  extractedSection: {
    marginBottom: SPACING.lg,
  },
  extractedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  extractedSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  extractedItem: {
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sendButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  sendButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});
