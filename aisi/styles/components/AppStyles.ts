import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  grid: {
    gap: 12,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
