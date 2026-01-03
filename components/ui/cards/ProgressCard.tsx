import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import PrimaryButton from "../buttons/PrimaryButton";

const ProgressCard = () => {
  const [progress, setProgress] = useState(80);

  // Color mapping based on progress
  const getTintColor = (fill: number) => {
    if (fill < 25) return "#FE714E"; // red
    if (fill < 50) return "#e0c722"; // yellow
    if (fill < 75) return "#a5c738"; // orange
    return "#10B981"; // Green
  };

  const tintColor = getTintColor(progress);

  return (
    <View className="flex-row justify-between bg-[#4FB2F326] p-5 rounded-[14px]">
      {/* left */}
      <View>
        <Text
          style={{ backgroundColor: tintColor }}
          className={`font-proximanova-semibold text-[10px] text-center text-white py-1.5 px-2.5 rounded-[20px] mb-2`}
        >
          {progress}% Ready
        </Text>

        {/* Progress Arc (Semi-Circle) */}
        <AnimatedCircularProgress
          size={100}
          width={10}
          fill={progress}
          rotation={-90} // Start at top (like a gauge)
          tintColor={tintColor}
          backgroundColor="#E5E7EB"
          arcSweepAngle={180} // Only half circle (top half)
          lineCap="round"
          style={styles.progressContainer}
        >
          {() => (
            <View className="absolute inset-0 items-center justify-center">
              {/* User Icon */}
              <View className="border-[#4FB2F34D] border-8 rounded-full">
                <View className="bg-white rounded-full w-14 h-14 justify-center items-center">
                  <FontAwesome name="user" size={26} color="#4FB2F3" />
                </View>
              </View>
            </View>
          )}
        </AnimatedCircularProgress>

        {/* Label: 0% - Left End */}
        <Text className="absolute bottom-8 text-[10px] text-secondary font-proximanova-semibold">
          0
        </Text>

        {/* Label: 100% - Right End */}
        <Text className="absolute bottom-8 right-0 text-[10px] text-secondary font-proximanova-semibold">
          100
        </Text>

        {/* Bottom Label */}
        <Text className="absolute bottom-0 right-10 text-[10px] font-proximanova-semibold text-center ">
          Profile
        </Text>
      </View>

      {/* center */}
      <View className="justify-center">
        <Image
          source={require("@/assets/images/vertical-line.svg")}
          style={{
            height: 84,
            width: 1,
          }}
        />
      </View>

      {/* right */}
      <View className="justify-center">
        <Text className="font-proximanova-semibold mb-1">
          Your Profile is {progress}% Ready
        </Text>
        <Text className="font-proximanova-regular text-secondary text-sm">
          Complete Your Profile To Get
        </Text>
        <Text className="font-proximanova-semibold text-[#4FB2F3] text-sm">
          5 Tokens
        </Text>

        <PrimaryButton
          className="mt-2.5 w-full"
          title="Complete Profile"
          iconSize={18}
        />
      </View>
    </View>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  progressContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
