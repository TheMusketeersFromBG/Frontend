import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/components/AppStyles';
import { lightTheme, darkTheme } from './theme/theme';
import AnimatedCard, { type Section } from './components/AnimatedCard';
import { useProfileData } from './hooks/useProfileData';
import { useOnboarding } from './hooks/useOnboarding';
import { useCaloriesData, todayKey } from './hooks/useCaloriesData';
import { useWorkoutContext } from './context/WorkoutContext';
import { useStepTracker } from './hooks/useStepTracker';
import { useBooksData } from './hooks/useBooksData';
import SummaryBar from './components/SummaryBar';
import OnboardingScreen from './screens/OnboardingScreen';
import CaloriesScreen from './screens/CaloriesScreen';
import BooksScreen from './screens/BooksScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import NutritionScreen from './screens/NutritionScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import { WorkoutProvider } from './context/WorkoutContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { initFromOnboarding } from './hooks/useOnboardingInit';
import { useAuth } from './hooks/useAuth';
import AuthScreen from './screens/AuthScreen';

type Screen = 'home' | 'calories' | 'books' | 'workout' | 'nutrition' | 'progress' | 'profile' | 'chat';


function getGreeting(t: { goodMorning: string; goodDay: string; goodEvening: string }): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.goodMorning;
  if (hour < 18) return t.goodDay;
  return t.goodEvening;
}


function AppInner() {
  const { t, setLang, lang } = useLanguage();

  const sections: (Section & { id: Screen })[] = [
    { id: 'workout',   title: t.workouts,   icon: 'barbell-outline',    accent: '#f44336' },
    { id: 'nutrition', title: t.nutrition,  icon: 'leaf-outline',       accent: '#8bc34a' },
    { id: 'calories',  title: t.calories,   icon: 'flame-outline',      accent: '#ff9800' },
    { id: 'progress',  title: t.progress,   icon: 'trending-up-outline', accent: '#9c27b0' },
    { id: 'books',     title: t.books,      icon: 'book-outline',       accent: '#2196f3' },
    { id: 'profile',   title: t.profile,    icon: 'person-outline',     accent: '#9e9e9e' },
  ];
  const [screen, setScreen] = useState<Screen>('home');
  const [chatReturn, setChatReturn] = useState<Screen>('home');
  const [dark, setDark] = useState(false);

  const openChat = (from: Screen) => { setChatReturn(from); setScreen('chat'); };
  const theme = dark ? darkTheme : lightTheme;
  const { data: profileData } = useProfileData();
  const { completed, save: saveOnboarding, data: onboardingData } = useOnboarding();
  const { session, loading: authLoading, login, signup, logout } = useAuth();
  const { totalCalories } = useCaloriesData(todayKey());
  const { history } = useWorkoutContext();
  const { steps } = useStepTracker();
  const { todayPages } = useBooksData();
  const displayName = profileData.name || session?.name || '';

  const todayBurned = history
    .filter(w => w.date.startsWith(todayKey()))
    .reduce((s, w) => s + (w.caloriesBurned || 0), 0);

  if (authLoading || completed === null) return null;

  // Не е логнат → Auth екран
  if (!session?.isLoggedIn) return (
    <AuthScreen
      dark={dark}
      onLogin={login}
      onSignup={signup}
      onGoToOnboarding={(name) => {
        // Името ще се запази след onboarding
      }}
    />
  );

  // Логнат но няма onboarding → Quiz
  if (!completed) return (
    <OnboardingScreen
      dark={dark}
      onComplete={async (data) => {
        await saveOnboarding(data);
        await initFromOnboarding(data);
      }}
    />
  );

  if (screen === 'calories')  return <CaloriesScreen  onBack={() => setScreen('home')} dark={dark} createdAt={onboardingData.createdAt || new Date().toISOString()} onOpenChat={() => openChat('calories')} />;
  if (screen === 'books')     return <BooksScreen     onBack={() => setScreen('home')} dark={dark} onOpenChat={() => openChat('books')} />;
  if (screen === 'workout')   return <WorkoutScreen   onBack={() => setScreen('home')} dark={dark} onOpenChat={() => openChat('workout')} />;
  if (screen === 'nutrition') return <NutritionScreen onBack={() => setScreen('home')} dark={dark} onOpenChat={() => openChat('nutrition')} />;
  if (screen === 'progress')  return <ProgressScreen  onBack={() => setScreen('home')} dark={dark} createdAt={onboardingData.createdAt || new Date().toISOString()} />;
  if (screen === 'profile')   return <ProfileScreen   onBack={() => setScreen('home')} dark={dark} onToggleDark={() => setDark(!dark)} onLogout={logout} />;
  if (screen === 'chat')      return <ChatScreen      onBack={() => setScreen(chatReturn)} dark={dark} />;

  const rows = [
    sections.slice(0, 2),
    sections.slice(2, 4),
    sections.slice(4, 6),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.subtext }]}>
            {getGreeting(t)}{displayName ? `, ${displayName}` : ''} 👋
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>AISI</Text>
        </View>
        <TouchableOpacity onPress={() => setDark(!dark)}>
          <Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={26} color={theme.text} />
        </TouchableOpacity>
      </View>
      <SummaryBar theme={theme} dark={dark} consumed={totalCalories} burned={todayBurned} steps={steps} pages={todayPages} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((section) => (
                <AnimatedCard
                  key={section.id}
                  section={section}
                  dark={dark}
                  onPress={() => setScreen(section.id)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WorkoutProvider>
        <AppInner />
      </WorkoutProvider>
    </LanguageProvider>
  );
}
