import { useRef, useEffect } from 'react';
import { View, Text, Animated, Image, ImageSourcePropType } from 'react-native';
import { styles, BODY_HEIGHT, BODY_WIDTH } from '../styles/components/TigerProgressStyles';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  consumed: number;
  goal: number;
  dark: boolean;
  streak: number;
}

const TIGERS: { source: ImageSourcePropType }[] = [
  { source: require('../assets/tiger_baby.png')   },
  { source: require('../assets/tiger_medium.png') },
  { source: require('../assets/tiger_big.png')    },
];

function getTiger(streak: number) {
  if (streak <= 10) return TIGERS[0];
  if (streak <= 25) return TIGERS[1];
  return TIGERS[2];
}

export default function TigerProgress({ consumed, goal, dark, streak }: Props) {
  const { t } = useLanguage();
  const fillAnim = useRef(new Animated.Value(0)).current;
  const percentage = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const overGoal   = consumed > goal;
  const remaining  = goal - consumed;
  const tiger      = getTiger(streak);

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: percentage,
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();
  }, [percentage]);

  // Overlay намалява от горе надолу — разкрива тигъра от долу нагоре
  const overlayHeight = fillAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [BODY_HEIGHT, 0],
  });

  const cardBg  = dark ? '#1e1e1e' : '#fff';
  const bgColor = cardBg;

  return (
    <View style={styles.container}>
      <View style={[styles.body, { backgroundColor: cardBg, borderRadius: 24, borderWidth: 0 }]}>
        <Image
          source={tiger.source}
          style={{ width: BODY_WIDTH, height: BODY_HEIGHT, resizeMode: 'contain' }}
        />
        {/* Overlay скрива тигъра отгоре — намалява при прогрес */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: overlayHeight,
            backgroundColor: bgColor,
            opacity: 0.85,
          }}
        />
        <Text style={[styles.percentText, { color: dark ? '#fff' : '#111', position: 'absolute' }]}>
          {Math.round(percentage * 100)}%
        </Text>
      </View>

      <Text style={[styles.caloriesText, { color: dark ? '#fff' : '#111' }]}>
        {consumed} / {goal} kcal
      </Text>
      <Text style={[styles.remainingText, { color: overGoal ? '#f44336' : '#4caf50' }]}>
        {overGoal ? `+${Math.abs(remaining)} ${t.overGoal}` : `${remaining} ${t.remaining}`}
      </Text>
      <Text style={{ color: dark ? '#555' : '#aaa', fontSize: 11, marginTop: 2 }}>
        {streak} {t.daysStreak}
      </Text>
    </View>
  );
}
