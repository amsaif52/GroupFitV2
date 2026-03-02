import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { colors, fontSizes, spacing } from '../../theme';
import type { OnboardingSlideBase } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type OnboardingSlide = OnboardingSlideBase & {
  /** Optional background image per slide (RN only) */
  image?: ImageSourcePropType;
};

export interface OnboardingScreenNativeProps {
  /** Slides to show (e.g. 3 slides for customer or trainer copy) */
  slides: OnboardingSlide[];
  /** Called when user taps Get Started on the last slide */
  onComplete: () => void | Promise<void>;
  /** Label for the final CTA button */
  getStartedLabel?: string;
  /** Label for Next button */
  nextLabel?: string;
  /** Label for Skip button */
  skipLabel?: string;
}

export function OnboardingScreenNative({
  slides,
  onComplete,
  getStartedLabel = "Get Started",
  nextLabel = "Next",
  skipLabel = "Skip",
}: OnboardingScreenNativeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLastSlide = currentIndex === slides.length - 1;

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  }

  function goNext() {
    if (isLastSlide) {
      onComplete();
      return;
    }
    scrollRef.current?.scrollTo({
      x: (currentIndex + 1) * SCREEN_WIDTH,
      animated: true,
    });
  }

  function skip() {
    onComplete();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            {slide.image ? (
              <ImageBackground source={slide.image} style={styles.slideBg} resizeMode="cover">
                <View style={styles.textOverlay}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleBold}>{slide.titleBold}</Text>
                    <Text style={styles.titleRest}>{slide.titleRest}</Text>
                  </View>
                  {slide.subtitle ? <Text style={styles.subtitle}>{slide.subtitle}</Text> : null}
                </View>
              </ImageBackground>
            ) : (
              <View style={[styles.slideBg, styles.slideBgPlaceholder]}>
                <View style={styles.textOverlay}>
                  <View style={styles.titleRow}>
                    <Text style={styles.titleBold}>{slide.titleBold}</Text>
                    <Text style={styles.titleRest}>{slide.titleRest}</Text>
                  </View>
                  {slide.subtitle ? <Text style={styles.subtitle}>{slide.subtitle}</Text> : null}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom: Skip, dots, Next / Get Started */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={skip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.skipBtn}>
          <Text style={styles.skipText}>{skipLabel}</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={goNext} style={styles.nextBtn} activeOpacity={0.8}>
          <Text style={styles.nextText}>
            {isLastSlide ? getStartedLabel : nextLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blue,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideBgPlaceholder: {
    backgroundColor: colors.blue,
  },
  textOverlay: {
    alignSelf: 'center',
    paddingHorizontal: spacing.paddingHorizontal,
    paddingBottom: '20%',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBold: {
    fontSize: fontSizes.font25 + 1,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginRight: 8,
  },
  titleRest: {
    fontSize: fontSizes.font25 + 1,
    fontWeight: '300',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: fontSizes.font25 + 1,
    fontWeight: '300',
    color: colors.white,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 34,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.paddingHorizontal,
    paddingBottom: 40,
    paddingTop: 16,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: fontSizes.font16,
    fontWeight: '700',
    color: colors.white,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 15,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 35,
    backgroundColor: colors.secondary,
  },
  nextBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  nextText: {
    fontSize: fontSizes.font16,
    fontWeight: '700',
    color: colors.white,
  },
});
