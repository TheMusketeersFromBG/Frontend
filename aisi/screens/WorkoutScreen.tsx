import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/screens/WorkoutScreenStyles';
import { useWorkoutContext } from '../context/WorkoutContext';
import { usePlan } from '../hooks/usePlan';
import LockedOverlay from '../components/LockedOverlay';
import { DAYS, EXERCISE_LIBRARY, type PlanDay } from '../hooks/useWorkoutData';
import { useSkiTracker } from '../hooks/useSkiTracker';
import { styles as skiStyles } from '../styles/screens/SkiTrackerStyles';
import { useLanguage } from '../context/LanguageContext';

interface Props { onBack: () => void; dark: boolean; onOpenChat?: () => void; }

const ACCENT    = '#f44336';
const SKI_COLOR = '#29b6f6';
type Tab = 'plan' | 'track' | 'ski';

const QUICK_SPORTS_KEYS = [
  { key: 'sFootball',   emoji: '⚽' },
  { key: 'sBasketball', emoji: '🏀' },
  { key: 'sVolleyball', emoji: '🏐' },
  { key: 'sTennis',     emoji: '🎾' },
  { key: 'sHandball',   emoji: '🤾' },
  { key: 'sRunning',    emoji: '🏃' },
  { key: 'sSwimming',   emoji: '🏊' },
  { key: 'sCycling',    emoji: '🚴' },
  { key: 'sHiking',     emoji: '🥾' },
  { key: 'sMartial',    emoji: '🥋' },
  { key: 'sDancing',    emoji: '💃' },
  { key: 'sYoga',       emoji: '🧘' },
  { key: 'sSkiing',     emoji: '🎿' },
  { key: 'sGolf',       emoji: '⛳' },
];

export default function WorkoutScreen({ onBack, dark, onOpenChat }: Props) {
  const { t, locale } = useLanguage();

  // Локализирани кратки имена на дните: Пон=0...Нед=6
  const localeDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i); // 2024-01-01 е Понеделник
    return d.toLocaleDateString(locale, { weekday: 'short' });
  });
  const {
    history, plan, active, isActive, elapsed, workoutName, setWorkoutName,
    startWorkout, finishWorkout, cancelWorkout, quickLog,
    addExercise, addSet, updateSet, removeExercise,
    savePlan, deleteWorkout, formatTime,
  } = useWorkoutContext();
  const QUICK_SPORTS = QUICK_SPORTS_KEYS.map(s => ({ name: t[s.key as keyof typeof t] as string, emoji: s.emoji }));

  const muscleGroups = [...new Set(EXERCISE_LIBRARY.map(e => e.muscleGroup))];
  const mgLabel = (key: string): string => ({
    chest: t.mgChest, back: t.mgBack, legs: t.mgLegs, shoulders: t.mgShoulders,
    biceps: t.mgBiceps, triceps: t.mgTriceps, abs: t.mgAbs, cardio: t.mgCardio,
  }[key] ?? key);
  const ski = useSkiTracker();
  const { isPaid } = usePlan();

  const [tab, setTab]               = useState<Tab>('track');
  const [activeDay, setActiveDay]   = useState(0);
  const [showExPicker, setShowExPicker] = useState(false);
  const [search, setSearch]         = useState('');
  const [editingPlan, setEditingPlan] = useState(false);
  const [planDraft, setPlanDraft]   = useState<PlanDay>({ name: '', exercises: [''] });
  const [showQuick, setShowQuick]             = useState(false);
  const [quickForm, setQuickForm]             = useState({ name: '', duration: '', calories: '' });
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showFinish, setShowFinish]           = useState(false);
  const [planExPicker, setPlanExPicker]   = useState<number | null>(null); // index на упражнението което се редактира

  const bg          = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg      = dark ? '#1c1c1e' : '#fff';
  const text        = dark ? '#fff'    : '#111';
  const subtext     = dark ? '#555'    : '#888';
  const inputBg     = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';
  const tabBg       = dark ? '#1c1c1e' : '#f0f0f0';

  const filteredEx = EXERCISE_LIBRARY.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscleGroup.toLowerCase().includes(search.toLowerCase())
  );

  const dayKey = (i: number) => String(i);
  const currentDay = plan[dayKey(activeDay)];

  const startEditDay = () => {
    setPlanDraft(currentDay || { name: '', exercises: [''] });
    setEditingPlan(true);
  };

  const savePlanDay = () => {
    const filtered = { ...planDraft, exercises: planDraft.exercises.filter(e => e.trim()) };
    savePlan({ ...plan, [dayKey(activeDay)]: filtered });
    setEditingPlan(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>{t.workouts}</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: tabBg }]}>
        <TouchableOpacity style={[styles.tab, tab === 'plan' && { backgroundColor: ACCENT }]} onPress={() => setTab('plan')}>
          <Text style={[styles.tabText, { color: tab === 'plan' ? '#fff' : subtext }]}>{`📋 ${t.plan}`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'track' && { backgroundColor: ACCENT }]} onPress={() => setTab('track')}>
          <Text style={[styles.tabText, { color: tab === 'track' ? '#fff' : subtext }]}>{`💪 ${t.tracking}`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'ski' && { backgroundColor: SKI_COLOR }]} onPress={() => setTab('ski')}>
          <Text style={[styles.tabText, { color: tab === 'ski' ? '#fff' : subtext }]}>⛷️ {t.sSkiing}</Text>
        </TouchableOpacity>
      </View>

      {/* ПЛАН */}
      {tab === 'plan' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ overflow: 'hidden', borderRadius: 16 }}>
            {!isPaid && <LockedOverlay dark={dark} />}
            <TouchableOpacity
              style={[styles.aiBtn, { backgroundColor: '#9c27b0' }]}
              onPress={() => onOpenChat?.()}
            >
              <Text style={styles.aiBtnText}>{t.aiProgram}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {localeDays.map((d, i) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayBtn, { backgroundColor: activeDay === i ? ACCENT : cardBg }]}
                onPress={() => setActiveDay(i)}
              >
                <Text style={[styles.dayBtnText, { color: activeDay === i ? '#fff' : subtext }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.planCard, { backgroundColor: cardBg }]}>
            {currentDay?.name ? (
              <>
                <Text style={[styles.planDayName, { color: text }]}>{currentDay.name}</Text>
                {currentDay.exercises.map((ex, i) => (
                  <Text key={i} style={[styles.planExItem, { color: subtext }]}>• {ex}</Text>
                ))}
              </>
            ) : (
              <Text style={[styles.restDay, { color: subtext }]}>{t.restDay}</Text>
            )}
            <TouchableOpacity
              style={[styles.addSetBtn, { marginTop: 12 }]}
              onPress={startEditDay}
            >
              <Text style={[styles.addSetText, { color: ACCENT }]}>✏️ {t.edit}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* СЛЕДЕНЕ */}
      {tab === 'track' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!isActive ? (
            <>
              <TouchableOpacity style={[styles.startBtn, { backgroundColor: ACCENT }]} onPress={() => {
                const todayIdx = (new Date().getDay() + 6) % 7; // Пон=0 ... Нед=6
                const todayPlan = plan[String(todayIdx)];
                if (todayPlan?.exercises?.length) {
                  Alert.alert(
                    `📋 ${todayPlan.name || localeDays[todayIdx]}`,
                    `${t.todayPlanLabel}\n${todayPlan.exercises.map(e => `• ${e}`).join('\n')}\n\n${t.loadPlan}`,
                    [
                      { text: t.no, onPress: () => startWorkout(t.tracking) },
                      { text: t.yes, onPress: () => {
                        startWorkout(todayPlan.name || t.tracking);
                        todayPlan.exercises.forEach(name => {
                          const found = EXERCISE_LIBRARY.find(e => e.name === name);
                          addExercise(found ?? { name, muscleGroup: 'Друго' });
                        });
                      }},
                    ]
                  );
                } else {
                  startWorkout(t.tracking);
                }
              }}>
                <Text style={styles.startBtnText}>{t.startWorkout}</Text>
                <Text style={styles.startSubtext}>{t.addExercise}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: cardBg, borderWidth: 2, borderColor: ACCENT, marginTop: -8 }]}
                onPress={() => { setQuickForm({ name: '', duration: '' }); setShowQuick(true); }}
              >
                <Text style={[styles.startBtnText, { color: ACCENT }]}>{t.quickAdd}</Text>
                <Text style={[styles.startSubtext, { color: subtext }]}>{t.sFootball}, {t.sRunning}, {t.sSwimming}...</Text>
              </TouchableOpacity>

              {history.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>🏋️</Text>
                  <Text style={[styles.emptyText, { color: text }]}>{t.noWorkouts}</Text>
                </View>
              ) : history.map(w => (
                <View key={w.id} style={[styles.historyCard, { backgroundColor: cardBg }]}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyName, { color: text }]}>{w.name}</Text>
                    <TouchableOpacity onPress={() => deleteWorkout(w.id)}>
                      <Ionicons name="trash-outline" size={16} color={subtext} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.historyDate, { color: subtext }]}>
                    {new Date(w.date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                  </Text>
                  <View style={styles.historyMeta}>
                    <Text style={[styles.historyMetaItem, { color: subtext }]}>⏱ {w.duration} {t.duration}</Text>
                    <Text style={[styles.historyMetaItem, { color: subtext }]}>💪 {w.exercises.length} {t.exercises}</Text>
                    <Text style={[styles.historyMetaItem, { color: '#ff9800' }]}>🔥</Text>
                  </View>
                  <View style={styles.historyExList}>
                    {w.exercises.slice(0, 3).map((ex, i) => (
                      <Text key={i} style={[styles.historyEx, { color: subtext }]}>
                        • {ex.name} — {ex.sets.length} сета
                      </Text>
                    ))}
                    {w.exercises.length > 3 && (
                      <Text style={[styles.historyEx, { color: subtext }]}>+{w.exercises.length - 3} още...</Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              {/* Активна тренировка */}
              <View style={styles.timerRow}>
                <Text style={[styles.timer, { color: ACCENT }]}>{formatTime(elapsed)}</Text>
                <TextInput
                  style={[styles.nameInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                />
                <TouchableOpacity
                  style={[styles.finishBtn, { backgroundColor: '#4caf50' }]}
                  onPress={() => setShowFinish(true)}
                >
                  <Text style={styles.finishBtnText}>{t.finishWorkout}</Text>
                </TouchableOpacity>
              </View>

              {active.map((ex, exIdx) => (
                <View key={exIdx} style={[styles.exCard, { backgroundColor: cardBg }]}>
                  <View style={styles.exHeader}>
                    <View>
                      <Text style={[styles.exName, { color: text }]}>{ex.name}</Text>
                      <Text style={[styles.exGroup, { color: ACCENT }]}>{ex.muscleGroup}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeExercise(exIdx)}>
                      <Ionicons name="trash-outline" size={18} color={subtext} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                    <Text style={[styles.setNum, { color: subtext }]}>#</Text>
                    <Text style={[styles.setInput, { color: subtext, borderWidth: 0, backgroundColor: 'transparent', flex: 1 }]}>{t.weight}</Text>
                    <Text style={[styles.setInput, { color: subtext, borderWidth: 0, backgroundColor: 'transparent', flex: 1 }]}>{t.reps}</Text>
                    <View style={{ width: 32 }} />
                  </View>

                  {ex.sets.map((s, setIdx) => (
                    <View key={setIdx} style={styles.setRow}>
                      <Text style={[styles.setNum, { color: subtext }]}>{setIdx + 1}</Text>
                      <TextInput
                        style={[styles.setInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
                        placeholder="0"
                        placeholderTextColor={subtext}
                        keyboardType="numeric"
                        value={s.weight}
                        onChangeText={v => updateSet(exIdx, setIdx, 'weight', v)}
                      />
                      <TextInput
                        style={[styles.setInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
                        placeholder="0"
                        placeholderTextColor={subtext}
                        keyboardType="numeric"
                        value={s.reps}
                        onChangeText={v => updateSet(exIdx, setIdx, 'reps', v)}
                      />
                      <TouchableOpacity
                        style={[styles.setDone, { borderColor: s.done ? '#4caf50' : inputBorder, backgroundColor: s.done ? '#4caf50' : 'transparent' }]}
                        onPress={() => updateSet(exIdx, setIdx, 'done', !s.done)}
                      >
                        {s.done && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exIdx)}>
                    <Text style={[styles.addSetText, { color: ACCENT }]}>{t.addSet}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addExBtn, { borderColor: ACCENT }]}
                onPress={() => { setSearch(''); setShowExPicker(true); }}
              >
                <Text style={[styles.addExText, { color: ACCENT }]}>{t.addExercise}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {/* СКИ */}
      {tab === 'ski' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!ski.isTracking ? (
            <>
              <TouchableOpacity
                style={[skiStyles.startBtn, { backgroundColor: SKI_COLOR }]}
                onPress={async () => {
                  const ok = await ski.startTracking();
                  if (!ok) Alert.alert('GPS', t.notAvailable);
                }}
              >
                <Text style={skiStyles.startBtnText}>{t.skiStart}</Text>
                <Text style={skiStyles.startSubtext}>{t.skiDistance} · {t.skiSpeed}</Text>
              </TouchableOpacity>

              {ski.sessions.length === 0 ? (
                <View style={skiStyles.empty}>
                  <Text style={skiStyles.emptyEmoji}>⛷️</Text>
                  <Text style={[skiStyles.emptyText, { color: text }]}>{t.skiEmpty}</Text>
                </View>
              ) : ski.sessions.map(s => (
                <View key={s.id} style={[skiStyles.sessionCard, { backgroundColor: cardBg }]}>
                  <Text style={[skiStyles.sessionDate, { color: text }]}>
                    {new Date(s.date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                  </Text>
                  <View style={skiStyles.sessionMeta}>
                    <Text style={[skiStyles.sessionMetaText, { color: subtext }]}>🏔️ {s.runs.length} {t.skiRuns}</Text>
                    <Text style={[skiStyles.sessionMetaText, { color: subtext }]}>📏 {s.totalDistance.toFixed(1)} {t.skiDistance}</Text>
                    <Text style={[skiStyles.sessionMetaText, { color: SKI_COLOR }]}>⚡ {s.maxSpeed.toFixed(0)} {t.skiSpeed}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={[skiStyles.liveCard, { backgroundColor: cardBg }]}>
              <View style={skiStyles.liveHeader}>
                <Text style={[skiStyles.liveTitle, { color: text }]}>{t.skiActive}</Text>
                <Text style={[skiStyles.timer, { color: SKI_COLOR }]}>{ski.formatTime(ski.elapsed)}</Text>
              </View>

              <View style={skiStyles.statsGrid}>
                <View style={[skiStyles.statBox, { backgroundColor: `${SKI_COLOR}18` }]}>
                  <Text style={[skiStyles.statValue, { color: SKI_COLOR }]}>{ski.speed.toFixed(0)}</Text>
                  <Text style={[skiStyles.statLabel, { color: subtext }]}>{t.skiSpeed}</Text>
                </View>
                <View style={[skiStyles.statBox, { backgroundColor: `${SKI_COLOR}18` }]}>
                  <Text style={[skiStyles.statValue, { color: SKI_COLOR }]}>{ski.maxSpeed.toFixed(0)}</Text>
                  <Text style={[skiStyles.statLabel, { color: subtext }]}>{t.skiMaxSpeed}</Text>
                </View>
                <View style={[skiStyles.statBox, { backgroundColor: `${SKI_COLOR}18` }]}>
                  <Text style={[skiStyles.statValue, { color: SKI_COLOR }]}>{ski.distance.toFixed(2)}</Text>
                  <Text style={[skiStyles.statLabel, { color: subtext }]}>{t.skiDistance}</Text>
                </View>
              </View>

              <View style={skiStyles.runRow}>
                {!ski.currentRun ? (
                  <TouchableOpacity style={[skiStyles.runBtn, { backgroundColor: '#4caf50' }]} onPress={ski.startRun}>
                    <Text style={skiStyles.runBtnText}>{t.skiStartRun}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[skiStyles.runBtn, { backgroundColor: '#ff9800' }]} onPress={ski.endRun}>
                    <Text style={skiStyles.runBtnText}>{t.skiEndRun}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {ski.runs.length > 0 && (
                <View style={skiStyles.runsSection}>
                  <Text style={[{ fontSize: 13, fontWeight: '700', color: subtext, marginBottom: 6 }]}>
                    {t.skiRuns}: {ski.runs.length}
                  </Text>
                  {ski.runs.map((r, i) => (
                    <View key={i} style={[skiStyles.runItem, { backgroundColor: `${SKI_COLOR}12` }]}>
                      <Text style={[skiStyles.runItemText, { color: text }]}>#{i + 1}</Text>
                      <Text style={[skiStyles.runItemText, { color: subtext }]}>{ski.formatTime(r.duration)}</Text>
                      <Text style={[skiStyles.runItemText, { color: SKI_COLOR }]}>⚡ {r.maxSpeed.toFixed(0)} km/h</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[skiStyles.saveBtn, { backgroundColor: ACCENT, marginTop: 12 }]}
                onPress={() => Alert.alert(`${t.finish}?`, '', [
                  { text: t.cancel, style: 'cancel' },
                  { text: t.save, onPress: ski.saveSession },
                ])}
              >
                <Text style={skiStyles.saveBtnText}>{t.skiEnd}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Quick log modal */}
      <Modal visible={showQuick} transparent animationType="slide" onRequestClose={() => setShowQuick(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 24 }]}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.quickAdd}</Text>

            <TouchableOpacity
              style={[styles.searchInput, { backgroundColor: inputBg, borderColor: quickForm.name ? ACCENT : inputBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => setShowSportPicker(true)}
            >
              <Text style={{ color: quickForm.name ? text : subtext, fontSize: 16, fontWeight: quickForm.name ? '700' : '400' }}>
                {quickForm.name
                  ? `${QUICK_SPORTS.find(s => s.name === quickForm.name)?.emoji ?? '🏃'} ${quickForm.name}`
                  : t.chooseActivity}
              </Text>
              <Ionicons name="chevron-down" size={18} color={subtext} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text, textAlign: 'center', fontSize: 22, fontWeight: '800' }]}
              placeholder={t.minutes} placeholderTextColor={subtext} keyboardType="numeric"
              value={quickForm.duration} onChangeText={v => setQuickForm(f => ({ ...f, duration: v }))}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: inputBg }]} onPress={() => setShowQuick(false)}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: subtext }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: ACCENT }]}
                onPress={() => {
                  if (!quickForm.name || !quickForm.duration) return;
                  quickLog(quickForm.name, Number(quickForm.duration), 0);
                  setQuickForm({ name: '', duration: '', calories: '' });
                  setShowQuick(false);
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Finish workout modal */}
      <Modal visible={showFinish} transparent animationType="fade" onRequestClose={() => setShowFinish(false)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 32 }]}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.finishWorkout} 💪</Text>
            <Text style={[{ color: subtext, textAlign: 'center', marginTop: -8 }]}>
              🔥 {t.aiChatMsg}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#f4433618' }]} onPress={() => { cancelWorkout(); setShowFinish(false); }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#f44336' }}>{t.cancelWorkout}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#4caf50' }]} onPress={() => { finishWorkout(0); setShowFinish(false); }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>✅ {t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sport picker modal */}
      <Modal visible={showSportPicker} transparent animationType="slide" onRequestClose={() => setShowSportPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.chooseActivity}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {QUICK_SPORTS.map(s => (
                <TouchableOpacity
                  key={s.name}
                  style={[styles.exOption, { borderBottomColor: inputBorder, flexDirection: 'row', alignItems: 'center', gap: 12 }]}
                  onPress={() => { setQuickForm(f => ({ ...f, name: s.name })); setShowSportPicker(false); }}
                >
                  <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                  <Text style={[styles.exOptionText, { color: quickForm.name === s.name ? ACCENT : text, fontWeight: quickForm.name === s.name ? '800' : '600' }]}>{s.name}</Text>
                  {quickForm.name === s.name && <Ionicons name="checkmark" size={18} color={ACCENT} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Plan exercise picker modal */}
      <Modal visible={planExPicker !== null} transparent animationType="slide" onRequestClose={() => setPlanExPicker(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addExercise}</Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              placeholder="Търси..." placeholderTextColor={subtext}
              value={search} onChangeText={setSearch} autoFocus
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {muscleGroups.map(group => {
                const exs = filteredEx.filter(e => e.muscleGroup === group);
                if (!exs.length) return null;
                return (
                  <View key={group}>
                    <Text style={[styles.groupLabel, { color: ACCENT }]}>{mgLabel(group)}</Text>
                    {exs.map(ex => (
                      <TouchableOpacity
                        key={ex.name}
                        style={[styles.exOption, { borderBottomColor: inputBorder }]}
                        onPress={() => {
                          if (planExPicker !== null) {
                            setPlanDraft(d => ({ ...d, exercises: d.exercises.map((e, j) => j === planExPicker ? ex.name : e) }));
                          }
                          setPlanExPicker(null);
                        }}
                      >
                        <Text style={[styles.exOptionText, { color: text }]}>{ex.name}</Text>
                        <Text style={[{ fontSize: 12, color: subtext }]}>{ex.muscleGroup}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Exercise picker modal */}
      <Modal visible={showExPicker} transparent animationType="slide" onRequestClose={() => setShowExPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addExercise}</Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              placeholder="Търси..."
              placeholderTextColor={subtext}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {muscleGroups.map(group => {
                const exs = filteredEx.filter(e => e.muscleGroup === group);
                if (!exs.length) return null;
                return (
                  <View key={group}>
                    <Text style={[styles.groupLabel, { color: ACCENT }]}>{mgLabel(group)}</Text>
                    {exs.map(ex => (
                      <TouchableOpacity
                        key={ex.name}
                        style={[styles.exOption, { borderBottomColor: inputBorder }]}
                        onPress={() => { addExercise(ex); setShowExPicker(false); }}
                      >
                        <Text style={[styles.exOptionText, { color: text }]}>{ex.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Plan edit modal */}
      <Modal visible={editingPlan} transparent animationType="slide" onRequestClose={() => setEditingPlan(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{localeDays[activeDay]}</Text>
            <TextInput
              style={[styles.planNameInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
              placeholder={t.planNameHint}
              placeholderTextColor={subtext}
              value={planDraft.name}
              onChangeText={v => setPlanDraft(d => ({ ...d, name: v }))}
            />
            <ScrollView style={{ maxHeight: 220 }}>
              {planDraft.exercises.map((ex, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <TextInput
                    style={[styles.planExInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text, marginBottom: 0 }]}
                    placeholder={`${t.exerciseSingular} ${i + 1}`}
                    placeholderTextColor={subtext}
                    value={ex}
                    onChangeText={v => setPlanDraft(d => ({ ...d, exercises: d.exercises.map((e, j) => j === i ? v : e) }))}
                  />
                  <TouchableOpacity
                    style={{ padding: 10, borderRadius: 12, backgroundColor: `${ACCENT}22` }}
                    onPress={() => { setSearch(''); setPlanExPicker(i); }}
                  >
                    <Ionicons name="library-outline" size={18} color={ACCENT} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => setPlanDraft(d => ({ ...d, exercises: d.exercises.filter((_, j) => j !== i) }))}
                  >
                    <Ionicons name="trash-outline" size={16} color={subtext} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setPlanDraft(d => ({ ...d, exercises: [...d.exercises, ''] }))}>
              <Text style={[styles.addSetText, { color: ACCENT, textAlign: 'center', marginBottom: 12 }]}>{t.addExercise}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: inputBg }]} onPress={() => setEditingPlan(false)}>
                <Text style={[{ fontSize: 15, fontWeight: '700', color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[{ flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: ACCENT }]} onPress={savePlanDay}>
                <Text style={[{ fontSize: 15, fontWeight: '700', color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
