import { BusinessSelectionModalProps } from "@/types";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessSelectionModal: React.FC<BusinessSelectionModalProps> = ({
  visible,
  onClose,
  businesses,
  selectedBusinesses,
  onSelectionChange,
}) => {
  const [localSelection, setLocalSelection] =
    useState<string[]>(selectedBusinesses);

  // Determine if "All" is selected
  const isAllSelected =
    localSelection.length === 0 || localSelection.length === businesses.length;

  useEffect(() => {
    setLocalSelection(selectedBusinesses);
  }, [selectedBusinesses]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // If all selected, do nothing or keep all selected
      setLocalSelection([]);
    } else {
      // Select all
      setLocalSelection([]);
    }
  };

  const toggleBusiness = (businessId: string) => {
    // If clicking on already selected single business, switch to "All"
    if (localSelection.length === 1 && localSelection[0] === businessId) {
      setLocalSelection([]);
    } else {
      // Select only this business
      setLocalSelection([businessId]);
    }
  };

  const handleDone = () => {
    onSelectionChange(localSelection);
    onClose();
  };

  const isSelected = (businessId: string) => {
    // If empty array, "All" is selected, so all businesses appear selected
    if (localSelection.length === 0) return true;
    return localSelection.includes(businessId);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[45%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            {/* Header */}
            <View className="px-6 py-7">
              <Text className="font-proximanova-bold text-xl text-center">
                Select Your Business
              </Text>
            </View>

            {/* Select All Toggle */}
            <View className="px-6 pb-4">
              <TouchableOpacity
                onPress={toggleSelectAll}
                className="flex-row justify-between items-center"
              >
                <Text className="font-proximanova-semibold text-lg text-primary">
                  Select all
                </Text>
                <View
                  className="w-12 h-6 rounded-full relative"
                  style={{
                    backgroundColor: isAllSelected ? "#4FB2F3" : "#D1D5DB",
                  }}
                >
                  <View
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                    style={{
                      right: isAllSelected ? 2 : undefined,
                      left: isAllSelected ? undefined : 2,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Business List */}
            <ScrollView className="px-6">
              {businesses.map((business) => (
                <TouchableOpacity
                  key={business.id}
                  onPress={() => toggleBusiness(business.id)}
                  className={`flex-row items-center py-4 px-4 mb-3 rounded-xl ${
                    isSelected(business.id) ? "bg-[#4FB2F3]" : "bg-white"
                  }`}
                >
                  {/* Business Avatar */}
                  <View className="w-10 h-10 rounded-full mr-4 justify-center items-center">
                    <Image
                      source={business.imageUrl}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                      }}
                    />
                  </View>

                  {/* Business Name */}
                  <Text
                    className={`flex-1 font-proximanova-semibold ${
                      isSelected(business.id) ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {business.name}
                  </Text>

                  {/* Selection Indicator */}
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      isSelected(business.id)
                        ? "bg-white border-white"
                        : "border-gray-400 bg-white"
                    } justify-center items-center`}
                  >
                    {isSelected(business.id) && (
                      <Entypo name="check" size={14} color="black" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default BusinessSelectionModal;
