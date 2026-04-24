import { getStepName } from "@/constants/Steps";
import { useAuthStore } from "@/stores/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Step1 from "./step-1";
import Step2 from "./step-2";
import Step3 from "./step-3";
import Step4 from "./step-4";
import Step5 from "./step-5";

const ProgressFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [direction, setDirection] = useState("forward");
  const progress = currentStep / totalSteps;
  const router = useRouter();
  const { user } = useAuthStore();
  const initializedFromOnboarding = useRef(false);

  useEffect(() => {
    const onboarding = typeof user?.onboarding === "number" ? user.onboarding : 0;

    if (onboarding >= totalSteps) {
      router.replace("/(tabs)/home");
      return;
    }

    if (!initializedFromOnboarding.current) {
      const nextStep = Math.min(Math.max(onboarding + 1, 1), totalSteps);
      setDirection("forward");
      setCurrentStep(nextStep);
      initializedFromOnboarding.current = true;
    }
  }, [router, totalSteps, user?.onboarding]);

  const getAnimationStyle = (step: number) => {
    if (step === currentStep) {
      return direction === "forward"
        ? SlideInRight.duration(300)
        : SlideInRight.duration(300);
    }
    return undefined;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push("/(setup)/user-setup/complete");
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        style={{ flex: 1 }}
      >
        {/* Animated Step Content */}
        <View className="px-5 flex-1">
          {currentStep === 1 && (
            <Step1
              progress={progress}
              currentStep={currentStep}
              getStepName={getStepName}
              onComplete={handleNext}
              entering={getAnimationStyle(1)}
              handleBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <Step2
              progress={progress}
              currentStep={currentStep}
              getStepName={getStepName}
              onComplete={handleNext}
              entering={getAnimationStyle(2)}
              handleBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3
              progress={progress}
              currentStep={currentStep}
              getStepName={getStepName}
              onComplete={handleNext}
              entering={getAnimationStyle(3)}
              handleBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <Step4
              progress={progress}
              currentStep={currentStep}
              getStepName={getStepName}
              onComplete={handleNext}
              entering={getAnimationStyle(4)}
              handleBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <Step5
              progress={progress}
              currentStep={currentStep}
              getStepName={getStepName}
              onComplete={handleNext}
              entering={getAnimationStyle(5)}
              handleBack={handleBack}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProgressFlow;
