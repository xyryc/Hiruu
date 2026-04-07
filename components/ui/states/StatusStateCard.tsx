import { Image, type ImageSource } from "expo-image";
import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

type StatusStateCardProps = {
  style?: StyleProp<ViewStyle>;
  image?: ImageSource;
  title?: string;
  text?: string;
  titleStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const defaultOfflineImage = require("@/assets/images/errors/offline.svg");

const StatusStateCard = ({
  style,
  image,
  title = "You're Offline",
  text = "Please check your internet connection and try again later",
  titleStyle,
  textStyle,
}: StatusStateCardProps) => {
  return (
    <View
      style={style}
      className="items-center rounded-2xl border border-[#E4E4E4] bg-[#F7F7F7] px-6 py-10"
    >
      <Image
        source={image || defaultOfflineImage}
        contentFit="contain"
        style={{ width: 130, height: 130 }}
      />

      <Text
        style={titleStyle}
        className="mt-1 text-center font-proximanova-semibold text-[30px] text-[#1F1F1F]"
      >
        {title}
      </Text>
      <Text
        style={textStyle}
        className="mt-2 text-center font-proximanova-regular text-[15px] text-[#8C8C8C]"
      >
        {text}
      </Text>
    </View>
  );
};

export default StatusStateCard;
