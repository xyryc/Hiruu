import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ShareVia from "@/components/ui/modals/ShareVia";
import { useBusinessStore } from "@/stores/businessStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { toast } from "sonner-native";

const QrGenerate = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const qrCodeContainerRef = useRef<View>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessLogoUrl, setBusinessLogoUrl] = useState("")
  const insets = useSafeAreaInsets()

  const [inviteCode, setInviteCode] = useState("")
  const {
    userBusiness,
    selectedBusinesses,
    getBusinessProfile,
    generateBusinessCode,
    isLoading,
  } = useBusinessStore();


  const selectedBusinessId = selectedBusinesses[0];

  const generatedeepLinkUrl = useCallback(async () => {
    const businessId = selectedBusinessId || userBusiness?.id;
    if (!businessId) return;

    try {
      const business =
        userBusiness?.id === businessId
          ? userBusiness
          : await getBusinessProfile(businessId).catch(() => null);

      const result = await generateBusinessCode(businessId);

      const invite = result?.code || result?.data?.code || "";

      const link = invite
        ? `hirru://join?businessid=${businessId}&inviteCode=${invite}`
        : "";

      setInviteCode(invite);
      setDeepLinkUrl(link);
      setBusinessName(business?.name || userBusiness?.name || "");
      setBusinessLogoUrl(business?.logo || userBusiness?.logo || "");
    } catch { }
  }, [
    generateBusinessCode,
    getBusinessProfile,
    selectedBusinessId,
    userBusiness,
  ]);

  useEffect(() => {
    void generatedeepLinkUrl();
  }, [generatedeepLinkUrl, selectedBusinessId, userBusiness?.id]);

  // Copy code to clipboard function
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      toast.success(t("user.profile.qr.codeCopied"));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error(t("user.profile.qr.copyCodeFailed"));
    }
  };

  const downloadQRCode = async () => {
    try {
      setIsGenerating(true);

      if (!qrCodeContainerRef.current) {
        toast.error(t("user.profile.qr.qrNotFound"));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(qrCodeContainerRef.current, {
        format: "png",
        quality: 1.0,
      });

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === "granted") {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Download", asset, false);
          toast.success(t("user.profile.qr.qrSavedToGallery"));
          return;
        }
      } catch {
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: t("user.profile.qr.saveQrCode"),
        });
      } else {
        toast.info(t("user.profile.qr.qrReadyTakeScreenshot"));
      }
    } catch (error) {
      console.error("Error capturing QR code:", error);
      toast.error(t("user.profile.qr.saveQrFailedTakeScreenshot"));
    } finally {
      setIsGenerating(false);
    }
  };

  const shareQRCode = async () => {
    try {
      setIsGenerating(true);

      if (!qrCodeContainerRef.current) {
        toast.error(t("user.profile.qr.qrNotFound"));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(qrCodeContainerRef.current, {
        format: "png",
        quality: 1.0,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: t("user.profile.qr.shareQrCode"),
        });
      } else {
        toast.info(t("user.profile.qr.sharingNotAvailable"));
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast.error(t("user.profile.qr.shareQrFailed"));
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

      <ScreenHeader
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
        onPressBack={() => router.back()}
        title={t("user.profile.qr.inviteEmployee")}
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* QR Code Container */}
        <View className="bg-[#E5F4FD] dark:bg-dark-card mt-20 rounded-2xl pb-3 items-center shadow-sm border border-[#EEEEEE] dark:border-gray-800">
          {/* Employee Info Card */}
          <View className="items-center -top-8">
            {businessLogoUrl ? (
              <Image
                source={
                  businessLogoUrl.startsWith("http")
                    ? businessLogoUrl
                    : `${process.env.EXPO_PUBLIC_API_URL}${businessLogoUrl}`
                }
                contentFit="contain"
                style={{ height: 80, width: 80, borderRadius: 999 }}
              />
            ) : null}
            <Text className="mt-2.5 font-proximanova-semibold text-primary dark:text-dark-primary">
              {businessName}
            </Text>
          </View>

          {/* Actual QR Code */}
          <View
            className="w-64 h-64 bg-white dark:bg-gray-800 rounded-xl items-center justify-center border-2 border-[#4FB2F3] dark:border-gray-700"
            ref={qrCodeContainerRef}
            collapsable={false}
          >
            {isLoading || !deepLinkUrl ?
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="small" />
              </View>
              :
              <QRCode
                value={deepLinkUrl || "https://hiruu.com"} // Fallback to prevent empty string error
                logoSVG={require("@/assets/images/hiruu-logo.svg")}
                size={200}
                logoSize={30}
                color={isDark ? "#FFFFFF" : "#000000"}
                backgroundColor={isDark ? "#1F2937" : "#FFFFFF"}
                quietZone={0}
                ecl="M"
              />
            }
          </View>

          <Text
            className="capitalize font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-4"
            numberOfLines={1}
          >
            {t("user.profile.qr.scanToJoin", { businessName })}
          </Text>

          {/* Code Display with Copy Functionality */}
          <View className="bg-[#FFFFFF] rounded-full mt-4 py-2 px-8 flex-row items-center gap-4 active:bg-gray-100">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {t("user.profile.qr.codeLabel", { code: inviteCode })}
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* bottom text */}
        <View className="items-center">
          <Text className="mt-4 font-proximanova-semibold text-primary dark:text-dark-primary">
            {t("user.profile.qr.scanQrCode")}
          </Text>
          <Text className="mt-2.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary text-center">
            {t("user.profile.qr.scanQrDescription", { businessName })}
          </Text>
        </View>
        <ShareVia visible={isModal} onClose={() => setIsModal(false)} />
      </ScrollView>

      <PrimaryButton
        onPress={shareQRCode}
        title={t("user.profile.qr.scanQrCode")}
        className="mx-5 my-10"
      />
    </SafeAreaView>
  );
};

export default QrGenerate;
