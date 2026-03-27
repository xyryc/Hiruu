import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import RoleSlotsInput from "@/components/ui/inputs/RoleSlotsInput";
import TimePicker from "@/components/ui/inputs/TimePicker";
import DeleteConfirmModal from "@/components/ui/modals/DeleteConfirmModal";
import PreviewTemplateModal from "@/components/ui/modals/PreviewTemplateModal";
import { useBusinessStore } from "@/stores/businessStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const EditTemplate = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { templateId, businessId: businessIdParam } = useLocalSearchParams<{
    templateId?: string;
    businessId?: string;
  }>();
  const {
    selectedBusinesses,
    myBusinesses,
    myBusinessesLoading,
    getMyBusinesses,
    getMyBusinessRoles,
    getShiftTemplateById,
    deleteShiftTemplate,
    updateShiftTemplate,
  } = useBusinessStore();
  const timezone = usePreferencesStore((state) => state.timezone);

  const fallbackBusinessId = selectedBusinesses[0];
  const templateBusinessId = (businessIdParam || fallbackBusinessId || "").toString();
  const templateIdValue = (templateId || "").toString();

  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [currentRoleSlotsTotal, setCurrentRoleSlotsTotal] = useState<number>(0);
  const [initialRoleRequirements, setInitialRoleRequirements] = useState<
    { roleId: string; roleName: string; count: number }[]
  >([]);
  const [roleRequirements, setRoleRequirements] = useState<
    { roleId: string; roleName: string; count: number }[]
  >([]);
  const [shiftStartTime, setShiftStartTime] = useState<Date>(new Date());
  const [shiftEndTime, setShiftEndTime] = useState<Date>(new Date());
  const [hasBreak, setHasBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date>(new Date());
  const [breakEndTime, setBreakEndTime] = useState<Date>(new Date());
  const [roleSelectionVersion, setRoleSelectionVersion] = useState(0);
  const [openRoleDropdownTrigger, setOpenRoleDropdownTrigger] = useState(0);
  const [roleSlotsResetVersion, setRoleSlotsResetVersion] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getMyBusinesses().catch((error: any) => {
      toast.error(error?.message || "Failed to load businesses");
    });
  }, [getMyBusinesses]);

  useFocusEffect(
    useCallback(() => {
      const loadTemplate = async () => {
        if (!templateBusinessId || !templateIdValue) return;
        try {
          setIsLoadingTemplate(true);
          const data = await getShiftTemplateById(templateBusinessId, templateIdValue);
          if (!data) return;

          const roles = Array.isArray(data?.roleRequirements)
            ? data.roleRequirements.map((item: any) => ({
              roleId: item?.roleId || "",
              roleName: item?.businessRoleName || item?.roleName || "Role",
              count: Number(item?.count || 0),
            }))
            : [];
          const totalRequired = roles.reduce((sum: number, item: any) => sum + item.count, 0);

          setTemplateName(data?.name || "");
          setTemplateDescription(data?.description || "");
          setSelectedBusiness(data?.businessId || templateBusinessId);
          setInitialRoleRequirements(roles);
          setRoleRequirements(roles);
          setCurrentRoleSlotsTotal(totalRequired);

          const parseTimeToDate = (value?: string) => {
            if (!value) return new Date();
            const [rawHour = "0", rawMinute = "0"] = value.split(":");
            const hours = Number(rawHour);
            const minutes = Number(rawMinute);
            const nextDate = new Date();

            if (Number.isNaN(hours) || Number.isNaN(minutes)) {
              return nextDate;
            }

            nextDate.setHours(hours, minutes, 0, 0);
            return nextDate;
          };

          setShiftStartTime(parseTimeToDate(data?.startTime));
          setShiftEndTime(parseTimeToDate(data?.endTime));
          const firstBreak = Array.isArray(data?.breakDuration)
            ? data.breakDuration[0]
            : null;
          const hasBreakValue = Boolean(firstBreak?.startTime && firstBreak?.endTime);
          setHasBreak(hasBreakValue);
          setBreakStartTime(parseTimeToDate(firstBreak?.startTime));
          setBreakEndTime(parseTimeToDate(firstBreak?.endTime));

          setRoleSlotsResetVersion((prev) => prev + 1);
        } catch (error: any) {
          toast.error(error?.message || "Failed to load template");
        } finally {
          setIsLoadingTemplate(false);
        }
      };

      loadTemplate();
    }, [getShiftTemplateById, templateBusinessId, templateIdValue])
  );

  useEffect(() => {
    const loadRoles = async () => {
      if (!selectedBusiness) {
        setRoleOptions([]);
        return;
      }

      try {
        setRolesLoading(true);
        const data = await getMyBusinessRoles(selectedBusiness);
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          label: item?.role?.name || item?.name || "Role",
          value: item?.id || item?.roleId || "",
        }));
        setRoleOptions(mapped.filter((item: any) => item.value));
      } catch (error: any) {
        toast.error(error?.message || "Failed to load roles");
        setRoleOptions([]);
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [getMyBusinessRoles, selectedBusiness]);

  const businessOptions = useMemo(
    () =>
      (myBusinesses || []).map((business: any) => ({
        label: business?.name || "Business",
        value: business?.id || "",
        avatar: business?.logo || undefined,
      })),
    [myBusinesses]
  );

  const selectedRoleOption = useMemo(
    () => roleOptions.find((item) => item.value === selectedRole) || null,
    [roleOptions, selectedRole]
  );

  const handleTotalRequiredChange = useCallback((total: number) => {
    setCurrentRoleSlotsTotal((prev) => (prev === total ? prev : total));
  }, []);

  const handleRoleSlotsChange = useCallback(
    (slots: { roleId: string; roleName: string; count: number }[]) => {
      setRoleRequirements(slots);
    },
    []
  );

  const formatTime24 = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatTime12 = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${`${minute}`.padStart(2, "0")} ${period}`;
  };

  const toMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

  const shiftTimeValidationError = useMemo(() => {
    const shiftStartMinutes = toMinutes(shiftStartTime);
    const shiftEndMinutes = toMinutes(shiftEndTime);

    if (shiftEndMinutes <= shiftStartMinutes) {
      return "Shift end time must be after shift start time.";
    }

    return null;
  }, [shiftEndTime, shiftStartTime]);

  const breakTimeValidationError = useMemo(() => {
    if (!hasBreak) return null;

    const shiftStartMinutes = toMinutes(shiftStartTime);
    const shiftEndMinutes = toMinutes(shiftEndTime);
    const breakStartMinutes = toMinutes(breakStartTime);
    const breakEndMinutes = toMinutes(breakEndTime);

    if (breakEndMinutes <= breakStartMinutes) {
      return "Break end time must be after break start time.";
    }

    if (
      breakStartMinutes < shiftStartMinutes ||
      breakEndMinutes > shiftEndMinutes
    ) {
      return "Break time must be within the shift time range.";
    }

    return null;
  }, [breakEndTime, breakStartTime, hasBreak, shiftEndTime, shiftStartTime]);

  const selectedBusinessInfo = useMemo(
    () => (myBusinesses || []).find((business: any) => business?.id === selectedBusiness),
    [myBusinesses, selectedBusiness]
  );

  const previewData = useMemo(
    () => ({
      templateName: templateName.trim() || "Template",
      shiftTimeRange: `${formatTime12(shiftStartTime)} - ${formatTime12(shiftEndTime)}`,
      breakTimeRange: hasBreak
        ? `${formatTime12(breakStartTime)} - ${formatTime12(breakEndTime)}`
        : "No break",
      totalStaff: currentRoleSlotsTotal,
      roles: roleRequirements.map((item) => ({
        roleName: item.roleName || "Role",
        count: item.count || 0,
      })),
      businessName: selectedBusinessInfo?.name || "Business",
      businessLogo: selectedBusinessInfo?.logo || undefined,
    }),
    [
      breakEndTime,
      breakStartTime,
      roleRequirements,
      selectedBusinessInfo?.logo,
      selectedBusinessInfo?.name,
      currentRoleSlotsTotal,
      shiftEndTime,
      shiftStartTime,
      templateName,
      hasBreak,
    ]
  );

  const getValidatedPayload = () => {
    if (!selectedBusiness || !templateIdValue) {
      toast.error("Template not found.");
      return null;
    }

    if (!templateName.trim()) {
      toast.error("Template name is required.");
      return null;
    }

    if (roleRequirements.length === 0) {
      toast.error("Please add at least one role slot.");
      return null;
    }

    if (shiftTimeValidationError) {
      toast.error(shiftTimeValidationError);
      return null;
    }

    if (breakTimeValidationError) {
      toast.error(breakTimeValidationError);
      return null;
    }

    return {
      name: templateName.trim(),
      description: templateDescription?.trim() || null,
      startTime: formatTime24(shiftStartTime),
      timezone,
      endTime: formatTime24(shiftEndTime),
      ...(hasBreak
        ? {
          breakDuration: [
            {
              startTime: formatTime24(breakStartTime),
              endTime: formatTime24(breakEndTime),
            },
          ],
        }
        : {}),
      roleRequirements: roleRequirements.map((item) => ({
        roleId: item.roleId,
        count: item.count,
      })),
      isOvertime: false,
    };
  };

  const handleUpdateTemplate = async () => {
    const payload = getValidatedPayload();
    if (!payload) return;

    try {
      setIsSubmitting(true);
      await updateShiftTemplate(selectedBusiness, templateIdValue, payload);
      toast.success("Shift template updated successfully.");
      setIsPreview(false);
      router.back();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update shift template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = () => {
    const payload = getValidatedPayload();
    if (!payload) return;
    setIsPreview(true);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedBusiness || !templateIdValue) {
      toast.error("Template not found.");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteShiftTemplate(selectedBusiness, templateIdValue);
      toast.success("Shift template deleted successfully.");
      setIsDeleteConfirmOpen(false);
      router.back();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete shift template");
    } finally {
      setIsDeleting(false);
    }
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
          title="Edit Template"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          className="mx-5"
          showsVerticalScrollIndicator={false}
        >
          {isLoadingTemplate ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
                Template Name
              </Text>
              <TextInput
                value={templateName}
                onChangeText={setTemplateName}
                className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px]"
                placeholder="Morning Shift"
                placeholderTextColor="#7D7D7D"
                textAlignVertical="top"
              />

              <View className="mt-8">
                <View className="flex-row gap-4 items-center">
                  <View className="flex-1">
                    <TimePicker
                      title="Shift Start Time"
                      value={shiftStartTime}
                      onChangeTime={setShiftStartTime}
                    />
                  </View>
                  <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    To
                  </Text>
                  <View className="flex-1">
                    <TimePicker
                      title="Shift End Time"
                      value={shiftEndTime}
                      onChangeTime={setShiftEndTime}
                    />
                  </View>
                </View>
              </View>

              <View className="mt-8">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setHasBreak((prev) => !prev)}
                  className="flex-row items-center gap-2 mb-3"
                >
                  <Feather
                    name={hasBreak ? "check-square" : "square"}
                    size={18}
                    color={hasBreak ? "#4FB2F3" : "#A0A0A0"}
                  />
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    Add break (optional)
                  </Text>
                </TouchableOpacity>

                <View
                  pointerEvents={hasBreak ? "auto" : "none"}
                  style={{ opacity: hasBreak ? 1 : 0.45 }}
                >
                  <View className="flex-row gap-4 items-center">
                    <View className="flex-1">
                      <TimePicker
                        value={breakStartTime}
                        onChangeTime={setBreakStartTime}
                      />
                    </View>

                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      To
                    </Text>

                    <TimePicker
                      value={breakEndTime}
                      onChangeTime={setBreakEndTime}
                    />
                  </View>
                </View>

                {hasBreak && breakTimeValidationError ? (
                  <Text className="mt-2 text-xs font-proximanova-regular text-[#F34F4F]">
                    {breakTimeValidationError}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-8">
                  Select business
                </Text>
                {myBusinessesLoading ? (
                  <View className="mt-4 py-4 items-center border border-[#EEEEEE] rounded-[10px]">
                    <ActivityIndicator size="small" />
                  </View>
                ) : (
                  <SelectDropdown
                    className="mt-4"
                    placeholder="Choose business"
                    options={businessOptions}
                    value={selectedBusiness}
                    onSelect={(value: string) => {
                      setSelectedBusiness(value);
                      setSelectedRole("");
                      setRoleSelectionVersion(0);
                    }}
                  />
                )}
              </View>

              <View className="mt-8 flex-row justify-between items-center">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  Roles
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Feather name="users" size={14} color="#4FB2F3" />
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                    Required count: {currentRoleSlotsTotal}
                  </Text>
                </View>
              </View>

              <View className="mt-4">
                {rolesLoading ? (
                  <View className="py-4 items-center border border-[#EEEEEE] rounded-[10px]">
                    <ActivityIndicator size="small" />
                  </View>
                ) : (
                  <SelectDropdown
                    placeholder={
                      selectedBusiness ? "Choose role" : "Select business first"
                    }
                    options={roleOptions}
                    value={selectedRole}
                    openTrigger={openRoleDropdownTrigger}
                    onSelect={(value: string) => {
                      setSelectedRole(value);
                      setRoleSelectionVersion((prev) => prev + 1);
                    }}
                  />
                )}
              </View>

              <RoleSlotsInput
                titleHeight={true}
                initialRoleSlots={initialRoleRequirements}
                selectedRoleToAdd={
                  selectedRoleOption
                    ? { id: selectedRoleOption.value, name: selectedRoleOption.label }
                    : null
                }
                addRoleTrigger={roleSelectionVersion}
                resetTrigger={roleSlotsResetVersion}
                onTotalRequiredChange={handleTotalRequiredChange}
                onRoleSlotsChange={handleRoleSlotsChange}
                onPressAddRole={() => {
                  if (!selectedBusiness) {
                    toast.error("Select business first.");
                    return;
                  }
                  setOpenRoleDropdownTrigger((prev) => prev + 1);
                }}
              />

              <View className="mt-8 mb-5 flex-row gap-2">
                <TouchableOpacity
                  onPress={() => {
                    if (isDeleting || isSubmitting) return;
                    setIsDeleteConfirmOpen(true);
                  }}
                  className={`flex-1 bg-[#F34F4F] items-center justify-center rounded-full ${isDeleting || isSubmitting ? "opacity-50" : ""
                    }`}
                >
                  <Text className="font-proximanova-semibold text-base text-center text-[#ffffff]">
                    Delete
                  </Text>
                </TouchableOpacity>
                <PrimaryButton
                  className="flex-1"
                  onPress={handleOpenPreview}
                  loading={isSubmitting}
                  disabled={
                    isSubmitting ||
                    Boolean(shiftTimeValidationError) ||
                    Boolean(breakTimeValidationError)
                  }
                  title="Save"
                />
              </View>
            </>
          )}

          <PreviewTemplateModal
            visible={isPreview}
            onClose={() => setIsPreview(false)}
            onApply={handleUpdateTemplate}
            loading={isSubmitting}
            data={previewData}
          />

          <DeleteConfirmModal
            visible={isDeleteConfirmOpen}
            deleting={isDeleting}
            title="Delete Shift Template"
            description="Are you sure you want to delete this shift template? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onClose={() => {
              if (isDeleting) return;
              setIsDeleteConfirmOpen(false);
            }}
            onConfirm={handleDeleteTemplate}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditTemplate;
