'use client';
import React, { useState, useRef } from 'react';
import { colors, fontSizes, spacing } from '../../theme';
import type { OnboardingSlideBase } from './types';

export interface OnboardingScreenWebProps {
  slides: OnboardingSlideBase[];
  onComplete: () => void | Promise<void>;
  getStartedLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
}

const SLIDE_WIDTH = 400;

export function OnboardingScreenWeb({
  slides,
  onComplete,
  getStartedLabel = 'Get Started',
  nextLabel = 'Next',
  skipLabel = 'Skip',
}: OnboardingScreenWebProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLastSlide = currentIndex === slides.length - 1;

  function handleScroll() {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / SLIDE_WIDTH);
    setCurrentIndex(index);
  }

  function goNext() {
    if (isLastSlide) {
      onComplete();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    const el = scrollRef.current;
    if (el) {
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ left: nextIndex * SLIDE_WIDTH, behavior: 'smooth' });
      } else {
        el.scrollLeft = nextIndex * SLIDE_WIDTH;
      }
    }
  }

  function skip() {
    onComplete();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.blue,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              width: SLIDE_WIDTH,
              minWidth: SLIDE_WIDTH,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              paddingBottom: '20%',
              paddingLeft: spacing.paddingHorizontal,
              paddingRight: spacing.paddingHorizontal,
              scrollSnapAlign: 'start',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: fontSizes.font25 + 1,
                    fontWeight: 700,
                    color: colors.white,
                    marginRight: 8,
                  }}
                >
                  {slide.titleBold}
                </span>
                <span
                  style={{ fontSize: fontSizes.font25 + 1, fontWeight: 300, color: colors.white }}
                >
                  {slide.titleRest}
                </span>
              </div>
              {slide.subtitle ? (
                <p
                  style={{
                    fontSize: fontSizes.font25 + 1,
                    fontWeight: 300,
                    color: colors.white,
                    marginTop: 4,
                    margin: 0,
                  }}
                >
                  {slide.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: spacing.paddingHorizontal,
          paddingRight: spacing.paddingHorizontal,
          paddingBottom: 40,
          paddingTop: 16,
        }}
      >
        <button
          type="button"
          onClick={skip}
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            fontSize: fontSizes.font16,
            fontWeight: 700,
            color: colors.white,
            cursor: 'pointer',
          }}
        >
          {skipLabel}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentIndex ? 35 : 15,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  index === currentIndex ? colors.secondary : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 30,
            padding: '14px 20px',
            fontSize: fontSizes.font16,
            fontWeight: 700,
            color: colors.white,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isLastSlide ? getStartedLabel : nextLabel}
        </button>
      </div>
    </div>
  );
}
