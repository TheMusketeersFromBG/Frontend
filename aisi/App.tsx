import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './components/styles/AppStyles';
import { lightTheme, darkTheme } from './components/theme';
import AnimatedCard, { type Section } from './components/AnimatedCard';
import { useProfileData } from './hooks/useProfileData';
import SummaryBar from './components/SummaryBar';
import CaloriesScreen from './components/CaloriesScreen';
import BooksScreen from './components/BooksScreen';
import WorkoutScreen from './components/WorkoutScreen';
import NutritionScreen from './components/NutritionScreen';
import ProgressScreen from './components/ProgressScreen';
import ProfileScreen from './components/ProfileScreen';

type Screen = 'home' | 'calories' | 'books' | 'workout' | 'nutrition' | 'progress' | 'profile';

const sections: (Section & { id: Screen })[] = [
  { id: 'workout',   title: 'Тренировки', icon: 'barbell-outline',     accent: '#f44336' },
  { id: 'nutrition', title: 'Хранене',    icon: 'leaf-outline',         accent: '#8bc34a' },
  { id: 'calories',  title: 'Калории',    icon: 'flame-outline',        accent: '#ff9800' },
  { id: 'progress',  title: 'Прогрес',    icon: 'trending-up-outline',  accent: '#9c27b0' },
  { id: 'books',     title: 'Книги',      icon: 'book-outline',         accent: '#2196f3' },
  { id: 'profile',   title: 'Профил',     icon: 'person-outline',       accent: '#9e9e9e' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Добро утро';
  if (hour < 18) return 'Добър ден';
  return 'Добър вечер';
}


export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [dark, setDark] = useState(false);
  const theme = dark ? darkTheme : lightTheme;
  const { data: profileData } = useProfileData();
  const displayName = profileData.name || 'Потребител';

  if (screen === 'calories')  return <CaloriesScreen  onBack={() => setScreen('home')} dark={dark} />;
  if (screen === 'books')     return <BooksScreen     onBack={() => setScreen('home')} dark={dark} />;
  if (screen === 'workout')   return <WorkoutScreen   onBack={() => setScreen('home')} dark={dark} />;
  if (screen === 'nutrition') return <NutritionScreen onBack={() => setScreen('home')} dark={dark} />;
  if (screen === 'progress')  return <ProgressScreen  onBack={() => setScreen('home')} dark={dark} />;
  if (screen === 'profile')   return <ProfileScreen   onBack={() => setScreen('home')} dark={dark} onToggleDark={() => setDark(!dark)} />;

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
            {getGreeting()}, {displayName} 👋
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>AISI</Text>
        </View>
        <TouchableOpacity onPress={() => setDark(!dark)}>
          <Ionicons name={dark ? 'sunny-outline' : 'moon-outline'} size={26} color={theme.text} />
        </TouchableOpacity>
      </View>
      <SummaryBar theme={theme} dark={dark} />
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
