import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface TimerProps {
  seconds: number;
  onTick?: () => void;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({ seconds, onTick, isActive = true, size = 'md' }: TimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        onTick?.();
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds, onTick]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

  const isWarning = seconds <= 60;
  const isCritical = seconds <= 30;

  return (
    <View
      style={[
        styles.container,
        styles[`container_${size}`],
        isWarning && styles.warning,
        isCritical && styles.critical,
      ]}
    >
      <Text
        style={[
          styles.time,
          styles[`time_${size}`],
          isWarning && styles.timeWarning,
          isCritical && styles.timeCritical,
        ]}
      >
        {timeString}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pastel.mint,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container_sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  container_md: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  container_lg: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  warning: {
    backgroundColor: colors.pastel.peach,
  },
  critical: {
    backgroundColor: colors.pink.DEFAULT,
  },
  time: {
    fontWeight: '700',
    color: colors.primary.dark,
    fontVariant: ['tabular-nums'],
  },
  time_sm: {
    fontSize: 18,
  },
  time_md: {
    fontSize: 24,
  },
  time_lg: {
    fontSize: 32,
  },
  timeWarning: {
    color: colors.orange.DEFAULT,
  },
  timeCritical: {
    color: colors.neutral.white,
  },
});
