import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";
import InterestGrid from "../inputs/InterestGrid";

interface InterestModalProps {
  visible: boolean;
  /** initial selected interest ids when the modal opens */
  initialInterests?: string[];
  /** called whenever the selection changes */
  onChange?: (selected: string[]) => void;
  /** called when the modal closes; receives the final selection */
  onClose: (selected: string[]) => void;
}

const InterestModal = ({
  visible,
  initialInterests,
  onChange,
  onClose,
}: InterestModalProps) => {
  const { t } = useTranslation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialInterests ?? []
  );

  useEffect(() => {
    if (visible) {
      setSelectedInterests(initialInterests ?? []);
    }
  }, [visible, initialInterests]);

  const maxSelections = 8;
  const toggleInterest = (interestId: string) => {
    const isSelected = selectedInterests.includes(interestId);

    let newSelected: string[];
    if (isSelected) {
      newSelected = selectedInterests.filter((id) => id !== interestId);
    } else if (selectedInterests.length < maxSelections) {
      newSelected = [...selectedInterests, interestId];
    } else {
      newSelected = selectedInterests;
    }

    setSelectedInterests(newSelected);
    if (onChange) onChange(newSelected);
  };

  const handleDone = () => {
    if (onClose) onClose(selectedInterests);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl  max-h-[75%]">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary text-center">
              {t("user.profile.interestModal.title")}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 80
              }}
            >
              <InterestGrid
                selectedInterests={selectedInterests}
                onToggle={toggleInterest}
              />
            </ScrollView>

            <View className="absolute bottom-10 inset-x-0 items-center mx-5">
              {selectedInterests.length >= maxSelections && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-blue-700 text-sm text-center">
                    {t("user.profile.interestModal.maxReached")}
                  </Text>
                </View>
              )}
              <PrimaryButton
                title={t("user.profile.interestModal.save")}
                className="mt-2.5"
                onPress={handleDone}
              />
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default InterestModal;
