import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  startBtn: { borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  startSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  liveCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveTitle: { fontSize: 16, fontWeight: '700' },
  timer: { fontSize: 28, fontWeight: '900' },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600' },

  runRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  runBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  runBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  saveBtn: { borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  runsSection: { marginTop: 8 },
  runItem: { borderRadius: 12, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  runItemText: { fontSize: 13, fontWeight: '600' },

  sessionCard: { borderRadius: 18, padding: 16, marginBottom: 12 },
  sessionDate: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  sessionMeta: { flexDirection: 'row', gap: 12 },
  sessionMetaText: { fontSize: 13 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
