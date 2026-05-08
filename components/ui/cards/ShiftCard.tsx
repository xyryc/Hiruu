import { FontAwesome6, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";

const ShiftCard = ({ shift, onMessagePress, onViewDetailsPress }: any) => {
  const { t } = useTranslation();
  const router = useRouter();
  const avatarSource =
    typeof shift?.avatar === "string" && shift.avatar.trim().length > 0
      ? { uri: shift.avatar }
      : require("@/assets/images/placeholder.png");
  const canOpenUserProfile = Boolean(shift?.userId);

  const handleOpenUserProfile = () => {
    if (!canOpenUserProfile) return;
    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: {
        userId: String(shift.userId),
        ...(shift?.businessId
          ? { businessId: String(shift.businessId), canRate: "true" }
          : {}),
      },
    });
  };

  return (
    <View
      key={shift.id}
      className="border border-[#EEEEEE] rounded-xl p-4 mb-4"
    >
      {/* 1st row */}
      <View className="flex-row justify-between items-start">
        {/* profile pic, name */}
        <TouchableOpacity
          onPress={handleOpenUserProfile}
          disabled={!canOpenUserProfile}
          className="flex-row gap-2.5 flex-1"
        >
          <Image
            className="mr-2.5"
            source={avatarSource}
            style={{ width: 42, height: 42, borderRadius: 999 }}
          />

          <View className="">
            <Text className="text-base font-proximanova-bold text-primary">
              {shift.name}
            </Text>

            <Text className="text-sm font-proximanova-regular text-gray-600 mb-3">
              {shift.role}
            </Text>
          </View>
        </TouchableOpacity>

        {/* icons */}
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={onMessagePress}
            disabled={!onMessagePress}
            className={`p-2 rounded-full ${
              onMessagePress ? "bg-[#E5F4FD]" : "bg-[#F5F5F5]"
            }`}
          >
            <Image
              source={require("@/assets/images/messages-fill.svg")}
              contentFit="contain"
              style={{ height: 22, width: 22 }}
            />
          </TouchableOpacity>

          <SimpleLineIcons name="options-vertical" size={14} color="black" />
        </View>
      </View>

      {/* 2nd row */}
      <View className="my-4">
        <View className="flex-row justify-between mb-2.5">
          <Text className="text-sm font-proximanova-regular text-secondary">
            {t("user.jobs.schedule.shiftTime")}
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary">
            {shift.shiftTime}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm font-proximanova-regular text-secondary">
            {t("user.jobs.schedule.location")}
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary">
            {shift.location}
          </Text>
        </View>
      </View>

      {/* line*/}
      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          width: "100%",
          height: 1,
        }}
        contentFit="cover"
      />

      {/* 3rd row */}
      <View className="mt-2.5 flex-row justify-between items-center">
        {/* view details */}
        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={onViewDetailsPress}
          disabled={!onViewDetailsPress}
        >
          <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
            {t("user.jobs.schedule.viewDetails")}
          </Text>
          <FontAwesome6 name="arrow-right-long" size={14} color="#4FB2F3" />
        </TouchableOpacity>

        {/* status */}
        <StatusBadge status={shift?.status} />
      </View>
    </View>
  );
};

export default ShiftCard;
