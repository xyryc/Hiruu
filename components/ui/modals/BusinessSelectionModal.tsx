import { useBusinessStore } from "@/stores/businessStore";
import { BusinessSelectionModalProps } from "@/types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessSelectionModal: React.FC<BusinessSelectionModalProps> = ({
  visible,
  onClose,
  businesses,
  disableStoreFallback = false,
  selectedBusinesses,
  onSelectionChange,
}) => {
  const { myBusinesses, myBusinessesLoading, getMyBusinesses } = useBusinessStore();
  const displayedBusinesses =
    businesses.length > 0 || disableStoreFallback ? businesses : myBusinesses;
  const displayedBusinessIds = useMemo(() => {
    const unique = new Set<string>();
    displayedBusinesses.forEach((business) => {
      if (business?.id) unique.add(business.id);
    });
    return Array.from(unique);
  }, [displayedBusinesses]);

  const effectiveSelectedBusinesses = useMemo(() => {
    if (displayedBusinessIds.length <= 1) return displayedBusinessIds;
    const filtered = selectedBusinesses.filter((id) => displayedBusinessIds.includes(id));
    const unique = Array.from(new Set(filtered));
    return unique.length > 1 ? [] : unique;
  }, [displayedBusinessIds, selectedBusinesses]);

  const hasSingleBusiness = displayedBusinesses.length === 1;
  const hasMultipleBusinesses = displayedBusinesses.length > 1;

  // Determine if "All" is selected
  const isAllSelected =
    hasMultipleBusinesses &&
    effectiveSelectedBusinesses.length === 0;

  useEffect(() => {
    if (!visible) return;
    if (disableStoreFallback) return;
    if (businesses.length > 0) return;
    getMyBusinesses().catch(() => undefined);
  }, [businesses.length, disableStoreFallback, getMyBusinesses, visible]);

  useEffect(() => {
    if (!visible) return;
    if (!hasSingleBusiness) return;
    const onlyBusinessId = displayedBusinessIds[0];
    if (!onlyBusinessId) return;
    if (
      selectedBusinesses.length === 1 &&
      selectedBusinesses[0] === onlyBusinessId
    ) {
      return;
    }
    onSelectionChange([onlyBusinessId]);
  }, [
    displayedBusinessIds,
    hasSingleBusiness,
    onSelectionChange,
    selectedBusinesses,
    visible,
  ]);

  const toggleSelectAll = () => {
    if (!hasMultipleBusinesses) return;
    if (isAllSelected) {
      const firstBusinessId = displayedBusinessIds[0];
      onSelectionChange(firstBusinessId ? [firstBusinessId] : []);
      return;
    }
    onSelectionChange([]);
  };

  const toggleBusiness = (businessId: string) => {
    if (hasSingleBusiness) {
      onSelectionChange([businessId]);
      return;
    }

    // In "All" mode ([]), first tap switches to explicit single selection.
    if (isAllSelected) {
      onSelectionChange([businessId]);
      return;
    }

    if (effectiveSelectedBusinesses.includes(businessId)) {
      onSelectionChange([]);
      return;
    }

    onSelectionChange([businessId]);
  };

  const handleDone = () => {
    onClose();
  };

  const isSelected = (businessId: string) => {
    // With one business, explicit selection is required.
    if (hasSingleBusiness) return true;
    if (isAllSelected) return true;
    return effectiveSelectedBusinesses.includes(businessId);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[55%]">
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
            {hasMultipleBusinesses && (
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
            )}

            {/* Business List */}
            <ScrollView
              className="px-6"
              contentContainerStyle={{ paddingBottom: 140 }}
            >
              {myBusinessesLoading &&
                !disableStoreFallback &&
                displayedBusinesses.length === 0 && (
                  <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#4FB2F3" />
                  </View>
                )}
              {(!myBusinessesLoading || disableStoreFallback) &&
                displayedBusinesses.length === 0 && (
                  <Text className="text-center text-sm text-gray-500 py-6">
                    No businesses found.
                  </Text>
                )}
              {displayedBusinesses.map((business) => {
                const addressLabel = business?.address?.address || "";
                return (
                  <TouchableOpacity
                    key={business.id}
                    onPress={() => toggleBusiness(business.id)}
                    className={`flex-row items-center p-2.5 mb-3 rounded-xl ${isSelected(business.id) ? "bg-[#4FB2F3]" : "bg-white"
                      }`}
                  >
                    {/* Business Avatar */}
                    <View className="w-10 h-10 rounded-full mr-4 justify-center items-center">
                      {business.logo ? (
                        <Image
                          source={business.logo}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                          }}
                          contentFit="cover"
                        />
                      ) : (
                        <Image
                          source={require("@/assets/images/placeholder.png")}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                          }}
                          contentFit="cover"
                        />
                      )}
                    </View>

                    {/* Business Name */}
                    <View className="flex-1">
                      <Text
                        className={`font-proximanova-semibold ${isSelected(business.id) ? "text-white" : "text-gray-900"
                          }`}
                        numberOfLines={1}
                      >
                        {business.name}
                      </Text>
                      {!!addressLabel && (
                        <Text
                          className={`text-xs ${isSelected(business.id)
                            ? "text-white/80"
                            : "text-gray-500"
                            }`}
                          numberOfLines={1}
                        >
                          {addressLabel}
                        </Text>
                      )}
                    </View>

                    <Ionicons
                      name={isSelected(business.id) ? "checkmark-circle" : "radio-button-off"}
                      size={20}
                      color={isSelected(business.id) ? "white" : "black"
                      } />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default BusinessSelectionModal;
