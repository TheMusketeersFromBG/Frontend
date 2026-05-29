import { View, Text, StyleSheet } from 'react-native';

interface Props {
  data: number[];
  labels: string[];
  color: string;
  dark: boolean;
  unit?: string;
  height?: number;
  highlightLast?: boolean;
}

export default function BarChart({ data, labels, color, dark, unit = '', height = 100, highlightLast = true }: Props) {
  const max = Math.max(...data, 1);
  const subtext = dark ? '#555' : '#aaa';
  const text    = dark ? '#fff' : '#111';

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { height }]}>
        {data.map((val, i) => {
          const isLast = highlightLast && i === data.length - 1;
          const barH = Math.max((val / max) * (height - 24), val > 0 ? 4 : 0);
          return (
            <View key={i} style={styles.barCol}>
              {val > 0 && (
                <Text style={[styles.valLabel, { color: isLast ? color : subtext }]}>
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </Text>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: barH,
                    backgroundColor: isLast ? color : `${color}66`,
                    borderRadius: 6,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {labels.map((l, i) => (
          <Text key={i} style={[styles.label, { color: i === labels.length - 1 ? text : subtext }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  bar: { width: '100%' },
  valLabel: { fontSize: 9, fontWeight: '700' },
  labelsRow: { flexDirection: 'row' },
  label: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600' },
});
