import { chatService } from "@/services/chatService";
import { JobRequestCardProps } from "@/types";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
import StatusBadge from "../badges/StatusBadge";

const JobRequestCard = ({
  className,
  status,
  job,
  onApprove,
  onReject,
  actionLoading = null,
}: JobRequestCardProps) => {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const isReceived = status === "received";
  const recruitmentBusiness = job?.recruitment?.business;
  const recruitmentRole = job?.recruitment?.role?.role;
  const businessRoleBusiness = job?.businessRole?.business;
  const businessRoleRole = job?.businessRole?.role;
  const displayBusinessName =
    recruitmentBusiness?.name ||
    businessRoleBusiness?.name ||
    job?.business?.name ||
    "";
  const displayRole =
    recruitmentRole?.name ||
    businessRoleRole?.name ||
    job?.invitationRoleName ||
    job?.name ||
    "";
  const isVerified =
    job?.business?.isVerified === true ||
    recruitmentBusiness?.isVerified === true ||
    businessRoleBusiness?.isVerified === true;
  const businessRating =
    typeof job?.business?.rating === "number" && job.business.rating > 0
      ? job.business.rating
      : typeof recruitmentBusiness?.rating === "number" &&
        recruitmentBusiness.rating > 0
        ? recruitmentBusiness.rating
        : typeof businessRoleBusiness?.rating === "number" &&
          businessRoleBusiness.rating > 0
          ? businessRoleBusiness.rating
          : NaN;
  const businessRatingLabel =
    Number.isFinite(businessRating) && businessRating > 0
      ? `${businessRating.toFixed(1)}/5`
      : "N/A";
  const displaySalaryMin =
    typeof job?.invitationSalaryMin === "number"
      ? job.invitationSalaryMin
      : typeof job?.salaryMin === "number" && job.salaryMin > 0
        ? job.salaryMin
        : null;
  const displaySalaryMax =
    typeof job?.invitationSalaryMax === "number"
      ? job.invitationSalaryMax
      : typeof job?.salaryMax === "number" && job.salaryMax > 0
        ? job.salaryMax
        : null;
  const salarySuffix =
    job?.invitationSalaryType === "hourly" || job?.salaryType === "hourly"
      ? "hr"
      : job?.invitationSalaryType === "monthly" || job?.salaryType === "monthly"
        ? "mo"
        : null;
  const businessAddressObject =
    job?.business?.address && typeof job.business.address !== "string"
      ? job.business.address
      : undefined;
  const recruitmentBusinessAddressObject =
    recruitmentBusiness?.address && typeof recruitmentBusiness.address !== "string"
      ? recruitmentBusiness.address
      : undefined;
  const businessRoleBusinessAddressObject =
    businessRoleBusiness?.address && typeof businessRoleBusiness.address !== "string"
      ? businessRoleBusiness.address
      : undefined;
  const businessAddress =
    typeof job?.business?.address === "string"
      ? job.business.address
      : businessAddressObject?.city ||
      recruitmentBusinessAddressObject?.city ||
      businessRoleBusinessAddressObject?.city ||
      "";
  const displayJobType =
    typeof job?.jobType === "string" && job.jobType.trim().length > 0
      ? job.jobType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
      : null;
  const displayDistance =
    typeof job?.distanceKm === "number"
      ? `${Number(job.distanceKm.toFixed(job.distanceKm < 10 ? 1 : 0))}km away`
      : null;
  const finalReceivedStatus =
    job?.applicationStatus === "approved" || job?.applicationStatus === "rejected"
      ? job.applicationStatus
      : null;
  const handleOpenDetails = () => {
    handleOpenBusinessProfile();
  };

  const handleOpenBusinessProfile = () => {
    const businessId =
      job?.businessId ||
      job?.business?.id ||
      recruitmentBusiness?.id ||
      businessRoleBusiness?.id;

    if (!businessId) return;

    router.push({
      pathname: "/screens/profile/business/public-business-profile",
      params: { businessId },
    });
  };
  const handleMessageClick = async () => {
    if (isCreatingChat) return;

    const participantId =
      isReceived
        ? job?.invitedById
        : job?.userId;
    const referenceRecruitmentId = job?.recruitment?.id || undefined;

    if (!participantId) {
      toast.error("Chat user is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(participantId, {
        referenceRecruitmentId,
        businessId:
          job?.businessId ||
          job?.business?.id ||
          recruitmentBusiness?.id ||
          businessRoleBusiness?.id ||
          null,
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

  return (
    <View
      className={`${className} bg-white p-4 rounded-xl border border-[#EEEEEE]`}
    >
      <View className="gap-3">
        {isReceived ? (
          <>
            <TouchableOpacity
              onPress={handleOpenBusinessProfile}
              activeOpacity={0.8}
              className="flex-row items-center gap-3"
            >
              <Image
                source={
                  job?.business?.logo ||
                  recruitmentBusiness?.logo ||
                  businessRoleBusiness?.logo ||
                  "https://img.freepik.com/free-vector/elegant-luxury-hotel-logo_23-2147534418.jpg?semt=ais_hybrid&w=740&q=80"
                }
                style={{ width: 40, height: 40, borderRadius: 999 }}
                contentFit="cover"
              />

              <View className="flex-1">
                <Text className="font-proximanova-semibold text-base leading-5 text-[#111111]">
                  {displayRole || "Role"}
                </Text>
                <Text className="mt-0.5 font-proximanova-regular text-sm leading-[18px] text-[#7A7A7A]">
                  {displayBusinessName || "Business"}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2 flex-1">
                <SimpleLineIcons name="location-pin" size={14} color="#111111" />
                <Text
                  numberOfLines={1}
                  className="flex-1 font-proximanova-regular text-sm text-[#7A7A7A]"
                >
                  {businessAddress || "Location unavailable"}
                </Text>
              </View>

              {displaySalaryMin !== null && displaySalaryMax !== null ? (
                <View className="flex-row items-end">
                  <Text className="font-proximanova-bold text-lg text-[#111111]">
                    {displaySalaryMin}-{displaySalaryMax}$
                  </Text>
                  {salarySuffix ? (
                    <Text className="mb-0.5 font-proximanova-regular text-[13px] text-[#7A7A7A]">
                      /{salarySuffix}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              {isVerified ? (
                <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D8EAFE]">
                  <MaterialIcons name="verified" size={14} color="#2D8CFF" />
                  <Text className="font-proximanova-regular text-xs text-[#1F5CA8]">
                    Verified
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                <FontAwesome name="star" size={14} color="#F3C315" />
                <Text className="font-proximanova-regular text-xs text-[#222222]">
                  {businessRatingLabel}
                </Text>
              </View>

              {displayJobType ? (
                <View className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                  <Text className="font-proximanova-regular text-xs text-[#222222]">
                    {displayJobType}
                  </Text>
                </View>
              ) : null}

              {displayDistance ? (
                <View className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                  <Text className="font-proximanova-regular text-xs text-[#222222]">
                    {displayDistance}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleOpenBusinessProfile}
              activeOpacity={0.8}
              className="flex-row items-center gap-3"
            >
              <Image
                source={
                  job?.business?.logo ||
                  recruitmentBusiness?.logo ||
                  businessRoleBusiness?.logo ||
                  "https://img.freepik.com/free-vector/elegant-luxury-hotel-logo_23-2147534418.jpg?semt=ais_hybrid&w=740&q=80"
                }
                style={{ width: 40, height: 40, borderRadius: 999 }}
                contentFit="cover"
              />

              <View className="flex-1">
                <Text className="font-proximanova-semibold text-base leading-5 text-[#111111]">
                  {displayRole || "Role"}
                </Text>
                <Text className="mt-0.5 font-proximanova-regular text-sm leading-[18px] text-[#7A7A7A]">
                  {displayBusinessName || "Business"}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-2 flex-1">
                <SimpleLineIcons name="location-pin" size={14} color="#111111" />
                <Text
                  numberOfLines={1}
                  className="flex-1 font-proximanova-regular text-sm text-[#7A7A7A]"
                >
                  {businessAddress || "Location unavailable"}
                </Text>
              </View>

              {displaySalaryMin !== null && displaySalaryMax !== null ? (
                <View className="flex-row items-end">
                  <Text className="font-proximanova-bold text-lg text-[#111111]">
                    {displaySalaryMin}-{displaySalaryMax}$
                  </Text>
                  {salarySuffix ? (
                    <Text className="mb-0.5 font-proximanova-regular text-[13px] text-[#7A7A7A]">
                      /{salarySuffix}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              {isVerified ? (
                <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D8EAFE]">
                  <MaterialIcons name="verified" size={14} color="#2D8CFF" />
                  <Text className="font-proximanova-regular text-xs text-[#1F5CA8]">
                    Verified
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                <FontAwesome name="star" size={14} color="#F3C315" />
                <Text className="font-proximanova-regular text-xs text-[#222222]">
                  {businessRatingLabel}
                </Text>
              </View>

              {displayJobType ? (
                <View className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                  <Text className="font-proximanova-regular text-xs text-[#222222]">
                    {displayJobType}
                  </Text>
                </View>
              ) : null}

              {displayDistance ? (
                <View className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">
                  <Text className="font-proximanova-regular text-xs text-[#222222]">
                    {displayDistance}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{ height: 1, width: "100%", marginVertical: 10 }}
        contentFit="cover"
      />

      {isReceived ? (
        <View className="flex-row items-end justify-between gap-3">
          <TouchableOpacity
            onPress={handleOpenDetails}
            activeOpacity={0.8}
            className="flex-row items-center gap-2"
          >
            <Text className="font-proximanova-semibold text-[14px] text-[#45A9F5]">
              View Details
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#45A9F5" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleMessageClick}
              disabled={isCreatingChat}
              activeOpacity={0.8}
              className={`items-center justify-center rounded-full p-2 ${isCreatingChat ? "bg-[#F5F5F5]" : "bg-[#E5F4FD]"
                }`}
            >
              {isCreatingChat ? (
                <ActivityIndicator size="small" color="#7A7A7A" />
              ) : (
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  contentFit="contain"
                  style={{ height: 22, width: 22 }}
                />
              )}
            </TouchableOpacity>
            {finalReceivedStatus ? (
              <StatusBadge status={finalReceivedStatus} />
            ) : (
              <>
                <TouchableOpacity
                  onPress={onReject}
                  disabled={actionLoading !== null}
                  activeOpacity={0.8}
                >
                  {actionLoading === "rejected" ? (
                    <ActivityIndicator
                      size="small"
                      color="#FF5A58"
                      style={{ width: 42 }}
                    />
                  ) : (
                    <Entypo name="circle-with-cross" size={36} color="#FF5A58" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onApprove}
                  disabled={actionLoading !== null}
                  activeOpacity={0.8}
                >
                  {actionLoading === "approved" ? (
                    <ActivityIndicator
                      size="small"
                      color="#232A33"
                      style={{ width: 42 }}
                    />
                  ) : (
                    <Ionicons name="checkmark-circle" size={36} color="#232A33" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1 items-center">
            <MaterialCommunityIcons
              name="note-text-outline"
              size={18}
              color="#7A7A7A"
            />
            <Text className="text-sm font-proximanova-regular text-secondary">
              {job?._count?.recruitmentApplications ?? 305}
            </Text>
          </View>

          <Image
            source={require("@/assets/images/line-small.svg")}
            style={{ width: 1, height: 18 }}
          />

          <View className="flex-row gap-1 items-center">
            <SimpleLineIcons name="share-alt" size={14} color="#7A7A7A" />
            <Text className="text-sm font-proximanova-regular text-secondary">
              {job?.shareCount ?? 0}
            </Text>
          </View>

          <Image
            source={require("@/assets/images/line-small.svg")}
            style={{ width: 1, height: 18 }}
          />

          <StatusBadge status="submitted" className="bg-[#F1FFF4] border-[#CDEFD5]" />
        </View>
      )}
    </View>
  );
};

export default JobRequestCard;
