import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Step4({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title="Interest"
        buttonTitle="Skip"
        className="mt-3"
        onPress={() => router.push("/(setup)/user-setup/complete")}
      />

      {/* progress details */}
      <View className="my-7">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm font-proximanova-semibold">
            Your Progress: {currentStep * 20}%
          </Text>

          <Text className="text-sm font-proximanova-semibold">
            {getStepName(currentStep)}
          </Text>
        </View>

        <AnimatedView layout={Layout.springify()}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={11}
            color="#11293A"
            unfilledColor="#FFFFFF"
            borderWidth={0}
            borderRadius={100}
            animated={true}
            animationConfig={{ duration: 300 }}
          />
        </AnimatedView>
      </View>

      {/* main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
      >
        <InterestSelection
          selectedInterests={selectedInterests}
          onInterestsChange={setSelectedInterests}
          maxSelections={8}
        />
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton title="Next" className="w-full" onPress={onComplete} />
      </View>
    </AnimatedView>
  );
}
