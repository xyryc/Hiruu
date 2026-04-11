import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../buttons/PrimaryButton";

const RedeemModal = ({
  visible,
  onClose,
  data,
  namePlate,
  totalTokens = 0,
  coinPrice = 0,
  isOwned = false,
  isEquipped = false,
  ownedExpiry = null,
  onConfirm,
  confirming = false,
}: any) => {
  const handleDone = () => {
    onClose?.();
  };
  const detailsTitle = data?.detailsTitle || "Reward Details";
  const details = Array.isArray(data?.details) ? data.details.filter(Boolean) : [];
  const confirmTitle = data?.confirmTitle || "Confirm & Apply";
  const cardBgColor = data?.cardBgColor || "#EFF9FF";
  const options = Array.isArray(data?.options) ? data.options : [];
  const selectedOptionId = data?.selectedOptionId;
  const onSelectOption = data?.onSelectOption;
  const showSelectUser = Boolean(data?.showSelectUser);
  const selectUserLabel = data?.selectUserLabel || "Select a user to gift";
  const selectUserAvatar = data?.selectUserAvatar;
  const onPressSelectUser = data?.onPressSelectUser;
  const showSelectBusiness = Boolean(data?.showSelectBusiness);
  const selectBusinessTrigger = data?.selectBusinessTrigger;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 py-7">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              Ready to Redeem?
            </Text>

            <View className="flex-row items-center mx-auto mt-3">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{ width: 22, height: 22 }}
                contentFit="contain"
              />
              <View className="px-4 py-1 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
                <Text className="text-xs font-proximanova-semibold">{totalTokens}</Text>
              </View>
            </View>

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary text-center mt-2.5">
              This action will use your tokens to unlock the selected reward.
              Please confirm to proceed.
            </Text>

            {namePlate ? (
              <View className="mt-5">{namePlate}</View>
            ) : (
              <View
                className="rounded-xl p-2 w-full flex-row items-center -z-40 mt-5"
                style={{ backgroundColor: cardBgColor }}
              >
                <Image
                  source={data?.img}
                  contentFit="contain"
                  style={{ width: 60, height: 60, margin: 15 }}
                />
                <View className="-z-30">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                    {data?.title}
                  </Text>
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary text-sm mt-2.5">
                    {data?.subtitle}
                  </Text>
                  <View className="flex-row items-center mt-3 -z-20">
                    <Image
                      source={require("@/assets/images/hiruu-coin.svg")}
                      style={{ width: 22, height: 22 }}
                      contentFit="contain"
                    />
                    <View className="px-4 py-1 bg-[#ffffff] -ml-3 -z-10 rounded-r-[40px]">
                      <Text className="text-xs font-proximanova-semibold">{data?.coin}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {showSelectUser ? (
              <View className="mt-4">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  Select User
                </Text>

                <TouchableOpacity
                  onPress={onPressSelectUser}
                  activeOpacity={0.8}
                  className="mt-3 flex-row items-center justify-between rounded-2xl border border-[#E7E7E7] bg-white px-2 py-1"
                >
                  <View className="flex-row items-center gap-3">
                    {selectUserAvatar ? (
                      <Image
                        source={selectUserAvatar}
                        style={{ width: 32, height: 32, borderRadius: 999 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons name="person-circle" size={32} color="#B8BEC5" />
                    )}
                    <Text className="font-proximanova-regular text-sm text-secondary">
                      {selectUserLabel}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={16} color="#111111" />
                </TouchableOpacity>
              </View>
            ) : null}

            {showSelectBusiness ? (
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  Select Business
                </Text>
                {selectBusinessTrigger}
              </View>
            ) : null}

            <View className="flex-row gap-1.5 items-center mt-4">
              <Ionicons name="trail-sign" size={14} color="#4FB2F3" />
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                {detailsTitle}
              </Text>
            </View>

            <View className="bg-white rounded-lg ml-4">
              {details.map((item: string, index: number) => (
                <Text
                  key={`${item}-${index}`}
                  className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5"
                >
                  {index + 1}. {item}
                </Text>
              ))}
              {!isOwned && details.length === 0 ? (
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  1. Coin Price: {coinPrice} Tokens
                </Text>
              ) : null}
            </View>

            {options.length > 0 ? (
              <View className="mt-4 ml-4 gap-2">
                {options.map((option: any) => {
                  const isSelected = option?.id === selectedOptionId;
                  return (
                    <TouchableOpacity
                      key={option?.id}
                      onPress={() => onSelectOption?.(option?.id)}
                      className="flex-row items-center gap-3"
                    >
                      <Ionicons
                        name={isSelected ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={isSelected ? "#4FB2F3" : "#9CA3AF"}
                      />

                      <Text
                        className={`text-sm ${isSelected
                          ? "font-proximanova-semibold text-primary"
                          : "font-proximanova-regular text-secondary"
                          }`}
                      >
                        {option?.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {isOwned ? (
              <Text className="font-proximanova-semibold text-sm text-[#2E9B50] text-center mt-5">
                {isEquipped
                  ? "This nameplate is already equipped"
                  : ownedExpiry
                    ? `You already own this nameplate • Expires ${new Date(
                      ownedExpiry
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                    : "You already own this nameplate"}
              </Text>
            ) : null}

            {!isOwned || !isEquipped ? (
              <PrimaryButton
                title={isOwned ? "Apply Nameplate" : confirmTitle}
                className="mt-5"
                onPress={onConfirm}
                loading={confirming}
                disabled={confirming || !onConfirm}
              />
            ) : null}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default RedeemModal;
