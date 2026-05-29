import { StyleSheet, Dimensions } from 'react-native';

export const CARD_SIZE = (Dimensions.get('window').width - 20 * 2 - 14) / 2;

export const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  circleTopRight: {
    position: 'absolute',
    width: CARD_SIZE * 0.9,
    height: CARD_SIZE * 0.9,
    borderRadius: CARD_SIZE * 0.45,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -CARD_SIZE * 0.3,
    right: -CARD_SIZE * 0.3,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: CARD_SIZE * 0.5,
    height: CARD_SIZE * 0.5,
    borderRadius: CARD_SIZE * 0.25,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -CARD_SIZE * 0.15,
    left: -CARD_SIZE * 0.1,
  },
  titleLight: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titleDark: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
