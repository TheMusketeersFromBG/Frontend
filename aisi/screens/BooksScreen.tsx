import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/screens/BooksScreenStyles';
import { useBooksData, type BookStatus, type Book } from '../hooks/useBooksData';
import { usePlan } from '../hooks/usePlan';
import LockedOverlay from '../components/LockedOverlay';
import { useLanguage } from '../context/LanguageContext';

interface Props { onBack: () => void; dark: boolean; }

const ACCENT = '#2196f3';

export default function BooksScreen({ onBack, dark }: Props) {
  const { t } = useLanguage();
  const { addBook, updateBook, removeBook, finishBook, byStatus, totalFinished, totalPages, thisMonthFinished, dailyGoal, todayPages, saveDailyGoal, addTodayPages } = useBooksData();
  const { isPaid } = usePlan();

  const TABS: { key: BookStatus; label: string; emoji: string }[] = [
    { key: 'reading',  label: t.reading,     emoji: '📖' },
    { key: 'want',     label: t.wantToRead,  emoji: '🔖' },
    { key: 'finished', label: t.finished,    emoji: '✅' },
  ];

  const emptyMessages = {
    reading:  { emoji: '📖', text: t.noBooksYet,      sub: 'Добави книга която четеш сега' },
    want:     { emoji: '🔖', text: t.noBooksWant,      sub: 'Добави книги които искаш да прочетеш' },
    finished: { emoji: '🏆', text: t.noBooksFinished,  sub: 'Като завършиш книга ще се появи тук' },
  };
  const [activeTab, setActiveTab] = useState<BookStatus>('reading');
  const [showAdd, setShowAdd]         = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput]       = useState('');
  const [selected, setSelected]   = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', author: '', pages: '', genre: '', cover: '' });

  const bg          = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg      = dark ? '#1c1c1e' : '#fff';
  const text        = dark ? '#fff'    : '#111';
  const subtext     = dark ? '#555'    : '#888';
  const inputBg     = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';
  const tabBg       = dark ? '#1c1c1e' : '#f0f0f0';

  const pickCover = async () => {
    Alert.alert('Корица', 'Как искаш да добавиш корицата?', [
      { text: 'Откажи', style: 'cancel' },
      { text: '📷 Снимай', onPress: shootCover },
      { text: '🖼️ Галерия', onPress: galleryCover },
    ]);
  };

  const galleryCover = async () => {
    const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) { Alert.alert('Достъп', 'Разреши от Настройки.', [{ text: 'OK' }]); return; }
      const { status: s } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (s !== 'granted') return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) setForm(f => ({ ...f, cover: result.assets[0].uri }));
  };

  const shootCover = async () => {
    const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) { Alert.alert('Достъп до камерата', 'Разреши от Настройки.', [{ text: 'OK' }]); return; }
      Alert.alert('Достъп до камерата', 'AISI иска достъп до камерата.', [
        { text: 'Откажи', style: 'cancel' },
        { text: 'Разреши', onPress: async () => {
          const { status: s } = await ImagePicker.requestCameraPermissionsAsync();
          if (s === 'granted') launchCamera();
        }},
      ]);
      return;
    }
    launchCamera();
  };

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [2, 3], quality: 0.7 });
    if (!result.canceled) setForm(f => ({ ...f, cover: result.assets[0].uri }));
  };

  const submit = () => {
    if (!form.title || !form.author) return;
    addBook({ title: form.title, author: form.author, pages: Number(form.pages) || 0, genre: form.genre, cover: form.cover, status: activeTab });
    setForm({ title: '', author: '', pages: '', genre: '', cover: '' });
    setShowAdd(false);
  };

  const visibleBooks = byStatus(activeTab);
  const empty = emptyMessages[activeTab];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>{t.books}</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: tabBg }]}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && { backgroundColor: ACCENT }]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === t.key ? '#fff' : subtext }]}>
              {t.emoji} {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Дневна цел */}
      <View style={[styles.dailyGoalCard, { backgroundColor: cardBg, marginHorizontal: 20, marginBottom: 12 }]}>
        <View style={styles.dailyGoalRow}>
          <Text style={[styles.dailyGoalTitle, { color: text }]}>{t.dailyGoal}</Text>
          <TouchableOpacity onPress={() => { setGoalInput(String(dailyGoal)); setShowGoalEdit(true); }}>
            <Text style={{ color: ACCENT, fontSize: 13, fontWeight: '700' }}>{todayPages}/{dailyGoal} {t.pagesAdded} ✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.progressBar, { backgroundColor: inputBorder, marginVertical: 8 }]}>
          <View style={[styles.progressFill, { width: `${Math.min((todayPages / dailyGoal) * 100, 100)}%`, backgroundColor: ACCENT }]} />
        </View>
        <View style={styles.dailyBtns}>
          {[5, 10, 20].map(n => (
            <TouchableOpacity key={n} style={[styles.cardBtn, { backgroundColor: `${ACCENT}18` }]} onPress={() => addTodayPages(n)}>
              <Text style={[styles.cardBtnText, { color: ACCENT }]}>+{n} {t.pagesAdded}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ overflow: 'hidden', borderRadius: 16, marginBottom: 16 }}>
          {!isPaid && <LockedOverlay dark={dark} />}
          <TouchableOpacity
            style={[styles.aiBtn, { backgroundColor: '#9c27b0', marginBottom: 0 }]}
            onPress={() => Alert.alert(t.aiRecs, t.aiRecsMsg, [{ text: 'Разбрах' }])}
          >
          <Text style={styles.aiBtnText}>{t.aiRecs}</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'finished' && (
          <View style={styles.statsSection}>
            <Text style={[styles.statsTitle, { color: subtext }]}>{t.statistics}</Text>
            <View style={styles.statsRow}>
              {[
                { value: totalFinished,     label: t.totalBooks,  emoji: '📚' },
                { value: thisMonthFinished, label: t.thisMonth,   emoji: '📅' },
                { value: totalPages,        label: t.totalPages,  emoji: '📄' },
              ].map(s => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
                  <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                  <Text style={[styles.statValue, { color: ACCENT }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: subtext }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {visibleBooks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{empty.emoji}</Text>
            <Text style={[styles.emptyText, { color: text }]}>{empty.text}</Text>
            <Text style={[styles.emptySubtext, { color: subtext }]}>{empty.sub}</Text>
          </View>
        ) : visibleBooks.map(book => (
          <TouchableOpacity key={book.id} style={[styles.card, { backgroundColor: cardBg }]} onPress={() => setSelected(book)} activeOpacity={0.85}>
            <View style={styles.cardInner}>
              {book.cover
                ? <Image source={{ uri: book.cover }} style={styles.cover} />
                : <View style={[styles.coverPlaceholder, { backgroundColor: `${ACCENT}22` }]}>
                    <Text style={styles.coverEmoji}>📚</Text>
                  </View>
              }
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: text }]} numberOfLines={2}>{book.title}</Text>
                <Text style={[styles.cardAuthor, { color: subtext }]}>{book.author}</Text>
                {book.genre ? (
                  <Text style={[styles.cardGenre, { backgroundColor: `${ACCENT}18`, color: ACCENT }]}>{book.genre}</Text>
                ) : null}
                {book.status === 'reading' && book.pages > 0 && (
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBar, { backgroundColor: inputBorder }]}>
                      <View style={[styles.progressFill, { width: `${Math.min((book.pagesRead / book.pages) * 100, 100)}%`, backgroundColor: ACCENT }]} />
                    </View>
                    <Text style={[styles.progressText, { color: subtext }]}>{book.pagesRead}/{book.pages}</Text>
                  </View>
                )}
                {book.status === 'finished' && (
                  <View>
                    <Text style={[styles.dateText, { color: subtext }]}>
                      {book.dateFinished ? `✅ ${new Date(book.dateFinished).toLocaleDateString('bg-BG')}` : ''}
                    </Text>
                    {book.rating > 0 && (
                      <Text style={{ fontSize: 14, marginTop: 2 }}>
                        {'⭐'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
            {book.status === 'reading' && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.cardBtn, { backgroundColor: `${ACCENT}18` }]} onPress={() => updateBook(book.id, { pagesRead: Math.min(book.pagesRead + 10, book.pages) })}>
                  <Text style={[styles.cardBtnText, { color: ACCENT }]}>+10 {t.pagesAdded}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#4caf5018' }]} onPress={() => finishBook(book.id)}>
                  <Text style={[styles.cardBtnText, { color: '#4caf50' }]}>{t.finishReading}</Text>
                </TouchableOpacity>
              </View>
            )}
            {book.status === 'want' && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.cardBtn, { backgroundColor: `${ACCENT}18` }]} onPress={() => updateBook(book.id, { status: 'reading' })}>
                  <Text style={[styles.cardBtnText, { color: ACCENT }]}>{t.startReading}</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: ACCENT }]} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Daily goal modal */}
      <Modal visible={showGoalEdit} transparent animationType="fade" onRequestClose={() => setShowGoalEdit(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 32 }]}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.dailyGoal} ({t.pagesAdded})</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, borderColor: ACCENT, color: text, textAlign: 'center', fontSize: 28, fontWeight: '800' }]}
              keyboardType="numeric" value={goalInput} onChangeText={setGoalInput} autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowGoalEdit(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => { saveDailyGoal(Number(goalInput) || 20); setShowGoalEdit(false); }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addBook}</Text>
            <TouchableOpacity style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, alignItems: 'center', padding: 12 }]} onPress={pickCover}>
              {form.cover
                ? <Image source={{ uri: form.cover }} style={{ width: 60, height: 90, borderRadius: 8 }} />
                : <Text style={{ color: subtext, fontSize: 14 }}>{t.cover}</Text>
              }
            </TouchableOpacity>
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.title} placeholderTextColor={subtext} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.author} placeholderTextColor={subtext} value={form.author} onChangeText={v => setForm(f => ({ ...f, author: v }))} />
            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.pages} placeholderTextColor={subtext} keyboardType="numeric" value={form.pages} onChangeText={v => setForm(f => ({ ...f, pages: v }))} />
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.genre} placeholderTextColor={subtext} value={form.genre} onChangeText={v => setForm(f => ({ ...f, genre: v }))} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowAdd(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={submit}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Book detail modal */}
      {selected && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setSelected(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
              <Text style={[styles.modalTitle, { color: text }]} numberOfLines={2}>{selected.title}</Text>
              <Text style={[{ color: subtext, textAlign: 'center', marginTop: -8 }]}>{selected.author}</Text>

              {/* Рейтинг */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setSelected(s => s ? { ...s, rating: star } : s)}>
                    <Text style={{ fontSize: 28 }}>{star <= (selected.rating || 0) ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Страници прочетени */}
              {selected.status === 'reading' && selected.pages > 0 && (
                <View style={styles.modalRow}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text, textAlign: 'center' }]}
                    keyboardType="numeric"
                    value={String(selected.pagesRead)}
                    onChangeText={v => setSelected(s => s ? { ...s, pagesRead: Number(v) || 0 } : s)}
                    placeholder="Страници прочетени"
                    placeholderTextColor={subtext}
                  />
                  <View style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                    <Text style={{ color: subtext }}>/ {selected.pages}</Text>
                  </View>
                </View>
              )}

              {/* Смяна на статус */}
              <View style={[styles.modalRow, { flexWrap: 'wrap' }]}>
                {TABS.filter(t => t.key !== selected.status).map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.cardBtn, { backgroundColor: inputBg, flex: 1 }]}
                    onPress={() => {
                      const changes: Partial<Book> = { status: t.key };
                      if (t.key === 'finished') { changes.dateFinished = new Date().toISOString(); changes.pagesRead = selected.pages; }
                      updateBook(selected.id, changes);
                      setSelected(null);
                    }}
                  >
                    <Text style={[styles.cardBtnText, { color: subtext }]}>{t.emoji} {t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Бележки */}
              <TextInput
                style={[styles.notesInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
                placeholder={t.notes}
                placeholderTextColor={subtext}
                multiline
                value={selected.notes}
                onChangeText={v => setSelected(s => s ? { ...s, notes: v } : s)}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f4433618' }]} onPress={() => { removeBook(selected.id); setSelected(null); }}>
                  <Text style={[styles.modalBtnText, { color: '#f44336' }]}>{t.delete}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => { updateBook(selected.id, { notes: selected.notes, pagesRead: selected.pagesRead, rating: selected.rating }); setSelected(null); }}>
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
