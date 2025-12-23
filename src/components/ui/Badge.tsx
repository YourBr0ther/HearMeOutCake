import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';

interface BadgeProps {
  code: string;
  copyable?: boolean;
}

export function Badge({ code, copyable = true }: BadgeProps) {
  const handleCopy = async () => {
    if (copyable) {
      await Clipboard.setStringAsync(code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const content = (
    <View style={styles.container}>
      <Text style={styles.code}>{code}</Text>
      {copyable && <Text style={styles.hint}>Tap to copy</Text>}
    </View>
  );

  if (copyable) {
    return (
      <TouchableOpacity onPress={handleCopy} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pastel.lavender,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  code: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 8,
    color: colors.purple.dark,
  },
  hint: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginTop: 4,
  },
});
