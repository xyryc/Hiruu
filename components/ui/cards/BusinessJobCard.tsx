import { chatService } from "@/services/chatService";
import { BusinessJobCardProps } from "@/types";
import { buildDialablePhoneNumber } from "@/utils/phone";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { toast } from "sonner-native";
import StatusBadge from "../badges/StatusBadge";
import SecondaryButton from "../buttons/SecondaryButton";
import SmallButton from "../buttons/SmallButton";
import BusinessOfferModal from "../modals/BusinessOfferModal";

const JOB_CARD_RADIUS = 12;

const BusinessJobCard = ({
  className,
  status,
  candidate,
  received,
  profile,
  disableModalOpen,
  enableHeaderProfileTap,
  onAccept,
  onReject,
  actionLoading,
}: BusinessJobCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [pendingProfileNavigation, setPendingProfileNavigation] = useState<{
    userId: string;
    profileId?: string;
  } | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const [offerSent, setOfferSent] = useState(Boolean(profile?.alreadyOffered));
  const isSkeleton = !profile?.user && !profile?.headline && !profile?.highlightedExperience;
  const alreadyOffered = offerSent || Boolean(profile?.alreadyOffered);
  const modalDisabled = Boolean(disableModalOpen) || alreadyOffered;

  useEffect(() => {
    // Keep local state in sync when the profile changes (e.g. refresh/list reload).
    setOfferSent(Boolean(profile?.alreadyOffered));
  }, [profile?.alreadyOffered]);

  // Extract profile data
  const userName = profile?.user?.name || t("common.user");
  const userAvatarUri =
    typeof profile?.user?.avatar === "string" ? profile.user.avatar.trim() : "";
  const userAvatarSource = userAvatarUri
    ? { uri: userAvatarUri }
    : require("@/assets/images/placeholder.png");
  const headline = profile?.headline || t("common.notSet");
  const isPremium = profile?.isPremium || false;
  const applicationStatus = String(profile?.applicationStatus || "").toLowerCase();
  const finalReceivedStatus =
    applicationStatus === "approved" || applicationStatus === "rejected"
      ? applicationStatus
      : null;
  const isVerified = Boolean(
    profile?.user?.isEmailVerified || profile?.user?.isNumberVerified
  );
  const rawRating =
    profile?.rating ??
    profile?.user?.rating ??
    profile?.averageRating ??
    0;
  const numericRating = Number(rawRating);
  const displayRating =
    Number.isFinite(numericRating) && numericRating > 0
      ? `${numericRating.toFixed(1)}/5`
      : "N/A";

  // Handle address - check for user.address.address structure
  let address = t("common.addressUnavailable");
  if (profile?.user?.address) {
    if (typeof profile.user.address === "string") {
      address = profile.user.address;
    } else if (typeof profile.user.address === "object") {
      address = profile.user.address.city || t("common.addressUnavailable");
    }
  }

  const salaryMin = profile?.expectedSalaryMin || 5;
  const salaryMax = profile?.expectedSalaryMax || 10;
  const rawSalaryType = String(profile?.preferredSalaryType || "hourly").toLowerCase();
  const salaryType =
    rawSalaryType === "monthly"
      ? t("user.jobs.businessJobCard.salaryType.monthly")
      : rawSalaryType === "hourly"
        ? t("user.jobs.businessJobCard.salaryType.hourly")
        : rawSalaryType;
  const distanceKm = profile?.distanceKm;
  const preferenceJobTypeRaw =
    profile?.preferenceJobType ?? profile?.user?.jobProfile?.preferenceJobType;
  const preferenceJobType =
    typeof preferenceJobTypeRaw === "string" && preferenceJobTypeRaw.trim()
      ? preferenceJobTypeRaw
        .trim()
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
      : null;
  const dialPhoneNumber =
    (typeof profile?.user?.dialPhoneNumber === "string" && profile.user.dialPhoneNumber.trim())
      ? profile.user.dialPhoneNumber.trim()
      : buildDialablePhoneNumber(profile?.user?.countryCode, profile?.user?.phoneNumber);
  const canCall = Boolean(dialPhoneNumber);

  // Check if user is open to work from jobProfile
  const isOpenToWork = profile?.isOpenToWork ?? profile?.user?.jobProfile?.isOpenToWork ?? false;
  const shouldShowAvailableBadge = isOpenToWork === true;

  const handleMessageClick = async () => {
    const participantId = profile?.userId || profile?.user?.id;

    if (!participantId) {
      toast.error(t("user.jobs.businessJobCard.userInfoUnavailable"));
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(participantId);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error(t("user.jobs.businessJobCard.chatRoomIdMissing"));
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.businessJobCard.failedToStartChat"));
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleCallClick = async () => {
    if (!dialPhoneNumber) {
      toast.error(t("user.jobs.businessJobCard.phoneUnavailable"));
      return;
    }

    try {
      setIsCreatingCall(true);
      await Linking.openURL(`tel:${dialPhoneNumber.replace(/\s+/g, "")}`);
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.businessJobCard.failedToOpenDialer"));
    } finally {
      setIsCreatingCall(false);
    }
  };

  const handleViewProfile = (
    override?: { userId?: string; profileId?: string }
  ) => {
    const userId = override?.userId || profile?.userId || profile?.user?.id;

    if (!userId) {
      toast.error(t("user.jobs.businessJobCard.userInfoUnavailable"));
      return;
    }

    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: {
        userId,
        profileId: override?.profileId || profile?.id || "",
      },
    });
  };

  const handleProfileRequestFromModal = (payload: {
    userId: string;
    profileId?: string;
  }) => {
    setPendingProfileNavigation(payload);
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal || !pendingProfileNavigation) return;

    const timer = setTimeout(() => {
      handleViewProfile(pendingProfileNavigation);
      setPendingProfileNavigation(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [handleViewProfile, pendingProfileNavigation, showModal]);

  const handleOpenOfferModal = () => {
    if (alreadyOffered) {
      toast.info(t("user.jobs.businessJobCard.offerAlreadySent"));
      return;
    }
    setShowModal(true);
  };

  return (
    <TouchableOpacity
      onPress={modalDisabled ? undefined : handleOpenOfferModal}
      activeOpacity={modalDisabled ? 1 : 0.2}
      className={`${className}
      ${status === "featured" && "bg-[#E5F4FD]"}
      p-2.5 rounded-xl border border-[#4FB2F330]`}
    >
      <AutoSkeletonView isLoading={isSkeleton} defaultRadius={JOB_CARD_RADIUS}>
        {/* top */}
        <View className="relative">
          {alreadyOffered && (
            <View className="absolute right-2 top-2 z-20 px-2.5 py-1 rounded-full bg-[#0C2433]">
              <Text className="text-xs font-proximanova-semibold text-white">
                {t("user.jobs.businessJobCard.offerSent")}
              </Text>
            </View>
          )}
          {/* content */}
          <Pressable
            onPress={enableHeaderProfileTap ? () => handleViewProfile() : undefined}
            onStartShouldSetResponder={() => true}
            className="flex-row items-center gap-2.5 p-1 z-10"
          >
            {/* profile image */}
            <Image
              source={userAvatarSource}
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
          </Pressable>

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
        <View className="flex-row items-center justify-between mt-2.5">
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
              /{salaryType}{" "}
            </Text>
          </View>
        </View>

        {/* badges */}
        <View className="flex-row gap-1.5 mt-2.5">
          {isVerified ? (
            <View className="flex-row gap-1.5 items-center px-2.5 py-1 bg-[#3F98FF4D] rounded-full">
              <MaterialIcons name="verified" size={16} color="#3090FF" />
              <Text className="text-xs font-proximanova-regular text-primary">
                {t("common.verified")}
              </Text>
            </View>
          ) : !candidate && status !== "featured" && shouldShowAvailableBadge ? (
            <StatusBadge status="available" size="small" />
          ) : null}

          <View
            className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
          >
            <FontAwesome name="star" size={16} color="#F1C400" />
            <Text className="text-xs font-proximanova-regular">{displayRating}</Text>
          </View>

          {preferenceJobType && (
            <View
              className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                  ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
            `}
            >
              <Text className="text-xs font-proximanova-regular">
                {preferenceJobType}
              </Text>
            </View>
          )}

          {distanceKm !== null && distanceKm !== undefined && (
            <View
              className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
            >
              <Text className="text-xs font-proximanova-regular">
                {t("common.kmAway", { distance: Number(distanceKm.toFixed(1)) })}
              </Text>
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
          contentFit="cover"
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

              <Pressable
                onPress={canCall ? handleCallClick : undefined}
                disabled={!canCall || isCreatingChat || isCreatingCall}
                className={`h-10 w-10 rounded-full flex-row items-center justify-center
             ${status === "featured" ? "bg-white" : "bg-[#E5F4FD]"}
             ${canCall ? "" : "opacity-60 bg-[#E5E7EB]"}`}
              >
                {isCreatingCall ? (
                  <ActivityIndicator size="small" color="#4FB2F3" />
                ) : (
                  <Ionicons
                    name="call"
                    size={20}
                    color={canCall ? "#4FB2F3" : "#9CA3AF"}
                  />
                )}
              </Pressable>
            </View>

            {/* right */}
            {candidate ? (
              <StatusBadge status="submitted" />
            ) : (
              <View onStartShouldSetResponder={() => true}>
                <SmallButton
                  title={t("common.viewProfile")}
                  onPress={() => handleViewProfile()}
                />
              </View>
            )}
          </View>
        )}

        {/* bottom */}
        {received && (
          <View className="flex-row items-end justify-between">
            {/* left */}
            <View onStartShouldSetResponder={() => true}>
              <SecondaryButton
                title={t("common.viewDetails")}
                onPress={() => handleViewProfile()}
                textClass="text-[#4FB2F3]"
                iconBackground="bg-white"
                iconColor="#4FB2F3"
                className='pl-1.5'
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

              {finalReceivedStatus ? (
                <StatusBadge status={finalReceivedStatus} />
              ) : (
                <>
                  <TouchableOpacity
                    onPress={onReject}
                    disabled={actionLoading !== null}
                    className={`${actionLoading !== null ? "opacity-70" : ""}`}
                  >
                    {actionLoading === "rejected" ? (
                      <ActivityIndicator size="small" color="#F34F4F" style={{ width: 40 }} />
                    ) : (
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={40}
                        color="#F34F4F"
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onAccept}
                    disabled={actionLoading !== null}
                    className={`${actionLoading !== null ? "opacity-70" : ""}`}
                  >
                    {actionLoading === "approved" ? (
                      <ActivityIndicator size="small" color="#292D32" style={{ width: 40 }} />
                    ) : (
                      <Ionicons name="checkmark-circle" size={40} color="#292D32" />
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </AutoSkeletonView>

      {/* modal */}
      <BusinessOfferModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        userId={profile?.userId || profile?.user?.id || ""}
        alreadyOffered={alreadyOffered}
        onOfferSent={() => setOfferSent(true)}
        onViewProfileRequest={handleProfileRequestFromModal}
      />
    </TouchableOpacity>
  );
};

export default BusinessJobCard;
