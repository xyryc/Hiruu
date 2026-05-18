import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ListofShifts = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ day?: string }>();
  const day = typeof params.day === "string" ? params.day : "";
  const {
    selectedBusinesses,
    getShiftTemplates,
    weeklyShiftSelections,
    setWeeklyShiftSelection,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const skeletonItems = React.useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: `shift-skeleton-${index}` })),
    []
  );

  const to12Hour = (value?: string) => {
    if (!value) return t("common.timePlaceholder");
    const [rawHour = "0", rawMinute = "0"] = value.split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

    const period = hour >= 12 ? t("common.pm") : t("common.am");
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  };

  const loadTemplates = useCallback(async () => {
    if (!businessId) {
      setTemplates([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getShiftTemplates(businessId);
      const normalized = Array.isArray(data) ? data : [];
      setTemplates(normalized);
      if (day) {
        const preselectedIds = Array.isArray(weeklyShiftSelections[day])
          ? weeklyShiftSelections[day]
              .map((template: any) => template?.id)
              .filter(Boolean)
          : [];
        setSelectedShiftIds(preselectedIds);
      }
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToLoadShiftTemplates"));
    } finally {
      setIsLoading(false);
    }
  }, [businessId, day, getShiftTemplates, t, weeklyShiftSelections]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleShiftPress = (id: string) => {
    setSelectedShiftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedShiftIds.length === 0) {
      toast.error(t("user.jobs.schedule.selectAtLeastOneTemplate"));
      return;
    }

    if (day) {
      const selectedTemplates = templates.filter((template) =>
        selectedShiftIds.includes(template?.id)
      );
      if (selectedTemplates.length === 0) {
        toast.error(t("user.jobs.schedule.selectedTemplatesNotFound"));
        return;
      }
      setWeeklyShiftSelection(day, selectedTemplates);
      router.back();
      return;
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <SafeAreaView
        className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <ScreenHeader
          className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
          style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
          onPressBack={() => router.back()}
          title={t("user.jobs.schedule.listOfShiftsTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <FlatList
          className="mx-5 flex-1"
          data={isLoading ? skeletonItems : templates}
          keyExtractor={(item) => String(item?.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            isLoading ? (
              <View className="flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee]">
                <View className="w-12 h-12 rounded-full mr-3 bg-[#ECECEC]" />
                <View className="flex-1">
                  <View className="h-4 w-1/2 rounded bg-[#ECECEC]" />
                  <View className="h-3 w-2/3 rounded bg-[#ECECEC] mt-2" />
                </View>
                <View className="w-6 h-6 rounded-full bg-[#ECECEC]" />
              </View>
            ) : (
            <TouchableOpacity
              onPress={() => handleShiftPress(item?.id)}
              className="flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee]"
            >
              <Image
                source={
                  item?.business?.logo
                    ? { uri: item.business.logo }
                    : require("@/assets/images/placeholder.png")
                }
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                  {item?.name || t("user.jobs.schedule.shiftFallback")}
                </Text>
                <Text className="text-sm text-secondary dark:text-dark-secondary font-proximanova-regular">
                  {`${to12Hour(item?.startTime)} ${t("user.profile.weeklySchedule.to")} ${to12Hour(item?.endTime)}`}
                </Text>
              </View>

              <Ionicons
                name={
                  selectedShiftIds.includes(item?.id)
                    ? "checkmark-circle"
                    : "radio-button-off"
                }
                size={24}
                color={selectedShiftIds.includes(item?.id) ? "#11293A" : "#C7C7CC"}
              />
            </TouchableOpacity>
            )
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View className="py-10 items-center px-4">
                {businessId ? (
                  <>
                    <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary text-center">
                      {t("user.jobs.schedule.noShiftTemplatesYet")}
                    </Text>
                    <Text className="mt-2 text-sm text-secondary dark:text-dark-secondary text-center">
                      {t("user.jobs.schedule.createFirstOne")}
                    </Text>
                    <TouchableOpacity
                      className="mt-5 bg-[#11293A] rounded-full px-5 py-2.5"
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push("/screens/schedule/business/create-template")
                      }
                    >
                      <Text className="font-proximanova-semibold text-sm text-white">
                        {t("user.jobs.schedule.createShiftTemplate")}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text className="text-sm text-secondary dark:text-dark-secondary">
                    {t("common.selectBusinessFirst")}
                  </Text>
                )}
              </View>
            ) : null
          }
        />

        {/* button  */}
        <View className='absolute bottom-10 w-full'>
          <PrimaryButton
            className="mx-5"
            title={t("common.next")}
            onPress={handleNext}
            disabled={selectedShiftIds.length === 0}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ListofShifts;
