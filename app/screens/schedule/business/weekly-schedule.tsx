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
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const formatDateYmd = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseYmdDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const resolveDateForDayLabel = (
  startDateYmd: string,
  dayLabel: string
) => {
  if (!startDateYmd) return "";
  const start = parseYmdDate(startDateYmd);
  for (let index = 0; index < 7; index += 1) {
    const current = addDays(start, index);
    const currentDayLabel = current.toLocaleDateString("en-US", {
      weekday: "long",
    });
    if (currentDayLabel.toLowerCase() === dayLabel.toLowerCase()) {
      return formatDateYmd(current);
    }
  }
  return "";
};

const buildRoleAwareAssignment = (template: any, employmentIds: string[]) => {
  const normalizedAssigned = Array.from(
    new Set((Array.isArray(employmentIds) ? employmentIds : []).filter(Boolean))
  ).map((id) => String(id));

  const assignment: Record<string, string[]> = {
    assigned: normalizedAssigned,
  };

  const roleRequirements = Array.isArray(template?.roleRequirements)
    ? template.roleRequirements
    : [];

  if (roleRequirements.length === 0 || normalizedAssigned.length === 0) {
    return assignment;
  }

  // Distribute AI-assigned employees across required roles so role-based UI can reflect counts.
  let cursor = 0;
  roleRequirements.forEach((role: any) => {
    const roleId = String(role?.roleId || "");
    if (!roleId) return;
    const count = Math.max(Number(role?.count || 0), 0);
    if (count <= 0) {
      assignment[roleId] = [];
      return;
    }

    const slice = normalizedAssigned.slice(cursor, cursor + count);
    assignment[roleId] = slice;
    cursor += count;
  });

  return assignment;
};

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
  const [isFillingAI, setIsFillingAI] = React.useState(false);
  const {
    selectedBusinesses,
    weeklyShiftSelections,
    weeklyRoleAssignments,
    getWeeklyScheduleBlockById,
    getShiftTemplates,
    fillWeeklyBlockAutomatic,
    createWeeklyScheduleBlock,
    updateWeeklyScheduleBlock,
    setWeeklyShiftSelection,
    setWeeklyRoleAssignment,
    clearWeeklyShiftSelections,
    clearWeeklyRoleAssignments,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];
  const todayYmd = formatDateYmd(new Date());

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
            const template = templateMap.get(String(slot?.shiftTemplateId));

            setWeeklyRoleAssignment(
              assignmentKey,
              buildRoleAwareAssignment(template, employmentIds)
            );
          });
        });
      } catch (error: any) {
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadWeeklyBlock"));
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
    t,
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

  const isAllAssignmentsComplete = useMemo(() => {
    return daysData.every((day) => {
      const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
        ? weeklyShiftSelections[day.label]
        : [];

      return selectedTemplates.every((template: any) => {
        const requiredRoles = Array.isArray(template?.roleRequirements)
          ? template.roleRequirements
          : [];

        if (requiredRoles.length === 0) return true;

        const assignmentKey = `${day.label}::${template?.id}`;
        const selectedByRole = weeklyRoleAssignments[assignmentKey] || {};

        return requiredRoles.every((role: any) => {
          const roleId = String(role?.roleId || "");
          const requiredCount = Math.max(Number(role?.count || 0), 0);
          if (!roleId || requiredCount <= 0) return true;
          const selectedCount = Array.isArray(selectedByRole[roleId])
            ? selectedByRole[roleId].length
            : 0;
          return selectedCount >= requiredCount;
        });
      });
    });
  }, [weeklyRoleAssignments, weeklyShiftSelections]);

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

  const handleFillWithAI = async () => {
    if (!businessId) {
      toast.error(t("user.profile.noBusinessSelected"));
      return;
    }
    if (typeof params.startDate !== "string" || !params.startDate) {
      toast.error(t("user.jobs.schedule.selectWeekStartDate"));
      return;
    }
    if (typeof params.endDate !== "string" || !params.endDate) {
      toast.error(t("user.jobs.schedule.selectWeekStartDate"));
      return;
    }

    try {
      setIsFillingAI(true);
      const start = parseYmdDate(params.startDate);
      const end = parseYmdDate(params.endDate);
      const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

      if (totalDays !== 7) {
        toast.error(t("user.jobs.schedule.onlyOneWeek"));
        return;
      }

      const templateByDate: Record<string, string[]> = {};
      for (let index = 0; index < 7; index += 1) {
        const currentDate = addDays(start, index);
        const dateKey = formatDateYmd(currentDate);
        const dayLabel = currentDate.toLocaleDateString("en-US", { weekday: "long" });
        const selectedTemplates = Array.isArray(weeklyShiftSelections[dayLabel])
          ? weeklyShiftSelections[dayLabel]
          : [];
        const templateIds = selectedTemplates
          .map((template: any) => String(template?.id || ""))
          .filter(Boolean);
        if (templateIds.length > 0) {
          templateByDate[dateKey] = templateIds;
        }
      }

      if (Object.keys(templateByDate).length === 0) {
        toast.error(t("user.jobs.schedule.selectAtLeastOneTemplate"));
        return;
      }

      const aiData = await fillWeeklyBlockAutomatic(businessId, {
        startDate: params.startDate,
        endDate: params.endDate,
        templateByDate,
      });
      const aiSlots = Array.isArray(aiData?.template?.slots)
        ? aiData.template.slots
        : [];

      if (aiSlots.length === 0) {
        toast.error(
          t("api.invalid_ai_schedule_payload", {
            defaultValue: t("user.jobs.schedule.aiNoSlots"),
          })
        );
        return;
      }

      const templates = await getShiftTemplates(businessId);
      const templateMap = new Map(
        (Array.isArray(templates) ? templates : []).map((template: any) => [
          String(template?.id),
          template,
        ])
      );

      const nextAssignments: Record<string, Set<string>> = {};

      aiSlots.forEach((slot: any) => {
        const dayLabelRaw = String(slot?.dayOfWeek || "");
        const dayLabel =
          dayLabelRaw.charAt(0).toUpperCase() + dayLabelRaw.slice(1).toLowerCase();
        if (!dayLabel) return;

        const shiftTemplateId = String(slot?.shiftTemplateId || "");
        if (!shiftTemplateId) return;

        const assignmentKey = `${dayLabel}::${shiftTemplateId}`;
        if (!nextAssignments[assignmentKey]) {
          nextAssignments[assignmentKey] = new Set<string>();
        }
        const employmentIds = Array.isArray(slot?.employmentIds)
          ? slot.employmentIds
          : [];
        employmentIds.forEach((id: any) => {
          if (id) nextAssignments[assignmentKey].add(String(id));
        });
      });

      clearWeeklyRoleAssignments();

      Object.entries(nextAssignments).forEach(([assignmentKey, idsSet]) => {
        const [, shiftTemplateId = ""] = assignmentKey.split("::");
        const template = templateMap.get(String(shiftTemplateId));
        setWeeklyRoleAssignment(assignmentKey, {
          ...buildRoleAwareAssignment(template, Array.from(idsSet)),
        });
      });

      // Intentionally no success toast after AI fill; UI state update is the feedback.
    } catch (error: any) {
      const apiMessageKey =
        error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${apiMessageKey}`, {
          defaultValue:
            apiMessageKey || t("user.jobs.schedule.failedToAutoFillWeeklySchedule"),
        })
      );
    } finally {
      setIsFillingAI(false);
    }
  };

	  const handleNext = async () => {
    if (!businessId) {
      toast.error(t("user.profile.noBusinessSelected"));
      return;
    }
    if (!hasAtLeastOneTemplate) {
      toast.error(t("user.jobs.schedule.selectAtLeastOneTemplate"));
      return;
    }
    if (!isAllAssignmentsComplete) {
      toast.error(t("user.jobs.schedule.assignRequiredPeople"));
      return;
    }

    const selectedTemplateCount = daysData.reduce((total, day) => {
      const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
        ? weeklyShiftSelections[day.label]
        : [];
      return total + selectedTemplates.length;
    }, 0);

    if (selectedTemplateCount === 0) {
      toast.error(t("user.jobs.schedule.noScheduleItems"));
      return;
    }

	    if (isEditMode) {
	      if (
	        typeof params.startDate === "string" &&
	        params.startDate &&
	        params.startDate < todayYmd
	      ) {
	        toast.error(t("user.jobs.schedule.cannotEditPastWeek"));
	        return;
	      }

	      if (typeof params.blockId !== "string" || !params.blockId) {
	        toast.error(t("user.jobs.schedule.missingWeeklyBlockId"));
	        return;
	      }

      const slots = buildSlotsPayload();
      if (!Array.isArray(slots) || slots.length === 0) {
        toast.error(t("user.jobs.schedule.noScheduleItems"));
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
            defaultValue:
              apiMessageKey || t("user.jobs.schedule.failedToUpdateWeeklySchedule"),
          })
        );
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    if (typeof params.startDate !== "string" || !params.startDate) {
      router.push("/screens/schedule/business/apply-weekly-schedule");
      return;
    }

    const slots = buildSlotsPayload();
    if (!Array.isArray(slots) || slots.length === 0) {
      toast.error(t("user.jobs.schedule.noScheduleItems"));
      return;
    }

    try {
      setIsUpdating(true);
      await createWeeklyScheduleBlock(businessId, {
        startDate: params.startDate,
        name:
          typeof params.name === "string" && params.name.trim().length > 0
            ? params.name
            : `Week ${String(params.startDate || "")}`,
        slots,
      });
      toast.success(t("api.weekly_block_created_successfully"));
      clearWeeklyShiftSelections();
      clearWeeklyRoleAssignments();
      router.replace("/(tabs)/business-schedule");
    } catch (error: any) {
      const apiMessageKey =
        error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${apiMessageKey}`, {
          defaultValue:
            apiMessageKey || t("user.jobs.schedule.failedToApplyWeeklySchedule"),
        })
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearSlots = () => {
    if (isHydratingEdit || isUpdating || isFillingAI) return;
    clearWeeklyShiftSelections();
    clearWeeklyRoleAssignments();
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
          title={
            isEditMode
              ? t("user.jobs.schedule.editWeeklySchedule")
              : t("user.jobs.schedule.weeklySchedule")
          }
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity
              onPress={handleClearSlots}
              disabled={isHydratingEdit || isUpdating || isFillingAI}
              className={`${isHydratingEdit || isUpdating || isFillingAI ? "opacity-50" : ""}`}
            >
              <Text className="font-proximanova-semibold text-[#4FB2F3]">
                {t("common.clear")}
              </Text>
            </TouchableOpacity>
          }
        />

        {isHydratingEdit ? (
          <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
            <View className="mt-3">
              {Array.from({ length: 4 }, (_, index) => (
                <View key={`weekly-day-skeleton-${index}`} className="mt-3">
                  <View className="border border-[#eeeeee] rounded-[10px] py-4 px-4 flex-row items-center">
                    <View className="h-6 w-6 rounded-full bg-[#E5E7EB]" />
                    <View className="ml-4 flex-1">
                      <View className="h-4 w-28 rounded-md bg-[#E5E7EB]" />
                      <View className="mt-2 h-3 w-36 rounded-md bg-[#E5E7EB]" />
                    </View>
                  </View>

                  <View className="mt-3 border border-[#EEEEEE] rounded-[14px] p-4">
                    <View className="h-4 w-36 rounded-md bg-[#E5E7EB]" />
                    <View className="mt-3 h-3 w-full rounded-md bg-[#E5E7EB]" />
                    <View className="mt-2 h-3 w-[85%] rounded-md bg-[#E5E7EB]" />
                    <View className="mt-2 h-3 w-[65%] rounded-md bg-[#E5E7EB]" />
                    <View className="mt-4 h-[2px] w-full rounded-full bg-[#E5E7EB]" />
                    <View className="mt-3 flex-row items-center">
                      <View className="h-7 w-7 rounded-full bg-[#E5E7EB]" />
                      <View className="ml-2 h-3 w-32 rounded-md bg-[#E5E7EB]" />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-10 h-12 rounded-xl bg-[#E5E7EB]" />
            <View className="mt-4 mb-4 h-12 rounded-xl bg-[#E5E7EB]" />
          </ScrollView>
        ) : (
          <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>

          <View>
            {daysData.map((day) => {
              const selectedTemplates = Array.isArray(weeklyShiftSelections[day.label])
                ? weeklyShiftSelections[day.label]
                : [];
              const dayLabelLocalized = t(`user.profile.weeklyDays.${day.key}`);

              return (
                <View key={day.label}>
                  <TouchableOpacity
                    disabled={isHydratingEdit || isUpdating || isFillingAI}
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
                        {dayLabelLocalized}
                      </Text>
                      <Text className="mt-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {selectedTemplates.length > 0
                          ? t("user.jobs.schedule.templatesSelected", {
                              count: selectedTemplates.length,
                            })
                          : t("user.jobs.schedule.noShiftSelected")}
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
                            t("user.jobs.postJob.role");
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
                          ? t("user.jobs.schedule.assignment.noRoleRequirements")
                          : isAssignmentComplete
                            ? t("user.jobs.schedule.assignment.complete")
                            : t("user.jobs.schedule.assignment.incomplete", {
                                missing: missingRoles
                                  .map((item: any) =>
                                    t("user.jobs.schedule.assignment.needed", {
                                      role: item.roleName,
                                      count: item.remaining,
                                    })
                                  )
                                  .join(", "),
                              });

                      return (
                        <ShiftTemplateCard
                          weekly={true}
                          key={`${day.label}-${template?.id}`}
                          className="mt-3"
                          title={
                            template?.name ||
                            t("user.jobs.schedule.dayShiftTitle", { day: dayLabelLocalized })
                          }
                          startTime={template?.startTime}
                          endTime={template?.endTime}
                          breakDurations={template?.breakDuration}
                          location={
                            template?.business?.name ||
                            t("user.jobs.schedule.locationNotDefined")
                          }
                          roles={template?.roleRequirements || []}
                          businessName={template?.business?.name}
                          businessLogo={template?.business?.logo}
                          templateId={template?.id}
                          businessId={template?.businessId}
                          assignParams={{
                            day: day.label,
                            templateId: template?.id,
                            date:
                              typeof params.startDate === "string" && params.startDate
                                ? resolveDateForDayLabel(params.startDate, day.label)
                                : "",
                          }}
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
              title={
                isFillingAI
                  ? t("user.jobs.schedule.fillingAi")
                  : t("user.jobs.schedule.fillWithAi")
              }
              icon={<Ionicons name="sparkles-outline" size={20} color="white" />}
              onPress={handleFillWithAI}
              disabled={
                !hasAtLeastOneTemplate || isHydratingEdit || isUpdating || isFillingAI
              }
            />
            <PrimaryButton
              title={
                isEditMode
                  ? isUpdating
                    ? t("common.updating")
                    : t("common.update")
                  : t("common.next")
              }
              className="my-4"
              onPress={handleNext}
              loading={isUpdating}
              disabled={
                !hasAtLeastOneTemplate ||
                !isAllAssignmentsComplete ||
                isHydratingEdit ||
                isUpdating ||
                isFillingAI
              }
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SavedShiftTemplate;
