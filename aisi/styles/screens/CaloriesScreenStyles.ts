import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { padding: 20, paddingTop: 56 },
  fabWrapper: { alignItems: 'center', marginTop: 16, overflow: 'visible' },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    bottom: 40,
    zIndex: 20,
  },
  listScroll: { padding: 20, paddingBottom: 40 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  backBtn: { marginBottom: 16 },
  backText: { color: '#888', fontSize: 16 },

  // Date nav
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateText: { fontSize: 15, fontWeight: '700' },
  dateArrow: { padding: 8 },

  // Tiger section
  tigerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  // Macros
  macrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  macroValue: { fontSize: 18, fontWeight: '800' },
  macroLabel: { fontSize: 11, fontWeight: '600' },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Food list
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  foodEntry: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  foodPhoto: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  foodPhotoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  foodMacros: { fontSize: 12 },
  foodRight: { alignItems: 'flex-end', gap: 4 },
  foodCals: { fontSize: 16, fontWeight: '800' },
  foodTime: { fontSize: 11 },

  // Goal button
  goalBtn: {
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  goalBtnText: { fontSize: 13, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  modalRow: { flexDirection: 'row', gap: 10 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },

  cameraHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: -6,
  },

  // Action sheet
  actionSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  actionSheetText: {
    flex: 1,
    gap: 2,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionSheetDesc: {
    fontSize: 13,
  },
});
