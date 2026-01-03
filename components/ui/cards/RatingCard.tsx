import { View, Text } from "react-native";
import React from "react";
import { Image } from "expo-image";
import RatingStar from "./RatingStar";

type TRatingCard = {
  className: string;
  rating: number;
  time: string;
  name: string;
};

const RatingCard = ({ className, rating, name, time }: TRatingCard) => {
  return (
    <View className={`${className}`}>
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-4">
          <Image
            source={require("@/assets/images/reward/nameplate-profile.png")}
            contentFit="contain"
            style={{ height: 50, width: 50 }}
          />
          <View>
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {" "}
              {name}
            </Text>
            <View className="flex-row gap-3 items-center">
              <RatingStar rating={rating} />
              <Text>({rating})</Text>
            </View>
          </View>
        </View>
        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
          {time}
        </Text>
      </View>
    </View>
  );
};

export default RatingCard;
