import { useBusinessStore } from "@/stores/businessStore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

type BusinessSummaryProps = {
  className?: string;
};

const BusinessSummary = ({ className }: BusinessSummaryProps) => {
  const [showModal, setShowModal] = React.useState(false);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalTodayShifts: 0,
    businessCompletion: 0,
  });
  const {
    myBusinesses,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinesses,
    getBusinessOverview,
  } = useBusinessStore();

  useEffect(() => {
    getMyBusinesses().catch(() => undefined);
  }, [getMyBusinesses]);

  useEffect(() => {
    let mounted = true;

    const loadBusinessSummary = async () => {
      try {
        const businessId = selectedBusinesses[0];

        if (!businessId) {
          if (!mounted) return;
          setSummary({
            totalEmployees: 0,
            totalManagers: 0,
            totalTodayShifts: 0,
            businessCompletion: 0,
          });
          return;
        }

        const data = await getBusinessOverview(businessId);
        if (!mounted || !data) return;

        const businessSummary = data?.businessSummary;

        setSummary({
          totalEmployees:
            typeof businessSummary?.totalEmployees === "number"
              ? businessSummary.totalEmployees
              : 0,
          totalManagers:
            typeof businessSummary?.totalManagers === "number"
              ? businessSummary.totalManagers
              : 0,
          totalTodayShifts:
            typeof businessSummary?.totalTodayShifts === "number"
              ? businessSummary.totalTodayShifts
              : 0,
          businessCompletion:
            typeof businessSummary?.businessCompletion === "number"
              ? businessSummary.businessCompletion
              : 0,
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to load business summary");
      }
    };

    void loadBusinessSummary();

    return () => {
      mounted = false;
    };
  }, [getBusinessOverview, selectedBusinesses]);

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
          point={summary.totalEmployees}
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="Total"
          point={summary.totalManagers}
          subtitle="Managers"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>

      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Total Shifts"
          point={summary.totalTodayShifts}
          subtitle="Today"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="Completion"
          point={`${summary.businessCompletion}%`}
          subtitle="Complete"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>
    </View>
  );
};

export default BusinessSummary;
