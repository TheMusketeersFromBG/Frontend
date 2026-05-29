import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 30, fontWeight: '900' },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 4, gap: 2 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 13, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Cards
  card: { borderRadius: 20, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },

  // Streak
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  streakNum: { fontSize: 52, fontWeight: '900' },
  streakLabel: { fontSize: 14 },
  streakDots: { flexDirection: 'row', gap: 6, marginTop: 8 },
  streakDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  // Summary
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryItem: { width: '47%', borderRadius: 16, padding: 14, gap: 4 },
  summaryEmoji: { fontSize: 22 },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 12 },

  // Chart section
  chartCard: { borderRadius: 20, padding: 16, marginBottom: 14 },
  chartTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  chartSubtitle: { fontSize: 12, marginBottom: 10 },

  // Weight
  weightInputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  weightInput: { flex: 1, borderRadius: 14, padding: 12, fontSize: 20, fontWeight: '800', textAlign: 'center', borderWidth: 2 },
  weightBtn: { borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  weightBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  weightHistoryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  weightDate: { fontSize: 13 },
  weightVal: { fontSize: 14, fontWeight: '700' },

  // Steps
  stepsCount: { fontSize: 48, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  stepsLabel: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 5 },
  stepsMetaRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stepsMeta: { alignItems: 'center', gap: 2 },
  stepsMetaValue: { fontSize: 16, fontWeight: '800' },
  stepsMetaLabel: { fontSize: 11, fontWeight: '600' },
  goalBtn: { borderRadius: 12, padding: 8, alignItems: 'center', marginTop: 8 },
  goalBtnText: { fontSize: 12, fontWeight: '600' },
  unavailable: { textAlign: 'center', fontSize: 14, fontStyle: 'italic', paddingVertical: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 32 },
  modalBox: { borderRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalInput: { borderRadius: 14, padding: 14, fontSize: 28, fontWeight: '900', textAlign: 'center', borderWidth: 2 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});
