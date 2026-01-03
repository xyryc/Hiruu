import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import SecondaryButton from "../buttons/SecondaryButton";

const AnnouncementCard = () => {
  return (
    <View className="border border-[#EEEEEE] p-2.5 rounded-xl mr-2.5 max-w-80">
      {/* top section */}
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons
          className="p-3 bg-[#F3934F26] rounded-full"
          name="comment-text-multiple"
          size={22}
          color="#F3934F"
        />

        <View>
          <Text className="font-proximanova-bold">Latest Announcement</Text>
          <Text className="font-proximanova-regular text-sm text-[#F3934F] mt-1">
            Shift Swapping Is Live!
          </Text>
        </View>
      </View>

      {/* bottom section */}
      <Text className="mt-2.5 font-proximanova-regular text-sm text-secondary">
        Now you can easily request to swap your shift with coworkers anytime,
        hassle-free.
      </Text>

      {/* button */}
      <SecondaryButton
        title="Try Now"
        className="!bg-[#E5F4FD] mt-4  ml-auto !py-1.5"
        textClass="text-[#4FB2F3] mx-2"
        iconColor="#4FB2F3"
        iconBackground="bg-transparent"
      />

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

export default AnnouncementCard;
