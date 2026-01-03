import { AttachmentUploadProps } from "@/types/components/input";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AttachmentUpload = ({ onPress }: AttachmentUploadProps) => {
  return (
    <View>
      <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
        Attachments
      </Text>

      <TouchableOpacity
        onPress={onPress}
        className="items-center justify-center py-8 bg-white dark:bg-dark-surface rounded-xl border border-dashed border-[#EEEEEE] dark:border-dark-border"
        activeOpacity={0.7}
      >
        <Feather name="plus-circle" size={50} color="#4FB2F3" />

        <Text className="text-sm font-proximanova-medium text-secondary dark:text-dark-secondary mt-2.5">
          Upload Your File
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttachmentUpload;
