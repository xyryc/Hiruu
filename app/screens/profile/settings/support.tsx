import ScreenHeader from "@/components/header/ScreenHeader";
import { chatService } from "@/services/chatService";
import { useSettingsStore } from "@/stores/settingsStore";
import { AntDesign, Fontisto } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const HelpSupport = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getFaq = useSettingsStore((s) => s.getFaq);
  const faqItems = useSettingsStore((s) => s.faqItems);
  const isLoadingFaq = useSettingsStore((s) => s.isLoadingFaq);
  const [isOpeningSupportChat, setIsOpeningSupportChat] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadFaq = async () => {
        try {
          await getFaq();
        } catch (error) {
          console.error("support faq error:", error);
        }
      };

      loadFaq();
    }, [getFaq])
  );

  const handleOpenSupportChat = useCallback(async () => {
    try {
      setIsOpeningSupportChat(true);
      const result = await chatService.createSupportChat();
      router.push({
        pathname: "/screens/profile/settings/help-chat",
        params: {
          roomId: result.roomId,
          chatRoomName: result.room?.name || "Support Chat",
        },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to open support chat");
    } finally {
      setIsOpeningSupportChat(false);
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        className="capitalize bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
        onPressBack={() => router.back()}
        title="Help and Support"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mx-5 flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text
          className={`mt-5 font-proximanova-regular text-xs leading-5 ${isDark ? "text-dark-primary" : "text-primary"
            }`}
        >
          Track your shifts, manage your team, and grow your work journey, all in
          one place with Hiruu. Whether you are getting started or already a pro,
          help is available here.
        </Text>

        <Text
          className={`mt-2 font-proximanova-regular text-xs ${isDark ? "text-dark-primary" : "text-primary"
            }`}
        >
          Have a question?
        </Text>

        <Text
          className={`mt-5 font-proximanova-semibold text-base ${isDark ? "text-dark-primary" : "text-primary"
            }`}
        >
          FAQs
        </Text>

        <Text
          className={`mt-2 font-proximanova-regular text-xs ${isDark ? "text-dark-primary" : "text-primary"
            }`}
        >
          Quick solutions for common issues.
        </Text>

        {isLoadingFaq ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={isDark ? "#fff" : "#111"} />
          </View>
        ) : faqItems.length > 0 ? (
          <View className="pt-3">
            {faqItems.map((item, index) => (
              <View key={item.id} className={index === 0 ? "" : "mt-8"}>
                <Text
                  className={`font-proximanova-semibold text-sm ${isDark ? "text-dark-primary" : "text-primary"
                    }`}
                >
                  {item.order}. {item.question}
                </Text>
                <Text
                  className={`mt-1.5 font-proximanova-regular text-xs leading-5 ${isDark ? "text-dark-primary" : "text-primary"
                    }`}
                >
                  {item.answer}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text
            className={`mt-5 font-proximanova-regular text-xs ${isDark ? "text-dark-primary" : "text-primary"
              }`}
          >
            No FAQ found.
          </Text>
        )}
      </ScrollView>

      <View className="flex-row justify-between gap-3 my-8 mx-5">
        <TouchableOpacity
          onPress={handleOpenSupportChat}
          disabled={isOpeningSupportChat}
          className="rounded-full border border-[#11111133] py-2.5 px-5 flex-1 flex-row gap-1.5 items-center justify-center"
        >
          {isOpeningSupportChat ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <AntDesign name="message" size={18} color="black" />
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                Chat with us
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="rounded-full border border-[#11111133] py-2.5 px-5 flex-1 flex-row gap-1.5 items-center justify-center">
          <Fontisto name="email" size={18} color="black" />
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
            Email us
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HelpSupport;
