import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import RoleSlotsInput from "@/components/ui/inputs/RoleSlotsInput";
import TimePicker from "@/components/ui/inputs/TimePicker";
import PreviewTemplateModal from "@/components/ui/modals/PreviewTemplateModal";
import { Image } from "expo-image";
import { useBusinessStore } from "@/stores/businessStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const CreateTemplate = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const {
    myEmployments,
    myEmploymentsLoading,
    getMyEmployments,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyBusinessRoles,
    createShiftTemplate,
  } = useBusinessStore();
  const timezone = usePreferencesStore((state) => state.timezone);
  const [templateName, setTemplateName] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [currentRoleSlotsTotal, setCurrentRoleSlotsTotal] = useState<number>(0);
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
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getMyEmployments().catch((error: any) => {
      toast.error(error?.message || t("user.jobs.schedule.failedToLoadBusinesses"));
    });
  }, [getMyEmployments, t]);

  const activeBusinesses = useMemo(() => {
    const activeEmployments = (Array.isArray(myEmployments) ? myEmployments : []).filter(
      (employment: any) => String(employment?.status || "").toLowerCase() === "active"
    );
    const uniqueByBusinessId = new Map<string, any>();

    activeEmployments.forEach((employment: any) => {
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      if (!businessId || uniqueByBusinessId.has(businessId)) return;

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || "Business",
        logo: business?.logo,
        address: business?.address,
      });
    });

    return Array.from(uniqueByBusinessId.values());
  }, [myEmployments]);

  useEffect(() => {
    const preferredBusinessId = selectedBusinesses?.[0];
    const hasPreferred = activeBusinesses.some(
      (business) => business.id === preferredBusinessId
    );
    const nextBusinessId = hasPreferred
      ? preferredBusinessId
      : activeBusinesses[0]?.id || "";

    if (!nextBusinessId) {
      if (selectedBusiness !== "") {
        setSelectedBusiness("");
      }
      return;
    }

    if (selectedBusiness !== nextBusinessId) {
      setSelectedBusiness(nextBusinessId);
      setSelectedRole("");
      setRoleSelectionVersion(0);
      setRoleRequirements([]);
      setCurrentRoleSlotsTotal(0);
      setRoleSlotsResetVersion((prev) => prev + 1);
    }

    if (!hasPreferred && nextBusinessId) {
      setSelectedBusinesses([nextBusinessId]);
    }
  }, [
    activeBusinesses,
    selectedBusiness,
    selectedBusinesses,
    setSelectedBusinesses,
  ]);

  useEffect(() => {
    const loadRoles = async () => {
      if (!selectedBusiness) {
        setRoleOptions([]);
        setSelectedRole("");
        setRoleSelectionVersion(0);
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
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadRoles"));
        setRoleOptions([]);
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [getMyBusinessRoles, selectedBusiness, t]);

  const selectedRoleOption = useMemo(
    () => roleOptions.find((item) => item.value === selectedRole) || null,
    [roleOptions, selectedRole]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTotalRequiredChange = useCallback((total: number) => {
    setCurrentRoleSlotsTotal((prev) => (prev === total ? prev : total));
  }, []);

  const handleRoleSlotsChange = useCallback(
    (slots: { roleId: string; roleName: string; count: number }[]) => {
      setRoleRequirements((prev) => {
        if (
          prev.length === slots.length &&
          prev.every(
            (item, index) =>
              item.roleId === slots[index]?.roleId &&
              item.roleName === slots[index]?.roleName &&
              item.count === slots[index]?.count
          )
        ) {
          return prev;
        }
        return slots;
      });
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
      return t("user.jobs.schedule.shiftEndTimeMustBeAfterStartTime");
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
      return t("user.jobs.schedule.breakEndTimeMustBeAfterStartTime");
    }

    if (
      breakStartMinutes < shiftStartMinutes ||
      breakEndMinutes > shiftEndMinutes
    ) {
      return t("user.jobs.schedule.breakTimeMustBeWithinShiftTimeRange");
    }

    return null;
  }, [breakEndTime, breakStartTime, hasBreak, shiftEndTime, shiftStartTime]);

  const getValidatedPayload = () => {
    if (!selectedBusiness) {
      toast.error(t("user.jobs.schedule.selectBusinessFirst"));
      return null;
    }

    if (!templateName.trim()) {
      toast.error(t("user.jobs.schedule.templateNameRequired"));
      return null;
    }

    if (roleRequirements.length === 0) {
      toast.error(t("user.jobs.schedule.addAtLeastOneRoleSlot"));
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

  const handleCreateTemplate = async () => {
    const payload = getValidatedPayload();
    if (!payload) return;

    try {
      setIsSubmitting(true);
      const result = await createShiftTemplate(selectedBusiness, payload);
      toast.success(
        translateApiMessage(
          result?.message || "shift_template_created_successfully"
        )
      );
      setIsPreviewOpen(false);
      router.back();
    } catch (error: any) {
      setIsPreviewOpen(false);
      toast.error(
        translateApiMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create shift template"
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = () => {
    const payload = getValidatedPayload();
    if (!payload) return;
    setIsPreviewOpen(true);
  };

  const selectedBusinessInfo = useMemo(
    () => activeBusinesses.find((business: any) => business?.id === selectedBusiness),
    [activeBusinesses, selectedBusiness]
  );

  const previewData = useMemo(
    () => ({
      templateName: templateName.trim() || t("user.jobs.schedule.templateNameFallback"),
      shiftTimeRange: `${formatTime12(shiftStartTime)} - ${formatTime12(
        shiftEndTime
      )}`,
      breakTimeRange: hasBreak
        ? `${formatTime12(breakStartTime)} - ${formatTime12(breakEndTime)}`
        : t("user.jobs.schedule.noBreak"),
      totalStaff: currentRoleSlotsTotal,
      roles: roleRequirements.map((item) => ({
        roleName: item.roleName || t("user.jobs.schedule.roleFallback"),
        count: item.count || 0,
      })),
      businessName: selectedBusinessInfo?.name || t("user.jobs.schedule.businessFallback"),
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
          title={t("user.jobs.schedule.createTemplate")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <ScrollView className="mx-5" showsVerticalScrollIndicator={false} contentContainerStyle={{
          paddingBottom: 120
        }}>
          {/* input */}
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.schedule.templateName")}
          </Text>
          <TextInput
            value={templateName}
            onChangeText={setTemplateName}
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary  border border-[#EEEEEE] mt-2.5 rounded-[10px]"
            placeholder={t("user.jobs.schedule.morningShift")}
            placeholderTextColor="#7D7D7D"
            textAlignVertical="top"
          />

          {/* Time Picker shift  */}
          <View className="mt-8">
            <View className="flex-row gap-4 items-center">
              <TimePicker
                title={t("user.jobs.schedule.shiftStartTime")}
                value={shiftStartTime}
                onChangeTime={setShiftStartTime}
              />

              <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t("user.jobs.schedule.to")}
              </Text>

              <TimePicker
                title={t("user.jobs.schedule.shiftEndTime")}
                value={shiftEndTime}
                onChangeTime={setShiftEndTime}
              />
            </View>
          </View>

          {/* Break (optional) */}
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
                {t("user.jobs.schedule.addBreakOptional")}
              </Text>
            </TouchableOpacity>

            <View
              pointerEvents={hasBreak ? "auto" : "none"}
              style={{ opacity: hasBreak ? 1 : 0.45 }}
            >
              <View className="flex-row gap-4 items-center">
                <TimePicker
                  value={breakStartTime}
                  onChangeTime={setBreakStartTime}
                />


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

          {/* business info */}
          <View>
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-8">
              {t("user.jobs.schedule.business")}
            </Text>

            {myEmploymentsLoading ? (
              <View className="mt-4 py-4 items-center border border-[#EEEEEE] rounded-[10px]">
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <View className="mt-4 px-4 py-3 border border-[#EEEEEE] rounded-[10px] bg-[#F9FAFB]">
                <View className="flex-row items-center gap-2.5">
                  <Image
                    source={
                      selectedBusinessInfo?.logo
                        ? { uri: selectedBusinessInfo.logo }
                        : require("@/assets/images/placeholder.png")
                    }
                    style={{ width: 28, height: 28, borderRadius: 999 }}
                    contentFit="cover"
                  />
                  <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary flex-1">
                    {selectedBusinessInfo?.name || t("user.jobs.schedule.noBusinessSelected")}
                  </Text>
                </View>
                {selectedBusinessInfo?.address?.address ? (
                  <Text className="mt-1 text-xs font-proximanova-regular text-secondary">
                    {selectedBusinessInfo.address.address}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* role required */}
          <View className="mt-8 flex-row items-center justify-between">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              {t("user.jobs.schedule.roles")}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Feather name="users" size={14} color="#4FB2F3" />
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                {t("user.jobs.schedule.requiredCount")}: {currentRoleSlotsTotal}
              </Text>
            </View>
          </View>

          {/* role list */}
          <View className="mt-4">
            {rolesLoading ? (
              <View className="py-4 items-center border border-[#EEEEEE] rounded-[10px]">
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <SelectDropdown
                placeholder={
                  selectedBusiness ? t("user.jobs.schedule.chooseRole") : t("user.jobs.schedule.selectBusinessFirst")
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

          {/* <SearchBar
            className="mt-4 py-1"
            onSearch={(text) => {}}
          /> */}

          {/* role slot */}
          <RoleSlotsInput
            titleHeight={true}
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
                toast.error(t("user.jobs.schedule.selectBusinessFirst"));
                return;
              }
              setOpenRoleDropdownTrigger((prev) => prev + 1);
            }}
          />

          <View className="mt-8 mb-5">
            <PrimaryButton
              onPress={handleOpenPreview}
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                Boolean(shiftTimeValidationError) ||
                Boolean(breakTimeValidationError)
              }
              title={t("user.jobs.schedule.saveTemplate")}
            />
          </View>
        </ScrollView>

        <PreviewTemplateModal
          visible={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onApply={handleCreateTemplate}
          loading={isSubmitting}
          data={previewData}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreateTemplate;
