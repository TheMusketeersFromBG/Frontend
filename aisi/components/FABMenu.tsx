import { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, SUB_SIZE, SUB_RADIUS, FAB_CX, FAB_CY } from '../styles/components/FABMenuStyles';

interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface Props {
  actions: Action[];
  dark: boolean;
}

// ляво, право горе, дясно — AI Chat право горе
const ARC_ANGLES = [-145, -90, -35];

function getTargetPos(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: FAB_CX + Math.cos(rad) * SUB_RADIUS - SUB_SIZE / 2,
    y: FAB_CY + Math.sin(rad) * SUB_RADIUS - SUB_SIZE / 2,
  };
}

// Начална позиция — всички върху FAB центъра
const START_X = FAB_CX - SUB_SIZE / 2;
const START_Y = FAB_CY - SUB_SIZE / 2;

export default function FABMenu({ actions }: Props) {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, { toValue, useNativeDriver: true, friction: 5, tension: 50 }).start();
    setOpen(!open);
  };

  const close = () => {
    Animated.spring(animation, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    setOpen(false);
  };

  const rotation = animation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {actions.map((action, i) => {
        const target = getTargetPos(ARC_ANGLES[i]);
        const translateX = animation.interpolate({ inputRange: [0, 1], outputRange: [START_X - target.x, 0] });
        const translateY = animation.interpolate({ inputRange: [0, 1], outputRange: [START_Y - target.y, 0] });
        const scale      = animation.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.15, 1] });
        const opacity    = animation.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, 1] });

        return (
          <Animated.View
            key={action.label}
            style={[
              styles.subBtn,
              {
                backgroundColor: action.color,
                left: target.x,
                top: target.y,
                transform: [{ translateX }, { translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => { close(); setTimeout(action.onPress, 150); }}
              activeOpacity={0.85}
            >
              <Ionicons name={action.icon} size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#ff9800' }]}
        onPress={toggle}
        activeOpacity={0.85}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={32} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
