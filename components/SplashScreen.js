import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onEnter }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const rotateAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animations
    Animated.loop(
      Animated.timing(rotateAnim1, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim3, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0, -10, 5, 0],
  });

  const rotate1 = rotateAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = rotateAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const rotate3 = rotateAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: -20 }],
            },
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.cosmicRing,
                  styles.ring1,
                  { transform: [{ rotate: rotate1 }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.cosmicRing,
                  styles.ring2,
                  { transform: [{ rotate: rotate2 }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.cosmicRing,
                  styles.ring3,
                  { transform: [{ rotate: rotate3 }] },
                ]}
              />
              <Animated.Text
                style={[
                  styles.appLogo,
                  { transform: [{ translateY: floatTranslate }] },
                ]}
              >
                🌌
              </Animated.Text>
            </View>
            <Text style={styles.title}>TerraNebular</Text>
            <Text style={styles.subtitle}>Where Development Dreams Take Shape</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Spatial intelligence platform for Kigali's urban development. Explore
            zoning regulations, get instant insights, and make informed development
            decisions with AI-powered analysis.
          </Text>

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>How to Use</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureBox}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>1</Text>
                </View>
                <Text style={styles.featureTitle}>Click on the Map</Text>
                <Text style={styles.featureDescription}>
                  Select any location in Kigali to view its zoning classification
                </Text>
              </View>
              <View style={styles.featureBox}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>2</Text>
                </View>
                <Text style={styles.featureTitle}>View Zone Details</Text>
                <Text style={styles.featureDescription}>
                  See zoning type and regulations in the panel
                </Text>
              </View>
              <View style={styles.featureBox}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>3</Text>
                </View>
                <Text style={styles.featureTitle}>Ask Questions</Text>
                <Text style={styles.featureDescription}>
                  Use AI to answer questions about development, permits, and investment
                </Text>
              </View>
              <View style={styles.featureBox}>
                <View style={styles.featureNumber}>
                  <Text style={styles.featureNumberText}>4</Text>
                </View>
                <Text style={styles.featureTitle}>Make Decisions</Text>
                <Text style={styles.featureDescription}>
                  Get zoning insights to inform your development plans
                </Text>
              </View>
            </View>
          </View>

          {/* Enter Button */}
          <TouchableOpacity style={styles.enterButton} onPress={onEnter}>
            <Text style={styles.enterButtonText}>✨ Enter TerraNebular</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  contentWrapper: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cosmicRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 999,
  },
  ring1: {
    width: 80,
    height: 80,
    borderColor: '#6366F1',
  },
  ring2: {
    width: 100,
    height: 100,
    borderColor: '#EC4899',
  },
  ring3: {
    width: 120,
    height: 120,
    borderColor: '#F59E0B',
  },
  appLogo: {
    fontSize: 48,
    zIndex: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    opacity: 0.9,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: width * 0.9,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featuresTitle: {
    textAlign: 'center',
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  featureBox: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  featureNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureNumberText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 18,
  },
  enterButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  enterButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

