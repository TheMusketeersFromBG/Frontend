import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/screens/ChatScreenStyles';

interface Props {
  onBack: () => void;
  dark: boolean;
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
};

const ACCENT = '#6c63ff';

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SUGGESTIONS = [
  { emoji: '💪', label: 'Дай ми фитнес план' },
  { emoji: '🥗', label: 'Предложи рецепта' },
  { emoji: '📚', label: 'Препоръчай книга' },
  { emoji: '🔥', label: 'Колко калории?' },
];

const MOCK_RESPONSES = [
  'Все още се обучавам и скоро ще съм готов да те помогна! 💪',
  'Работи се по мен — съвсем скоро ще мога да ти дам персонализирани съвети.',
  'Идвам скоро! Ще мога да те консултирам за фитнес, хранене и много повече.',
  'Благодаря за търпението. Тренирам усилено, за да ти дам най-добрите съвети! 🏋️',
];

let mockIndex = 0;
function getMockResponse(): string {
  const r = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
  mockIndex++;
  return r;
}

export default function ChatScreen({ onBack, dark }: Props) {
  const bg = dark ? '#0f0f0f' : '#FFF8F0';
  const cardBg = dark ? '#1c1c1e' : '#fff';
  const text = dark ? '#fff' : '#111';
  const subtext = dark ? '#555' : '#aaa';
  const inputBg = dark ? '#1c1c1e' : '#fff';
  const inputBorder = dark ? '#2a2a2a' : '#e8e8e8';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Здравей! Аз съм AISI — твоят личен AI коуч. Все още се обучавам и скоро ще съм готов да ти помогна с фитнес, хранене и всичко останало! 🚀',
      sender: 'ai',
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef<FlatList>(null);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTyping) return;
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 150);
    const a3 = anim(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); dot1.setValue(0); dot2.setValue(0); dot3.setValue(0); };
  }, [isTyping]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      time: formatTime(new Date()),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getMockResponse(),
        sender: 'ai',
        time: formatTime(new Date()),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1400);
  };

  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bg, borderBottomColor: inputBorder, borderBottomWidth: 1 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color={text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.avatarCircle, { backgroundColor: ACCENT }]}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: text }]}>AISI Coach</Text>
            <Text style={[styles.headerSubtitle, { color: subtext }]}>
              {isTyping ? 'пише...' : 'AI асистент'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
              {!isUser && (
                <View style={[styles.aiBubbleAvatar, { backgroundColor: ACCENT }]}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
              )}
              <View style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAi,
                { backgroundColor: isUser ? ACCENT : cardBg },
              ]}>
                <Text style={[styles.bubbleText, { color: isUser ? '#fff' : text }]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.6)' : subtext }]}>
                  {item.time}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingRow}>
          <View style={[styles.aiBubbleAvatar, { backgroundColor: ACCENT }]}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
          <View style={[styles.typingBubble, { backgroundColor: cardBg }]}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.typingDot, { backgroundColor: subtext, transform: [{ translateY: dot }] }]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Suggestion chips */}
      {showSuggestions && (
        <View style={styles.suggestionsRow}>
          {SUGGESTIONS.map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.chip, { backgroundColor: cardBg, borderColor: inputBorder }]}
              onPress={() => { setInput(s.label); }}
            >
              <Text style={styles.chipEmoji}>{s.emoji}</Text>
              <Text style={[styles.chipText, { color: text }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { backgroundColor: bg }]}>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Напиши съобщение..."
          placeholderTextColor={subtext}
          multiline
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? ACCENT : (dark ? '#2a2a2a' : '#eee') }]}
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Ionicons name="arrow-up" size={20} color={input.trim() ? '#fff' : subtext} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
