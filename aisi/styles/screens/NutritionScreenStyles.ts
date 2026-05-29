import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },

  backBtn: { margin: 20, marginBottom: 0, marginTop: 56 },
  backText: { color: '#888', fontSize: 16 },

  // Tabs
  tabs: {
    flexDirection: 'row',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: { fontSize: 12, fontWeight: '700' },

  // Section
  section: { padding: 20, paddingTop: 16 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14,
  },

  // Water
  waterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  glass: {
    width: 44, height: 54, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
  },
  waterBtns: { flexDirection: 'row', gap: 10 },
  waterBtn: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center' },
  waterBtnText: { fontWeight: '700', fontSize: 15 },
  waterInfo: { fontSize: 13, marginTop: 8, textAlign: 'center' },

  // Goals
  goalRow: { marginBottom: 12 },
  goalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  goalInput: {
    borderRadius: 12, padding: 12,
    fontSize: 16, fontWeight: '700', borderWidth: 1,
  },

  // Recipe card
  recipeCard: {
    borderRadius: 18, padding: 16, marginBottom: 12,
  },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  recipeName: { fontSize: 16, fontWeight: '800', flex: 1 },
  recipeMeta: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  recipeTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  recipeDesc: { fontSize: 13 },

  // Supplement
  suppRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 10, gap: 12,
  },
  suppCheck: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  suppInfo: { flex: 1 },
  suppName: { fontSize: 15, fontWeight: '700' },
  suppMeta: { fontSize: 12, marginTop: 2 },

  // Meal plan
  weekRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dayBtn: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  dayBtnText: { fontSize: 11, fontWeight: '700' },
  mealSlot: { borderRadius: 14, padding: 12, marginBottom: 8 },
  mealSlotLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  mealSlotText: { fontSize: 14 },
  aiHint: { textAlign: 'center', fontSize: 13, marginTop: 8, fontStyle: 'italic' },

  // Add button
  addBtn: { borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 4 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalInput: { borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1 },
  modalRow: { flexDirection: 'row', gap: 10 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});
