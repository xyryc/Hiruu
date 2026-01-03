import { ActionCardProps } from "@/types";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SecondaryButton from "../buttons/SecondaryButton";

const ActionCard = ({
  title,
  buttonTitle,
  rightImage,
  imageClass,
  imageWidth,
  imageHeight,
  background,
  backgroundClass,
  backgroundWidth = 100,
  backgroundHeight = 100,
  onPress,
}: ActionCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row justify-between items-center p-4 bg-[#4FB2F3] rounded-[14px]"
    >
      <View className="w-8/12">
        <Text className="text-lg font-proximanova-bold text-white">
          {title}
        </Text>

        {buttonTitle && (
          <View className="mt-4">
            <SecondaryButton title={buttonTitle} onPress={onPress} />
          </View>
        )}
      </View>

      <View className={imageClass}>
        <Image
          source={rightImage}
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
          contentFit="contain"
        />
      </View>

      {/* background */}
      <View className={`${backgroundClass} absolute -right-6 top-0`}>
        <Image
          source={background}
          style={{
            width: backgroundWidth,
            height: backgroundHeight,
          }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ActionCard;
