import { useBusinessStore } from "@/stores/businessStore";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

type BusinessSummaryProps = {
  className?: string;
};

const BusinessSummary = ({ className }: BusinessSummaryProps) => {
  const [showModal, setShowModal] = React.useState(false);
  const {
    myBusinesses,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinesses,
  } = useBusinessStore();

  useEffect(() => {
    getMyBusinesses().catch(() => undefined);
  }, [getMyBusinesses]);

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = myBusinesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
    return { type: "multi", content: `${selectedBusinesses.length} Selected` };
  };

  const displayContent = getDisplayContent();

  return (
    <View className={`${className} px-4 mb-4`}>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-proximanova-semibold">
            Business Summary
          </Text>
        </View>

        <BusinessSelectionTrigger
          displayContent={displayContent as any}
          onPress={() => setShowModal(true)}
          compact
        />
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={myBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          imageUrl: b.logo,
          logo: b.logo,
        }))}
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
