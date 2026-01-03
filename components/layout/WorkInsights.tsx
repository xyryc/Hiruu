import businesses from "@/assets/data/businesses.json";
import userData from "@/assets/data/user.json";
import { WorkInsightsProps } from "@/types";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import StatCardSecondary from "../ui/cards/StatCardSecondary";
import MonthPicker from "../ui/inputs/MonthPicker";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

const WorkInsights = ({ className, title }: WorkInsightsProps | any) => {
  const [reportMonth, setReportMonth] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  const handleReportMonthChange = (date: Date) => {
    setReportMonth(date);
    console.log("Report month selected:", date.toLocaleDateString());
  };

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      if (selectedBusiness) {
        return { type: "single", content: selectedBusiness };
      }
    }
    return { type: "all", content: "All" }; // fallback
  };

  const displayContent = getDisplayContent();

  const user = userData.user;

  return (
    <View className={`${className} px-4`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-proximanova-semibold">
          {title ? title : "Work Insights"}
        </Text>

        {!title && (
          <View className="flex-row items-center gap-2">
            <MonthPicker
              value={reportMonth}
              onDateChange={handleReportMonthChange}
            />

            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-[#E5F4FD] flex-row items-center p-0.5 rounded-[26px]"
            >
              {displayContent?.type === "all" ? (
                <View className="pl-2.5 py-1.5">
                  <Text className="font-semibold text-sm text-primary">
                    {displayContent.content}
                  </Text>
                </View>
              ) : (
                displayContent.content?.imageUrl && (
                  <Image
                    source={displayContent.content.imageUrl}
                    style={{ width: 30, height: 30, borderRadius: 999 }}
                    contentFit="cover"
                  />
                )
              )}
              <SimpleLineIcons
                className="p-1.5"
                name="arrow-down"
                size={12}
                color="#111111"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* stats */}
      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Total team"
          point="25"
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="On Leave Today"
          point="03"
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>

      <StatCardSecondary
        business={user.role === "business"}
        background={require("@/assets/images/stats-bg2.svg")}
      />
    </View>
  );
};

export default WorkInsights;
