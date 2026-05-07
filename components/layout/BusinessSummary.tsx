import { useBusinessPermission } from "@/hooks/useBusinessPermission";
import { useBusinessStore } from "@/stores/businessStore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

type BusinessSummaryProps = {
  className?: string;
};

const BusinessSummary = ({ className }: BusinessSummaryProps) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = React.useState(false);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalTodayShifts: 0,
    businessCompletion: 0,
  });
  const {
    myEmployments,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyEmployments,
    getBusinessOverview,
  } = useBusinessStore();
  const { canRead: canReadBusinessOverview } = useBusinessPermission(
    "business.overview",
    { employments: myEmployments }
  );
  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("insufficient_permissions") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };
  const activeBusinesses = (Array.isArray(myEmployments) ? myEmployments : [])
    .filter((employment: any) => String(employment?.status || "").toLowerCase() === "active")
    .reduce((acc: any[], employment: any) => {
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      if (!businessId) return acc;
      if (acc.some((item) => item?.id === businessId)) return acc;
      return [
        ...acc,
        {
          id: businessId,
          name: business?.name || t("user.profile.businessSummary.businessFallback"),
          address: business?.address,
          imageUrl: business?.logo,
          logo: business?.logo,
          status: business?.status,
        },
      ];
    }, []);

  useEffect(() => {
    getMyEmployments().catch(() => undefined);
  }, [getMyEmployments]);

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
        if (!canReadBusinessOverview) {
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
        if (!mounted) return;
        if (isExpectedAuthError(error)) return;
        toast.error(
          error?.message || t("user.profile.businessSummary.failedToLoad")
        );
      }
    };

    void loadBusinessSummary();

    return () => {
      mounted = false;
    };
  }, [canReadBusinessOverview, getBusinessOverview, selectedBusinesses, t]);

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: t("user.profile.businessSummary.all") };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = activeBusinesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
    return {
      type: "multi",
      content: t("user.profile.businessSummary.selectedCount", {
        count: selectedBusinesses.length,
      }),
    };
  };

  const displayContent = getDisplayContent();

  return (
    <View className={`${className} px-4 mb-4`}>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-proximanova-semibold">
            {t("user.profile.businessSummary.title")}
          </Text>
        </View>

        {/* <BusinessSelectionTrigger
          displayContent={displayContent as any}
          onPress={() => setShowModal(true)}
          compact
        /> */}
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={activeBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          imageUrl: b.logo,
          logo: b.logo,
          status: b.status,
        }))}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* stats*/}
      <View className="flex-row gap-3 mb-4 mt-4">
        <StatCardPrimary
          title={t("user.profile.businessSummary.total")}
          point={summary.totalEmployees}
          subtitle={t("user.profile.businessSummary.employees")}
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title={t("user.profile.businessSummary.total")}
          point={summary.totalManagers}
          subtitle={t("user.profile.businessSummary.managers")}
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>

      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title={t("user.profile.businessSummary.totalShifts")}
          point={summary.totalTodayShifts}
          subtitle={t("user.profile.businessSummary.today")}
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title={t("user.profile.businessSummary.completion")}
          point={`${summary.businessCompletion}%`}
          subtitle={t("user.profile.businessSummary.complete")}
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>
    </View>
  );
};

export default BusinessSummary;
