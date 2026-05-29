import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/screens/ProgressScreenStyles';
import { useStepTracker } from '../hooks/useStepTracker';
import { useProgressData, weekRangeLabel, monthLabel, groupByWeek, getWeekDays, dayLabel } from '../hooks/useProgressData';
import { useWorkoutContext } from '../context/WorkoutContext';
import BarChart from '../components/BarChart';
import MiniLineChart from '../components/MiniLineChart';
import LockedOverlay from '../components/LockedOverlay';
import { usePlan } from '../hooks/usePlan';
import { useLanguage } from '../context/LanguageContext';

interface Props { onBack: () => void; dark: boolean; createdAt: string; }

type Tab = 'today' | 'week' | 'month' | 'body';
const ACCENT   = '#9c27b0';
const SCREEN_W = Dimensions.get('window').width - 40 - 32;

type ChartKey = 'calories' | 'steps' | 'workouts' | 'pages';

export default function ProgressScreen({ onBack, dark, createdAt }: Props) {
  const { t, locale } = useLanguage();
  const CHARTS = [
    { key: 'calories' as ChartKey, title: `🥗 ${t.calories}`,  color: '#4caf50' },
    { key: 'steps'    as ChartKey, title: `🚶 ${t.steps}`,     color: '#2196f3' },
    { key: 'workouts' as ChartKey, title: `💪 ${t.workouts}`,  color: '#f44336' },
    { key: 'pages'    as ChartKey, title: `📖 ${t.pages}`,     color: '#9c27b0' },
  ];
  const created = new Date(createdAt);

  // Минималните offsets спрямо датата на създаване
  const minWeekOffset = (() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - dayOfWeek);
    const createdMonday = new Date(created);
    createdMonday.setDate(created.getDate() - (created.getDay() + 6) % 7);
    return Math.ceil((createdMonday.getTime() - thisMonday.getTime()) / (7 * 86400000));
  })();

  const minMonthOffset = (() => {
    const today = new Date();
    return (created.getFullYear() - today.getFullYear()) * 12 + (created.getMonth() - today.getMonth());
  })();
  const { history } = useWorkoutContext();
  const { steps, goal, saveGoal, available, km, kcal, percentage } = useStepTracker();
  const {
    weekData, weekOffset, setWeekOffset,
    monthData, monthOffset, setMonthOffset,
    weightLog, saveWeight, calcStreak,
  } = useProgressData(history);

  const [tab, setTab]             = useState<Tab>('today');
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  const bg          = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg      = dark ? '#1c1c1e' : '#fff';
  const text        = dark ? '#fff'    : '#111';
  const subtext     = dark ? '#555'    : '#888';
  const inputBg     = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';
  const tabBg       = dark ? '#1c1c1e' : '#f0f0f0';

  const { isPaid } = usePlan();
  const streak    = calcStreak();
  const todaySummary = weekData[weekData.length - 1] ?? { calories: 0, workouts: 0, pages: 0 };
  const last7     = getWeekDays(weekOffset);
  const labels    = getWeekDays(weekOffset).map(d => dayLabel(d, locale));
  const monthWeeks = groupByWeek(monthData);

  const streakDots = last7.map(date => {
    const d = weekData.find(w => w.date === date);
    return (d?.workouts ?? 0) > 0 || (d?.steps ?? 0) > 1000;
  });

  const NavRow = ({ onPrev, onNext, label, canNext, canPrev = true }: { onPrev: () => void; onNext: () => void; label: string; canNext: boolean; canPrev?: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <TouchableOpacity onPress={onPrev} style={{ padding: 8 }} disabled={!canPrev}>
        <Ionicons name="chevron-back" size={22} color={canPrev ? text : 'transparent'} />
      </TouchableOpacity>
      <Text style={[{ fontSize: 14, fontWeight: '700', color: text }]}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={{ padding: 8 }} disabled={!canNext}>
        <Ionicons name="chevron-forward" size={22} color={canNext ? text : 'transparent'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>{t.progress}</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: tabBg }]}>
        {([['today', t.today], ['week', t.week], ['month', t.month], ['body', t.body]] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && { backgroundColor: ACCENT }]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, { color: tab === key ? '#fff' : subtext }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ДНЕС */}
        {tab === 'today' && (
          <>
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, { color: subtext }]}>{t.streak}</Text>
              <View style={styles.streakRow}>
                <Text style={{ fontSize: 48 }}>🔥</Text>
                <View>
                  <Text style={[styles.streakNum, { color: '#ff9800' }]}>{streak}</Text>
                  <Text style={[styles.streakLabel, { color: subtext }]}>{t.activeStreak}</Text>
                </View>
              </View>
              <View style={styles.streakDots}>
                {streakDots.map((active, i) => (
                  <View key={i} style={[styles.streakDot, { backgroundColor: active ? '#ff9800' : inputBg }]}>
                    <Text style={{ fontSize: 9, color: active ? '#fff' : subtext }}>{labels[i] ?? ''}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, overflow: 'hidden' }]}>
              {!isPaid && <LockedOverlay dark={dark} />}
              <Text style={[styles.cardTitle, { color: subtext }]}>{t.overview}</Text>
              <View style={styles.summaryGrid}>
                {[
                  { emoji: '🥗', value: `${todaySummary.calories}`,               label: t.consumed,  color: '#4caf50' },
                  { emoji: '💪', value: `${todaySummary.workouts}`,               label: t.workouts,  color: '#f44336' },
                  { emoji: '🚶', value: steps > 0 ? steps.toLocaleString() : '—', label: t.steps,     color: '#2196f3' },
                  { emoji: '📖', value: `${todaySummary.pages}`,                  label: t.pages,     color: '#9c27b0' },
                ].map(s => (
                  <View key={s.label} style={[styles.summaryItem, { backgroundColor: `${s.color}18` }]}>
                    <Text style={styles.summaryEmoji}>{s.emoji}</Text>
                    <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={[styles.summaryLabel, { color: subtext }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.cardTitle, { color: subtext }]}>{t.steps}</Text>
              {!available ? (
                <Text style={[styles.unavailable, { color: subtext }]}>{t.notAvailable}</Text>
              ) : (
                <>
                  <Text style={[styles.stepsCount, { color: '#4caf50' }]}>{steps.toLocaleString()}</Text>
                  <Text style={[styles.stepsLabel, { color: subtext }]}>/ {goal.toLocaleString()} {t.steps}</Text>
                  <View style={[styles.progressTrack, { backgroundColor: inputBorder }]}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: '#4caf50' }]} />
                  </View>
                  <View style={styles.stepsMetaRow}>
                    {[{ v: km, l: 'km' }, { v: String(kcal), l: 'kcal' }, { v: `${Math.round(percentage)}%`, l: t.goal }].map(m => (
                      <View key={m.l} style={styles.stepsMeta}>
                        <Text style={[styles.stepsMetaValue, { color: text }]}>{m.v}</Text>
                        <Text style={[styles.stepsMetaLabel, { color: subtext }]}>{m.l}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.goalBtn, { backgroundColor: inputBg }]} onPress={() => { setGoalInput(String(goal)); setShowGoalEdit(true); }}>
                    <Text style={[styles.goalBtnText, { color: subtext }]}>{t.stepsGoal}: {goal.toLocaleString()} ✏️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {/* СЕДМИЦА */}
        {tab === 'week' && (
          <>
            <NavRow
              onPrev={() => setWeekOffset(w => w - 1)}
              onNext={() => setWeekOffset(w => w + 1)}
              label={weekRangeLabel(weekOffset, locale)}
              canNext={weekOffset < 0}
              canPrev={weekOffset > minWeekOffset}
            />
            {weekData.length > 0 && CHARTS.map(chart => (
              <View key={chart.key} style={[styles.chartCard, { backgroundColor: cardBg, overflow: 'hidden' }]}>
                {!isPaid && <LockedOverlay dark={dark} />}
                <Text style={[styles.chartTitle, { color: text }]}>{chart.title}</Text>
                <BarChart
                  data={weekData.map(d => d[chart.key])}
                  labels={getWeekDays(weekOffset).map(d => dayLabel(d, locale))}
                  color={chart.color}
                  dark={dark}
                  highlightLast={weekOffset === 0}
                />
              </View>
            ))}
          </>
        )}

        {/* МЕСЕЦ */}
        {tab === 'month' && (
          <>
            <NavRow
              onPrev={() => setMonthOffset(m => m - 1)}
              onNext={() => setMonthOffset(m => m + 1)}
              label={monthLabel(monthOffset, locale)}
              canNext={monthOffset < 0}
              canPrev={monthOffset > minMonthOffset}
            />
            {monthWeeks.length > 0 && CHARTS.map(chart => (
              <View key={chart.key} style={[styles.chartCard, { backgroundColor: cardBg, overflow: 'hidden' }]}>
                {!isPaid && <LockedOverlay dark={dark} />}
                <Text style={[styles.chartTitle, { color: text }]}>{chart.title}</Text>
                <BarChart
                  data={monthWeeks.map(d => d[chart.key])}
                  labels={monthWeeks.map((d, i) => `${t.week.slice(0,3)} ${i + 1}`)}
                  color={chart.color}
                  dark={dark}
                  highlightLast={monthOffset === 0}
                />
              </View>
            ))}
          </>
        )}

        {/* ТЯЛО */}
        {tab === 'body' && (
          <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.chartTitle, { color: text }]}>{`⚖️ ${t.weight_}`}</Text>
            <View style={styles.weightInputRow}>
              <TextInput
                style={[styles.weightInput, { backgroundColor: inputBg, borderColor: '#ff9800', color: text }]}
                placeholder={t.kg} placeholderTextColor={subtext} keyboardType="numeric"
                value={weightInput} onChangeText={setWeightInput}
              />
              <TouchableOpacity
                style={[styles.weightBtn, { backgroundColor: '#ff9800' }]}
                onPress={() => { if (weightInput) { saveWeight(Number(weightInput)); setWeightInput(''); } }}
              >
                <Text style={styles.weightBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {weightLog.length >= 2 ? (
              <MiniLineChart
                data={weightLog.slice(-14).map(e => ({ date: e.date, value: e.weight }))}
                color="#ff9800" dark={dark} unit={` ${t.kg}`} width={SCREEN_W}
              />
            ) : (
              <Text style={[styles.unavailable, { color: subtext }]}>{t.noData}</Text>
            )}
            {weightLog.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {weightLog.slice(-5).reverse().map((e, i) => (
                  <View key={i} style={[styles.weightHistoryItem, { borderBottomColor: inputBorder }]}>
                    <Text style={[styles.weightDate, { color: subtext }]}>
                      {new Date(e.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={[styles.weightVal, { color: '#ff9800' }]}>{e.weight} {t.kg}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

      </ScrollView>

      <Modal visible={showGoalEdit} transparent animationType="fade" onRequestClose={() => setShowGoalEdit(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.stepsGoal}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBg, borderColor: '#4caf50', color: '#4caf50' }]}
              keyboardType="numeric" value={goalInput} onChangeText={setGoalInput} autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowGoalEdit(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4caf50' }]} onPress={() => { saveGoal(Number(goalInput) || 10000); setShowGoalEdit(false); }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
