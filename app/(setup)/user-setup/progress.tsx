import { getStepName } from "@/constants/Steps";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { View } from "react-native";
import { SlideInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

const ProgressFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [direction, setDirection] = useState("forward");
  const progress = currentStep / totalSteps;
  const router = useRouter();

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
