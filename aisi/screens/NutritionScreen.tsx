import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/screens/NutritionScreenStyles';
import { useNutritionData } from '../hooks/useNutritionData';
import { usePlan } from '../hooks/usePlan';
import LockedOverlay from '../components/LockedOverlay';
import { useLanguage } from '../context/LanguageContext';

interface Props { onBack: () => void; dark: boolean; onOpenChat?: () => void; }

const ACCENT = '#8bc34a';
// generated inside component

export default function NutritionScreen({ onBack, dark, onOpenChat }: Props) {
  const { t, locale } = useLanguage();
  const localeDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i);
    return d.toLocaleDateString(locale, { weekday: 'short' });
  });

  const TABS = [t.water, t.recipes, t.supplements, t.weeklyPlan, t.goalsTab] as const;
  type Tab = typeof TABS[number];

  const MEAL_SLOTS = [
    { key: 'breakfast', label: t.breakfast },
    { key: 'lunch',     label: t.lunch     },
    { key: 'dinner',    label: t.dinner    },
  ] as const;

  const {
    waterGlasses, addWater, removeWater,
    supplements, toggleSupplement, addSupplement, removeSupplement,
    goals, saveGoals,
    recipes, addRecipe, removeRecipe,
    mealPlan, updateMealSlot,
  } = useNutritionData();

  const { isPaid } = usePlan();
  const [activeTab, setActiveTab]     = useState<string>(t.water);
  const [activeDay, setActiveDay]     = useState(0);
  const [showAddSupp, setShowAddSupp] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ day: string; slot: string; label: string } | null>(null);
  const [slotInput, setSlotInput]     = useState('');

  const [suppForm, setSuppForm] = useState({ name: '', dose: '', time: '' });
  const [recipeForm, setRecipeForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', prepTime: '', description: '' });
  const [goalsForm, setGoalsForm] = useState({ protein: String(goals.protein), carbs: String(goals.carbs), fat: String(goals.fat), water: String(goals.water) });

  const bg          = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg      = dark ? '#1c1c1e' : '#fff';
  const text        = dark ? '#fff'    : '#111';
  const subtext     = dark ? '#555'    : '#888';
  const inputBg     = dark ? '#2a2a2a' : '#f5f5f5';
  const inputBorder = dark ? '#3a3a3a' : '#e0e0e0';
  const tabBg       = dark ? '#1c1c1e' : '#f0f0f0';

  const rName = (r: { id: string; name: string }) =>
    ({ '1': t.r1Name, '2': t.r2Name, '3': t.r3Name, '4': t.r4Name }[r.id] ?? r.name);
  const rDesc = (r: { id: string; description: string }) =>
    ({ '1': t.r1Desc, '2': t.r2Desc, '3': t.r3Desc, '4': t.r4Desc }[r.id] ?? r.description);

  const dayKey = (i: number) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1 + i);
    return d.toISOString().split('T')[0];
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>{t.back}</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: tabBg }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { backgroundColor: ACCENT }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : subtext }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ВОДА */}
        {activeTab === t.water && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.water}</Text>
            <View style={styles.waterRow}>
              {Array.from({ length: goals.water }).map((_, i) => (
                <View key={i} style={[styles.glass, { backgroundColor: i < waterGlasses ? '#2196f3' : cardBg, borderColor: i < waterGlasses ? '#2196f3' : inputBorder }]}>
                  <Ionicons name="water" size={20} color={i < waterGlasses ? '#fff' : subtext} />
                </View>
              ))}
            </View>
            <Text style={[styles.waterInfo, { color: subtext }]}>
              {waterGlasses} / {goals.water} {t.glasses} · {waterGlasses * 250} / {goals.water * 250} {t.ml}
            </Text>
            <View style={[styles.waterBtns, { marginTop: 16 }]}>
              <TouchableOpacity style={[styles.waterBtn, { backgroundColor: cardBg }]} onPress={removeWater}>
                <Text style={[styles.waterBtnText, { color: subtext }]}>{t.removeGlass}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.waterBtn, { backgroundColor: '#2196f3' }]} onPress={addWater}>
                <Text style={[styles.waterBtnText, { color: '#fff' }]}>{t.addGlass}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* РЕЦЕПТИ */}
        {activeTab === t.recipes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.recipes}</Text>
            <View style={{ overflow: 'hidden', borderRadius: 16, marginBottom: 16 }}>
              {!isPaid && <LockedOverlay dark={dark} />}
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: '#607d8b', marginBottom: 0 }]}
                onPress={() => onOpenChat?.()}
              >
                <Text style={styles.addBtnText}>{t.aiRecipes}</Text>
              </TouchableOpacity>
            </View>
            {recipes.map(r => (
              <View key={r.id} style={[styles.recipeCard, { backgroundColor: cardBg }]}>
                <View style={styles.recipeHeader}>
                  <Text style={[styles.recipeName, { color: text }]}>{rName(r)}</Text>
                  <TouchableOpacity onPress={() => removeRecipe(r.id)}>
                    <Ionicons name="trash-outline" size={16} color={subtext} />
                  </TouchableOpacity>
                </View>
                <View style={styles.recipeMeta}>
                  <Text style={[styles.recipeTag, { backgroundColor: `${ACCENT}22`, color: ACCENT }]}>🕐 {r.prepTime}</Text>
                  <Text style={[styles.recipeTag, { backgroundColor: '#ff980022', color: '#ff9800' }]}>🔥 {r.calories} kcal</Text>
                  <Text style={[styles.recipeTag, { backgroundColor: '#4caf5022', color: '#4caf50' }]}>💪 {r.protein}g</Text>
                </View>
                <Text style={[styles.recipeDesc, { color: subtext }]}>{rDesc(r)}</Text>
              </View>
            ))}
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: ACCENT }]} onPress={() => setShowAddRecipe(true)}>
              <Text style={styles.addBtnText}>{t.addRecipe}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ДОБАВКИ */}
        {activeTab === t.supplements && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.supplements}</Text>
            <View style={{ overflow: 'hidden', borderRadius: 16, marginBottom: 16 }}>
              {!isPaid && <LockedOverlay dark={dark} />}
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: '#607d8b', marginBottom: 0 }]}
                onPress={() => onOpenChat?.()}
              >
                <Text style={styles.addBtnText}>{t.aiSupps}</Text>
              </TouchableOpacity>
            </View>
            {supplements.length === 0 && (
              <Text style={[{ color: subtext, textAlign: 'center', marginBottom: 16 }]}>{t.noSupplements}</Text>
            )}
            {supplements.map(s => (
              <View key={s.id} style={[styles.suppRow, { backgroundColor: cardBg }]}>
                <TouchableOpacity
                  style={[styles.suppCheck, { borderColor: ACCENT, backgroundColor: s.takenToday ? ACCENT : 'transparent' }]}
                  onPress={() => toggleSupplement(s.id)}
                >
                  {s.takenToday && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <View style={styles.suppInfo}>
                  <Text style={[styles.suppName, { color: text, textDecorationLine: s.takenToday ? 'line-through' : 'none' }]}>{s.name}</Text>
                  <Text style={[styles.suppMeta, { color: subtext }]}>{s.dose} · {s.time}</Text>
                </View>
                <TouchableOpacity onPress={() => removeSupplement(s.id)}>
                  <Ionicons name="trash-outline" size={16} color={subtext} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: ACCENT }]} onPress={() => setShowAddSupp(true)}>
              <Text style={styles.addBtnText}>{t.addSupplement}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ПЛАН */}
        {activeTab === t.weeklyPlan && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.weeklyPlan}</Text>
            <View style={{ overflow: 'hidden', borderRadius: 16, marginBottom: 16 }}>
              {!isPaid && <LockedOverlay dark={dark} />}
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: '#9c27b0', marginBottom: 0 }]}
                onPress={() => onOpenChat?.()}
              >
                <Text style={styles.addBtnText}>{t.aiMealPlan}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.weekRow}>
              {localeDays.map((d, i) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, { backgroundColor: activeDay === i ? ACCENT : cardBg }]}
                  onPress={() => setActiveDay(i)}
                >
                  <Text style={[styles.dayBtnText, { color: activeDay === i ? '#fff' : subtext }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {MEAL_SLOTS.map(slot => {
              const key = dayKey(activeDay);
              const value = mealPlan[key]?.[slot.key] || '';
              return (
                <TouchableOpacity
                  key={slot.key}
                  style={[styles.mealSlot, { backgroundColor: cardBg }]}
                  onPress={() => { setSlotInput(value); setEditingSlot({ day: key, slot: slot.key, label: slot.label }); }}
                >
                  <Text style={[styles.mealSlotLabel, { color: subtext }]}>{slot.label}</Text>
                  <Text style={[styles.mealSlotText, { color: value ? text : subtext }]}>
                    {value || `${t.add}...`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ЦЕЛИ */}
        {activeTab === t.goalsTab && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: subtext }]}>{t.goalsTab}</Text>
            {[
              { key: 'protein', label: `${t.protein} (g)`, color: '#4caf50' },
              { key: 'carbs',   label: `${t.carbs} (g)`,   color: '#2196f3' },
              { key: 'fat',     label: `${t.fat} (g)`,     color: '#f44336' },
              { key: 'water',   label: `${t.water} (${t.glasses})`, color: '#03a9f4' },
            ].map(f => (
              <View key={f.key} style={styles.goalRow}>
                <Text style={[styles.goalLabel, { color: text }]}>{f.label}</Text>
                <TextInput
                  style={[styles.goalInput, { backgroundColor: inputBg, borderColor: f.color, color: text }]}
                  keyboardType="numeric"
                  value={goalsForm[f.key as keyof typeof goalsForm]}
                  onChangeText={v => setGoalsForm(g => ({ ...g, [f.key]: v }))}
                  onBlur={() => saveGoals({
                    protein: Number(goalsForm.protein) || 150,
                    carbs:   Number(goalsForm.carbs)   || 250,
                    fat:     Number(goalsForm.fat)     || 70,
                    water:   Number(goalsForm.water)   || 8,
                  })}
                />
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Modal добавка */}
      <Modal visible={showAddSupp} transparent animationType="slide" onRequestClose={() => setShowAddSupp(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addSupplement}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.recipeName} placeholderTextColor={subtext} value={suppForm.name} onChangeText={v => setSuppForm(f => ({ ...f, name: v }))} />
            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.dose} placeholderTextColor={subtext} value={suppForm.dose} onChangeText={v => setSuppForm(f => ({ ...f, dose: v }))} />
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.time} placeholderTextColor={subtext} value={suppForm.time} onChangeText={v => setSuppForm(f => ({ ...f, time: v }))} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowAddSupp(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => { if (suppForm.name) { addSupplement(suppForm); setSuppForm({ name: '', dose: '', time: '' }); setShowAddSupp(false); } }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal рецепта */}
      <Modal visible={showAddRecipe} transparent animationType="slide" onRequestClose={() => setShowAddRecipe(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{t.addRecipe}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.recipeName} placeholderTextColor={subtext} value={recipeForm.name} onChangeText={v => setRecipeForm(f => ({ ...f, name: v }))} />
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.description} placeholderTextColor={subtext} value={recipeForm.description} onChangeText={v => setRecipeForm(f => ({ ...f, description: v }))} />
            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder="kcal" placeholderTextColor={subtext} keyboardType="numeric" value={recipeForm.calories} onChangeText={v => setRecipeForm(f => ({ ...f, calories: v }))} />
              <TextInput style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={t.prepTime} placeholderTextColor={subtext} value={recipeForm.prepTime} onChangeText={v => setRecipeForm(f => ({ ...f, prepTime: v }))} />
            </View>
            <View style={styles.modalRow}>
              {[{ key: 'protein', ph: t.protein }, { key: 'carbs', ph: t.carbs }, { key: 'fat', ph: t.fat }].map(field => (
                <TextInput key={field.key} style={[styles.modalInput, { flex: 1, backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholder={field.ph} placeholderTextColor={subtext} keyboardType="numeric" value={recipeForm[field.key as keyof typeof recipeForm]} onChangeText={v => setRecipeForm(f => ({ ...f, [field.key]: v }))} />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setShowAddRecipe(false)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => {
                if (recipeForm.name) {
                  addRecipe({ name: recipeForm.name, calories: Number(recipeForm.calories) || 0, protein: Number(recipeForm.protein) || 0, carbs: Number(recipeForm.carbs) || 0, fat: Number(recipeForm.fat) || 0, prepTime: recipeForm.prepTime || '—', description: recipeForm.description });
                  setRecipeForm({ name: '', calories: '', protein: '', carbs: '', fat: '', prepTime: '', description: '' });
                  setShowAddRecipe(false);
                }
              }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.add}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal meal slot */}
      <Modal visible={!!editingSlot} transparent animationType="fade" onRequestClose={() => setEditingSlot(null)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center', padding: 32 }]}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderRadius: 24 }]}>
            <Text style={[styles.modalTitle, { color: text }]}>{editingSlot?.label}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]} placeholderTextColor={subtext} value={slotInput} onChangeText={setSlotInput} autoFocus />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: inputBg }]} onPress={() => setEditingSlot(null)}>
                <Text style={[styles.modalBtnText, { color: subtext }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: ACCENT }]} onPress={() => {
                if (editingSlot) { updateMealSlot(editingSlot.day, editingSlot.slot as any, slotInput); setEditingSlot(null); }
              }}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
