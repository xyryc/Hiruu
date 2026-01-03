import { View, Text } from "react-native";
import React from "react";
import { Image } from "expo-image";
import RatingStar from "./RatingStar";

const RatingBanner = () => {
  return (
    <View>
      <View className="flex-row justify-center items-center">
        <Image
          source={require("@/assets/images/profile/rating-leaves.svg")}
          contentFit="contain"
          style={{ height: 84, width: 61, transform: [{ scaleX: -1 }] }}
        />
        <View>
          <Text className="text-center font-proximanova-semibold text-primary dark:text-dark-primary">
            Overall Rating
          </Text>
          <Text className="text-center font-proximanova-bold text-5xl text-primary dark:text-dark-primary">
            4.9
          </Text>
        </View>
        <Image
          source={require("@/assets/images/profile/rating-leaves.svg")}
          contentFit="contain"
          style={{ height: 84, width: 61 }}
        />
      </View>

      <RatingStar rating={5} />
      <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2">
        Based on overall rating
      </Text>
    </View>
  );
};

export default RatingBanner;
