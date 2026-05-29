import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/screens/ProfileScreenStyles';
import { useProfileData } from '../hooks/useProfileData';
import { useLanguage } from '../context/LanguageContext';
import type { Lang } from '../translations';

interface Props {
  onBack: () => void;
  dark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
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

// achievements defined inside component to use t


function calcAge(birthdate: string): string {
  if (!birthdate) return '—';
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}


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

export default function ProfileScreen({ onBack, dark, onToggleDark, onLogout }: Props) {
  const { data, updateMetric, updateName, updatePhoto, updateNotifications, updateLanguage } = useProfileData();

  const achievements = [
    { emoji: '🏆', title: t.ach1Title, desc: t.ach1Desc, unlocked: true  },
    { emoji: '🔥', title: t.ach2Title, desc: t.ach2Desc, unlocked: false },
    { emoji: '📚', title: t.ach3Title, desc: t.ach3Desc, unlocked: false },
    { emoji: '💪', title: t.ach4Title, desc: t.ach4Desc, unlocked: false },
    { emoji: '🥗', title: t.ach5Title, desc: t.ach5Desc, unlocked: false },
    { emoji: '⚡', title: t.ach6Title, desc: t.ach6Desc, unlocked: false },
  ];
  const { lang: currentLang, setLang, t } = useLanguage();

  const mainMetrics = [
    { key: 'height',    label: t.height, unit: t.cm    },
    { key: 'weight',    label: t.weight_, unit: 'kg'   },
    { key: 'birthdate', label: t.age,    unit: t.years },
  ];

  const detailedMeasures = [
    { key: 'chest',     label: t.chest     },
    { key: 'waist',     label: t.waist     },
    { key: 'hips',      label: t.hips      },
    { key: 'shoulders', label: t.shoulders },
    { key: 'bicep',     label: t.bicep     },
    { key: 'thigh',     label: t.thigh     },
  ];

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
          <Text style={styles.backText}>{t.back}</Text>
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
              <Text style={styles.planBadgeText}>{t.freePlan}</Text>
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
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.basicMeasurements}</Text>
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
              <Text style={[styles.sectionTitle, { color: subtext }]}>{t.bmi}</Text>
              <Text style={[styles.metricValue, { color: bmiInfo.color, marginTop: 4 }]}>{bmi}</Text>
              <Text style={[styles.metricLabel, { color: bmiInfo.color, marginTop: 2 }]}>{bmiInfo.label}</Text>
            </View>
            <Text style={{ fontSize: 13, color: subtext, flex: 1, textAlign: 'right', marginLeft: 12 }}>
              {t.bmiNote}
            </Text>
          </View>
        )}

        {/* Подробни мерки */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.detailedMeasurements}</Text>
            <TouchableOpacity onPress={() => setShowMeasures(!showMeasures)}>
              <Text style={[styles.toggleText, { color: ACCENT }]}>
                {showMeasures ? t.hide : t.show}
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
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.statistics}</Text>
          </View>
          <View style={styles.statsGrid}>
            {[
              { emoji: '🔥', value: '0', label: t.daysStreak  },
              { emoji: '📅', value: '0', label: t.activeDays  },
              { emoji: '💪', value: '0', label: t.workouts    },
              { emoji: '📚', value: '0', label: t.books       },
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
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.achievements}</Text>
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
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.settings}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color={subtext} />
                <Text style={[styles.settingLabel, { color: text }]}>{t.notifications}</Text>
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
                <Text style={[styles.settingLabel, { color: text }]}>{t.darkMode}</Text>
              </View>
              <Switch value={dark} onValueChange={onToggleDark} trackColor={{ true: PLAN_COLOR }} />
            </View>
            <View style={[styles.separator, { backgroundColor: sepColor }]} />
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowLangPicker(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color={subtext} />
                <Text style={[styles.settingLabel, { color: text }]}>{t.language}</Text>
              </View>
              <Text style={[styles.settingValue, { color: subtext }]}>
                {LANGUAGES.find(l => l.code === currentLang)?.flag}{' '}
                {LANGUAGES.find(l => l.code === currentLang)?.name} →
              </Text>
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: sepColor }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="diamond-outline" size={20} color={PLAN_COLOR} />
                <Text style={[styles.settingLabel, { color: text }]}>{t.plan}</Text>
              </View>
              <Text style={[styles.settingValue, { color: PLAN_COLOR }]}>{t.freePlan} →</Text>
            </View>
          </View>
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#f4433618', marginTop: 8 }]}
          onPress={() => Alert.alert(
            t.logoutConfirm,
            t.logoutMsg,
            [
              { text: t.cancel, style: 'cancel' },
              { text: t.logout, style: 'destructive', onPress: onLogout },
            ]
          )}
        >
          <View style={[styles.settingRow, { paddingVertical: 6 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={20} color="#f44336" />
              <Text style={[styles.settingLabel, { color: '#f44336' }]}>{t.logout}</Text>
            </View>
          </View>
        </TouchableOpacity>

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
            <Text style={[styles.modalTitle, { color: text }]}>{t.language}</Text>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => {
                updateLanguage(lang.code);
                setLang(lang.code as Lang);
                setShowLangPicker(false);
              }}
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
              <Text style={[styles.modalBtnText, { color: subtext }]}>{t.close}</Text>
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
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: PLAN_COLOR }]}
                onPress={() => { updateMetric(editing!.key, inputVal); setEditing(null); }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal за име */}
      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.yourName}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              value={inputVal}
              onChangeText={setInputVal}
              autoFocus
              placeholder={t.enterName}
              placeholderTextColor={subtext}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setEditingName(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: PLAN_COLOR }]}
                onPress={() => { updateName(inputVal); setEditingName(false); }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
