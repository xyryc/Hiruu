import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";
import businesses from "@/assets/data/businesses.json";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SimpleLineIcons } from "@expo/vector-icons";

type BusinessSummaryProps = {
  className?: string;
};

const BusinessSummary = ({ className }: BusinessSummaryProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
  };

  const displayContent = getDisplayContent();

  return (
    <View className={`${className} px-4`}>
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xl font-proximanova-semibold">
            Business Summary
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-[#E5F4FD] flex-row items-center p-0.5 rounded-[26px]"
        >
          {displayContent?.type === "all" ? (
            <View className="pl-2.5 py-1.5">
              <Text className="font-semibold text-sm text-primary">All</Text>
            </View>
          ) : (
            <Image
              source={displayContent?.content?.imageUrl}
              style={{ width: 30, height: 30, borderRadius: 999 }}
              contentFit="cover"
            />
          )}

          <SimpleLineIcons
            className="p-1.5"
            name="arrow-down"
            size={12}
            color="#111111"
          />
        </TouchableOpacity>
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* stats*/}
      <View className="flex-row gap-3 mb-4 mt-4">
        <StatCardPrimary
          title="Total"
          point={25}
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="Total"
          point="03"
          subtitle="Managers"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>
      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Total Shifts"
          point={35}
          subtitle="Today"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="Completion"
          point="75%"
          subtitle="Managers"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>
    </View>
  );
};

export default BusinessSummary;
