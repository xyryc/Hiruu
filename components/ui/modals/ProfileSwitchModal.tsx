import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import { ProfileSwitchModalProps } from "@/types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileSwitchModal = ({
  visible,
  onClose,
  onSelectUserProfile,
  onSelectBusinessProfile,
}: ProfileSwitchModalProps) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(user ?? null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const hasLoadedOnceRef = useRef(false);
  const getProfile = useProfileStore((state) => state.getProfile);
  const {
    myEmployments,
    myEmploymentsLoading,
    getMyEmployments,
    selectedBusinesses,
  } = useBusinessStore();
  const selectedBusinessId = selectedBusinesses[0] || null;
  const hasProfile = Boolean(profile);

  useEffect(() => {
    if (!profile && user) {
      setProfile(user);
    }
  }, [profile, user]);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    const loadData = async () => {
      const shouldFetchProfile = !hasLoadedOnceRef.current && !hasProfile;
      // Always refresh employments when modal opens so profile switch list
      // reflects recently created/deleted businesses immediately.
      const shouldFetchEmployments = true;

      if (!shouldFetchProfile && !shouldFetchEmployments) return;

      if (shouldFetchProfile) {
        setIsProfileLoading(true);
      }
      try {
        await Promise.all([
          shouldFetchProfile
            ? getProfile()
              .then((result) => {
                console.log(
                  "[ProfileSwitchModal] getProfile raw response",
                  JSON.stringify(result, null, 2)
                );
                if (isMounted) {
                  setProfile(result.data);
                }
              })
              .catch(() => undefined)
            : Promise.resolve(),
          shouldFetchEmployments
            ? getMyEmployments(false).catch(() => undefined)
            : Promise.resolve(),
        ]);
        if (isMounted) {
          hasLoadedOnceRef.current = true;
        }
      } catch {
        // keep modal usable even if profile fetch fails
      } finally {
        if (isMounted && shouldFetchProfile) {
          setIsProfileLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [visible, getMyEmployments, getProfile, hasProfile]);

  const employmentEntries = (Array.isArray(myEmployments) ? myEmployments : [])
    .reduce((acc: any[], employment: any) => {
      const businessId = employment?.business?.id || employment?.businessId;
      if (!businessId) return acc;
      const existingIndex = acc.findIndex(
        (item) => (item?.business?.id || item?.businessId) === businessId
      );

      if (existingIndex === -1) {
        return [...acc, employment];
      }

      const existingEmployment = acc[existingIndex];
      const nextStatus = String(employment?.status || "").toLowerCase();
      const existingStatus = String(existingEmployment?.status || "").toLowerCase();

      if (nextStatus === "active" && existingStatus !== "active") {
        const next = [...acc];
        next[existingIndex] = employment;
        return next;
      }

      return acc;
    }, []);
  const sheetHeight = Math.round(windowHeight * 0.6);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />

        <View className="relative">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2 z-10">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View
            className="bg-white rounded-t-3xl overflow-hidden"
            style={{ height: sheetHeight }}
          >
            <SafeAreaView edges={["bottom"]} className="px-6 py-7 flex-1 bg-white">
              <Text className="font-proximanova-bold text-xl text-center text-primary">
                {t("user.profile.switchProfile")}
              </Text>

              {isProfileLoading ? (
                <View className="mt-6 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center">
                  <View className="h-[34px] w-[34px] rounded-full bg-[#E5E7EB]" />
                  <View className="flex-1 ml-3">
                    <View className="h-4 w-28 rounded-md bg-[#E5E7EB]" />
                    <View className="h-3 w-40 rounded-md bg-[#E5E7EB] mt-2" />
                  </View>
                  <View className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onSelectUserProfile}
                  className="mt-6 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center"
                >
                  <Image
                    source={profile?.avatar || require("@/assets/images/placeholder.png")}
                    style={{ width: 34, height: 34, borderRadius: 999 }}
                    contentFit="cover"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="font-proximanova-semibold text-primary">
                      {profile?.name ||
                        t("user.profile.userProfileLabel", { defaultValue: "User profile" })}
                    </Text>
                    {!!profile?.email && (
                      <Text className="text-xs text-secondary">{profile.email}</Text>
                    )}
                  </View>

                  {selectedBusinessId === null && (
                    <Ionicons name="checkmark-circle" size={24} color="#4FB2F3" />
                  )}
                </TouchableOpacity>
              )}

              <Text className='font-proximanova-medium text-lg mt-3'>{t("user.profile.yourBusinessProfiles")}</Text>

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
              >
                {myEmploymentsLoading ? (
                  <>
                    {Array.from({ length: 3 }, (_, index) => (
                      <View
                        key={`profile-switch-skeleton-${index}`}
                        className="mt-3 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center"
                      >
                        <View className="h-[34px] w-[34px] rounded-full bg-[#E5E7EB]" />
                        <View className="flex-1 ml-3">
                          <View className="h-4 w-40 rounded-md bg-[#E5E7EB]" />
                          <View className="h-3 w-28 rounded-md bg-[#E5E7EB] mt-2" />
                        </View>
                        <View className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                      </View>
                    ))}
                  </>
                ) : null}

                {!myEmploymentsLoading && employmentEntries.length === 0 && (
                  <Text className="text-center text-sm text-secondary py-4">
                    {t("user.profile.noBusinessesFound")}
                  </Text>
                )}

                {employmentEntries.map((employment: any) => {
                  const business = employment?.business || {};
                  const roleName = employment?.role?.role?.name || "";
                  const roleMissing = !employment?.role;
                  const businessStatus = String(
                    business?.status || employment?.status || ""
                  ).toLowerCase();
                  const isClosedBusiness = businessStatus === "closed";
                  const isSwitchDisabled = roleMissing;
                  const helperText = roleMissing
                    ? t("user.profile.roleNotAssignedYet")
                    : roleName
                      ? roleName
                      : "";

                  return (
                    <TouchableOpacity
                      key={employment?.id || business?.id}
                      onPress={() => {
                        if (isSwitchDisabled) return;
                        if (isClosedBusiness) {
                          onClose();
                          router.push({
                            pathname: "/screens/profile/settings/reopen-business",
                            params: { businessId: business.id },
                          });
                          return;
                        }
                        onSelectBusinessProfile(business.id);
                      }}
                      disabled={isSwitchDisabled}
                      className={`mt-3 border border-[#EEEEEE] rounded-xl px-4 py-3 flex-row items-center ${isSwitchDisabled ? "opacity-60" : ""
                        }`}
                    >
                      <Image
                        source={business.logo || require("@/assets/images/placeholder.png")}
                        style={{ width: 34, height: 34, borderRadius: 999 }}
                        contentFit="cover"
                      />
                      <View className="flex-1 ml-3">
                        <Text className="font-proximanova-semibold text-primary">
                          {business.name}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2 flex-wrap">
                          {!!helperText && (
                            <Text className="text-xs text-secondary" numberOfLines={1}>
                              {helperText}
                            </Text>
                          )}
                          {isClosedBusiness ? (
                            <View className="px-2 py-0.5 rounded-full bg-[#F34F4F1A]">
                              <Text className="text-[10px] font-proximanova-semibold text-[#F34F4F]">
                                {t("common.closed")}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {isSwitchDisabled ? (
                        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                      ) : selectedBusinessId === business.id ? (
                        <Ionicons name="checkmark-circle" size={24} color="#4FB2F3" />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color="black" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ProfileSwitchModal;
