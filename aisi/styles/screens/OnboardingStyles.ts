import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 40 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },

  stepLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  question:  { fontSize: 26, fontWeight: '900', marginBottom: 8, lineHeight: 32 },
  subtext:   { fontSize: 15, marginBottom: 32 },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  option: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 16, borderWidth: 2,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  optionText: { fontSize: 14, fontWeight: '600' },

  input: {
    borderRadius: 16, padding: 16,
    fontSize: 28, fontWeight: '800',
    textAlign: 'center', borderWidth: 2,
    marginBottom: 8,
  },
  inputUnit: { textAlign: 'center', fontSize: 14, marginBottom: 32 },

  spacer: { flex: 1 },

  navRow: { width: '100%', alignItems: 'center', justifyContent: 'center', height: 54 },
  navRowWithBack: { width: '100%', flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  nextBtn: {
    width: '70%', height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnFlex: {
    flex: 1, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Final step
  doneContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  doneTiger: { fontSize: 80 },
  doneTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  doneSubtext: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    width: '100%', height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  doneBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
