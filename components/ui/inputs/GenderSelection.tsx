import { GenderSelectionProps } from "@/types";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const GenderSelection: React.FC<GenderSelectionProps> = ({
  value,
  onGenderChange,
}) => {
  const genderOptions = [
    {
      value: "male" as const,
      label: "Male",
      icon: "👨",
      bgColor: "bg-white",
      textColor: "text-gray-900",
      borderColor: "border-gray-800",
    },
    {
      value: "female" as const,
      label: "Female",
      icon: "👩",
      bgColor: "bg-gray-100",
      textColor: "text-gray-400",
      borderColor: "border-gray-300",
    },
    {
      value: "other" as const,
      label: "Other",
      icon: "⚧️",
      bgColor: "bg-gray-100",
      textColor: "text-gray-400",
      borderColor: "border-gray-300",
    },
  ];

  const getCardStyle = (optionValue: string) => {
    const isSelected = value === optionValue;

    if (isSelected) {
      return {
        container: "bg-white border border-[#11293A]",
        text: "text-primary",
        checkmark: true,
      };
    }

    return {
      container: "bg-gray-100 border border-[#11293A]",
      text: "text-primary",
      checkmark: false,
    };
  };

  return (
    <View className="flex-row gap-2">
      {genderOptions.map((option) => {
        const cardStyle = getCardStyle(option.value);

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onGenderChange(option.value)}
            className={`flex-1 relative`}
          >
            <View
              className={`p-6 rounded-2xl items-center ${cardStyle.container}`}
            >
              {/* Checkmark */}
              {cardStyle.checkmark && (
                <View className="absolute top-3 right-3 z-10 w-6 h-6 bg-gray-800 rounded-full items-center justify-center">
                  <Text className="text-white text-sm font-proximanova-bold">
                    ✓
                  </Text>
                </View>
              )}

              {/* Icon */}
              <View className="mb-4">
                {option.value === "male" && (
                  <View className="w-16 h-16  items-center justify-center">
                    <Image
                      style={{
                        height: 56,
                        width: 56,
                      }}
                      source={require("@/assets/images/male.svg")}
                      contentFit="contain"
                    />
                  </View>
                )}

                {option.value === "female" && (
                  <View className="w-16 h-16 items-center justify-center">
                    <Image
                      style={{
                        height: 56,
                        width: 56,
                      }}
                      source={require("@/assets/images/female.svg")}
                      contentFit="contain"
                    />
                  </View>
                )}

                {option.value === "other" && (
                  <View className="w-16 h-16 items-center justify-center">
                    <Image
                      style={{
                        height: 56,
                        width: 56,
                      }}
                      source={require("@/assets/images/other.svg")}
                      contentFit="contain"
                    />
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                className={`text-lg font-proximanova-medium ${cardStyle.text}`}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default GenderSelection;
