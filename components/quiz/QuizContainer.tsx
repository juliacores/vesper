'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase/client';
import QuizStep1 from './QuizStep1';
import QuizStep2 from './QuizStep2';
import QuizStep3 from './QuizStep3';
import QuizStep4 from './QuizStep4';
import QuizStep5 from './QuizStep5';
import QuizStep6 from './QuizStep6';

export interface QuizAnswers {
  dynamic?: 'Submissive' | 'Dominant' | 'Switch' | 'Observer/Voyeur';
  tone?: 'Worship/Praise' | 'Degradation/Dirty' | 'Stern/Commanding' | 'Soft/Romantic';
  triggers?: string[];
  psychology?: string;
  hardLimits?: string[];
  safeword?: string;
}

const TOTAL_STEPS = 6;

export default function QuizContainer() {
  const router = useRouter();
  const { setUserPreferences } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    safeword: 'Red', // Default safeword
  });

  const updateAnswer = (step: number, value: any) => {
    const stepKeys: (keyof QuizAnswers)[] = [
      'dynamic',
      'tone',
      'triggers',
      'psychology',
      'hardLimits',
      'safeword',
    ];
    setAnswers((prev) => ({ ...prev, [stepKeys[step - 1]]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save to Zustand store
    setUserPreferences({
      dynamic: answers.dynamic,
      tone: answers.tone,
      triggers: answers.triggers,
      psychology: answers.psychology,
      hardLimits: answers.hardLimits,
      safeword: answers.safeword || 'Red',
    });

    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dynamic: answers.dynamic,
          tone: answers.tone,
          triggers: answers.triggers,
          psychology: answers.psychology,
          hard_limits: answers.hardLimits,
          safeword: answers.safeword || 'Red',
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        // Don't block navigation if save fails
      }
    }

    // Navigate to feature tour
    router.push('/onboarding/tour');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!answers.dynamic;
      case 2:
        return !!answers.tone;
      case 3:
        return answers.triggers && answers.triggers.length > 0;
      case 4:
        return !!answers.psychology;
      case 5:
        return true; // Hard limits are optional
      case 6:
        return !!answers.safeword && answers.safeword.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-void p-6">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-paper/60">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-paper/60">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="h-1 bg-paper/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-lime"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Quiz Steps */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <QuizStep1
              key="step1"
              value={answers.dynamic}
              onChange={(value) => updateAnswer(1, value)}
            />
          )}
          {currentStep === 2 && (
            <QuizStep2
              key="step2"
              value={answers.tone}
              onChange={(value) => updateAnswer(2, value)}
            />
          )}
          {currentStep === 3 && (
            <QuizStep3
              key="step3"
              value={answers.triggers || []}
              onChange={(value) => updateAnswer(3, value)}
            />
          )}
          {currentStep === 4 && (
            <QuizStep4
              key="step4"
              value={answers.psychology}
              onChange={(value) => updateAnswer(4, value)}
            />
          )}
          {currentStep === 5 && (
            <QuizStep5
              key="step5"
              value={answers.hardLimits || []}
              onChange={(value) => updateAnswer(5, value)}
            />
          )}
          {currentStep === 6 && (
            <QuizStep6
              key="step6"
              value={answers.safeword || 'Red'}
              onChange={(value) => updateAnswer(6, value)}
            />
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex-1 py-4 bg-paper/10 border border-paper/20 text-paper font-semibold rounded-lg"
            >
              Back
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-4 font-semibold rounded-lg ${
              canProceed()
                ? 'bg-lime text-void'
                : 'bg-paper/10 text-paper/40 cursor-not-allowed'
            }`}
          >
            {currentStep === TOTAL_STEPS ? 'Complete' : 'Next'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

