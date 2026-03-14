import { chatService } from "@/services/chatService";
import { BusinessJobCardProps } from "@/types";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";
import StatusBadge from "../badges/StatusBadge";
import SecondaryButton from "../buttons/SecondaryButton";
import SmallButton from "../buttons/SmallButton";
import BusinessOfferModal from "../modals/BusinessOfferModal";

const BusinessJobCard = ({
  className,
  status,
  candidate,
  received,
  profile,
}: BusinessJobCardProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  console.log("[BusinessJobCard] render profile:", {
    id: profile?.id,
    userId: profile?.userId || profile?.user?.id,
    name: profile?.user?.name,
    headline: profile?.headline,
    isOpenToWork: profile?.isOpenToWork,
    isPremium: profile?.isPremium,
  });

  // Extract profile data
  const userName = profile?.user?.name || "Md Talath Un Nabi Anik";
  const userAvatar = profile?.user?.avatar || "https://images.squarespace-cdn.com/content/v1/5521b031e4b06ebe90178744/1560360135937-3XYVZ3124L1YL2FOASSQ/headshots-linkedin-photographer.jpg";
  const headline = profile?.headline || "Cashier";
  const isPremium = profile?.isPremium || false;

  // Handle address - check for user.address.address structure
  let address = "New York, North Bergen";
  if (profile?.user?.address) {
    if (typeof profile.user.address === "string") {
      address = profile.user.address;
    } else if (typeof profile.user.address === "object") {
      address = profile.user.address.address || profile.user.address.city || "New York, North Bergen";
    }
  }

  const salaryMin = profile?.expectedSalaryMin || 5;
  const salaryMax = profile?.expectedSalaryMax || 10;
  const salaryType = profile?.preferredSalaryType || "hr";
  const distanceKm = profile?.distanceKm;

  // Check if user is open to work from jobProfile
  const isOpenToWork = profile?.isOpenToWork ?? profile?.user?.jobProfile?.isOpenToWork ?? false;
  const isOnline = profile?.user?.isOnline || false;

  // Determine availability status: open to work takes priority over online status
  const availabilityStatus: "available" | "unavailable" = isOpenToWork ? "available" : (isOnline ? "available" : "unavailable");

  const handleMessageClick = async () => {
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

  return (
    <TouchableOpacity
      onPress={() => setShowModal(true)}
      className={`${className}
      ${status === "featured" && "bg-[#E5F4FD]"}
      p-2.5 rounded-xl border border-[#4FB2F330]`}
    >
      {/* top */}
      <View className="relative">
        {/* content */}
        <View className="flex-row items-center gap-2.5 p-1 z-10">
          {/* profile image */}
          <Image
            source={userAvatar}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
            }}
            contentFit="cover"
          />

          {/* name */}
          <View>
            <Text className="text-base font-proximanova-semibold">
              {headline}{" "}
              {isPremium && (
                <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
              )}
            </Text>

            <Text className="text-sm font-proximanova-regular">
              {userName}
            </Text>
          </View>
        </View>

        {/* background */}
        {status === "featured" && (
          <View className="absolute top-0 left-0 w-full">
            <Image
              source={require("@/assets/images/featured.png")}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 10,
              }}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      {/* mid */}
      <View className="flex-row items-center justify-between gap-20 mt-2.5">
        <View className="flex-row items-center gap-1.5">
          <SimpleLineIcons name="location-pin" size={12} color="black" />
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            {address}
          </Text>
        </View>

        <View className="flex-row">
          <Text className="text-xl font-proximanova-semibold text-primary">
            {salaryMin}-{salaryMax}$
          </Text>
          <Text className="text-lg font-proximanova-regular text-secondary">
            /{salaryType}
          </Text>
        </View>
      </View>

      {/* badges */}
      <View className="flex-row gap-1.5 mt-2.5">
        {status === "featured" || candidate ? (
          <View className="flex-row gap-1.5 items-center px-2.5 py-1 bg-[#3F98FF4D] rounded-full">
            <MaterialIcons name="verified" size={16} color="#3090FF" />
            <Text className="text-xs font-proximanova-regular text-primary">
              Verified
            </Text>
          </View>
        ) : (
          <StatusBadge status={availabilityStatus} size="small" />
        )}

        <View
          className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
        >
          <FontAwesome name="star" size={16} color="#F1C400" />
          <Text className="text-xs font-proximanova-regular">4</Text>
        </View>

        <View
          className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
        >
          <Text className="text-xs font-proximanova-regular">Full Time</Text>
        </View>

        {distanceKm !== null && distanceKm !== undefined && (
          <View
            className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
          >
            <Text className="text-xs font-proximanova-regular">{distanceKm.toFixed(1)}km away</Text>
          </View>
        )}
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          height: 1,
          width: "100%",
          marginVertical: 10,
        }}
        contentFit="contain"
      />

      {/* bottom */}
      {received || (
        <View className="flex-row justify-between">
          {/* left */}
          <View className="flex-row gap-2.5 items-center">
            <Pressable
              onPress={handleMessageClick}
              disabled={isCreatingChat}
              className={`h-10 w-10 rounded-full flex-row items-center justify-center
               ${status === "featured" ? "bg-white" : "bg-[#E5F4FD]"}`}
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
            </Pressable>

            <Image
              source={require("@/assets/images/vertical-line.svg")}
              style={{
                height: 18,
                width: 0.5,
              }}
            />

            <View
              className={`h-10 w-10 rounded-full flex-row items-center justify-center
             ${status === "featured" ? "bg-white" : "bg-[#E5F4FD]"}`}
            >
              <Ionicons name="call" size={20} color="#4FB2F3" />
            </View>
          </View>

          {/* right */}
          {candidate ? (
            <StatusBadge status="submitted" />
          ) : (
            <View onStartShouldSetResponder={() => true}>
              <SmallButton
                title="View Profile"
                onPress={() =>
                  router.push("/screens/jobs/business/user-profile-preview")
                }
              />
            </View>
          )}
        </View>
      )}

      {/* bottom */}
      {received && (
        <View className="flex-row items-center justify-between">
          {/* left */}
          <View onStartShouldSetResponder={() => true}>
            <SecondaryButton
              title="View Details"
              textClass="text-[#4FB2F3]"
              iconBackground="bg-white"
              iconColor="#4FB2F3"
            />
          </View>

          {/* right */}
          <View className="flex-row items-center gap-1.5" onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              onPress={handleMessageClick}
              disabled={isCreatingChat}
              className="bg-[#E5F4FD] border-[0.5px] border-[#FFFFFF00] rounded-full p-2"
            >
              {isCreatingChat ? (
                <ActivityIndicator size="small" color="#4FB2F3" />
              ) : (
                <Ionicons name="chatbubbles" size={22} color="#4FB2F3" />
              )}
            </TouchableOpacity>

            <MaterialCommunityIcons
              name="close-circle"
              size={40}
              color="#F34F4F"
            />

            <Ionicons name="checkmark-circle" size={40} color="#292D32" />
          </View>
        </View>
      )}

      {/* modal */}
      <BusinessOfferModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </TouchableOpacity>
  );
};

export default BusinessJobCard;
