import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#888',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  editBtn: {
    padding: 8,
    borderRadius: 12,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleText: {
    fontSize: 13,
  },

  // Card
  card: {
    borderRadius: 20,
    padding: 16,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },

  // Detailed measurements
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  measureItem: {
    width: '47%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  measureLabel: {
    fontSize: 13,
  },
  measureValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
  },

  // Achievements
  achieveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achieveItem: {
    width: '47%',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  achieveEmoji: {
    fontSize: 26,
  },
  achieveCol: {
    flex: 1,
  },
  achieveTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  achieveDesc: {
    fontSize: 11,
    marginTop: 1,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
  },
  separator: {
    height: 1,
  },

  // Edit modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  metricTouchable: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
});
