import React, { useState } from 'react';
import { FindSeasonScreen } from './FindSeasonScreen';
import { TestStep } from './TestStep';
import { TestResult } from './TestResult';
import { ConsultantPlaceholder } from './ConsultantPlaceholder';
import { 
  determineColorSeason, 
  getConfidenceLevel, 
  type Undertone, 
  type Chroma, 
  type Value 
} from '@/lib/color-season-test';

type Screen = 'find' | 'test-1' | 'test-2' | 'test-3' | 'result' | 'consultant';

interface ColorSeasonTestProps {
  onClose: () => void;
  onComplete: () => void;
}

// Test data
const STEP_1_OPTIONS = [
  { id: 'warm', color: '#FFF8E7', labelEn: 'Cream', labelZh: '米白色' },
  { id: 'cool', color: '#FFFFFF', labelEn: 'True White', labelZh: '纯白色' },
];

const STEP_2_OPTIONS = [
  { id: 'bright', color: '#4169E1', labelEn: 'Bright Blue', labelZh: '亮蓝色' },
  { id: 'soft', color: '#8BA8B7', labelEn: 'Dusty Blue', labelZh: '灰蓝色' },
];

const STEP_3_OPTIONS = [
  { id: 'light', color: '#FAF0E6', labelEn: 'Light', labelZh: '浅色' },
  { id: 'medium', color: '#D2B48C', labelEn: 'Medium', labelZh: '中等' },
  { id: 'deep', color: '#8B4513', labelEn: 'Deep', labelZh: '深色' },
];

export function ColorSeasonTest({ onClose, onComplete }: ColorSeasonTestProps) {
  const [screen, setScreen] = useState<Screen>('find');
  const [answers, setAnswers] = useState<{
    undertone: Undertone | null;
    chroma: Chroma | null;
    value: Value | null;
  }>({
    undertone: null,
    chroma: null,
    value: null,
  });

  const handleStep1Select = (value: string) => {
    setAnswers(prev => ({ ...prev, undertone: value as Undertone }));
    setScreen('test-2');
  };

  const handleStep1NotSure = () => {
    setAnswers(prev => ({ ...prev, undertone: 'neutral' }));
    setScreen('test-2');
  };

  const handleStep2Select = (value: string) => {
    setAnswers(prev => ({ ...prev, chroma: value as Chroma }));
    setScreen('test-3');
  };

  const handleStep2NotSure = () => {
    setAnswers(prev => ({ ...prev, chroma: 'neutral' }));
    setScreen('test-3');
  };

  const handleStep3Select = (value: string) => {
    setAnswers(prev => ({ ...prev, value: value as Value }));
    setScreen('result');
  };

  const handleStep3NotSure = () => {
    setAnswers(prev => ({ ...prev, value: 'neutral' }));
    setScreen('result');
  };

  const handleRetake = () => {
    setAnswers({ undertone: null, chroma: null, value: null });
    setScreen('test-1');
  };

  const getResultSeason = () => {
    if (!answers.undertone || !answers.chroma || !answers.value) {
      return 'summer-true';
    }
    return determineColorSeason({
      undertone: answers.undertone,
      chroma: answers.chroma,
      value: answers.value,
    });
  };

  const getResultConfidence = () => {
    if (!answers.undertone || !answers.chroma || !answers.value) {
      return 'low';
    }
    return getConfidenceLevel({
      undertone: answers.undertone,
      chroma: answers.chroma,
      value: answers.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      {screen === 'find' && (
        <FindSeasonScreen
          onBack={onClose}
          onStartTest={() => setScreen('test-1')}
          onConsultant={() => setScreen('consultant')}
        />
      )}

      {screen === 'test-1' && (
        <TestStep
          step={0}
          totalSteps={3}
          titleEn="Warm vs Cool"
          titleZh="暖色调 vs 冷色调"
          instructionEn="Put your finger in the middle and see which side makes your skin look brighter and less yellow."
          instructionZh="把手指放在中间，看看哪一边让你的皮肤看起来更明亮、更少黄调。"
          options={STEP_1_OPTIONS}
          notSureEn="Not sure / Both similar"
          notSureZh="不确定 / 两个差不多"
          onSelect={handleStep1Select}
          onBack={() => setScreen('find')}
          onNotSure={handleStep1NotSure}
        />
      )}

      {screen === 'test-2' && (
        <TestStep
          step={1}
          totalSteps={3}
          titleEn="Bright vs Soft"
          titleZh="清晰 vs 柔和"
          instructionEn="Which side makes your skin look cleaner and more refined?"
          instructionZh="哪一边让你的皮肤看起来更干净、更精致？"
          options={STEP_2_OPTIONS}
          notSureEn="Not sure"
          notSureZh="不确定"
          onSelect={handleStep2Select}
          onBack={() => setScreen('test-1')}
          onNotSure={handleStep2NotSure}
        />
      )}

      {screen === 'test-3' && (
        <TestStep
          step={2}
          totalSteps={3}
          titleEn="Light / Medium / Deep"
          titleZh="浅色 / 中等 / 深色"
          instructionEn="Which one makes your skin look more balanced and defined?"
          instructionZh="哪一个让你的皮肤看起来更平衡、更有轮廓感？"
          options={STEP_3_OPTIONS}
          notSureEn="Not sure"
          notSureZh="不确定"
          onSelect={handleStep3Select}
          onBack={() => setScreen('test-2')}
          onNotSure={handleStep3NotSure}
        />
      )}

      {screen === 'result' && (
        <TestResult
          seasonId={getResultSeason()}
          confidence={getResultConfidence()}
          onUseResult={onComplete}
          onRetake={handleRetake}
        />
      )}

      {screen === 'consultant' && (
        <ConsultantPlaceholder onBack={() => setScreen('find')} />
      )}
    </div>
  );
}
