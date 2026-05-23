import ScreenHeader from "@/components/header/ScreenHeader";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, ScrollView, Text, View } from "react-native";
import { EnrichedMarkdownText } from "react-native-enriched-markdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const Terms = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getTermsAndConditions = useSettingsStore((s) => s.getTermsAndConditions);
  const termsAndConditions = useSettingsStore((s) => s.termsAndConditions);
  const isLoadingTermsAndConditions = useSettingsStore(
    (s) => s.isLoadingTermsAndConditions
  );

  useFocusEffect(
    useCallback(() => {
      const loadTermsAndConditions = async () => {
        try {
          await getTermsAndConditions();
        } catch (error) {
          console.error("terms-and-conditions error:", error);
        }
      };

      loadTermsAndConditions();
    }, [getTermsAndConditions])
  );

  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >

      <ScreenHeader
        className="capitalize bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
        onPressBack={() => router.back()}
        title={t("user.profile.termsAndConditions")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mx-5 flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View>
          {isLoadingTermsAndConditions ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={isDark ? "#fff" : "#111"} />
            </View>
          ) : termsAndConditions?.content ? (
            <EnrichedMarkdownText
              markdown={termsAndConditions.content}
              flavor="github"
              onLinkPress={({ url }) => Linking.openURL(url)}

              markdownStyle={{
                paragraph: {
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: "proximanova-regular",
                  marginTop: 6,
                  marginBottom: 0,
                },
                h1: {
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 18,
                  fontFamily: "proximanova-semibold",
                  marginTop: 20,
                  marginBottom: 0,
                  lineHeight: 24,
                },
                h2: {
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 16,
                  fontFamily: "proximanova-semibold",
                  marginTop: 18,
                  marginBottom: 0,
                  lineHeight: 22,
                },
                h3: {
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 13,
                  fontFamily: "proximanova-semibold",
                  marginTop: 16,
                  marginBottom: 0,
                  lineHeight: 18,
                },
                blockquote: {
                  borderColor: "#4FB2F3",
                  borderWidth: 3,
                  gapWidth: 8,
                  marginTop: 16,
                  marginBottom: 0,
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: "proximanova-regular",
                },
                code: {
                  fontFamily: "monospace",
                },
                link: {
                  color: "#4FB2F3",
                },
                list: {
                  marginTop: 10,
                  marginBottom: 0,
                  color: isDark ? "#FFFFFF" : "#11293A",
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: "proximanova-regular",
                  bulletColor: isDark ? "#FFFFFF" : "#11293A",
                  gapWidth: 6,
                },
              }}
            />
          ) : (
            <Text
              className={`mt-5 font-proximanova-regular text-xs ${isDark ? "text-dark-primary" : "text-primary"
                }`}
            >
              {t("user.profile.noTermsAndConditionsFound")}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;
