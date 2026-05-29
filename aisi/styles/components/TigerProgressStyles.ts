import { StyleSheet } from 'react-native';

export const BODY_WIDTH  = 300;
export const BODY_HEIGHT = 300;

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  body: {
    width: BODY_WIDTH,
    height: BODY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  percentText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
