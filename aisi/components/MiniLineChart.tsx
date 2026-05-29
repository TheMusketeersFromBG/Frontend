import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

interface Props {
  data: { date: string; value: number }[];
  color: string;
  dark: boolean;
  unit?: string;
  width?: number;
  height?: number;
}

export default function MiniLineChart({ data, color, dark, unit = '', width = 300, height = 100 }: Props) {
  const subtext = dark ? '#555' : '#aaa';
  const text    = dark ? '#fff' : '#111';
  const gridColor = dark ? '#2a2a2a' : '#f0f0f0';

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={{ color: subtext, fontSize: 13 }}>Недостатъчно данни</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const pad = 20;
  const chartW = width - pad * 2;
  const chartH = height - pad;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * chartW;
    const y = pad / 2 + ((max - d.value) / (max - min)) * chartH;
    return { x, y, value: d.value };
  });

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height + 20}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(t => {
          const y = pad / 2 + t * chartH;
          return <Line key={t} x1={pad} y1={y} x2={width - pad} y2={y} stroke={gridColor} strokeWidth={1} />;
        })}
        {/* Line */}
        <Polyline points={polyPoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3}
            fill={i === points.length - 1 ? color : `${color}88`} />
        ))}
      </Svg>
      {/* Labels */}
      <View style={styles.labelsRow}>
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map((d, i) => (
          <Text key={i} style={[styles.label, { color: subtext }]}>
            {d.value}{unit}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { justifyContent: 'center', alignItems: 'center' },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 4 },
  label: { fontSize: 11, fontWeight: '600' },
});
