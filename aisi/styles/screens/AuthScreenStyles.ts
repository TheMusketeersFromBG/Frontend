import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  logo: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 42, fontWeight: '900', letterSpacing: 6 },
  logoSub: { fontSize: 14, marginTop: 4 },

  tabs: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 2, marginBottom: 32 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 15, fontWeight: '700' },

  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginLeft: 4 },
  input: {
    borderRadius: 14, padding: 14, fontSize: 16,
    borderWidth: 1.5, marginBottom: 14,
  },
  inputError: { borderColor: '#f44336' },
  errorText: { fontSize: 12, color: '#f44336', marginTop: -10, marginBottom: 10, marginLeft: 4 },

  submitBtn: {
    borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8,
  },
  submitBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },

  passwordHint: {
    fontSize: 12, marginTop: -10, marginBottom: 14, marginLeft: 4, lineHeight: 18,
  },

  globalError: {
    borderRadius: 12, padding: 12, marginBottom: 14,
  },
  globalErrorText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

  showHide: { position: 'absolute', right: 16, top: 15 },
});
