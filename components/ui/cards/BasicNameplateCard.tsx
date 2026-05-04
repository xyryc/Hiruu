import { MaterialIcons, Octicons, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

type BasicNameplateCardProps = {
  avatarUrl?: string | null;
  name?: string;
  location?: string;
  rating?: number | string;
  isVerified?: boolean;
};

const BasicNameplateCard = ({
  avatarUrl,
  name,
  location,
  rating,
  isVerified = true,
}: BasicNameplateCardProps) => {
  const validRating = Number(rating);
  return (
    <View
      className="min-h-[120px] rounded-xl px-4 flex-row items-center"
      style={{
        borderWidth: 1,
        borderColor: "#E6E8EC",
        backgroundColor: "#F7FAFC",
      }}
    >
      <View
        className="rounded-full mr-2.5 p-1"
        style={{
          borderColor: "#D5DCE4",
          borderWidth: 2,
          borderRadius: 999,
        }}
      >
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("@/assets/images/placeholder.png")
          }
          style={{
            width: 78,
            height: 78,
            borderRadius: 999,
          }}
          contentFit="cover"
        />
      </View>

      <View className="max-w-[70%] items-start">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <Text
            numberOfLines={1}
            className="font-proximanova-semibold text-sm text-primary"
          >
            {name || "User"}
          </Text>
          {isVerified ? (
            <MaterialIcons name="verified" size={16} color="#4F83F3" />
          ) : null}
        </View>

        <View className="flex-row items-center gap-1 mb-1.5">
          <SimpleLineIcons name="location-pin" size={12} color="black" />
          <Text
            numberOfLines={1}
            className="font-proximanova-regular text-xs text-primary"
          >
            {location || "Location unavailable"}
          </Text>
        </View>

        <View className="flex-row gap-1 px-2 py-1 bg-white rounded-md">
          <Octicons name="star-fill" size={12} color="#F1C400" />
          <Text className="font-proximanova-semibold text-xs text-primary">
            {
              Number.isFinite(validRating) && validRating > 0
                ? `${validRating.toFixed(1)}/5`
                : "N/A"
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BasicNameplateCard;
