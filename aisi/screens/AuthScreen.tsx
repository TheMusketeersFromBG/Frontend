import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useLanguage } from '../context/LanguageContext';
import type { Lang } from '../translations';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  dark: boolean;
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSignup: (name: string, email: string) => Promise<void>;
  onGoToOnboarding: (name: string) => void;
}

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

const LANGUAGES = [
  { code: 'BG', name: 'Български', flag: '🇧🇬' },
  { code: 'EN', name: 'English',   flag: '🇬🇧' },
  { code: 'EL', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ZH', name: '中文',      flag: '🇨🇳' },
  { code: 'JP', name: '日本語',    flag: '🇯🇵' },
  { code: 'KO', name: '한국어',    flag: '🇰🇷' },
  { code: 'DE', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'RU', name: 'Русский',   flag: '🇷🇺' },
  { code: 'FR', name: 'Français',  flag: '🇫🇷' },
  { code: 'ES', name: 'Español',   flag: '🇪🇸' },
  { code: 'IT', name: 'Italiano',  flag: '🇮🇹' },
  { code: 'PT', name: 'Português', flag: '🇵🇹' },
];

const BG_TOP    = '#dbeafe'; // светло синьо
const BG_BOTTOM = '#ffffff';
const BLACK     = '#000000';
const BLUE      = '#2563eb';
const GRAY      = '#6b7280';
const BORDER    = '#d1d5db';
const ERROR     = '#ef4444';

type View_ = 'landing' | 'login' | 'signup';

export default function AuthScreen({ onLogin, onSignup, onGoToOnboarding }: Props) {
  const { t, setLang } = useLanguage();
  const [view, setView] = useState<View_>('landing');
  const [selectedLang, setSelectedLang] = useState('BG');

  // Login
  const [loginEmail, setLoginEmail]     = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError]     = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Signup
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail || !loginPassword) { setLoginError(t.fillFields); return; }
    const err = await onLogin(loginEmail.trim(), loginPassword);
    if (err) setLoginError(err);
  };

  const validateSignup = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.fillFields;
    if (!EMAIL_REGEX.test(email.trim())) errs.email = t.invalidEmail;
    if (!PASSWORD_REGEX.test(password)) errs.password = t.invalidPassword;
    if (password !== confirmPwd) errs.confirm = t.passwordsMismatch;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    await onSignup(name.trim(), email.trim());
    onGoToOnboarding(name.trim());
  };

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <View style={s.landingContainer}>
        <StatusBar barStyle="light-content" />

        {/* Gradient background */}
        <LinearGradient
          colors={['#0f172a', '#1e3a5f', '#1d4ed8', '#60a5fa']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Abstract blobs */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={W} height={H}>
            <Circle cx={W * 0.85} cy={H * 0.08} r={120} fill="rgba(255,255,255,0.05)" />
            <Circle cx={W * 0.1}  cy={H * 0.25} r={80}  fill="rgba(255,255,255,0.04)" />
            <Ellipse cx={W * 0.6} cy={H * 0.45} rx={160} ry={100} fill="rgba(255,255,255,0.04)" />
            <Circle cx={W * 0.3}  cy={H * 0.7}  r={60}  fill="rgba(255,255,255,0.06)" />
            <Circle cx={W * 0.9}  cy={H * 0.6}  r={100} fill="rgba(99,179,237,0.12)" />
            <Path
              d={`M 0 ${H * 0.55} Q ${W * 0.3} ${H * 0.45} ${W * 0.6} ${H * 0.55} Q ${W * 0.8} ${H * 0.62} ${W} ${H * 0.5} L ${W} ${H} L 0 ${H} Z`}
              fill="rgba(255,255,255,0.04)"
            />
          </Svg>
        </View>

        {/* Logo area */}
        <View style={s.landingTop}>
          {/* Разчупено лого */}
          <View style={s.logoGrid}>
            <View style={s.logoRow}>
              <View style={[s.logoBox, { backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 6 }]}>
                <Text style={s.logoLetter}>A</Text>
              </View>
              <View style={[s.logoBox, { backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 14 }]}>
                <Text style={[s.logoLetter, { fontSize: 36, color: '#93c5fd' }]}>I</Text>
              </View>
            </View>
            <View style={[s.logoRow, { marginTop: 6 }]}>
              <View style={[s.logoBox, { backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 6, marginTop: -10 }]}>
                <Text style={[s.logoLetter, { fontSize: 36, color: '#93c5fd' }]}>S</Text>
              </View>
              <View style={[s.logoBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={s.logoLetter}>I</Text>
              </View>
            </View>
          </View>
          <Text style={s.landingSub}>AI Self Improvement</Text>
        </View>

        {/* Language selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 16 }}
          style={{ flexGrow: 0 }}
        >
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[s.langChip, selectedLang === lang.code && s.langChipActive]}
              onPress={() => { setSelectedLang(lang.code); setLang(lang.code as Lang); }}
            >
              <Text style={{ fontSize: 16 }}>{lang.flag}</Text>
              <Text style={[s.langText, selectedLang === lang.code && { color: '#fff' }]}>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Buttons */}
        <View style={s.landingButtons}>
          <TouchableOpacity style={s.loginBtn} onPress={() => setView('login')}>
            <Text style={s.loginBtnText}>{t.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.signupBtn} onPress={() => setView('signup')}>
            <Text style={s.signupBtnText}>{t.signup}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (view === 'login') {
    return (
      <View style={s.formContainer}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity style={s.back} onPress={() => { setLoginError(''); setView('landing'); }}>
          <Ionicons name="arrow-back" size={22} color={BLACK} />
        </TouchableOpacity>
        <Text style={s.formLogo}>AISI</Text>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {loginError ? (
            <View style={s.errorBox}>
              <Text style={s.errorBoxText}>{loginError}</Text>
            </View>
          ) : null}

          <View style={s.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={GRAY} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder={t.email}
              placeholderTextColor={GRAY}
              autoCapitalize="none"
              keyboardType="email-address"
              value={loginEmail}
              onChangeText={setLoginEmail}
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={GRAY} style={s.inputIcon} />
            <TextInput
              style={[s.input, { paddingRight: 48 }]}
              placeholder={t.password}
              placeholderTextColor={GRAY}
              secureTextEntry={!showLoginPwd}
              value={loginPassword}
              onChangeText={setLoginPassword}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowLoginPwd(v => !v)}>
              <Ionicons name={showLoginPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleLogin}>
            <Text style={s.submitBtnText}>{t.enterApp}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setView('signup')}>
            <Text style={{ color: BLUE, fontSize: 14 }}>{t.noAccount} <Text style={{ fontWeight: '700' }}>{t.register}</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── SIGNUP ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.formContainer}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={s.back} onPress={() => { setErrors({}); setView('landing'); }}>
        <Ionicons name="arrow-back" size={22} color={BLACK} />
      </TouchableOpacity>
      <Text style={s.formLogo}>AISI</Text>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={[s.inputWrapper, errors.name ? s.inputError : null]}>
          <Ionicons name="person-outline" size={18} color={GRAY} style={s.inputIcon} />
          <TextInput style={s.input} placeholder={t.name} placeholderTextColor={GRAY} value={name} onChangeText={setName} />
        </View>
        {errors.name ? <Text style={s.fieldError}>{errors.name}</Text> : null}

        {/* Email */}
        <View style={[s.inputWrapper, errors.email ? s.inputError : null]}>
          <Ionicons name="mail-outline" size={18} color={GRAY} style={s.inputIcon} />
          <TextInput style={s.input} placeholder={t.email} placeholderTextColor={GRAY} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        </View>
        {errors.email ? <Text style={s.fieldError}>{errors.email}</Text> : null}

        {/* Password */}
        <View style={[s.inputWrapper, errors.password ? s.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={18} color={GRAY} style={s.inputIcon} />
          <TextInput style={[s.input, { paddingRight: 48 }]} placeholder={t.password} placeholderTextColor={GRAY} secureTextEntry={!showPwd} value={password} onChangeText={setPassword} />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPwd(v => !v)}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
          </TouchableOpacity>
        </View>
        {errors.password
          ? <Text style={s.fieldError}>{errors.password}</Text>
          : <Text style={s.hint}>{t.passwordHint}</Text>}

        {/* Confirm */}
        <View style={[s.inputWrapper, errors.confirm ? s.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={18} color={GRAY} style={s.inputIcon} />
          <TextInput style={[s.input, { paddingRight: 48 }]} placeholder={t.confirmPassword} placeholderTextColor={GRAY} secureTextEntry={!showConfirm} value={confirmPwd} onChangeText={setConfirmPwd} />
          <TouchableOpacity style={s.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={GRAY} />
          </TouchableOpacity>
        </View>
        {errors.confirm ? <Text style={s.fieldError}>{errors.confirm}</Text> : null}

        <TouchableOpacity style={[s.submitBtn, { backgroundColor: BLACK }]} onPress={handleSignup}>
          <Text style={s.submitBtnText}>{t.register}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setView('login')}>
          <Text style={{ color: BLUE, fontSize: 14 }}>{t.hasAccount} <Text style={{ fontWeight: '700' }}>{t.login}</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  // Landing
  landingContainer: { flex: 1 },
  landingTop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  logoGrid: { alignItems: 'flex-start' },
  logoRow: { flexDirection: 'row' },
  logoBox: {
    width: 72, height: 72, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoLetter: { fontSize: 44, fontWeight: '900', color: '#fff' },
  landingSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 20, letterSpacing: 3, textTransform: 'uppercase' },
  landingBottom: { display: 'none' }, // unused
  landingButtons: {
    paddingHorizontal: 28, paddingBottom: 52, gap: 12,
  },
  loginBtn: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  loginBtnText: { color: '#0f172a', fontSize: 17, fontWeight: '800' },
  signupBtn: {
    borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 16, alignItems: 'center',
  },
  signupBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  signupLink: { color: BLUE, fontSize: 16, fontWeight: '700' },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  langChipActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  langText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // Form screens
  formContainer: { flex: 1, backgroundColor: BG_BOTTOM, paddingHorizontal: 28, paddingTop: 60 },
  back: { marginBottom: 8 },
  formLogo: { fontSize: 40, fontWeight: '900', color: BLACK, letterSpacing: 6, marginBottom: 32 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 14,
    backgroundColor: '#f9fafb', marginBottom: 14, paddingHorizontal: 14,
  },
  inputError: { borderColor: ERROR },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: BLACK },
  eyeBtn: { position: 'absolute', right: 14 },

  submitBtn: {
    backgroundColor: BLUE, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  errorBox: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorBoxText: { color: ERROR, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  fieldError: { color: ERROR, fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 4 },
  hint: { color: GRAY, fontSize: 12, marginTop: -10, marginBottom: 14, marginLeft: 4 },
});
