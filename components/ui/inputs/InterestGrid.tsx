import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { INTERESTS, Interest } from "@/constants/interests";

type InterestGridProps = {
  selectedInterests: string[];
  onToggle?: (interestId: string) => void;
  readonly?: boolean;
  showSelectedOnly?: boolean;
  interests?: Interest[];
};

const InterestGrid: React.FC<InterestGridProps> = ({
  selectedInterests,
  onToggle,
  readonly = false,
  showSelectedOnly = false,
  interests = INTERESTS,
}) => {
  const { t } = useTranslation();

  const visibleInterests =
    readonly && showSelectedOnly
      ? interests.filter((interest) =>
        selectedInterests.includes(interest.id)
      )
      : interests;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
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
                    className={`w-16 h-16 rounded-full items-center justify-center
                        ${selected && !readonly ? `border border-primary` : ""} ${interest.color}`}
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
    </ScrollView>
  );
};

export default InterestGrid;
