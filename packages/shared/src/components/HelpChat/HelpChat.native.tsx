import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme';
import type { HelpChatProps } from './HelpChat.types';

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 16 },
  hint: { fontSize: 14, color: colors.grey, marginBottom: 12 },
  row: { marginBottom: 8, alignItems: 'flex-start' },
  rowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '85%', padding: 10, borderRadius: 10 },
  bubbleUser: { backgroundColor: colors.secondary },
  bubbleAssistant: { backgroundColor: colors.borderLight },
  bubbleTextUser: { color: colors.white, fontSize: 14 },
  bubbleTextAssistant: { color: colors.black, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.black,
  },
  sendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  sendBtnDisabled: { opacity: 0.7 },
  sendText: { color: colors.white, fontWeight: '600' },
  error: { color: colors.error, fontSize: 14, marginTop: 8, marginHorizontal: 12 },
});

export function HelpChatNative({
  messages,
  onSend,
  sending,
  error,
  hintText,
  inputPlaceholder = 'Type a message…',
}: HelpChatProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || sending) return;
    onSend(text);
    setInputValue('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.length === 0 && <Text style={styles.hint}>{hintText}</Text>}
        {messages.map((m, i) => (
          <View key={i} style={[styles.row, m.role === 'user' && styles.rowUser]}>
            <View
              style={[
                styles.bubble,
                m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text style={m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
                {m.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.grey}
          editable={!sending}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (sending || !inputValue.trim()) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending || !inputValue.trim()}
        >
          <Text style={styles.sendText}>{sending ? '…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}
