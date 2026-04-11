import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import InterestGrid from "./InterestGrid";

interface InterestsSelectionProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  readonly?: boolean;
  showSelectedOnly?: boolean;
}

const InterestsSelection: React.FC<InterestsSelectionProps> = ({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10,
  readonly = false,
  showSelectedOnly = false,
}) => {
  const { t } = useTranslation();

  const toggleInterest = (interestId: string) => {
    if (readonly) return;
    const isSelected = selectedInterests.includes(interestId);

    if (isSelected) {
      onInterestsChange(selectedInterests.filter((id) => id !== interestId));
    } else if (selectedInterests.length < maxSelections) {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  return (
    <View>
      {!readonly && (
        <View className="mb-6">
          <Text className="text-xl font-proximanova-semibold text-gray-900 mb-2">
            {t("user.profile.interestSelection.title")}
          </Text>
          <Text className="text-sm text-gray-600">
            {t("user.profile.interestSelection.subtitle", {
              maxSelections,
              count: selectedInterests.length,
            })}
          </Text>
        </View>
      )}

      <InterestGrid
        selectedInterests={selectedInterests}
        onToggle={toggleInterest}
        readonly={readonly}
        showSelectedOnly={showSelectedOnly}
      />

      {!readonly && selectedInterests.length >= maxSelections && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-blue-700 text-sm text-center">
            {t("user.profile.interestSelection.maxReached")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default InterestsSelection;
