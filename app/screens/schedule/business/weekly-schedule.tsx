import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ShiftTemplateCard from "@/components/ui/cards/ShiftTemplateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const daysData = [
  { label: "Monday" },
  { label: "Tuesday" },
  { label: "Wednesday" },
  { label: "Thursday" },
  { label: "Friday" },
  { label: "Saturday" },
  { label: "Sunday" },
];

const SavedShiftTemplate = () => {
  const params = useLocalSearchParams<{
    mode?: string;
    blockId?: string;
    startDate?: string;
    endDate?: string;
    name?: string;
  }>();
  const isEditMode = params.mode === "edit";
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isHydratingEdit, setIsHydratingEdit] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const {
    selectedBusinesses,
    weeklyShiftSelections,
    weeklyRoleAssignments,
    getWeeklyScheduleBlockById,
    getShiftTemplates,
    updateWeeklyScheduleBlock,
    setWeeklyShiftSelection,
    setWeeklyRoleAssignment,
    clearWeeklyShiftSelections,
    clearWeeklyRoleAssignments,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];

  useEffect(() => {
    const hydrateEditSelections = async () => {
      if (!isEditMode || !businessId || typeof params.blockId !== "string" || !params.blockId) {
        return;
      }

      try {
        setIsHydratingEdit(true);
        const [block, templates] = await Promise.all([
          getWeeklyScheduleBlockById(businessId, params.blockId),
          getShiftTemplates(businessId),
        ]);

        const templateMap = new Map(
          (Array.isArray(templates) ? templates : []).map((template: any) => [
            String(template?.id),
            template,
          ])
        );

        clearWeeklyShiftSelections();
        clearWeeklyRoleAssignments();

        daysData.forEach((day) => {
          const dayKey = day.label;
          const slots = (Array.isArray(block?.plan?.slots) ? block.plan.slots : [])
            .filter(
              (slot: any) =>
                String(slot?.dayOfWeek || "").toLowerCase() === dayKey.toLowerCase()
            )
            .sort(
              (a: any, b: any) =>
                Number(a?.sequence ?? 0) - Number(b?.sequence ?? 0)
            );

          const selectedTemplates = slots
            .map((slot: any) => templateMap.get(String(slot?.shiftTemplateId)))
            .filter(Boolean);

          setWeeklyShiftSelection(dayKey, selectedTemplates);

          slots.forEach((slot: any) => {
            const assignmentKey = `${dayKey}::${slot?.shiftTemplateId}`;
            const employmentIds = Array.isArray(slot?.employmentIds)
              ? slot.employmentIds.filter(Boolean)
              : [];

            setWeeklyRoleAssignment(assignmentKey, {
              assigned: employmentIds,
            });
          });
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to load weekly block details.");
      } finally {
        setIsHydratingEdit(false);
      }
    };

    hydrateEditSelections();
  }, [
    businessId,
    clearWeeklyRoleAssignments,
    clearWeeklyShiftSelections,
    getShiftTemplates,
    getWeeklyScheduleBlockById,
    isEditMode,
    params.blockId,
    setWeeklyRoleAssignment,
    setWeeklyShiftSelection,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      const refreshSelectedTemplates = async () => {
        if (!businessId) return;

        try {
          const templates = await getShiftTemplates(businessId);
          const currentSelections = useBusinessStore.getState().weeklyShiftSelections;
          const templateMap = new Map(
            (Array.isArray(templates) ? templates : []).map((template: any) => [
              String(template?.id),
              template,
            ])
          );

          daysData.forEach((day) => {
            const existingSelection = Array.isArray(currentSelections[day.label])
              ? currentSelections[day.label]
              : [];

            if (existingSelection.length === 0) return;

            const refreshedSelection = existingSelection
              .map((template: any) => templateMap.get(String(template?.id)))
              .filter(Boolean);

            setWeeklyShiftSelection(day.label, refreshedSelection);
          });
        } catch {
          // Keep existing selection if refresh fails.
        }
      };

      refreshSelectedTemplates();
    }, [businessId, getShiftTemplates, setWeeklyShiftSelection])
  );

  const hasAtLeastOneTemplate = useMemo(
    () =>
      daysData.some(
        (day) =>
          Array.isArray(weeklyShiftSelections[day.label]) &&
          weeklyShiftSelections[day.label].length > 0
      ),
    [weeklyShiftSelections]
  );

  const buildSlotsPayload = () =>
    daysData.flatMap((day) => {
      const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
        ? weeklyShiftSelections[day.label]
        : [];

      return selectedTemplates
        .filter((template: any) => Boolean(template?.id))
        .map((template: any, sequence: number) => {
          const assignmentKey = `${day.label}::${template?.id}`;
          const selectedByRole = weeklyRoleAssignments[assignmentKey] || {};
          const employmentIds = Array.from(
            new Set(
              Object.values(selectedByRole)
                .flat()
                .filter(Boolean)
            )
          );
          const requiredEmployees = Array.isArray(template?.roleRequirements)
            ? template.roleRequirements.reduce(
                (total: number, role: any) => total + Number(role?.count || 0),
                0
              )
            : employmentIds.length;

          return {
            sequence,
            shiftTemplateId: template?.id,
            dayOfWeek: day.label.toLowerCase(),
            requiredEmployees: requiredEmployees > 0 ? requiredEmployees : 1,
            employmentIds,
          };
        });
    });

  const handleNext = async () => {
    if (!businessId) {
      toast.error("Please select a business first.");
      return;
    }
    if (!hasAtLeastOneTemplate) {
      toast.error("Please select at least one shift template.");
      return;
    }

    const selectedTemplateCount = daysData.reduce((total, day) => {
      const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
        ? weeklyShiftSelections[day.label]
        : [];
      return total + selectedTemplates.length;
    }, 0);

    if (selectedTemplateCount === 0) {
      toast.error("No schedule items found.");
      return;
    }

    if (isEditMode) {
      if (typeof params.blockId !== "string" || !params.blockId) {
        toast.error("Missing weekly block id.");
        return;
      }

      const slots = buildSlotsPayload();
      if (!Array.isArray(slots) || slots.length === 0) {
        toast.error("No schedule items found.");
        return;
      }

      try {
        setIsUpdating(true);
        await updateWeeklyScheduleBlock(businessId, params.blockId, {
          name:
            typeof params.name === "string" && params.name.trim().length > 0
              ? params.name
              : `Week ${String(params.startDate || "")}`,
          slots,
        });
        toast.success(t("api.weekly_block_updated_successfully"));
        router.back();
      } catch (error: any) {
        const apiMessageKey =
          error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
        toast.error(
          t(`api.${apiMessageKey}`, {
            defaultValue: apiMessageKey || "Failed to update weekly schedule.",
          })
        );
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    router.push("/screens/schedule/business/apply-weekly-schedule");
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
          className="capitalize bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
          style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
          onPressBack={() => router.back()}
          title={isEditMode ? "Edit Weekly Schedule" : "Weekly Schedule"}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        {isHydratingEdit ? (
          <View className="mx-5 flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" color="#4FB2F3" />
            <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
              Loading weekly schedule...
            </Text>
          </View>
        ) : (
          <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>

          <View>
            {daysData.map((day) => {
              const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
                ? weeklyShiftSelections[day.label]
                : [];

              return (
                <View key={day.label}>
                  <TouchableOpacity
                    disabled={isHydratingEdit || isUpdating}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/schedule/business/list-shifts",
                        params: { day: day.label },
                      })
                    }
                    className="border mt-3 border-[#eeeeee] rounded-[10px] py-4 px-4 gap-4 flex-row items-center"
                  >
                    <SimpleLineIcons name="plus" size={24} color="#4FB2F3" />
                    <View className="flex-1">
                      <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                        {day.label}
                      </Text>
                      <Text className="mt-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {selectedTemplates.length > 0
                          ? `${selectedTemplates.length} template(s) selected`
                          : "No shift selected"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {selectedTemplates.map((template: any) => (
                    (() => {
                      const requiredRoles = Array.isArray(template?.roleRequirements)
                        ? template.roleRequirements
                        : [];
                      const assignmentKey = `${day.label}::${template?.id}`;
                      const selectedByRole = weeklyRoleAssignments[assignmentKey] || {};
                      const missingRoles = requiredRoles
                        .map((role: any) => {
                          const roleId = String(role?.roleId || "");
                          const roleName =
                            role?.businessRoleName ||
                            role?.roleName ||
                            role?.name ||
                            "Role";
                          const requiredCount = Number(role?.count || 0);
                          const selectedCount = Array.isArray(selectedByRole[roleId])
                            ? selectedByRole[roleId].length
                            : 0;
                          const remaining = Math.max(requiredCount - selectedCount, 0);

                          return {
                            roleName,
                            remaining,
                          };
                        })
                        .filter((item: any) => item.remaining > 0);

                      const isAssignmentComplete = missingRoles.length === 0;
                      const assignmentStatusText =
                        requiredRoles.length === 0
                          ? "No role requirements"
                          : isAssignmentComplete
                            ? "Complete"
                            : `Incomplete: ${missingRoles
                                .map((item: any) => `${item.roleName} ${item.remaining} needed`)
                                .join(", ")}`;

                      return (
                        <ShiftTemplateCard
                          weekly={true}
                          key={`${day.label}-${template?.id}`}
                          className="mt-3"
                          title={template?.name || `${day.label} Shift`}
                          startTime={template?.startTime}
                          endTime={template?.endTime}
                          breakDurations={template?.breakDuration}
                          location={template?.business?.name || "Location not defined"}
                          roles={template?.roleRequirements || []}
                          businessName={template?.business?.name}
                          businessLogo={template?.business?.logo}
                          templateId={template?.id}
                          businessId={template?.businessId}
                          assignParams={{ day: day.label, templateId: template?.id }}
                          assignmentStatusText={assignmentStatusText}
                          isAssignmentComplete={isAssignmentComplete}
                        />
                      );
                    })()
                  ))}
                </View>
              );
            })}
          </View>

            <GradientButton
              className="mt-10"
              title="Fill With AI"
              icon={<Ionicons name="sparkles-outline" size={20} color="white" />}
            />
            <PrimaryButton
              title={isEditMode ? (isUpdating ? "Updating..." : "Update") : "Next"}
              className="my-4"
              onPress={handleNext}
              loading={isUpdating}
              disabled={!hasAtLeastOneTemplate || isHydratingEdit || isUpdating}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SavedShiftTemplate;
