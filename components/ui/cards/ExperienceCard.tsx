import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const ExperienceCard = ({ focus, className }: any) => {
  return (
    <View
      className={` p-2.5  ${className} ${focus ? "border rounded-2xl" : "border border-[#0000000D] rounded-2xl"} `}
    >
      {focus && (
        <View className="absolute -top-9 right-2">
          <Image
            source={require("@/assets/images/experience.svg")}
            contentFit="contain"
            style={{ height: 30, width: 150 }}
          />
          <Text className="-top-6 text-center font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            Current Working
          </Text>
        </View>
      )}
      <View className="flex-row justify-between ">
        <View className="flex-row items-center gap-3">
          <View>
            <Image
              source={require("@/assets/images/reward/nameplate-profile.png")}
              contentFit="contain"
              style={{ height: 50, width: 50 }}
            />
          </View>
          <View>
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Hapiness Bar
            </Text>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              working as Operations Manager
            </Text>
          </View>
        </View>
        <View>
          <Image
            source={require("@/assets/images/hiruu-logo.svg")}
            contentFit="contain"
            style={{ height: 14, width: 38 }}
          />
        </View>
      </View>
    </View>
  );
};

export default ExperienceCard;
