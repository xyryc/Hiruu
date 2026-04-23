import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import PrimaryButton from "../buttons/PrimaryButton";

const EditBadgeModal = ({ visible, onClose }: any) => {
  const { t } = useTranslation();
  const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [earnedBadges, setEarnedBadges] = React.useState<any[]>([]);

  const getTierUi = (tier?: string) => {
    const normalized = String(tier || "").toLowerCase();
    switch (normalized) {
      case "silver":
        return {
          img: require("@/assets/images/black-bands.svg"),
          bgColor: "#80808026",
          color: "#808080",
        };
      case "gold":
        return {
          img: require("@/assets/images/gold-bands.svg"),
          bgColor: "#F1C40026",
          color: "#F1C400",
        };
      case "diamond":
        return {
          img: require("@/assets/images/blue-bands.svg"),
          bgColor: "#4FB2F326",
          color: "#4FB2F3",
        };
      case "bronze":
      default:
        return {
          img: require("@/assets/images/red-bands.svg"),
          bgColor: "#F3934F26",
          color: "#F3934F",
        };
    }
  };

  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    const loadEarnedBadges = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/badges/my/earned");
        const result = response?.data;
        const list = Array.isArray(result?.data) ? result.data : [];
        if (!mounted) return;
        setEarnedBadges(list);
        const equipped = list
          .filter((item: any) => item?.isEquipped === true)
          .sort(
            (a: any, b: any) =>
              Number(a?.equippedSlot || 0) - Number(b?.equippedSlot || 0)
          )
          .map((item: any) => String(item?.id))
          .slice(0, 3);
        setSelectedCards(equipped);
      } catch (error: any) {
        if (!mounted) return;
        if (isExpectedAuthError(error)) return;
        toast.error(error?.message || t("user.profile.editBadgeModal.failedToLoadEarnedBadges"));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void loadEarnedBadges();

    return () => {
      mounted = false;
    };
  }, [t, visible]);

  const badgeItems = useMemo(() => {
    return earnedBadges.map((badge) => {
      const ui = getTierUi(badge?.tier);
      return {
        id: String(badge?.id || `${badge?.achievementId || ""}-${badge?.tier || ""}`),
        title: String(badge?.achievement?.title || t("user.profile.editBadgeModal.badge")),
        ...ui,
      };
    });
  }, [earnedBadges, t]);

  const badgeRows = useMemo(() => {
    const rows: any[][] = [];
    for (let index = 0; index < badgeItems.length; index += 4) {
      rows.push(badgeItems.slice(index, index + 4));
    }
    return rows;
  }, [badgeItems]);

  const handleCardSelect = (badgeId: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(badgeId)) return prev.filter((id) => id !== badgeId);
      if (prev.length < 3) return [...prev, badgeId];
      return prev;
    });
  };

  const getSelectionNumber = (badgeId: string) => {
    const position = selectedCards.indexOf(badgeId);
    return position !== -1 ? position + 1 : null;
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      const payload = {
        badges: selectedCards.map((id, index) => ({
          id,
          slot: index + 1,
        })),
      };
      const response = await axiosInstance.patch("/badges/toggle", payload);
      const result = response?.data;
      const messageKey = result?.message || "badges_updated_successfully";
      toast.success(translateApiMessage(messageKey));
      onClose();
    } catch (error: any) {
      if (isExpectedAuthError(error)) return;
      toast.error(translateApiMessage(error?.message || t("user.profile.editBadgeModal.failedToSaveBadges")));
    } finally {
      setSaving(false);
    }
  };

  const renderBadgeRow = (items: any[]) => (
    <View className="flex-row gap-4">
      {items.map((item) => {
        const selectionNumber = getSelectionNumber(item.id);
        const isSelected = selectionNumber !== null;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleCardSelect(item.id)}
            className="items-center w-20"
          >
            <View
              className="h-[74px] w-[54px] border-2 rounded-xl justify-center items-center"
              style={{ backgroundColor: item.bgColor, borderColor: item.color }}
            >
              <Image
                source={item.img}
                contentFit="contain"
                style={{ height: 42, width: 29 }}
              />
              {isSelected && (
                <View
                  className="absolute -top-1 -right-1 rounded-full h-5 w-5 items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Text className="text-white font-proximanova-bold text-xs">
                    {selectionNumber}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-center font-proximanova-regular text-xs text-primary dark:text-dark-primary mt-2">
              {item.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-8 py-7">
            <Text className="font-proximanova-bold text-xl mb-7 text-primary dark:text-dark-primary text-center">
              {t("user.profile.editBadgeModal.selectYourBadge")}
            </Text>

            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
            ) : badgeRows.length > 0 ? (
              badgeRows.map((row, index) => (
                <React.Fragment key={`badge-row-${index}`}>
                  {renderBadgeRow(row)}
                </React.Fragment>
              ))
            ) : (
              <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {t("user.profile.editBadgeModal.noEarnedBadgesYet")}
              </Text>
            )}
            <PrimaryButton
              title={saving ? t("user.profile.businessProfile.saving") : t("user.profile.editBadgeModal.save")}
              className="mt-10"
              onPress={handleSave}
              loading={saving}
            />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default EditBadgeModal;
