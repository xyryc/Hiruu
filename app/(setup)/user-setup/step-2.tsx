import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ProfileImagePicker from "@/components/ui/inputs/ProfileImagePicker";
import { useProfileStore } from "@/stores/profileStore";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { toast } from "sonner-native";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Step2({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const hasPrefilledFromProfile = useRef(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const { updateProfile, isLoading } = useProfileStore();
  const isStep2ProfileLocked = Boolean(
    (user as any)?.avatar || (typeof (user as any)?.bio === "string" && (user as any).bio.trim())
  );

  useEffect(() => {
    if (!user || hasPrefilledFromProfile.current) return;
    const profileUser = user as any;
    if (typeof profileUser?.avatar === "string" && profileUser.avatar) {
      setProfileImage(profileUser.avatar);
    }
    if (typeof profileUser?.bio === "string" && profileUser.bio) {
      setBio(profileUser.bio);
    }
    hasPrefilledFromProfile.current = true;
  }, [user]);

  // Handle form submission
  const handleNext = async () => {
    if (isStep2ProfileLocked) {
      onComplete();
      return;
    }

    if (!profileImage && !bio.trim()) {
      onComplete();
      return;
    }

    try {
      const profileData: any = {};

      // Add intro if provided
      if (bio.trim()) {
        profileData.bio = bio.trim();
      }

      // Add profile image if provided
      if (profileImage) {
        const filename = profileImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : "image/jpeg";

        profileData.avatar = {
          uri: profileImage,
          type: type,
          name: filename || "profile.jpg",
        };
      }
      profileData.onboarding = 2;

      // Call same API as Step1
      await updateProfile(profileData);

      onComplete();
    } catch (error: any) {
      toast.error(error.message || t("user.setup.profileUpdateError"));
      console.error("Profile update error:", error);
    }
  };

  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title={t("user.setup.businessSetup.profilePhotoTitle")}
        buttonTitle={t("user.setup.skip")}
        className="mt-3"
        onPress={onComplete}
      />

      {/* progress details */}
      <View className="my-7">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm font-proximanova-semibold">
            {t("user.setup.yourProgress", { percent: currentStep * 20 })}
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
        <View
          pointerEvents={isStep2ProfileLocked ? "none" : "auto"}
          style={{ opacity: isStep2ProfileLocked ? 0.7 : 1 }}
        >
          <ProfileImagePicker value={profileImage} onImageChange={setProfileImage} size={120} />

          {profileImage && (
            <TouchableOpacity
              onPress={() => setProfileImage(null)}
              className="mt-6 px-4 py-2 bg-red-500 rounded-lg"
              disabled={isStep2ProfileLocked}
            >
              <Text className="text-white font-proximanova-medium text-center">
                {t("user.setup.businessSetup.removePhoto")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* intro  */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            {t("user.setup.addPersonalIntro")}
          </Text>

          <TextInput
            placeholder={t("user.setup.businessSetup.typeHere")}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm h-20"
            autoCapitalize="none"
            multiline={true}
            textAlignVertical="top"
            value={bio}
            onChangeText={setBio}
            editable={!isStep2ProfileLocked}
          />
        </View>
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton
          title={t("user.setup.next")}
          className="w-full"
          onPress={handleNext}
          loading={isLoading}
        />
      </View>
    </AnimatedView>
  );
}
