import { formatShortDateInTimezone } from "@/utils/date";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBadge from "../badges/StatusBadge";

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

const LeaveRequestApprovalModal = ({ visible, onClose, reject, request }: any) => {
  const handleDone = () => {
    onClose();
  };

  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { key: "leaves", label: "Too many employees on leave" },
    { key: "priority", label: "Business priority day" },
    { key: "notice", label: "Insufficient notice" },
    { key: "other", label: "Other" },
  ];

  const requester = request?.employment?.user || {};
  const role = request?.employment?.role?.role?.name || "Unassigned";
  const avatar =
    resolveMediaUrl(requester?.avatar) ||
    require("@/assets/images/placeholder.png");
  const startDate = request?.startDate
    ? formatShortDateInTimezone(request.startDate)
    : "Apr 20, 2025";
  const endDate = request?.endDate
    ? formatShortDateInTimezone(request.endDate)
    : startDate;
  const submittedOn = request?.createdAt
    ? formatShortDateInTimezone(request.createdAt)
    : "Apr 20, 2025";
  const approvedOn = request?.approvedAt
    ? formatShortDateInTimezone(request.approvedAt)
    : "Apr 20, 2025";
  const leaveType = request?.leaveType || "leave";
  const reason = request?.reason || "No reason provided";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <View className="items-center"></View>

            {reject && (
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mb-8">
                Add Rejection Reason
              </Text>
            )}
            {/* headers */}
            <View className="flex-row gap-2 items-center">
              <Image
                source={avatar}
                contentFit="cover"
                style={{ height: 40, width: 40, borderRadius: 999 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {requester?.name || "Unknown User"}
                </Text>
                <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                  {role}
                </Text>
              </View>
            </View>

            {/* date */}
            <View className="flex-row justify-between mt-8">
              <View>
                <View>
                  <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                    From:
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    {startDate}
                  </Text>
                </View>
                <View className="mt-4">
                  <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                    Submitted On:
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    {submittedOn}
                  </Text>
                </View>
              </View>
              <View>
                <View>
                  <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                    To:
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    {endDate}
                  </Text>
                </View>
                <View className="mt-4">
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                    Type:
                  </Text>
                  <Text className="capitalize font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    {leaveType}
                  </Text>
                </View>
              </View>
            </View>

            {/* details */}
            {reject || (
              <View className="mt-4">
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                  Reason:
                </Text>
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  {reason}
                </Text>
              </View>
            )}

            {/* status button and date */}

            {reject || (
              <View className="flex-row justify-between mt-9 items-center mb-4 ">
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  Approved on {approvedOn}
                </Text>
                <StatusBadge status="approved" />
              </View>
            )}

            {/* radio button */}
            {reject && (
              <View>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      setSelected(selected === option.key ? null : option.key)
                    }
                    className="flex-row items-center mt-4 gap-2"
                  >
                    <View
                      className={`h-6 w-6 border rounded-full flex-row justify-center items-center ${selected === option.key ? "bg-primary" : ""
                        }`}
                    >
                      {selected === option.key && (
                        <Ionicons
                          name="checkmark-outline"
                          size={17}
                          color="white"
                        />
                      )}
                    </View>
                    <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View className="mt-4">
                  <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
                    Rejection Reason
                  </Text>
                  <View className="bg-white  dark:bg-dark-surface rounded-xl border border-[#EEEEEE] dark:border-dark-border overflow-hidden">
                    <TextInput
                      className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary min-h-[120px]"
                      placeholder="Please explain why this leave request is being denied..."
                      placeholderTextColor="#7D7D7D"
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>
                <Text className="mt-8 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary ">
                  This reason will be visible to the employee
                </Text>
                {/* Footer Buttons */}
                <View className="mt-5">
                  <View className="flex-row gap-3">
                    <TouchableOpacity className="flex-1 border border-[#11111133] rounded-full py-4">
                      <Text className="text-center text-gray-700 font-semibold text-base">
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`flex-1 rounded-full py-4 bg-[#F34F4F]`}
                    >
                      <Text
                        className={`text-center font-semibold text-base text-white`}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default LeaveRequestApprovalModal;
