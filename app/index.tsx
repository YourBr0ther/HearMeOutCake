import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui';
import { colors, gradients } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[colors.pastel.mint, colors.neutral.offWhite]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo/Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.emoji}>🎂</Text>
            <Text style={styles.title}>HearMeOut</Text>
            <Text style={styles.titleAccent}>Cake</Text>
            <Text style={styles.subtitle}>
              Pick your flags. Stick them in the cake.{'\n'}
              Defend your choices!
            </Text>
          </View>

          {/* How to Play */}
          <View style={styles.howToPlay}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Create or join a game with a theme</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Pick 5 images for your flags</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Reveal and discuss your picks!</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttons}>
            <Button
              title="Create Game"
              onPress={() => router.push('/create-game')}
              variant="primary"
              size="lg"
              fullWidth
            />
            <Button
              title="Join Game"
              onPress={() => router.push('/join-game')}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.neutral.dark,
    letterSpacing: -1,
  },
  titleAccent: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: -1,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  howToPlay: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.DEFAULT,
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral.dark,
  },
  buttons: {
    gap: 16,
  },
});
