import { Entypo, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

type PreviewRole = {
  roleName: string;
  count: number;
};

type PreviewTemplateData = {
  templateName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  breakTimeRange: string;
  totalStaff: number;
  roles: PreviewRole[];
  businessName: string;
  businessLogo?: string;
};

type PreviewTemplateModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  loading?: boolean;
  data: PreviewTemplateData;
};

const PreviewTemplateModal = ({
  visible,
  onClose,
  onApply,
  loading = false,
  data,
}: PreviewTemplateModalProps) => {
  const handleDone = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              Preview Template
            </Text>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5 text-center">
              Review your template settings before saving
            </Text>

            <View className="border my-7 border-[#eeeeee] rounded-xl px-4">
              <View className="relative items-center">
                <Image
                  source={require("@/assets/images/timer-bg.svg")}
                  contentFit="contain"
                  style={{
                    height: 32,
                    width: 210,
                    tintColor: "#EEEEEE",
                    marginTop: -2,
                  }}
                />
                <View className="absolute flex-row gap-3 mt-1.5">
                  <Text className="font-proximanova-bold text-primary dark:text-dark-primary text-center ">
                    {data?.templateName || "Template"}
                  </Text>
                  <Feather name="edit-2" size={16} color="black" />
                </View>
              </View>

              {/* time box */}
              <View>
                <View className="flex-row justify-between items-center mt-3.5 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Start Time:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    {data?.shiftStartTime || "--:--"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-4 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    End Time:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    {data?.shiftEndTime || "--:--"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-4 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Break Time:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    {data?.breakTimeRange || "--:-- - --:--"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-4 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Total Staff:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    {data?.totalStaff || 0}
                  </Text>
                </View>

                <View className="flex-row justify-between items-start mt-3">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Roles:
                  </Text>

                  <View className="flex-row flex-wrap gap-2 justify-end flex-1 ml-3">
                    {(data?.roles || []).length > 0 ? (
                      data.roles.map((role, index) => (
                        <Text
                          key={`${role.roleName}-${index}`}
                          className="h-7 font-proximanova-regular text-sm text-primary dark:text-dark-primary bg-[#f5f5f5] rounded-full px-2.5 py-1.5 "
                        >
                          {role.count} {role.roleName}
                        </Text>
                      ))
                    ) : (
                      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        No roles added
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <Image
                source={require("@/assets/images/dotted-line.svg")}
                contentFit="fill"
                style={{ width: "100%", height: 1, marginTop: 15 }}
              />

              <View className="flex-row gap-2 items-center my-2.5">
                <Image
                  source={
                    data?.businessLogo
                      ? { uri: data.businessLogo }
                      : require("@/assets/images/adaptive-icon.png")
                  }
                  contentFit="contain"
                  style={{ width: 30, height: 30, borderRadius: 999 }}
                />
                <Text className="font-proximanova-regular  text-secondary dark:text-dark-secondary">
                  {data?.businessName || "Business"}
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Apply Template"
              className="mt-5"
              loading={loading}
              disabled={loading}
              onPress={onApply}
            />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default PreviewTemplateModal;
