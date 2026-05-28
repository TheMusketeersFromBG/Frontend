import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onBack: () => void;
  dark: boolean;
}

export default function CaloriesScreen({ onBack, dark }: Props) {
  const bg = dark ? '#0f0f0f' : '#FFF8F0';
  const text = dark ? '#fff' : '#111';
  const subtext = dark ? '#555' : '#888';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>← Назад</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: text }]}>Калории</Text>
      <Text style={[styles.subtitle, { color: subtext }]}>Идва скоро...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
});
