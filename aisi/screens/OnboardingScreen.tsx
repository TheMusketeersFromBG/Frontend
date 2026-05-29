import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/screens/OnboardingStyles';
import { OnboardingData } from '../hooks/useOnboarding';
import { useLanguage } from '../context/LanguageContext';
import type { T } from '../translations';

interface Props {
  dark: boolean;
  onComplete: (data: OnboardingData) => void;
}

const ACCENT = '#ff9800';

function getSteps(t: T) {
  return [
    {
      key: 'goal',
      label: `Стъпка 1 ${t.stepOf} 9`,
      question: t.goalQ,
      sub: t.goalSub,
      type: 'single',
      options: [
        { value: 'lose',     label: t.lose,     emoji: '🔥' },
        { value: 'gain',     label: t.gain,     emoji: '💪' },
        { value: 'maintain', label: t.maintain, emoji: '⚖️' },
        { value: 'health',   label: t.health,   emoji: '🌿' },
      ],
    },
    {
      key: 'activity',
      label: `Стъпка 2 ${t.stepOf} 9`,
      question: t.activityQ,
      sub: t.activitySub,
      type: 'single',
      options: [
        { value: 'sedentary', label: t.sedentary,  emoji: '🪑' },
        { value: 'light',     label: t.light,      emoji: '🚶' },
        { value: 'moderate',  label: t.moderate,   emoji: '🏃' },
        { value: 'very',      label: t.veryActive, emoji: '⚡' },
      ],
    },
    {
      key: 'sports',
      label: `Стъпка 3 ${t.stepOf} 9`,
      question: t.sportsQ,
      sub: t.sportsSub,
      type: 'multi',
      options: [
        { value: 'gym',        label: t.sFitness,    emoji: '🏋️' },
        { value: 'running',    label: t.sRunning,    emoji: '🏃' },
        { value: 'swimming',   label: t.sSwimming,   emoji: '🏊' },
        { value: 'cycling',    label: t.sCycling,    emoji: '🚴' },
        { value: 'football',   label: t.sFootball,   emoji: '⚽' },
        { value: 'basketball', label: t.sBasketball, emoji: '🏀' },
        { value: 'volleyball', label: t.sVolleyball, emoji: '🏐' },
        { value: 'tennis',     label: t.sTennis,     emoji: '🎾' },
        { value: 'yoga',       label: t.sYoga,       emoji: '🧘' },
        { value: 'martial',    label: t.sMartial,    emoji: '🥋' },
        { value: 'boxing',     label: t.sBoxing,     emoji: '🥊' },
        { value: 'crossfit',   label: t.sCrossfit,   emoji: '🏅' },
        { value: 'hiking',     label: t.sHiking,     emoji: '🥾' },
        { value: 'climbing',   label: t.sClimbing,   emoji: '🧗' },
        { value: 'skiing',     label: t.sSkiing,     emoji: '🎿' },
        { value: 'dancing',    label: t.sDancing,    emoji: '💃' },
        { value: 'golf',       label: t.sGolf,       emoji: '⛳' },
        { value: 'handball',   label: t.sHandball,   emoji: '🤾' },
        { value: 'none',       label: t.noSport,     emoji: '😴' },
      ],
    },
    {
      key: 'diet',
      label: `Стъпка 4 ${t.stepOf} 9`,
      question: t.dietQ,
      sub: t.dietSub,
      type: 'single',
      options: [
        { value: 'normal',     label: t.normal,        emoji: '🍽️' },
        { value: 'vegetarian', label: t.vegetarian,    emoji: '🥗' },
        { value: 'vegan',      label: t.vegan,         emoji: '🌱' },
        { value: 'keto',       label: t.keto,          emoji: '🥩' },
        { value: 'no_pref',    label: t.noPreference,  emoji: '🤷' },
      ],
    },
    {
      key: 'allergies',
      label: `Стъпка 5 ${t.stepOf} 9`,
      question: t.allergiesQ,
      sub: t.allergiesSub,
      type: 'multi',
      options: [
        { value: 'gluten',  label: t.aGluten,   emoji: '🌾' },
        { value: 'lactose', label: t.aLactose,  emoji: '🥛' },
        { value: 'nuts',    label: t.aNuts,     emoji: '🥜' },
        { value: 'eggs',    label: t.aEggs,     emoji: '🥚' },
        { value: 'soy',     label: t.aSoy,      emoji: '🫘' },
        { value: 'seafood', label: t.aSeafood,  emoji: '🦐' },
        { value: 'none',    label: t.noAllergies, emoji: '✅' },
      ],
    },
    {
      key: 'targetWeight',
      label: `Стъпка 6 ${t.stepOf} 9`,
      question: t.targetWeightQ,
      sub: t.targetWeightSub,
      type: 'input',
      options: [],
    },
    {
      key: 'readingGenres',
      label: `Стъпка 7 ${t.stepOf} 9`,
      question: t.genresQ,
      sub: t.genresSub,
      type: 'multi',
      options: [
        { value: 'fiction',    label: t.gFiction,     emoji: '🚀' },
        { value: 'nonfiction', label: t.gNonfiction,  emoji: '📰' },
        { value: 'selfdev',    label: t.gSelfdev,     emoji: '🧠' },
        { value: 'history',    label: t.gHistory,     emoji: '🏛️' },
        { value: 'science',    label: t.gScience,     emoji: '🔬' },
        { value: 'novels',     label: t.gNovels,      emoji: '💕' },
        { value: 'biography',  label: t.gBiography,   emoji: '👤' },
        { value: 'thriller',   label: t.gThriller,    emoji: '🔍' },
        { value: 'horror',     label: t.gHorror,      emoji: '👻' },
        { value: 'philosophy', label: t.gPhilosophy,  emoji: '🤔' },
        { value: 'psychology', label: t.gPsychology,  emoji: '🧩' },
        { value: 'business',   label: t.gBusiness,    emoji: '💼' },
        { value: 'travel',     label: t.gTravel,      emoji: '✈️' },
        { value: 'classics',   label: t.gClassics,    emoji: '📜' },
        { value: 'manga',      label: t.gManga,       emoji: '📓' },
      ],
    },
    {
      key: 'readingFrequency',
      label: `Стъпка 8 ${t.stepOf} 9`,
      question: t.freqQ,
      sub: t.freqSub,
      type: 'single',
      options: [
        { value: 'never',    label: t.never,    emoji: '😅' },
        { value: 'monthly',  label: t.monthly,  emoji: '📖' },
        { value: 'biweekly', label: t.biweekly, emoji: '📚' },
        { value: 'weekly',   label: t.weekly,   emoji: '🤓' },
      ],
    },
    {
      key: 'plan',
      label: `Стъпка 9 ${t.stepOf} 9`,
      question: t.planQ,
      sub: t.planSub,
      type: 'plan',
      options: [],
    },
  ];
}

export default function OnboardingScreen({ dark, onComplete }: Props) {
  const { t } = useLanguage();
  const STEPS = getSteps(t);
  const TOTAL = STEPS.length;
  const [step, setStep]   = useState(0);
  const [done, setDone]   = useState(false);
  const [answers, setAnswers] = useState<OnboardingData>({
    goal: '', activity: '', sports: [], diet: '',
    allergies: [], targetWeight: '', readingGenres: [], readingFrequency: '',
    plan: 'free', createdAt: '',
  });

  const bg       = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg   = dark ? '#1c1c1e' : '#fff';
  const text      = dark ? '#fff'   : '#111';
  const subtext   = dark ? '#666'   : '#888';
  const inputBg   = dark ? '#1c1c1e' : '#fff';
  const borderOff = dark ? '#2a2a2a' : '#e0e0e0';

  const current = STEPS[step];

  const getValue = () => answers[current.key as keyof OnboardingData];

  const toggleOption = (value: string) => {
    const key = current.key as keyof OnboardingData;
    if (current.type === 'single') {
      setAnswers(a => ({ ...a, [key]: value }));
    } else {
      const arr = (answers[key] as string[]) || [];
      const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      setAnswers(a => ({ ...a, [key]: updated }));
    }
  };

  const isSelected = (value: string) => {
    const val = getValue();
    if (Array.isArray(val)) return val.includes(value);
    return val === value;
  };

  const canNext = () => {
    const val = getValue();
    if (current.type === 'input') return String(val).trim().length > 0;
    if (current.type === 'multi') return (val as string[]).length > 0;
    if (current.type === 'plan')  return true; // free е default
    return String(val).length > 0;
  };

  const next = () => {
    if (step < TOTAL - 1) setStep(s => s + 1);
    else setDone(true);
  };

  const back = () => setStep(s => s - 1);

  const finish = () => onComplete(answers);

  if (done) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneTiger}>🐯</Text>
          <Text style={[styles.doneTitle, { color: text }]}>{t.doneTitle}</Text>
          <Text style={[styles.doneSubtext, { color: subtext }]}>{t.doneSub}</Text>
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: ACCENT }]} onPress={finish}>
            <Text style={styles.doneBtnText}>{t.letsGo}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, { backgroundColor: i <= step ? ACCENT : borderOff }]}
          />
        ))}
      </View>

      <Text style={[styles.stepLabel, { color: subtext }]}>{current.label}</Text>
      <Text style={[styles.question, { color: text }]}>{current.question}</Text>
      <Text style={[styles.subtext, { color: subtext }]}>{current.sub}</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {current.type === 'plan' ? (
          <View style={{ gap: 14 }}>
            {[
              {
                value: 'free',
                title: t.planFree,
                price: t.planFreePrice,
                color: '#888',
                badge: null as string | null,
                features: ['✅ Следене на калории', '✅ Тренировки', '✅ Книги', '✅ Хранене', '✅ Прогрес (базов)', '🔒 AI функции', '🔒 Графики и обобщение'],
              },
              {
                value: 'paid',
                title: t.planPaid,
                price: t.planPaidPrice,
                color: '#9c27b0',
                badge: t.recommended,
                features: ['✅ Всичко от безплатния', '✅ AI препоръки за храна', '✅ AI workout програма', '✅ AI книги по вкус', '✅ Графики и обобщение', '✅ AI калории от снимка'],
              },
            ].map(plan => {
              const selected = answers.plan === plan.value;
              return (
                <TouchableOpacity
                  key={plan.value}
                  style={{
                    borderRadius: 20, padding: 20, borderWidth: 2,
                    borderColor: selected ? plan.color : borderOff,
                    backgroundColor: selected ? `${plan.color}18` : cardBg,
                  }}
                  onPress={() => setAnswers(a => ({ ...a, plan: plan.value as 'free' | 'paid' }))}
                  activeOpacity={0.85}
                >
                  {plan.badge && (
                    <Text style={{ color: plan.color, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>{plan.badge}</Text>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: selected ? plan.color : text }}>{plan.title}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: plan.color }}>{plan.price}</Text>
                  </View>
                  {plan.features.map((f, i) => (
                    <Text key={i} style={{ fontSize: 13, color: subtext, marginBottom: 4 }}>{f}</Text>
                  ))}
                  {selected && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                      <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                      <Text style={{ color: plan.color, fontWeight: '700', fontSize: 13 }}>{t.selected}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : current.type === 'input' ? (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: ACCENT, color: text }]}
              keyboardType="numeric"
              placeholder="75"
              placeholderTextColor={subtext}
              value={String(answers.targetWeight)}
              onChangeText={v => setAnswers(a => ({ ...a, targetWeight: v }))}
              autoFocus
            />
            <Text style={[styles.inputUnit, { color: subtext }]}>килограми</Text>
          </>
        ) : current.type === 'plan' ? null : (
          <View style={styles.optionsGrid}>
            {current.options.map(opt => {
              const selected = isSelected(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? `${ACCENT}22` : cardBg,
                      borderColor: selected ? ACCENT : borderOff,
                    },
                  ]}
                  onPress={() => toggleOption(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                  <Text style={[styles.optionText, { color: selected ? ACCENT : text }]}>{opt.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={16} color={ACCENT} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={step > 0 ? styles.navRowWithBack : styles.navRow}>
        {step > 0 && (
          <TouchableOpacity style={[styles.backBtn, { borderColor: borderOff }]} onPress={back}>
            <Ionicons name="arrow-back" size={22} color={text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[step > 0 ? styles.nextBtnFlex : styles.nextBtn, { backgroundColor: canNext() ? ACCENT : borderOff }]}
          onPress={next}
          disabled={!canNext()}
        >
          <Text style={styles.nextBtnText}>
            {step === TOTAL - 1 ? t.finish : t.next}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
