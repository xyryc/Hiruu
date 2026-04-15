import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ActionIconCard from "../ui/cards/ActionIconCard";

type QuickActionBusinessProps = {
  className?: string;
};

const QuickActionBusiness = ({ className }: QuickActionBusinessProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myEmployments = useBusinessStore((state) => state.myEmployments);
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const selectedBusinessId = selectedBusinesses?.[0] || "";
  const getBusinessUnresolvedShiftRequestCount = useShiftStore(
    (state) => state.getBusinessUnresolvedShiftRequestCount
  );
  const [counts, setCounts] = useState<{
    leave_request: number;
    overtime_request: number;
  }>({
    leave_request: 0,
    overtime_request: 0,
  });
  const isBusinessProfile = selectedBusinesses.length > 0;
  const canManageOnboarding = useMemo(() => {
    const selectedEmployment = (Array.isArray(myEmployments) ? myEmployments : []).find(
      (employment: any) =>
        String(employment?.status || "").toLowerCase() === "active" &&
        (employment?.businessId === selectedBusinessId ||
          employment?.business?.id === selectedBusinessId)
    );

    const rawPermission = selectedEmployment?.role?.permissions?.["people.employees"];
    const permissionLevel =
      typeof rawPermission === "number" ? rawPermission : Number(rawPermission);

    return Number.isFinite(permissionLevel) && permissionLevel >= 2;
  }, [myEmployments, selectedBusinessId]);

  useFocusEffect(
    useCallback(() => {
      if (!isBusinessProfile || !selectedBusinessId) return;

      let mounted = true;

      const loadCounts = async () => {
        try {
          await getMyEmployments();
          const data = await getBusinessUnresolvedShiftRequestCount(selectedBusinessId);
          if (!mounted) return;

          setCounts({
            leave_request:
              typeof data?.leave_request === "number" ? data.leave_request : 0,
            overtime_request:
              typeof data?.overtime_request === "number"
                ? data.overtime_request
                : 0,
          });
        } catch {
          if (!mounted) return;
          setCounts({
            leave_request: 0,
            overtime_request: 0,
          });
        }
      };

      void loadCounts();

      return () => {
        mounted = false;
      };
    }, [
      getMyEmployments,
      getBusinessUnresolvedShiftRequestCount,
      isBusinessProfile,
      selectedBusinessId,
    ])
  );

  if (!isBusinessProfile) {
    return null;
  }

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {t("user.jobs.quickActions.title")}
      </Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ActionIconCard
          icon={<Ionicons name="calendar" size={24} color="#4FB2F3" />}
          title={t("user.jobs.quickActions.leave")}
          count={counts.leave_request}
          onPress={() => router.push("/screens/home/leave/request")}
        />

        <ActionIconCard
          icon={
            <MaterialCommunityIcons
              name="timer-settings"
              size={24}
              color="#4FB2F3"
            />
          }
          title={t("user.jobs.quickActions.shiftRequest")}
          onPress={() => router.push("/screens/home/team/shift-requests")}
        />

        <ActionIconCard
          icon={<MaterialIcons name="timer" size={24} color="#4FB2F3" />}
          title={t("user.jobs.quickActions.otRequest")}
          count={counts.overtime_request}
          onPress={() => router.push("/screens/home/shift/overtime-history")}
        />

        {canManageOnboarding ? (
          <ActionIconCard
            icon={<FontAwesome name="users" size={20} color="#4FB2F3" />}
            title={t("user.jobs.quickActions.teamPanel")}
            onPress={() => router.push("/screens/home/team/manage-team")}
          />
        ) : null}

        <ActionIconCard
          icon={
            <MaterialCommunityIcons
              name="calendar-plus-outline"
              size={24}
              color="#4FB2F3"
            />
          }
          title={t("user.jobs.quickActions.weekSchedule")}
          onPress={() => router.push("/screens/schedule/business/weekly-schedule")}
        />
      </ScrollView>
    </View>
  );
};

export default QuickActionBusiness;
