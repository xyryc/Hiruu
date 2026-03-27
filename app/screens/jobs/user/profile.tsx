import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import JobApplyModal from "@/components/ui/modals/JobApplyModal";
import { chatService } from "@/services/chatService";
import { useJobStore } from "@/stores/jobStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { utcTimeToLocalDate } from "@/utils/timezone";
import {
  Feather,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

const formatShiftTime12Hour = (value?: string | null, timezone?: string) => {
  if (!value || typeof value !== "string") return null;

  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  return utcTimeToLocalDate(value, timezone).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const JobProfile = () => {
  const { businessId, recruitmentId } = useLocalSearchParams<{
    businessId?: string;
    recruitmentId?: string;
  }>();
  const timezone = usePreferencesStore((state) => state.timezone);
  const getRecruitmentById = useJobStore((s) => s.getRecruitmentById);
  const shareRecruitment = useJobStore((s) => s.shareRecruitment);

  const [showModal, setShowModal] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const loadJobDetails = useCallback(async () => {
    if (!businessId || !recruitmentId) return;

    try {
      const data = await getRecruitmentById(String(businessId), String(recruitmentId));
      setJob(data || null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load job details");
    }
  }, [businessId, getRecruitmentById, recruitmentId]);

  useFocusEffect(
    useCallback(() => {
      loadJobDetails();
    }, [loadJobDetails])
  );

  const companyName = job?.business?.name || "Farout Beach Club";
  const companyLogo =
    resolveMediaUrl(job?.business?.logo) ||
    "https://images-platform.99static.com//gkoGE5-VZ1k4SXxg0mrUj7O0V38=/250x0:1750x1500/fit-in/500x500/99designs-contests-attachments/102/102585/attachment_102585463";
  const companyRatingValue = Math.max(
    0,
    Math.min(5, Number(job?.business?.rating ?? 0))
  );
  const companyRatingLabel = Number(companyRatingValue.toFixed(1)).toString();
  const locationLabel =
    job?.business?.address?.address || "Unknown Location";


  const roleName = job?.role?.role?.name || "Bartender";
  const aboutRole =
    job?.description ||
    "Join the core team at Space Hotel, a unique dining experience known for its space-themed interiors and premium service.....Read More";
  const genderLabel = job?.gender || "Male";
  const experienceLabel = job?.experience ? `${job.experience} Year` : "1 Year";
  const ageLabel =
    typeof job?.ageMin === "number" && typeof job?.ageMax === "number"
      ? `${job.ageMin}-${job.ageMax}`
      : "18-25";
  const formattedShiftStartTime = formatShiftTime12Hour(job?.shiftStartTime, timezone);
  const formattedShiftEndTime = formatShiftTime12Hour(job?.shiftEndTime, timezone);
  const shiftLabel =
    formattedShiftStartTime && formattedShiftEndTime
      ? `${formattedShiftStartTime} - ${formattedShiftEndTime}`
      : "10:00 AM - 11:00 PM";
  const salaryLabel =
    typeof job?.salaryMin === "number" &&
      typeof job?.salaryMax === "number" &&
      typeof job?.salaryType === "string"
      ? `${job.salaryMin}-${job.salaryMax}$/${job.salaryType === "monthly" ? "mo" : "hr"}`
      : "5-10$/hr";
  const managerName = job?.postedBy?.name || "Meclizine Johnsen";
  const managerAvatar =
    resolveMediaUrl(job?.postedBy?.avatar) || require("@/assets/images/placeholder.png");
  const distanceValue = typeof job?.distanceKm === "number" ? job.distanceKm : NaN;
  const distanceLabel = Number.isFinite(distanceValue)
    ? `${distanceValue.toFixed(2)} Km Away`
    : null;

  const socials = useMemo(() => {
    const social = job?.business?.social || {};
    return {
      facebook: social.facebook || "@alvarez_f",
      linkedin: social.linkedin || "in/albert-flore-12562f25",
      whatsapp: social.whatsapp || "+1(125) 256 25612",
      twitter: social.twitter || "@alber256",
    };
  }, [job?.business?.social]);

  useEffect(() => {
    if (!job) return;

    console.log(
      "[UserJobProfile] screen data:",
      JSON.stringify(
        {
          route: { businessId, recruitmentId },
          job,
          companyName,
          companyLogo,
          locationLabel,
          roleName,
          aboutRole,
          genderLabel,
          experienceLabel,
          ageLabel,
          shiftLabel,
          salaryLabel,
          managerName,
          managerAvatar,
          distanceLabel,
          socials,
        },
        null,
        2
      )
    );
  }, [
    aboutRole,
    ageLabel,
    businessId,
    companyLogo,
    companyName,
    distanceLabel,
    experienceLabel,
    genderLabel,
    job,
    locationLabel,
    managerAvatar,
    managerName,
    recruitmentId,
    roleName,
    salaryLabel,
    shiftLabel,
    socials,
  ]);

  const handleShare = async () => {
    try {
      if (businessId && recruitmentId) {
        await shareRecruitment(String(businessId), String(recruitmentId));
        setJob((prev: any) =>
          prev
            ? {
              ...prev,
              shareCount:
                typeof prev?.shareCount === "number" ? prev.shareCount + 1 : 1,
            }
            : prev
        );
      }
      await Share.share({
        message: `Check this job on Hiruu: ${job?.role?.role?.name || "Job"}`,
        title: "Job Posting",
      });
    } catch {
      Alert.alert("Error", "Could not share profile");
    }
  };

  const handleMessageManager = async () => {
    if (isCreatingChat) return;

    const participantId = job?.postedBy?.id;
    const referenceRecruitmentId =
      typeof recruitmentId === "string" ? recruitmentId : job?.id;

    if (!participantId) {
      toast.error("Hiring manager is unavailable for chat");
      return;
    }

    if (!referenceRecruitmentId) {
      toast.error("Recruitment reference is missing");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(participantId, {
        referenceRecruitmentId,
      });
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error("Chat room id is missing");
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to start chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleOpenBusinessProfile = () => {
    const targetBusinessId =
      typeof job?.business?.id === "string" ? job.business.id : null;

    if (!targetBusinessId) {
      toast.error("Business profile unavailable");
      return;
    }

    router.push({
      pathname: "/screens/profile/business/public-business-profile",
      params: { businessId: targetBusinessId },
    });
  };

  return (
    <SafeAreaView
      className="bg-[#E5F4FD] dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader
        className="mx-5 pb-20"
        title=""
        onPressBack={() => router.back()}
        components={
          <Ionicons
            onPress={() => handleShare()}
            className="p-2 bg-white rounded-full"
            name="share-outline"
            size={20}
            color="black"
          />
        }
      />

      {/* content */}
      <View className="bg-white">
        {/* profile */}
        <View className="absolute -top-16 inset-x-0">
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenBusinessProfile}>
            {/* profile image */}
            <View className="border-2 border-[#11293A] rounded-full mx-auto p-1">
              <Image
                source={companyLogo}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 999,
                }}
                contentFit="cover"
              />
            </View>

            {/* name */}
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-center mt-4">
              {companyName}{" "}
              <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
            </Text>

            <View className="flex-row items-center justify-center mt-2.5 gap-7">
              <View className="flex-row items-center gap-2.5 border-r-hairline border-[#7A7A7A] pr-7">
                <SimpleLineIcons name="location-pin" size={14} color="#7A7A7A" />
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {locationLabel}
                </Text>
              </View>

              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {companyRatingLabel}/5{" "}
                <Fontisto name="star" size={14} color="#F1C400" />
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="mt-40 mx-5"
          contentContainerStyle={{
            paddingBottom: 300,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Job Description
          </Text>

          {/* about the role */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="file-document-check-outline"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                About the Role
              </Text>
            </View>

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
              {aboutRole}
            </Text>
          </View>

          {/* key info */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Octicons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="repo-forked"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Key Info
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2.5 mt-2.5">
              <SimpleStatusBadge title={`Hiring: ${roleName}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge title={`Gender: ${genderLabel}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge title={`Experience: ${experienceLabel}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge
                title={`Location: ${locationLabel}`}
                bgColor="#F5F5F5"
              />
              <SimpleStatusBadge title={`Age: ${ageLabel}`} bgColor="#F5F5F5" />
              <SimpleStatusBadge
                title={`Shift: ${shiftLabel}`}
                bgColor="#F5F5F5"
              />
              <SimpleStatusBadge title={`Salary: ${salaryLabel}`} bgColor="#F5F5F5" />
              {distanceLabel ? (
                <SimpleStatusBadge title={distanceLabel} bgColor="#F5F5F5" />
              ) : null}
              <SimpleStatusBadge
                title={`Shares: ${job?.shareCount ?? 0}`}
                bgColor="#F5F5F5"
              />
            </View>
          </View>

          {/* hiring manager */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Feather
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="user"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Hiring Manager
              </Text>
            </View>

            {/* profile */}
            <View className="bg-[#4FB2F3] p-2.5 rounded-xl flex-row justify-between items-center mt-4">
              <View className="flex-row items-center gap-2.5">
                <Image
                  source={managerAvatar}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                  }}
                  contentFit="cover"
                />
                <Text className="font-proximanova-bold text-white">
                  {managerName}
                </Text>
              </View>

              <TouchableOpacity
                className={`bg-white rounded-full p-2 ${isCreatingChat ? "opacity-60" : ""}`}
                onPress={handleMessageManager}
                disabled={isCreatingChat}
              >
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Us On */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Ionicons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="call-outline"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Contact Us On
              </Text>
            </View>

            {/* socials */}
            <View className="mt-4 border-hairline border-[#EEEEEE] rounded-xl">
              {/* facebook */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/facebook2.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {socials.facebook}
                </Text>
              </View>

              {/* linkedin */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/linkedin.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {socials.linkedin}
                </Text>
              </View>

              {/* whatsapp */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/whatsapp.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {socials.whatsapp}
                </Text>
              </View>

              {/* twitter */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/twitter.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {socials.twitter}
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            className="mt-7"
            title="Apply This Job"
            onPress={() => setShowModal(true)}
          />
        </ScrollView>
      </View>

      <JobApplyModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        job={job}
      />
    </SafeAreaView>
  );
};

export default JobProfile;
