import ScreenHeader from "@/components/header/ScreenHeader";
import ShiftTemplateCard from "@/components/ui/cards/ShiftTemplateCard";
import DeleteConfirmModal from "@/components/ui/modals/DeleteConfirmModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SavedShiftTemplate = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { selectedBusinesses, getShiftTemplates, deleteShiftTemplate } =
    useBusinessStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const skeletonRows = [1, 2, 3];
  const businessId = selectedBusinesses[0];

  const loadTemplates = useCallback(async () => {
    if (!businessId) {
      setTemplates([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getShiftTemplates(businessId);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToLoadShiftTemplates"));
    } finally {
      setIsLoading(false);
    }
  }, [businessId, getShiftTemplates, t]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleDeleteTemplate = async (templateId?: string) => {
    if (!businessId || !templateId || deletingId) return;

    try {
      setDeletingId(templateId);
      await deleteShiftTemplate(businessId, templateId);
      setTemplates((prev) => prev.filter((item) => item?.id !== templateId));
      toast.success(t("user.jobs.schedule.shiftTemplateDeleted"));
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToDeleteShiftTemplate"));
    } finally {
      setDeletingId(null);
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
          title={t("user.jobs.schedule.savedShiftTemplate")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120
          }}
          className="mx-5"
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View className="pt-8">
              {skeletonRows.map((item, index) => (
                <View
                  key={`template-skeleton-${item}`}
                  className={`${index === 0 ? "mt-0" : "mt-4"} rounded-2xl border border-[#EEEEEE] bg-white px-4 py-4`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="h-5 w-36 rounded-full bg-[#E5E7EB]" />
                    <View className="h-4 w-14 rounded-full bg-[#E5E7EB]" />
                  </View>

                  <View className="mt-3 h-3.5 w-28 rounded-full bg-[#E5E7EB]" />
                  <View className="mt-2 h-3.5 w-44 rounded-full bg-[#E5E7EB]" />

                  <View className="mt-4 flex-row gap-2">
                    <View className="h-6 w-20 rounded-full bg-[#E5E7EB]" />
                    <View className="h-6 w-24 rounded-full bg-[#E5E7EB]" />
                    <View className="h-6 w-16 rounded-full bg-[#E5E7EB]" />
                  </View>

                  <View className="mt-4 h-3 w-3/4 rounded-full bg-[#E5E7EB]" />
                  <View className="mt-2 h-3 w-1/2 rounded-full bg-[#E5E7EB]" />
                </View>
              ))}
            </View>
          ) : templates.length > 0 ? (
            templates.map((template, index) => {
              return (
                <ShiftTemplateCard
                  key={template?.id || index}
                  className={index === 0 ? "mt-8" : "mt-4"}
                  templateId={template?.id}
                  businessId={businessId}
                  title={template?.name || "Shift Template"}
                  startTime={template?.startTime}
                  endTime={template?.endTime}
                  breakDurations={template?.breakDuration}
                  location={template?.business?.address?.address || "Business address"}
                  businessName={template?.business?.name || "Business"}
                  businessLogo={template?.business?.logo}
                  roles={template?.roleRequirements || []}
                  onDelete={() => setPendingDeleteId(template?.id)}
                />
              );
            })
          ) : (
            <View className="py-10 items-center px-4">
              <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary text-center">
                {t("user.jobs.schedule.noShiftTemplatesYet")}
              </Text>
              <Text className="mt-2 text-sm text-secondary dark:text-dark-secondary text-center">
                {t("user.jobs.schedule.createFirstOne")}
              </Text>
              <TouchableOpacity
                className="mt-5 bg-[#11293A] rounded-full px-5 py-2.5"
                activeOpacity={0.85}
                onPress={() => router.push("/screens/schedule/business/create-template")}
              >
                <Text className="font-proximanova-semibold text-sm text-white">
                  {t("user.jobs.schedule.createShiftTemplate")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <DeleteConfirmModal
          visible={Boolean(pendingDeleteId)}
          deleting={Boolean(deletingId)}
          title={t("user.jobs.schedule.deleteShiftTemplate")}
          description={t("user.jobs.schedule.deleteShiftTemplateDescription")}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
          onClose={() => {
            if (deletingId) return;
            setPendingDeleteId(null);
          }}
          onConfirm={async () => {
            if (!pendingDeleteId) return;
            await handleDeleteTemplate(pendingDeleteId);
            setPendingDeleteId(null);
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SavedShiftTemplate;
