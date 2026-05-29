import { StyleSheet } from 'react-native';

export const FAB_SIZE    = 62;
export const SUB_SIZE    = 50;
export const SUB_RADIUS  = 100;
export const WRAPPER_W   = 300;
export const WRAPPER_H   = FAB_SIZE + SUB_RADIUS + SUB_SIZE;
export const FAB_CX      = WRAPPER_W / 2;
export const FAB_CY      = WRAPPER_H - FAB_SIZE / 2;

export const styles = StyleSheet.create({
  wrapper: {
    width: WRAPPER_W,
    height: WRAPPER_H,
  },
  subBtn: {
    position: 'absolute',
    width: SUB_SIZE,
    height: SUB_SIZE,
    borderRadius: SUB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    left: FAB_CX - FAB_SIZE / 2,
    top: FAB_CY - FAB_SIZE / 2,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 21,
  },
});
