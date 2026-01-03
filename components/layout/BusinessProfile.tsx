import { BusinessProfileProps } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import SmallButton from "../ui/buttons/SmallButton";

const BusinessProfile = ({ className }: BusinessProfileProps) => {
  const router = useRouter();

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        Do You Manage a Business?
      </Text>

      <View className="flex-row items-center bg-[#FCF7E4] border border-[#EEEEEE] p-4 rounded-xl">
        <View className="">
          <Text className="font-proximanova-semibold mb-2">
            Run Your Business Smarter{" "}
          </Text>

          <View className="flex-row items-center gap-2.5">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-sm">Run Your Business Smarter</Text>
          </View>

          <View className="flex-row items-center gap-2.5 mt-1.5">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-sm">Create & Post Jobs</Text>
          </View>

          <View className="flex-row items-center gap-2.5 mt-1.5">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-sm">Track Work Hours Easily</Text>
          </View>

          <View className="flex-row items-center gap-2.5 mt-1.5">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-sm">Monitor Team Performance</Text>
          </View>

          {/* button */}
          <SmallButton
            onPress={() => router.push("/(setup)/business-setup")}
            title="Create Business Profile"
            className="mt-5"
          />
        </View>

        {/* background image */}
        <Image
          source={require("@/assets/images/guy-in-chair.svg")}
          style={{
            width: 154,
            height: 165,
          }}
        />
      </View>
    </View>
  );
};

export default BusinessProfile;
