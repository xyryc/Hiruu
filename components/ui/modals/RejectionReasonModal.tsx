import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StatusBadge from "../badges/StatusBadge";

const RejectionReasonModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View>
      {/* Button to open modal */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="flex-row items-center pb-1 justify-between rounded-full bg-white"
      >
        <View className="flex-row gap-1 mt-2.5">
          <Text className="font-proximanova-semibold text-sm text-[#F34F4F]">
            Rejection Reason
          </Text>
          <Text className="font-proximanova-semibold text-sm">
            : Not enough staff available
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-white dark:bg-dark-surface rounded-t-3xl py-8 px-5 relative items-center">
              {/* Close button centered */}
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                className="absolute -top-16 right-1/2  p-3 rounded-full bg-[#00000080] dark:bg-gray-700"
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>

              {/* Content */}
              <View className="w-full ">
                <View className="flex-row justify-between gap-4 mx-1">
                  <View className="flex-row gap-2.5 items-center">
                    <Image
                      source="https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg"
                      contentFit="contain"
                      style={{ height: 35, width: 35 }}
                    />
                    <Text className="font-proximanova-regular text-base dark:text-white">
                      Hapiness Bar
                    </Text>
                  </View>
                  <View className=" bg-[#E5F4FD] p-3 rounded-full ">
                    <Image
                      source={require("@/assets/images/messages-fill.svg")}
                      contentFit="contain"
                      style={{ height: 24, width: 24, tintColor: "" }}
                    />
                  </View>
                </View>
                <View className="flex-row justify-between gap-4 mx-1 mt-8">
                  <View>
                    <Text className="text-[#7A7A7A] dark:text-white font-proximanova-regular text-sm mt-2">
                      From:
                    </Text>
                    <Text className="dark:text-white font-proximanova-semibold text-sm mt-2">
                      Apr 28, 2025{" "}
                    </Text>
                    <Text className="text-[#7A7A7A] dark:text-white font-proximanova-regular text-sm mt-2">
                      Submitted On:
                    </Text>
                    <Text className="dark:text-white font-proximanova-semibold text-sm mt-2">
                      Apr 28, 2025
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[#7A7A7A] dark:text-white font-proximanova-regular text-sm mt-2">
                      To:
                    </Text>
                    <Text className="dark:text-white font-proximanova-semibold text-sm mt-2">
                      Apr 29, 2025
                    </Text>
                    <Text className="text-[#4FB2F3] dark:text-white font-proximanova-semibold text-sm mt-2">
                      Type:
                    </Text>
                    <Text className="dark:text-white font-proximanova-semibold text-sm mt-2">
                      Casual Leave
                    </Text>
                  </View>
                </View>
                <View className="mx-1">
                  <Text className="text-[#4FB2F3] dark:text-white font-proximanova-semibold text-sm mt-4">
                    Reason:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                    I need to attend my sister’s wedding ceremony in Chicago.
                    travel arrangements have been made, and I&apos;ll be back to work
                    on Monday{" "}
                  </Text>
                </View>
                <View className="mx-1 bg-[#F34F4F1A] p-4 rounded-3xl mt-4">
                  <Text className=" font-proximanova-regular text-sm">
                    <Text className="text-[#F34F4F] font-proximanova-semibold">
                      Rejection Reason
                    </Text>
                    : High store traffic and overlapping team leaves — unable to
                    approve. Please coordinate new dates with your team lead.
                  </Text>
                </View>
                <View className="flex-row justify-between mx-1 mt-8 ">
                  <Text className="font-proximanova-regular text-sm">
                    Rejected on apr 30, 2025
                  </Text>
                  <StatusBadge status="rejected" />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default RejectionReasonModal;
