import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#888', fontSize: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '900' },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 4, gap: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 14, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  // Start button
  startBtn: { borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  startSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // Active workout
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timer: { fontSize: 32, fontWeight: '900' },
  nameInput: { flex: 1, marginLeft: 16, borderRadius: 12, padding: 10, fontSize: 16, fontWeight: '700', borderWidth: 1 },
  finishBtn: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 10 },
  finishBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Exercise card
  exCard: { borderRadius: 18, padding: 14, marginBottom: 12 },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  exName: { fontSize: 16, fontWeight: '800' },
  exGroup: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { fontSize: 13, fontWeight: '700', width: 20, textAlign: 'center' },
  setInput: { flex: 1, borderRadius: 10, padding: 8, fontSize: 14, fontWeight: '600', textAlign: 'center', borderWidth: 1 },
  setDone: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  addSetBtn: { paddingVertical: 6, alignItems: 'center', marginTop: 4 },
  addSetText: { fontSize: 13, fontWeight: '700' },

  // Add exercise button
  addExBtn: { borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 4, borderWidth: 2, borderStyle: 'dashed' },
  addExText: { fontSize: 15, fontWeight: '700' },

  // History
  historyCard: { borderRadius: 18, padding: 16, marginBottom: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyName: { fontSize: 16, fontWeight: '800' },
  historyDate: { fontSize: 12 },
  historyMeta: { flexDirection: 'row', gap: 12 },
  historyMetaItem: { fontSize: 13 },
  historyExList: { marginTop: 8, gap: 3 },
  historyEx: { fontSize: 13 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },

  // Plan
  weekRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dayBtn: { flex: 1, padding: 8, borderRadius: 12, alignItems: 'center' },
  dayBtnText: { fontSize: 11, fontWeight: '700' },
  planCard: { borderRadius: 18, padding: 16, marginBottom: 12 },
  planDayName: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  planExItem: { fontSize: 14, marginBottom: 4 },
  planNameInput: { borderRadius: 12, padding: 12, fontSize: 16, fontWeight: '700', borderWidth: 1, marginBottom: 10 },
  planExInput: { borderRadius: 12, padding: 10, fontSize: 14, borderWidth: 1, marginBottom: 8 },
  restDay: { fontSize: 15, fontStyle: 'italic' },

  aiBtn: { borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 16 },
  aiBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  searchInput: { borderRadius: 14, padding: 12, fontSize: 15, borderWidth: 1, marginBottom: 12 },
  groupLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8, marginBottom: 6 },
  exOption: { paddingVertical: 12, borderBottomWidth: 1 },
  exOptionText: { fontSize: 15, fontWeight: '600' },
});
