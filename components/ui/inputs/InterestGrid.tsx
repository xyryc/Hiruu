import { InterestGridProps } from "@/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { INTERESTS } from "@/constants/interests";

const INTEREST_BG_COLOR_MAP: Record<string, string> = {
  "bg-orange-100": "#FFEDD5",
  "bg-blue-100": "#DBEAFE",
  "bg-yellow-100": "#FEF9C3",
  "bg-green-100": "#DCFCE7",
  "bg-gray-100": "#F3F4F6",
  "bg-gray-200": "#E5E7EB",
  "bg-green-200": "#BBF7D0",
  "bg-yellow-200": "#FEF08A",
  "bg-pink-100": "#FCE7F3",
  "bg-red-100": "#FEE2E2",
  "bg-orange-200": "#FED7AA",
  "bg-green-300": "#86EFAC",
  "bg-blue-200": "#BFDBFE",
  "bg-cyan-100": "#CFFAFE",
  "bg-gray-300": "#D1D5DB",
  "bg-pink-200": "#FBCFE8",
  "bg-gray-400": "#9CA3AF",
  "bg-yellow-300": "#FDE047",
  "bg-orange-300": "#FDBA74",
  "bg-purple-100": "#F3E8FF",
  "bg-gray-500": "#6B7280",
  "bg-green-400": "#4ADE80",
  "bg-pink-300": "#F9A8D4",
};

const InterestGrid = ({
  selectedInterests,
  onToggle,
  readonly = false,
  showSelectedOnly = false,
  interests = INTERESTS,
}: InterestGridProps) => {
  const { t } = useTranslation();

  const visibleInterests =
    readonly && showSelectedOnly
      ? interests.filter((interest) =>
        selectedInterests.includes(interest.id)
      )
      : interests;

  return (
    <View className={`flex-row flex-wrap ${!readonly && "justify-between"}`}>
      {visibleInterests.map((interest) => {
        const selected = selectedInterests.includes(interest.id);

        return (
          <TouchableOpacity
            key={interest.id}
            onPress={() => onToggle?.(interest.id)}
            className="w-[23%] mb-4"
            activeOpacity={0.7}
            disabled={!onToggle || readonly}
          >
            <View className="items-center">
              <View className="relative">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{
                    backgroundColor:
                      INTEREST_BG_COLOR_MAP[interest.color] || "#F3F4F6",
                    borderWidth: selected && !readonly ? 1 : 0,
                    borderColor: selected && !readonly ? "#111111" : "transparent",
                    borderRadius: 999,
                  }}
                >
                  <Text className="text-2xl">{interest.icon}</Text>
                </View>

                {selected && !readonly && (
                  <View className="absolute top-0 -right-1 w-6 h-6 bg-gray-800 rounded-full items-center justify-center border-2 border-white">
                    <Text className="text-white text-xs font-proximanova-bold">
                      ✓
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className={`text-xs text-center mt-2 font-proximanova-medium ${selected ? "text-gray-900" : "text-gray-600"}`}
              >
                {t(interest.name)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default InterestGrid;
