import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import MultiSelectCompanyDropdown from "@/components/ui/inputs/MultiSelectCompanyDropdown";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { Companies, Company } from "@/types";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { toast } from "sonner-native";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Step3({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const hasPrefilledFromProfile = useRef(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Companies[]>([]);
  const { updateProfile, syncExperiences, isLoading } = useProfileStore();

  useEffect(() => {
    if (!user || hasPrefilledFromProfile.current) return;
    const profileUser = user as any;
    const profileExperiences = Array.isArray(profileUser?.experiences) ? profileUser.experiences : [];
    if (!profileExperiences.length) {
      hasPrefilledFromProfile.current = true;
      return;
    }

    const hydratedExperiences: Companies[] = profileExperiences.map((exp: any, index: number) => {
      const businessId = exp?.businessId || exp?.business?.id;
      const customBusinessName = exp?.customBusinessName;
      const companyName =
        exp?.business?.name ||
        customBusinessName ||
        `Experience ${index + 1}`;
      const companyId = businessId || `custom_${exp?.id || index}`;
      return {
        id: exp?.id,
        companyId,
        businessId,
        companyName,
        logo: exp?.business?.logo || exp?.customBusinessLogo || undefined,
        customBusinessName: customBusinessName || undefined,
        customBusinessLogo: exp?.customBusinessLogo || null,
        startDate: exp?.startDate || "",
        endDate: exp?.endDate || "",
        position: exp?.position || "",
        description: exp?.description || "",
        isCurrent: Boolean(exp?.isCurrent),
      };
    });

    const hydratedCompanies: Company[] = hydratedExperiences.map((exp) => ({
      id: exp.companyId,
      name: exp.companyName,
      logo: exp.logo,
      isCustom: !exp.businessId,
    }));

    setWorkExperiences(hydratedExperiences);
    setSelectedCompanies(hydratedCompanies);
    hasPrefilledFromProfile.current = true;
  }, [user]);

  const handleNext = async () => {
    // Skip if no work experience added
    if (workExperiences.length === 0) {
      try {
        await updateProfile({ onboarding: 3 });
        onComplete();
      } catch (error: any) {
        toast.error(error.message || t("user.setup.profileUpdateError"));
      }
      return;
    }

    try {
      const normalizedExperiences = workExperiences.filter((exp) =>
        Boolean(
          exp?.businessId ||
            exp?.customBusinessName ||
            exp?.companyId ||
            exp?.companyName
        )
      );

      for (const exp of normalizedExperiences) {
        const hasBusinessRef = Boolean(exp?.businessId);
        const hasCustomName = Boolean(
          String(exp?.customBusinessName || exp?.companyName || "").trim()
        );
        const hasPosition = Boolean(String(exp?.position || "").trim());
        const hasStartDate = Boolean(exp?.startDate);

        if (!hasBusinessRef && !hasCustomName) {
          toast.error("Please select a company or enter a custom company name.");
          return;
        }
        if (!hasPosition) {
          toast.error("Please enter your position for each experience.");
          return;
        }
        if (!hasStartDate) {
          toast.error("Please select a start date for each experience.");
          return;
        }
      }

      const uniqueExperienceDrafts = new Map<string, Companies>();
      normalizedExperiences.forEach((exp) => {
        const key =
          exp?.id ||
          exp?.businessId ||
          exp?.companyId ||
          exp?.customBusinessName;
        if (!key) return;
        if (!uniqueExperienceDrafts.has(String(key))) {
          uniqueExperienceDrafts.set(String(key), exp);
        }
      });

      await updateProfile({ onboarding: 3 });
      await syncExperiences(Array.from(uniqueExperienceDrafts.values()), []);
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
        title={t("user.setup.workExperience")}
        buttonTitle={t("user.setup.skip")}
        className="mt-3"
        onPress={onComplete}
      />

      {/* progress details */}
      <View className="mt-7">
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
        contentContainerStyle={{ paddingBottom: 300 }}
        className="flex-1"
      >
        {/* company  */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            {t("user.setup.companyEmployer")}
          </Text>

          <MultiSelectCompanyDropdown
            selectedCompanies={selectedCompanies}
            workExperiences={workExperiences}
            onCompaniesChange={setSelectedCompanies}
            onWorkExperiencesChange={setWorkExperiences}
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
