import { SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type DisplayContent =
  | { type: "all"; content: string }
  | {
      type: "single";
      content?: {
        name?: string;
        logo?: string;
        imageUrl?: string;
      };
    }
  | { type: "multi"; content: string };

type BusinessSelectionTriggerProps = {
  displayContent?: DisplayContent | null;
  onPress: () => void;
  className?: string;
  compact?: boolean;
};

const BusinessSelectionTrigger = ({
  displayContent,
  onPress,
  className = "",
  compact = false,
}: BusinessSelectionTriggerProps) => {
  const { t } = useTranslation();
  const paddingClass = compact ? "p-0.5" : "p-1";
  const imageSource =
    displayContent?.content?.logo ||
    displayContent?.content?.imageUrl ||
    displayContent?.content?.business?.logo;
  const displayName =
    displayContent?.content?.name ||
    displayContent?.content?.business?.name ||
    t("user.jobs.schedule.selected");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-[#E5F4FD] flex-row items-center rounded-[26px] ${paddingClass} ${className}`}
    >
      {displayContent?.type === "all" ? (
        <View className="pl-2.5 py-1.5">
          <Text className="font-semibold text-sm text-primary">
            {t("common.all")}
          </Text>
        </View>
      ) : displayContent?.type === "single" ? (
        <View>
          {imageSource ? (
            <Image
              source={imageSource}
              style={{ width: 30, height: 30, borderRadius: 999 }}
              contentFit="cover"
            />
          ) : (
            <View className="pl-2.5 py-1.5">
              <Text className="font-semibold text-sm text-primary">
                {displayName}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View className="pl-2.5 py-1.5">
          <Text className="font-semibold text-sm text-primary">
            {displayContent?.content || t("user.jobs.schedule.selected")}
          </Text>
        </View>
      )}

      <SimpleLineIcons
        className="p-1.5"
        name="arrow-down"
        size={12}
        color="#111111"
      />
    </TouchableOpacity>
  );
};

export default BusinessSelectionTrigger;
