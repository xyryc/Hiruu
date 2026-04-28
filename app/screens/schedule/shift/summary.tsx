import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import AttachmentUpload from "@/components/ui/inputs/AttachmentUpload";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ShiftSummary = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createShiftReport } = useShiftStore();

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const mimeType = file.mimeType || "application/octet-stream";
      if (!ALLOWED_ATTACHMENT_TYPES.includes(mimeType)) {
        toast.error("Selected file type is not allowed");
        return;
      }
      setAttachment({
        uri: file.uri,
        name: file.name || `attachment_${Date.now()}`,
        type: mimeType,
      });
    } catch {
      toast.error("Failed to pick attachment");
    }
  };

  const handleSubmitSummary = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("type", "summary");
      formData.append("notes", reason.trim());
      if (attachment) {
        if (!ALLOWED_ATTACHMENT_TYPES.includes(attachment.type)) {
          toast.error("Attachment type is not allowed");
          return;
        }
        formData.append("attachment", attachment as any);
      }

      const result = await createShiftReport(formData as any);
      toast.success(
        translateApiMessage(result?.message || "shift_report_submitted")
      );
      router.back();
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message || "Failed to submit shift summary"
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-dark-background">
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-6 rounded-b-3xl overflow-hidden"
        title="Shift Summary"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 bg-white dark:bg-dark-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-6">
          {/* Overtime Details Section */}
          <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mb-7">
            Your Shift Recap
          </Text>

          {/* Additional Notes */}
          <View className="mb-4">
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
              Additional Notes
            </Text>
            <View className="bg-white dark:bg-dark-surface rounded-xl border border-[#EEEEEE] dark:border-dark-border overflow-hidden">
              <TextInput
                className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary min-h-[120px]"
                placeholder="Any suggestions, feedback, or extra notes?"
                placeholderTextColor="#7D7D7D"
                multiline
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>

          {/* upload */}
          <View>
            <AttachmentUpload onPress={handleFileUpload} />
            {attachment?.name ? (
              <Text className="mt-2 text-xs text-secondary">{attachment.name}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className="mx-5 absolute bottom-0 left-0 right-0 py-5 items-center justify-end bg-white dark:bg-dark-background rounded-t-[20px]">
        <PrimaryButton
          title={isSubmitting ? "Submitting..." : "Send Request"}
          onPress={handleSubmitSummary}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default ShiftSummary;
