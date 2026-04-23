import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Text, View } from "react-native";
import PdfRendererView from "react-native-pdf-renderer";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const CvPreview = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; url?: string }>();
  const [pdfLocalUri, setPdfLocalUri] = useState("");
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);

  const previewType = useMemo(
    () => (params?.type === "pdf" ? "pdf" : "image"),
    [params?.type]
  );
  const previewUrl = useMemo(
    () => (typeof params?.url === "string" ? params.url.trim() : ""),
    [params?.url]
  );

  useEffect(() => {
    let isMounted = true;

    const preparePdf = async () => {
      if (previewType !== "pdf" || !previewUrl) {
        if (isMounted) {
          setPdfLocalUri("");
          setIsPreparingPdf(false);
        }
        return;
      }

      if (previewUrl.startsWith("file://")) {
        if (isMounted) {
          setPdfLocalUri(previewUrl);
          setIsPreparingPdf(false);
        }
        return;
      }

      try {
        if (isMounted) setIsPreparingPdf(true);
        const cacheDir = new Directory(Paths.cache, "pdf-previews");
        if (!cacheDir.exists) {
          cacheDir.create({ idempotent: true, intermediates: true });
        }

        const fileName = `preview-${Date.now()}.pdf`;
        const targetFile = new File(cacheDir, fileName);
        const downloadedFile = await File.downloadFileAsync(previewUrl, targetFile, {
          idempotent: true,
        });

        if (isMounted) {
          setPdfLocalUri(downloadedFile.uri);
        }
      } catch {
        if (isMounted) {
          setPdfLocalUri("");
          toast.error(t("user.profile.cvPreview.failedToLoadPdfPreview"));
        }
      } finally {
        if (isMounted) setIsPreparingPdf(false);
      }
    };

    void preparePdf();
    return () => {
      isMounted = false;
    };
  }, [previewType, previewUrl, t]);

  const handleOpenExternal = async () => {
    if (!previewUrl) return;
    try {
      await Linking.openURL(previewUrl);
    } catch {
      toast.error(t("user.profile.cvPreview.unableToOpenLink"));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <ScreenHeader
        onPressBack={() => router.back()}
        title={
          previewType === "pdf"
            ? t("user.profile.cvPreview.pdfPreview")
            : t("user.profile.cvPreview.imagePreview")
        }
        className="px-5 pb-4"
      />

      {!previewUrl ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-proximanova-regular text-sm text-secondary text-center">
            {t("user.profile.cvPreview.previewLinkUnavailable")}
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
            {isPreparingPdf ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
            ) : pdfLocalUri ? (
              <PdfRendererView
                source={pdfLocalUri}
                maxZoom={5}
                distanceBetweenPages={16}
                style={{ flex: 1, width: "100%" }}
                onError={() => toast.error(t("user.profile.cvPreview.failedToLoadPdfPreview"))}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <Text className="font-proximanova-regular text-sm text-secondary text-center">
                  {t("user.profile.cvPreview.pdfPreviewUnavailable")}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {previewUrl ? (
        <GradientButton
          className="mx-5 mb-5"
          title={
            previewType === "pdf"
              ? t("user.profile.cvPreview.downloadPdf")
              : t("user.profile.cvPreview.downloadImage")
          }
          icon={<Ionicons name="download-outline" size={18} color="#FFFFFF" />}
          onPress={handleOpenExternal}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default CvPreview;
