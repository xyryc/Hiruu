import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Text, View } from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Preview = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; url?: string }>();

  const previewType = useMemo(
    () => (params?.type === "pdf" ? "pdf" : "image"),
    [params?.type]
  );
  const previewUrl = useMemo(
    () => (typeof params?.url === "string" ? params.url.trim() : ""),
    [params?.url]
  );

  const handleOpenExternal = async () => {
    if (!previewUrl) return;
    try {
      await Linking.openURL(previewUrl);
    } catch {
      toast.error("Unable to open link");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <ScreenHeader
        onPressBack={() => router.back()}
        title={previewType === "pdf" ? "PDF Preview" : "Image Preview"}
        className="px-5 pb-4"
      />

      {!previewUrl ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-proximanova-regular text-sm text-secondary text-center">
            Preview link is unavailable.
          </Text>
        </View>
      ) : previewType === "image" ? (
        <View className="flex-1 px-5 pb-5">
          <Image
            source={{ uri: previewUrl }}
            contentFit="contain"
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
          />
        </View>
      ) : (
        <View className="flex-1 px-5 pb-5">
          <View className="flex-1 overflow-hidden rounded-xl border border-[#EEEEEE]">
            <Pdf
              source={{ uri: previewUrl, cache: true }}
              style={{ flex: 1, width: "100%" }}
              onError={() => toast.error("Failed to load PDF preview")}
            />
          </View>
        </View>
      )}

      {previewUrl ? (
        <GradientButton
          className="mx-5 mb-5"
          title={previewType === "pdf" ? "Download PDF" : "Download Image"}
          icon={<Ionicons name="download-outline" size={18} color="#FFFFFF" />}
          onPress={handleOpenExternal}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default Preview;
