import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ShareVia from "@/components/ui/modals/ShareVia";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useColorScheme } from "nativewind";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

const QrGenerate = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const qrCodeContainerRef = useRef<View>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const employeeInfo = {
    name: "Favour",
    code: "895641",
    businessName: "Houghton",
  };

  // Create a deep link URL instead of JSON
  // This will open your app with the invitation details
  const deepLinkUrl = `hirru://join?business=${encodeURIComponent(
    employeeInfo.businessName
  )}&code=${employeeInfo.code}&employee=${encodeURIComponent(
    employeeInfo.name
  )}&type=employee_join`;

  // Copy code to clipboard function
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(employeeInfo.code);
      Alert.alert("Copied!", "Code has been copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy code to clipboard");
    }
  };

  const downloadQRCode = async () => {
    try {
      setIsGenerating(true);

      if (!qrCodeContainerRef.current) {
        Alert.alert("Error", "QR code not found");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(qrCodeContainerRef.current, {
        format: "png",
        quality: 1.0,
      });

      console.log("Captured URI:", uri);

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Download", asset, false);
          Alert.alert("Success", "QR code has been saved to your gallery");
          return;
        }
      } catch (mediaError) {
        console.log("Media library save failed, using sharing...");
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Save QR Code",
        });
      } else {
        Alert.alert(
          "QR Code Captured",
          "QR code is ready. You can take a screenshot to save it.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error capturing QR code:", error);

      Alert.alert(
        "Save QR Code",
        "To save this QR code:\n\n1. Take a screenshot of this screen\n2. The QR code will be saved to your gallery\n3. You can then share it with others",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const [isModal, setIsModal] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      {/* Header */}
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Invite Employee"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity
              onPress={downloadQRCode}
              disabled={isGenerating}
              className="h-10 w-10 bg-white rounded-full flex-row items-center justify-center"
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Feather name="download" size={20} color="black" />
              )}
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* QR Code Container */}
        <View className="bg-[#E5F4FD] dark:bg-dark-card mt-20 rounded-2xl pb-3 items-center shadow-sm border border-[#EEEEEE] dark:border-gray-800">
          {/* Employee Info Card */}
          <View className="items-center -top-8">
            <Image
              source={require("@/assets/images/reward/nameplate-profile.png")}
              contentFit="contain"
              style={{ height: 80, width: 80 }}
            />
            <Text className="mt-2.5 font-proximanova-semibold text-primary dark:text-dark-primary">
              {employeeInfo.businessName}
            </Text>
          </View>

          {/* Actual QR Code */}
          <View
            className="w-64 h-64 bg-white dark:bg-gray-800 rounded-xl items-center justify-center border-2 border-[#4FB2F3] dark:border-gray-700"
            ref={qrCodeContainerRef}
            collapsable={false}
          >
            <QRCode
              value={deepLinkUrl}
              logoSVG={require("@/assets/images/hiruu-logo.svg")}
              size={200}
              logoSize={30}
              color={isDark ? "#FFFFFF" : "#000000"}
              backgroundColor={isDark ? "#1F2937" : "#FFFFFF"}
              quietZone={0}
              ecl="M"
            />
          </View>

          <Text
            className="capitalize font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-4"
            numberOfLines={1}
          >
            Scan to join {employeeInfo.businessName}
          </Text>

          {/* Code Display with Copy Functionality */}
          <View className="bg-[#FFFFFF] rounded-full mt-4 py-2 px-8 flex-row items-center gap-4 active:bg-gray-100">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              Code: {employeeInfo.code}
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* bottom text */}
        <View className="items-center">
          <Text className="mt-4 font-proximanova-semibold text-primary dark:text-dark-primary">
            Scan QR Code
          </Text>
          <Text className="mt-2.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary text-center">
            Scan the QR code to join {employeeInfo.businessName} on Hirru
          </Text>
        </View>
        <ShareVia visible={isModal} onClose={() => setIsModal(false)} />
      </ScrollView>
      <PrimaryButton
        onPress={() => setIsModal(true)}
        title="Share QR Code"
        className="mx-5 my-10"
      />
    </SafeAreaView>
  );
};

export default QrGenerate;
