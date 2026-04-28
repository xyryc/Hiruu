import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type ColleagueItem = {
  employmentId: string;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
  role?: {
    id?: string;
    systemRoleId?: string;
    name?: string;
  } | null;
};

const ColleagueCardSkeleton = () => {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3 rounded-xl border border-[#EEEEEE] mb-2">
      <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
      <View className="flex-1">
        <View className="h-4 w-32 rounded-md bg-[#E5E7EB]" />
        <View className="h-3 w-24 rounded-md bg-[#E5E7EB] mt-2" />
      </View>
      <View className="w-5 h-5 rounded-full bg-[#E5E7EB]" />
    </View>
  );
};

const TransferOwnership = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessColleagues = useShiftStore((state) => state.getBusinessColleagues);
  const currentUser = useAuthStore((state) => state.user);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [colleagues, setColleagues] = useState<ColleagueItem[]>([]);
  const [selectedColleague, setSelectedColleague] = useState<ColleagueItem | null>(null);

  const businessId = selectedBusinesses?.[0] || "";

  const loadColleagues = useCallback(async () => {
    if (!businessId) {
      toast.error(t("user.profile.businessProfile.businessFallback"));
      return;
    }

    try {
      setLoading(true);
      const response = await getBusinessColleagues(businessId);
      const filtered = (Array.isArray(response) ? response : []).filter(
        (item) => item?.userId && item.userId !== currentUser?.id
      );
      setColleagues(filtered);
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to load colleagues")
      );
      setColleagues([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, currentUser?.id, getBusinessColleagues, t]);

  const openPicker = async () => {
    setPickerVisible(true);
    if (colleagues.length === 0) {
      await loadColleagues();
    }
  };

  const filteredColleagues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((item) => {
      const name = String(item?.user?.name || "").toLowerCase();
      const role = String(item?.role?.name || "").toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [colleagues, searchQuery]);

  const selectedName =
    selectedColleague?.user?.name ||
    t("user.profile.transferOwnership.selectColleague");

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        className="mx-5 my-2.5"
        onPressBack={() => router.back()}
        title={t("user.profile.transferOwnership.title")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <View className="px-5 pt-2">
        <Text className="text-sm text-secondary dark:text-dark-secondary">
          {t("user.profile.transferOwnership.description")}
        </Text>

        <TouchableOpacity
          onPress={() => void openPicker()}
          className="mt-5 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row justify-between items-center"
        >
          <View className="flex-row items-center gap-2.5 flex-1">
            {selectedColleague?.user?.avatar ? (
              <Image
                source={selectedColleague.user.avatar}
                contentFit="cover"
                style={{ width: 28, height: 28, borderRadius: 999 }}
              />
            ) : (
              <View className="w-7 h-7 rounded-full bg-[#E5E7EB]" />
            )}
            <Text
              className={`text-sm ${selectedColleague ? "text-primary dark:text-dark-primary font-proximanova-semibold" : "text-secondary dark:text-dark-secondary font-proximanova-regular"}`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedName}
            </Text>
          </View>

          <Entypo name="chevron-down" size={18} color="#7A7A7A" />
        </TouchableOpacity>

        <View className="mt-4 p-4 rounded-xl bg-[#FFF4E5] border border-[#F5C585]">
          <View className="flex-row items-center gap-2">
            <Ionicons name="warning-outline" size={16} color="#B45309" />
            <Text className="font-proximanova-semibold text-sm text-[#92400E]">
              {t("user.profile.transferOwnership.warningTitle")}
            </Text>
          </View>
          <Text className="mt-2 font-proximanova-regular text-sm text-[#92400E]">
            {t("user.profile.transferOwnership.warningDescription")}
          </Text>
        </View>

        <PrimaryButton
          className="mt-6"
          title={t("user.profile.transferOwnership.proceed")}
          disabled={!selectedColleague}
          onPress={() =>
            toast.message(t("user.profile.transferOwnership.apiPending"))
          }
        />
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View className="flex-1 bg-[#00000066] justify-end">
          <View className="bg-white rounded-t-3xl max-h-[75%]">
            <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <View className="bg-[#000] rounded-full p-2.5">
                  <Entypo name="cross" size={30} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-7 pb-3">
              <Text className="font-proximanova-bold text-xl text-primary">
                {t("user.profile.transferOwnership.modalTitle")}
              </Text>
            </View>

            <View className="mx-5 mb-3 flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2">
              <EvilIcons name="search" size={24} color="#666" />
              <TextInput
                placeholder={t("common.searchHere")}
                className="ml-2 flex-1 py-1.5 text-primary dark:text-dark-primary"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
                returnKeyType="search"
              />
            </View>

            {loading ? (
              <View pointerEvents="none" className="px-5 pb-5">
                <AutoSkeletonView isLoading={true} defaultRadius={12}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <ColleagueCardSkeleton key={`colleague-skeleton-${i}`} />
                  ))}
                </AutoSkeletonView>
              </View>
            ) : (
              <FlatList
                data={filteredColleagues}
                keyExtractor={(item) => item.employmentId}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                ListEmptyComponent={
                  <View className="pt-8">
                    <StatusStateCard
                      image={require("@/assets/images/male.svg")}
                      title={t("user.profile.transferOwnership.emptyTitle")}
                      text={t("user.profile.transferOwnership.emptyText")}
                    />
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedColleague?.employmentId === item.employmentId;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedColleague(item);
                        setPickerVisible(false);
                      }}
                      className={`flex-row items-center gap-3 px-4 py-3 rounded-xl border mb-2 ${isSelected ? "border-[#4FB2F3] bg-[#E5F4FD]" : "border-[#EEEEEE]"}`}
                    >
                      <Image
                        source={item?.user?.avatar || require("@/assets/images/placeholder.png")}
                        contentFit="cover"
                        style={{ width: 40, height: 40, borderRadius: 999 }}
                      />
                      <View className="flex-1">
                        <Text className="font-proximanova-semibold text-base text-primary">
                          {item?.user?.name || t("common.user")}
                        </Text>
                        <Text className="text-xs text-secondary">
                          {item?.role?.name || t("user.profile.roleNotAssignedYet")}
                        </Text>
                      </View>

                      {isSelected ? (
                        <Ionicons name="checkmark-circle-sharp" size={22} color="#4FB2F3" />
                      ) : (
                        <View className="w-5 h-5 rounded-full border border-[#9CA3AF]" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransferOwnership;
