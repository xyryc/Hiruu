import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const BadgeCard = ({ className }: any) => {
  return (
    <View
      className={`flex-row justify-between px-4 border-hairline rounded-2xl ${className} `}
    >
      <View className=" pb-4 items-center">
        <Image
          source={require("@/assets/images/reward/red-bands.svg")}
          contentFit="cover"
          style={{ height: 75, width: 50 }}
        />
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center">
          Hard worker
        </Text>
      </View>
      <Image
        source={require("@/assets/images/vertical-dotted-line.svg")}
        contentFit="contain"
        style={{ height: 60, width: 2, marginTop: 20 }}
      />
      <View className=" pb-4 items-center">
        <Image
          source={require("@/assets/images/reward/black-bands.svg")}
          contentFit="cover"
          style={{ height: 75, width: 50 }}
        />
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center">
          Hard worker
        </Text>
      </View>
      <Image
        source={require("@/assets/images/vertical-dotted-line.svg")}
        contentFit="contain"
        style={{ height: 60, width: 2, marginTop: 20 }}
      />
      <View className=" pb-4 items-center">
        <Image
          source={require("@/assets/images/reward/gold-bands.svg")}
          contentFit="cover"
          style={{ height: 75, width: 50 }}
        />
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center">
          Hard worker
        </Text>
      </View>
    </View>
  );
};

export default BadgeCard;
