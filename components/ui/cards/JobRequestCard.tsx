import { JobRequestCardProps } from "@/types";
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";
import SecondaryButton from "../buttons/SecondaryButton";

const JobRequestCard = ({ className, status, job }: JobRequestCardProps) => {
  const router = useRouter();
  const isReceived = status === "received";

  return (
    <View className={`${className} bg-[#E5F4FD] p-4 rounded-xl`}>
      <TouchableOpacity
        onPress={() => {
          const businessId = job?.businessId || job?.business?.id;
          const recruitmentId = job?.id;

          if (businessId && recruitmentId) {
            router.push({
              pathname: "/screens/jobs/user/profile",
              params: { businessId, recruitmentId },
            });
            return;
          }

          router.push("/screens/jobs/user/profile");
        }}
        className="flex-row gap-2.5"
      >
        <Image
          source={
            job?.business?.logo ||
            "https://img.freepik.com/free-vector/elegant-luxury-hotel-logo_23-2147534418.jpg?semt=ais_hybrid&w=740&q=80"
          }
          style={{ width: 40, height: 40, borderRadius: 999 }}
          contentFit="cover"
        />

        <View>
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-1">
            {job?.name || "Maintanence Staff"}
          </Text>
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {job?.business?.name || "Picko labs"}
          </Text>
        </View>
      </TouchableOpacity>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{ height: 1, width: "100%", marginVertical: 10 }}
        contentFit="contain"
      />

      {isReceived ? (
        <View className="flex-row items-center justify-between">
          <SecondaryButton
            title="View Details"
            textClass="text-[#4FB2F3]"
            iconBackground="bg-white"
            iconColor="#4FB2F3"
          />

          <View className="flex-row items-center gap-1.5">
            <View className="bg-[#E5F4FD] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
              <Ionicons name="chatbubbles" size={22} color="#4FB2F3" />
            </View>

            <Entypo name="circle-with-cross" size={40} color="#F34F4F" />
            <Ionicons name="checkmark-circle" size={40} color="#292D32" />
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

          {typeof job?.distanceKm === "number" && (
            <>
              <Image
                source={require("@/assets/images/line-small.svg")}
                style={{ width: 1, height: 18 }}
              />

              <View className="flex-row gap-1 items-center">
                <Ionicons name="location-outline" size={16} color="#7A7A7A" />
                <Text className="text-sm font-proximanova-regular text-secondary">
                  {job.distanceKm}km
                </Text>
              </View>
            </>
          )}

          <Image
            source={require("@/assets/images/line-small.svg")}
            style={{ width: 1, height: 18 }}
          />

          <StatusBadge status="submitted" />
        </View>
      )}
    </View>
  );
};

export default JobRequestCard;
