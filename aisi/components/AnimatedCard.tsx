import { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/components/AnimatedCardStyles';

export interface Section {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}

interface Props {
  section: Section;
  dark: boolean;
  onPress: () => void;
}

export default function AnimatedCard({ section, dark, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  const cardBg = dark ? '#1c1c1e' : section.accent;
  const iconColor = dark ? section.accent : 'rgba(255,255,255,0.95)';

  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            shadowColor: section.accent,
            transform: [{ scale }],
          },
        ]}
      >
        {!dark && (
          <>
            <View style={styles.circleTopRight} />
            <View style={styles.circleBottomLeft} />
          </>
        )}
        <Ionicons name={section.icon} size={38} color={iconColor} />
        <Text style={[styles.titleDark, { color: dark ? section.accent : '#fff' }]}>
          {section.title}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
