import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  dark: boolean;
  message?: string;
}

export default function LockedOverlay({ dark, message }: Props) {
  const { t } = useLanguage();
  const msg = message ?? t.lockedMsg;
  const bg   = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.82)';
  const text = dark ? '#fff' : '#111';

  return (
    <View style={[styles.overlay, { backgroundColor: bg }]}>
      <Ionicons name="lock-closed" size={28} color="#9c27b0" />
      <Text style={[styles.text, { color: text }]}>{msg}</Text>
      <Text style={styles.sub}>{t.upgradeMsg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    gap: 8,
    zIndex: 10,
  },
  text: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 12, color: '#9c27b0', fontWeight: '600' },
});
