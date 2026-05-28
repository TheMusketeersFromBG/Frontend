import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles/ProfileScreenStyles';
import { useProfileData } from '../hooks/useProfileData';

interface Props {
  onBack: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

const ACCENT = '#9e9e9e';
const PLAN_COLOR = '#9c27b0';

const LANGUAGES = [
  { code: 'BG', name: 'Български',  flag: '🇧🇬' },
  { code: 'EN', name: 'English',    flag: '🇬🇧' },
  { code: 'EL', name: 'Ελληνικά',  flag: '🇬🇷' },
  { code: 'ZH', name: '中文',       flag: '🇨🇳' },
  { code: 'JP', name: '日本語',     flag: '🇯🇵' },
  { code: 'KO', name: '한국어',     flag: '🇰🇷' },
  { code: 'DE', name: 'Deutsch',    flag: '🇩🇪' },
  { code: 'RU', name: 'Русский',    flag: '🇷🇺' },
  { code: 'FR', name: 'Français',   flag: '🇫🇷' },
];

const achievements = [
  { emoji: '🏆', title: 'Първа стъпка',  desc: 'Създаден профил',   unlocked: true  },
  { emoji: '🔥', title: 'Огнен старт',   desc: '7 дни поред',       unlocked: false },
  { emoji: '📚', title: 'Книжен молец',  desc: 'Прочетена 1 книга', unlocked: false },
  { emoji: '💪', title: 'Железен човек', desc: '10 тренировки',     unlocked: false },
  { emoji: '🥗', title: 'Здравословен',  desc: '30 дни проследени', unlocked: false },
  { emoji: '⚡', title: 'На ниво',       desc: '30 дни streak',     unlocked: false },
];

const mainMetrics = [
  { key: 'height',    label: 'Ръст',    unit: 'cm'  },
  { key: 'weight',    label: 'Тегло',   unit: 'kg'  },
  { key: 'birthdate', label: 'Възраст', unit: 'год' },
];

function calcAge(birthdate: string): string {
  if (!birthdate) return '—';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

const detailedMeasures = [
  { key: 'chest',     label: 'Гърди'  },
  { key: 'waist',     label: 'Кръст'  },
  { key: 'hips',      label: 'Ханш'   },
  { key: 'shoulders', label: 'Рамене' },
  { key: 'bicep',     label: 'Бицепс' },
  { key: 'thigh',     label: 'Бедро'  },
];

type MetricKey = keyof ReturnType<typeof useProfileData>['data']['metrics'];

function calcBMI(height: string, weight: string): string | null {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (!h || !w) return null;
  return (w / Math.pow(h / 100, 2)).toFixed(1);
}

function bmiLabel(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Поднормено тегло', color: '#2196f3' };
  if (bmi < 25)   return { label: 'Нормално тегло',   color: '#4caf50' };
  if (bmi < 30)   return { label: 'Наднормено тегло', color: '#ff9800' };
  return           { label: 'Затлъстяване',           color: '#f44336' };
}

export default function ProfileScreen({ onBack, dark, onToggleDark }: Props) {
  const { data, updateMetric, updateName, updatePhoto, updateNotifications, updateLanguage } = useProfileData();

  const pickPhoto = async () => {
    const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) updatePhoto(result.assets[0].uri);
      return;
    }

    if (!canAskAgain) {
      Alert.alert(
        'Достъп до галерията',
        'Нямаме достъп до галерията. Разреши го от Настройки → Приложения → AISI → Разрешения.',
        [{ text: 'Разбрах' }]
      );
      return;
    }

    Alert.alert(
      'Достъп до галерията',
      'AISI се нуждае от достъп до галерията, за да можеш да сложиш профилна снимка.',
      [
        { text: 'Откажи', style: 'cancel' },
        {
          text: 'Разреши',
          onPress: async () => {
            const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (newStatus !== 'granted') return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled) updatePhoto(result.assets[0].uri);
          },
        },
      ]
    );
  };
  const [showMeasures, setShowMeasures] = useState(false);
  const [editing, setEditing] = useState<{ key: MetricKey; label: string; unit: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const bg       = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg   = dark ? '#1c1c1e' : '#fff';
  const text     = dark ? '#fff'    : '#111';
  const subtext  = dark ? '#555'    : '#888';
  const chipBg   = dark ? '#2a2a2a' : '#f5f5f5';
  const sepColor = dark ? '#2a2a2a' : '#f0f0f0';
  const inputBg  = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';

  const displayName = data.name || 'Потребител';
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';
  const bmi = calcBMI(data.metrics.height, data.metrics.weight);
  const bmiInfo = bmi ? bmiLabel(parseFloat(bmi)) : null;

  const openMetric = (key: MetricKey, label: string, unit: string) => {
    setInputVal(data.metrics[key]);
    setEditing({ key, label, unit });
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={pickPhoto}>
            <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
              {data.photo
                ? <Image source={{ uri: data.photo }} style={styles.avatarImage} />
                : <Text style={styles.avatarText}>{avatarLetter}</Text>
              }
            </View>
          </TouchableOpacity>
          <View style={styles.nameCol}>
            <Text style={[styles.name, { color: text }]}>{displayName}</Text>
            <View style={[styles.planBadge, { backgroundColor: PLAN_COLOR }]}>
              <Text style={styles.planBadgeText}>Безплатен план</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: chipBg }]}
            onPress={() => { setInputVal(data.name); setEditingName(true); }}
          >
            <Ionicons name="pencil-outline" size={18} color={subtext} />
          </TouchableOpacity>
        </View>

        {/* Основни мерки */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>Основни мерки</Text>
          </View>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.metricsRow}>
              {mainMetrics.map((m, i) => (
                <View key={m.key} style={{ flexDirection: 'row', flex: 1 }}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: sepColor }]} />}
                  <TouchableOpacity
                    style={styles.metricTouchable}
                    onPress={() => m.key === 'birthdate'
                      ? setShowDatePicker(true)
                      : openMetric(m.key as MetricKey, m.label, m.unit)
                    }
                  >
                    <Text style={[styles.metricValue, { color: text }]}>
                      {m.key === 'birthdate'
                        ? calcAge(data.metrics.birthdate)
                        : data.metrics[m.key as MetricKey] || '—'}
                    </Text>
                    <Text style={[styles.metricUnit, { color: ACCENT }]}>{m.unit}</Text>
                    <Text style={[styles.metricLabel, { color: subtext }]}>{m.label}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* BMI */}
        {bmi && bmiInfo && (
          <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <View>
              <Text style={[styles.sectionTitle, { color: subtext }]}>BMI ИНДЕКС</Text>
              <Text style={[styles.metricValue, { color: bmiInfo.color, marginTop: 4 }]}>{bmi}</Text>
              <Text style={[styles.metricLabel, { color: bmiInfo.color, marginTop: 2 }]}>{bmiInfo.label}</Text>
            </View>
            <Text style={{ fontSize: 13, color: subtext, flex: 1, textAlign: 'right', marginLeft: 12 }}>
              * BMI е приблизителен показател. AI анализ ще бъде наличен скоро.
            </Text>
          </View>
        )}

        {/* Подробни мерки */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>Подробни мерки</Text>
            <TouchableOpacity onPress={() => setShowMeasures(!showMeasures)}>
              <Text style={[styles.toggleText, { color: ACCENT }]}>
                {showMeasures ? 'Скрий' : 'Покажи'}
              </Text>
            </TouchableOpacity>
          </View>
          {showMeasures && (
            <View style={styles.measureGrid}>
              {detailedMeasures.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.measureItem, { backgroundColor: cardBg }]}
                  onPress={() => openMetric(m.key as MetricKey, m.label, 'cm')}
                >
                  <Text style={[styles.measureLabel, { color: subtext }]}>{m.label}</Text>
                  <Text style={[styles.measureValue, { color: text }]}>
                    {data.metrics[m.key as MetricKey] ? `${data.metrics[m.key as MetricKey]} cm` : '— cm'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Статистики */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>Статистики</Text>
          </View>
          <View style={styles.statsGrid}>
            {[
              { emoji: '🔥', value: '0', label: 'Дни streak'  },
              { emoji: '📅', value: '0', label: 'Активни дни' },
              { emoji: '💪', value: '0', label: 'Тренировки'  },
              { emoji: '📚', value: '0', label: 'Книги'       },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statValue, { color: text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: subtext }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Постижения */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>Постижения</Text>
          </View>
          <View style={styles.achieveGrid}>
            {achievements.map((a) => (
              <View
                key={a.title}
                style={[styles.achieveItem, { backgroundColor: cardBg, opacity: a.unlocked ? 1 : 0.4 }]}
              >
                <Text style={styles.achieveEmoji}>{a.unlocked ? a.emoji : '🔒'}</Text>
                <View style={styles.achieveCol}>
                  <Text style={[styles.achieveTitle, { color: text }]}>{a.title}</Text>
                  <Text style={[styles.achieveDesc, { color: subtext }]}>{a.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Настройки */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>Настройки</Text>
          </View>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color={subtext} />
                <Text style={[styles.settingLabel, { color: text }]}>Нотификации</Text>
              </View>
              <Switch
                value={data.notifications}
                onValueChange={updateNotifications}
                trackColor={{ true: PLAN_COLOR }}
              />
            </View>
            <View style={[styles.separator, { backgroundColor: sepColor }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name={dark ? 'moon' : 'sunny-outline'} size={20} color={subtext} />
                <Text style={[styles.settingLabel, { color: text }]}>Тъмен режим</Text>
              </View>
              <Switch value={dark} onValueChange={onToggleDark} trackColor={{ true: PLAN_COLOR }} />
            </View>
            <View style={[styles.separator, { backgroundColor: sepColor }]} />
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowLangPicker(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color={subtext} />
                <Text style={[styles.settingLabel, { color: text }]}>Език</Text>
              </View>
              <Text style={[styles.settingValue, { color: subtext }]}>
                {LANGUAGES.find(l => l.code === data.language)?.flag}{' '}
                {LANGUAGES.find(l => l.code === data.language)?.name} →
              </Text>
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: sepColor }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="diamond-outline" size={20} color={PLAN_COLOR} />
                <Text style={[styles.settingLabel, { color: text }]}>План</Text>
              </View>
              <Text style={[styles.settingValue, { color: PLAN_COLOR }]}>Безплатен →</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Date Picker за рождена дата */}
      {showDatePicker && (
        <DateTimePicker
          value={data.metrics.birthdate ? new Date(data.metrics.birthdate) : new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onValueChange={(_event: unknown, date?: Date) => {
            setShowDatePicker(false);
            if (date) updateMetric('birthdate', date.toISOString());
          }}
        />
      )}

      {/* Modal за език */}
      <Modal visible={showLangPicker} transparent animationType="slide" onRequestClose={() => setShowLangPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Избери език</Text>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => { updateLanguage(lang.code); setShowLangPicker(false); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: data.language === lang.code ? `${PLAN_COLOR}22` : 'transparent',
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 24 }}>{lang.flag}</Text>
                <Text style={{ fontSize: 16, color: text, flex: 1, fontWeight: data.language === lang.code ? '700' : '400' }}>
                  {lang.name}
                </Text>
                {data.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={PLAN_COLOR} />
                )}
              </TouchableOpacity>
            ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: inputBg, marginTop: 4 }]}
              onPress={() => setShowLangPicker(false)}
            >
              <Text style={[styles.modalBtnText, { color: subtext }]}>Затвори</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal за мерки */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>
              {editing?.label} ({editing?.unit})
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="numeric"
              autoFocus
              placeholder="Въведи стойност"
              placeholderTextColor={subtext}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setEditing(null)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>Откажи</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: PLAN_COLOR }]}
                onPress={() => { updateMetric(editing!.key, inputVal); setEditing(null); }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Запази</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal за име */}
      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Твоето име</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              value={inputVal}
              onChangeText={setInputVal}
              autoFocus
              placeholder="Въведи име"
              placeholderTextColor={subtext}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setEditingName(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>Откажи</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: PLAN_COLOR }]}
                onPress={() => { updateName(inputVal); setEditingName(false); }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Запази</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
