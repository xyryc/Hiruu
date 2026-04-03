import BadgeCard from "@/components/ui/cards/BadgeCard";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import ExperienceCard from "@/components/ui/cards/ExperienceCard";
import StatCardPrimary from "@/components/ui/cards/StatCardPrimary";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import {
  Feather,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type PreviewParams = {
  userId?: string;
  profileId?: string;
  businessId?: string;
  canRate?: string;
};

const UserProfilePreview = () => {
  const router = useRouter();
  const params = useLocalSearchParams<PreviewParams>();
  const getJobProfileByUserId = useJobStore((s) => s.getJobProfileByUserId);
  const [showText, setShowText] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const userId = typeof params.userId === "string" ? params.userId : "";
  const businessId =
    typeof params.businessId === "string" ? params.businessId : "";
  const canRate = params.canRate === "true" && Boolean(businessId);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        toast.error("User information is unavailable");
        return;
      }

      try {
        setIsLoading(true);
        const result = await getJobProfileByUserId(userId);
        console.log("[UserProfilePreview] =========== api response:", JSON.stringify(result, null, 2));
        if (isMounted) {
          setProfile(result);
        }
      } catch (error: any) {
        if (isMounted) {
          setProfile(null);
        }
        toast.error(error?.message || "Failed to load profile");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getJobProfileByUserId, userId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/business-jobs");
  };

  const profileAddress = useMemo(() => {
    const address = profile?.user?.address;

    if (!address) return "Location unavailable";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      return (
        address?.city ||
        address?.state ||
        address?.address ||
        address?.country ||
        "Location unavailable"
      );
    }

    return "Location unavailable";
  }, [profile]);

  const shortIntro = useMemo(() => {
    return (
      profile?.about ||
      profile?.highlightedExperience ||
      profile?.user?.bio ||
      "No profile summary available"
    );
  }, [profile]);

  const openDaysCount = useMemo(() => {
    const weeklyAvailability = Array.isArray(profile?.weeklyAvailability)
      ? profile.weeklyAvailability
      : [];

    return weeklyAvailability.filter((item: any) => item?.isOpen).length;
  }, [profile]);

  const salaryRangeLabel = useMemo(() => {
    const min = profile?.expectedSalaryMin;
    const max = profile?.expectedSalaryMax;
    const type = profile?.preferredSalaryType;

    if (min == null && max == null) return "Not set";
    if (min != null && max != null) {
      return `${min}-${max}${type ? ` /${type}` : ""}`;
    }

    return `${min ?? max}${type ? ` /${type}` : ""}`;
  }, [profile]);

  const isOwnProfile = useMemo(() => {
    const previewUserId = profile?.userId || profile?.user?.id;
    return Boolean(previewUserId && currentUser?.id && previewUserId === currentUser.id);
  }, [currentUser?.id, profile?.user?.id, profile?.userId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile?.user?.name || "this profile"} on Hiruu!`,
        title: `${profile?.user?.name || "User"}'s Profile`,
      });
    } catch {
      Alert.alert("Error", "Could not share profile");
    }
  };

  const handleMessagePress = async () => {
    const participantId = profile?.userId || profile?.user?.id;
    if (!participantId) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(participantId);
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-dark-background">
        <SafeAreaView className="bg-[#E5F4FD] rounded-b-xl">
          <View className="flex-row justify-between items-center mt-5 mx-5 mb-4">
            <TouchableOpacity onPress={handleBack}>
              <Feather className="p-2" name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare()}>
              <Ionicons
                className="p-2"
                name="share-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View className="pt-6 items-center">
          <ActivityIndicator size="small" color="#4FB2F3" />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white pb-32 dark:bg-dark-background">
      <View className="bg-[#E5F4FD] rounded-b-xl">
        <SafeAreaView>
          <View className={`flex-row justify-between items-center mt-5 mx-5`}>
            <TouchableOpacity onPress={handleBack}>
              <Feather
                className="p-2"
                name="arrow-left"
                size={24}
                color="black"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleShare()}>
              <Ionicons
                className="p-2"
                name="share-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/screens/profile/rating",
              params: {
                userId: profile?.userId || profile?.user?.id || "",
                ...(canRate ? { businessId, canRate: "true" } : {}),
              },
            })
          }
          className="mx-5 mt-3.5"
        >
          {/* dynamic nameplate, equipped */}
          {profile?.user?.appearance?.nameplate?.metadata ? (
            <DynamicNameplateCard
              metadata={profile.user.appearance.nameplate.metadata}
              mode="redeem"
              preview={{
                avatarUrl: profile?.user?.avatar || null,
                name: profile?.user?.name || "User",
                location: profileAddress || "Location unavailable",
                rating: profile?.user?.rating ?? 0,
                isVerified: true,
              }}
            />
          ) : (
            <BasicNameplateCard
              avatarUrl={profile?.user?.avatar || null}
              name={profile?.user?.name || "User"}
              location={profileAddress || "Location unavailable"}
              rating={profile?.user?.rating ?? 0}
              isVerified
            />
          )}
        </TouchableOpacity>

        {/* Badge item */}
        <View className="mx-5 flex-row justify-between mt-5 items-center">
          <View className="flex-row gap-2.5 items-center">
            <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center ">
              <MaterialCommunityIcons
                className="rotate-180"
                name="medal-outline"
                size={16}
                color="black"
              />
            </View>
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Badge
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/screens/profile/badge")}
          >
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              View all Badge
            </Text>
          </TouchableOpacity>
        </View>
        <BadgeCard className="mx-5 mt-3.5" />

        {/* short intro */}
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
            <Foundation name="clipboard" size={16} color="black" />
          </View>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Short Intro
          </Text>
        </View>
        <View className="mx-5 mt-4">
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {showText
              ? shortIntro
              : `${shortIntro.slice(0, 120)}${shortIntro.length > 120 ? "..." : ""}`}
            {"   "}
            <Text
              onPress={() => setShowText(!showText)}
              className="font-proximanova-semibold text-sm text-[#11293A]"
            >
              {shortIntro.length > 120 ? (showText ? "See less" : "Read More") : ""}
            </Text>
          </Text>
        </View>

        {/* Experience */}
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
            <Foundation name="clipboard" size={16} color="black" />
          </View>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Experience
          </Text>
        </View>

        <ExperienceCard
          focus
          className="mt-8 mx-5"
          companyName={profile?.user?.name || "Profile"}
          position={profile?.headline || "Role not specified"}
          companyLogo={
            profile?.user?.avatar ||
            require("@/assets/images/placeholder.png")
          }
          isVerified
          isCurrent={Boolean(profile?.isOpenToWork)}
        />

        {/* Achievement */}
        <View className=" mx-5 mt-8">
          <View className="flex-row gap-2.5 items-center">
            <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center ">
              <MaterialCommunityIcons
                className="rotate-180"
                name="medal-outline"
                size={16}
                color="black"
              />
            </View>
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Achievement
            </Text>
          </View>
          <View className="flex-row gap-3 mb-4 mt-4">
            <StatCardPrimary
              point={`${openDaysCount}`}
              title="Open Days"
              subtitle={"weekly"}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={`${(profile?.skills || []).length}`}
              title="Skills"
              subtitle={"listed"}
              background={require("@/assets/images/stats-bg.svg")}
            />
          </View>
          <View className="flex-row gap-3 mb-4">
            <StatCardPrimary
              point={`${profile?.preferredRoleIds?.length || 0}`}
              title="Preferred Roles"
              subtitle={"selected"}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={profile?.isOpenToWork ? "Open" : "Closed"}
              title="Work Status"
              subtitle={salaryRangeLabel}
              background={require("@/assets/images/stats-bg.svg")}
            />
          </View>
        </View>

        {/* Interests */}
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
            <Foundation name="clipboard" size={16} color="black" />
          </View>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Interests
          </Text>
        </View>

        <View className="flex-row justify-between mx-5 mt-4">
          <View>
            <View className="w-16 h-16 rounded-full items-center justify-center bg-gray-200 p-2.5">
              <Text className="text-2xl">⚽</Text>
            </View>
            <Text className="text-center text-xs  mt-2 font-proximanova-medium">
              Sports
            </Text>
          </View>
          <View>
            <View className="w-16 h-16 rounded-full items-center justify-center bg-green-100 p-2.5">
              <Text className="text-2xl">🎵</Text>
            </View>
            <Text className="text-center text-xs  mt-2 font-proximanova-medium">
              Music
            </Text>
          </View>
          <View>
            <View className="w-16 h-16 rounded-full items-center justify-center bg-yellow-100 p-2.5">
              <Text className="text-2xl">📷</Text>
            </View>
            <Text className="text-center text-xs  mt-2 font-proximanova-medium">
              Photography
            </Text>
          </View>
          <View>
            <View className="w-16 h-16 rounded-full items-center justify-center bg-orange-100 p-2.5">
              <Text className="text-2xl">🎨</Text>
            </View>
            <Text className="text-center text-xs  mt-2 font-proximanova-medium">
              Art
            </Text>
          </View>
        </View>

        {/* Employee Info */}
        <View className="flex-row items-center gap-2.5 mt-8 mx-5">
          <View className="h-8 w-8 bg-[#E5F4FD] rounded-full flex-row justify-center items-center">
            <Ionicons name="person" size={16} color="black" />
          </View>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Employee Info
          </Text>
        </View>

        <View className="flex-row justify-between items-center mx-5 mt-4 p-2.5 bg-[#4FB2F3] rounded-xl">
          <View className="flex-row items-center gap-2.5">
            <View>
              <Image
                source={
                  profile?.user?.avatar ||
                  require("@/assets/images/placeholder.png")
                }
                contentFit="cover"
                style={{ height: 40, width: 40, borderRadius: 99 }}
              />
            </View>
            <Text className="font-proximanova-bold text-white">
              {profile?.user?.name || "User"}
            </Text>
          </View>

          {!isOwnProfile ? (
            <TouchableOpacity
              onPress={handleMessagePress}
              disabled={isCreatingChat}
              className="h-10 w-10 bg-white rounded-full flex-row items-center justify-center"
            >
              {isCreatingChat ? (
                <ActivityIndicator size="small" color="#4FB2F3" />
              ) : (
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  contentFit="contain"
                  style={{ height: 22, width: 22 }}
                />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Contact Me On */}
        <View className="flex-row items-center gap-2.5 mt-6 mx-5">
          <View className="h-8 w-8 bg-[#E5F4FD] rounded-full flex-row justify-center items-center">
            <Ionicons name="call-outline" size={16} color="black" />
          </View>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Contact Me On
          </Text>
        </View>

        <ConnectSocials
          className="mx-5 my-4"
          value={profile?.user?.social || {}}
          hideEmpty
          canEdit={false}
        />
      </ScrollView>
    </View>
  );
};

export default UserProfilePreview;

