import { useState } from 'react';
import { Dimensions, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../styles/screens/CaloriesScreenStyles';
import { useCaloriesData, todayKey, formatDateLabel } from '../hooks/useCaloriesData';
import TigerProgress from '../components/TigerProgress';
import FABMenu from '../components/FABMenu';
import { useLanguage } from '../context/LanguageContext';

const FAB_TOP = Dimensions.get('window').height * 0.62;

interface Props { onBack: () => void; dark: boolean; createdAt: string; }

const ACCENT = '#ff9800';

function offsetDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function CaloriesScreen({ onBack, dark, createdAt }: Props) {
  const { t, locale } = useLanguage();
  const minDate = createdAt.split('T')[0];
  const [dateKey, setDateKey] = useState(todayKey());
  const { dayData, totalCalories, totalProtein, totalCarbs, totalFat, addEntry, removeEntry, setGoal } = useCaloriesData(dateKey);
  const [showAdd, setShowAdd]     = useState(false);
  const [showGoal, setShowGoal]   = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', photo: '' });

  const bg          = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg      = dark ? '#1c1c1e' : '#fff';
  const text        = dark ? '#fff'    : '#111';
  const subtext     = dark ? '#555'    : '#888';
  const inputBg     = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';
  const isToday     = dateKey === todayKey();

  const openCamera = async () => {
    const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
    const launch = async () => {
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!result.canceled) {
        setForm(f => ({ ...f, photo: result.assets[0].uri }));
        Alert.alert(t.addedCover, t.aiComing);
        setShowAdd(true);
      }
    };
    if (status === 'granted') { launch(); return; }
    if (!canAskAgain) { Alert.alert('Достъп до камерата', 'Разреши го от Настройки.', [{ text: 'Разбрах' }]); return; }
    Alert.alert('Достъп до камерата', 'AISI иска достъп до камерата.', [
      { text: t.cancel, style: 'cancel' },
      { text: 'Разреши', onPress: async () => { const { status: s } = await ImagePicker.requestCameraPermissionsAsync(); if (s === 'granted') launch(); } },
    ]);
  };

  const submitEntry = () => {
    if (!form.name || !form.calories) return;
    addEntry({ name: form.name, calories: Number(form.calories) || 0, protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0, photo: form.photo });
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', photo: '' });
    setShowAdd(false);
  };

  const fabActions = [
    { icon: 'camera-outline' as const,              label: t.camera,  color: '#607d8b', onPress: openCamera },
    { icon: 'chatbubble-ellipses-outline' as const, label: t.aiChat,  color: '#9c27b0', onPress: () => Alert.alert(t.aiChat, t.aiChatMsg, [{ text: 'Разбрах' }]) },
    { icon: 'create-outline' as const,              label: t.manual,  color: ACCENT,    onPress: () => setShowAdd(true) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>

      {/* Целият контент скролва */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateArrow} onPress={() => setDateKey(d => offsetDate(d, -1))} disabled={dateKey <= minDate}>
            <Ionicons name="chevron-back" size={22} color={dateKey <= minDate ? 'transparent' : text} />
          </TouchableOpacity>
          <Text style={[styles.dateText, { color: text }]}>{isToday ? t.today : formatDateLabel(dateKey, locale)}</Text>
          <TouchableOpacity style={styles.dateArrow} onPress={() => setDateKey(d => offsetDate(d, 1))} disabled={isToday}>
            <Ionicons name="chevron-forward" size={22} color={isToday ? 'transparent' : text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tigerSection}>
          <TigerProgress consumed={totalCalories} goal={dayData.goal} dark={dark} streak={0} />
        </View>

        {/* Макроси — измерваме позицията */}
        <View
          style={styles.macrosRow}
        >
          {[
            { label: t.protein, value: totalProtein, color: '#4caf50', unit: 'g' },
            { label: t.carbs,   value: totalCarbs,   color: '#2196f3', unit: 'g' },
            { label: t.fat,     value: totalFat,     color: '#f44336', unit: 'g' },
          ].map(m => (
            <View key={m.label} style={[styles.macroCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.macroValue, { color: m.color }]}>{m.value}{m.unit}</Text>
              <Text style={[styles.macroLabel, { color: subtext }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: subtext, marginTop: 16 }]}>{t.nutrition}</Text>
        {dayData.entries.length === 0 ? (
          <Text style={[styles.emptyText, { color: subtext }]}>{t.nothingAdded}</Text>
        ) : dayData.entries.map(entry => (
          <View key={entry.id} style={[styles.foodEntry, { backgroundColor: cardBg }]}>
            {entry.photo
              ? <Image source={{ uri: entry.photo }} style={styles.foodPhoto} />
              : <View style={[styles.foodPhotoPlaceholder, { backgroundColor: `${ACCENT}22` }]}>
                  <Ionicons name="nutrition-outline" size={22} color={ACCENT} />
                </View>
            }
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: text }]}>{entry.name}</Text>
              <Text style={[styles.foodMacros, { color: subtext }]}>П:{entry.protein}g  В:{entry.carbs}g  М:{entry.fat}g</Text>
            </View>
            <View style={styles.foodRight}>
              <Text style={[styles.foodCals, { color: ACCENT }]}>{entry.calories}</Text>
              <Text style={[styles.foodTime, { color: subtext }]}>{entry.time}</Text>
              <TouchableOpacity onPress={() => removeEntry(entry.id)}>
                <Ionicons name="trash-outline" size={16} color={subtext} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.goalBtn, { backgroundColor: cardBg }]} onPress={() => { setGoalInput(String(dayData.goal)); setShowGoal(true); }}>
          <Text style={[styles.goalBtnText, { color: subtext }]}>{t.dailyGoal}: {dayData.goal} kcal  ✏️</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB — абсолютен, центриран, не мърда при скрол */}
      <View
        style={{ position: 'absolute', top: FAB_TOP, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}
        pointerEvents="box-none"
      >
        <FABMenu actions={fabActions} dark={dark} />
      </View>

      {/* Add modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addFood}</Text>
            {form.photo ? <Image source={{ uri: form.photo }} style={{ height: 80, borderRadius: 12 }} resizeMode="cover" /> : null}
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.foodName} placeholderTextColor={subtext} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.kcal} placeholderTextColor={subtext} keyboardType="numeric" value={form.calories} onChangeText={v => setForm(f => ({ ...f, calories: v }))} />
            <View style={styles.modalRow}>
              {[{ key: 'protein', label: `${t.protein} (g)` }, { key: 'carbs', label: `${t.carbs} (g)` }, { key: 'fat', label: `${t.fat} (g)` }].map(field => (
                <TextInput key={field.key} style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={field.label} placeholderTextColor={subtext} keyboardType="numeric" value={form[field.key as keyof typeof form]} onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))} />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowAdd(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={submitEntry}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal modal */}
      <Modal visible={showGoal} transparent animationType="fade" onRequestClose={() => setShowGoal(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 32 }]}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.dailyGoal}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text, textAlign: 'center', fontSize: 24, fontWeight: '800' }]} keyboardType="numeric" value={goalInput} onChangeText={setGoalInput} autoFocus />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowGoal(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => { setGoal(Number(goalInput) || 2000); setShowGoal(false); }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
