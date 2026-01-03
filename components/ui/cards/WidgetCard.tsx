import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import SecondaryButton from "../buttons/SecondaryButton";

const WidgetCard = () => {
  return (
    <View className="border border-[#EEEEEE] p-2.5 rounded-xl mr-2.5 max-w-80">
      <View>
        {/* top section */}
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            className="p-3 bg-[#E9F0FD] rounded-full"
            name="comment-text-multiple"
            size={22}
            color="#6998EF"
          />
          <Text className="font-proximanova-bold">Recent Shift Summary</Text>
        </View>

        {/* bottom section */}
        <View className="mt-2.5 flex-row justify-between items-center gap-6">
          <View>
            <Text className="font-proximanova-regular text-sm text-secondary mb-0.5">
              Date
            </Text>
            <Text className="text-primary text-sm font-proximanova-semibold">
              23 July
            </Text>
          </View>

          <Image
            source={require("@/assets/images/line-small.svg")}
            style={{
              height: 24,
              width: 1,
            }}
          />

          <View>
            <Text className="font-proximanova-regular text-sm text-secondary mb-0.5">
              Date
            </Text>
            <Text className="text-primary text-sm font-proximanova-semibold">
              23 July
            </Text>
          </View>

          <Image
            source={require("@/assets/images/line-small.svg")}
            style={{
              height: 24,
              width: 1,
            }}
          />

          <View>
            <Text className="font-proximanova-regular text-sm text-secondary mb-0.5">
              Rating
            </Text>

            <View className="flex-row gap-0.5">
              <FontAwesome name="star" size={16} color="#F1C400" />
              <FontAwesome name="star" size={16} color="#F1C400" />
              <FontAwesome name="star" size={16} color="#F1C400" />
              <FontAwesome name="star" size={16} color="#F1C400" />
              <FontAwesome name="star" size={16} color="#F1C400" />
            </View>
          </View>
        </View>

        {/* button */}
        <SecondaryButton
          title="View Details"
          className="!bg-[#E5F4FD] mt-4 max-w-[60%] ml-auto !py-1.5"
          textClass="text-[#4FB2F3] mx-2"
          iconColor="#4FB2F3"
          iconBackground="bg-transparent"
        />
      </View>

      <View className="absolute -bottom-20 left-7">
        <Image
          source={require("@/assets/images/stats-bg2.svg")}
          style={{
            width: 100,
            height: 120,
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );
};

export default WidgetCard;
