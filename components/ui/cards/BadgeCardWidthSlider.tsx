import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import CoinProgressSlider from "../inputs/CoinProgressSlider";
import BadgeModal from "../modals/BadgeModal";

type TBadgeCardWidthSlider = {
  img: string;
  title: string;
  time: string;
  max: number;
  achieved: number;
  text: string;
  tag: string;
  badgeBackground: string;
  tagColor: string;
  className?: string;
  onPress: () => void;
};

const BadgeCardWidthSlider = ({
  img,
  title,
  time,
  max,
  achieved,
  text,
  tag,
  tagColor,
  badgeBackground,
  className,
  onPress,
}: TBadgeCardWidthSlider) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        className={` ${className} border border-[#EEEEEE] rounded-xl p-4 flex-row gap-4`}
      >
        <View
          className="h-[87px] w-16 bg-[#FFF4ED] items-center flex-row justify-center rounded-[10px] border border-b-[3px] "
          style={{ borderColor: tagColor, backgroundColor: badgeBackground }}
        >
          <Image
            source={img}
            contentFit="contain"
            style={{ height: 49, width: 34 }}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between">
            <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
              {title}
            </Text>
            <Text
              className=" text-right font-proximanova-semibold"
              style={{ color: tagColor }}
            >
              {tag}
            </Text>
          </View>
          <Text className=" mt-1.5 font-proximanova-semibold text-primary dark:text-dark-primary">
            {time}
          </Text>

          <View className="mt-1.5">
            <CoinProgressSlider max={max} achieved={achieved} />
          </View>
          <Text className="mt-2 font-proximanova-semibold text-primary dark:text-dark-primary">
            <Text className="text-[#4FB2F3]">Next</Text> : {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BadgeCardWidthSlider;
