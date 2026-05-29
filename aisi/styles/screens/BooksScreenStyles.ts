import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },

  // Tabs
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 4, gap: 2 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 12, fontWeight: '700' },

  // Book card
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 20, marginBottom: 14, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', padding: 14, gap: 14 },
  cover: { width: 70, height: 100, borderRadius: 10 },
  coverPlaceholder: { width: 70, height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  coverEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  cardAuthor: { fontSize: 13, marginBottom: 6 },
  cardGenre: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', overflow: 'hidden', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  cardActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  cardBtn: { flex: 1, padding: 8, borderRadius: 12, alignItems: 'center' },
  cardBtnText: { fontSize: 12, fontWeight: '700' },

  // Finished card
  finishedBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  finishedBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  dateText: { fontSize: 11, marginTop: 4 },

  // Stats
  statsSection: { marginTop: 8, marginBottom: 24 },
  statsTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 13, textAlign: 'center' },

  // AI button
  aiBtn: { borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 16 },
  aiBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Daily goal
  dailyGoalCard: { borderRadius: 18, padding: 14 },
  dailyGoalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dailyGoalTitle: { fontSize: 15, fontWeight: '700' },
  dailyBtns: { flexDirection: 'row', gap: 8 },

  // FAB
  fab: {
    position: 'absolute', bottom: 32, right: 24,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2196f3', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalInput: { borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1 },
  modalRow: { flexDirection: 'row', gap: 10 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
  notesInput: { borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, minHeight: 100, textAlignVertical: 'top' },
});
