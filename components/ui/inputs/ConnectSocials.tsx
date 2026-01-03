import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SmallButton from "../buttons/SmallButton";

const ConnectSocials = ({ className }: any) => {
  return (
    <View className={`${className} border border-[#EEEEEE] rounded-xl`}>
      {/* facebook */}
      <View className="flex-row justify-between items-center p-3 border-b border-[#EEEEEE]">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/facebook2.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Facebook</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>

      {/* linkedin */}
      <View className="flex-row justify-between items-center p-3 border-b border-[#EEEEEE]">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/linkedin.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Facebook</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>

      {/* whatsapp */}
      <View className="flex-row justify-between items-center p-3 border-b border-[#EEEEEE]">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/whatsapp.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Facebook</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>

      {/* twitter */}
      <View className="flex-row justify-between items-center p-3 border-b border-[#EEEEEE]">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/twitter.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Facebook</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>

      {/* telegram */}
      <View className="flex-row justify-between items-center p-3 border-b border-[#EEEEEE]">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/telegram.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Facebook</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>

      {/* instagram */}
      <View className="flex-row justify-between items-center p-3">
        <TouchableOpacity className="flex-row items-center gap-1.5">
          <Image
            style={{
              height: 36,
              width: 36,
            }}
            source={require("@/assets/images/instagram.svg")}
            contentFit="contain"
          />

          <Text className="text-sm font-proximanova-semibold">Instagram</Text>
        </TouchableOpacity>

        <SmallButton title="Link" />
      </View>
    </View>
  );
};

export default ConnectSocials;
