import ScreenHeader from "@/components/header/ScreenHeader";
import ShiftTemplateCard from "@/components/ui/cards/ShiftTemplateCard";
import DeleteConfirmModal from "@/components/ui/modals/DeleteConfirmModal";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { selectedBusinesses, getShiftTemplates, deleteShiftTemplate } =
    useBusinessStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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
      toast.error(error?.message || "Failed to load shift templates");
    } finally {
      setIsLoading(false);
    }
  }, [businessId, getShiftTemplates]);

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
      toast.success("Shift template deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete shift template");
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
          title="Saved Shift template"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity onPress={() => router.push("/screens/schedule/business/create-template")} className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center">
              <Ionicons name="documents-outline" size={18} color="black" />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120
          }}
          className="mx-5"
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
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
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                No shift templates found.
              </Text>
            </View>
          )}
        </ScrollView>

        <DeleteConfirmModal
          visible={Boolean(pendingDeleteId)}
          deleting={Boolean(deletingId)}
          title="Delete Shift Template"
          description="Are you sure you want to delete this shift template? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
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
