import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ProfileImagePicker from "@/components/ui/inputs/ProfileImagePicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Step2({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title="Profile Photo"
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
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding here
        className="flex-1" // Add flex-1 to ScrollView
      >
        {/* profile image */}
        <View>
          <ProfileImagePicker
            value={profileImage}
            onImageChange={setProfileImage}
            size={120}
          />

          {profileImage && (
            <TouchableOpacity
              onPress={() => setProfileImage(null)}
              className="mt-6 px-4 py-2 bg-red-500 rounded-lg"
            >
              <Text className="text-white font-proximanova-medium text-center">
                Remove Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* intro  */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Add a personal intro
          </Text>

          <TextInput
            placeholder="Type here..."
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm h-20"
            autoCapitalize="none"
            multiline={true}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton title="Next" className="w-full" onPress={onComplete} />
      </View>
    </AnimatedView>
  );
}
