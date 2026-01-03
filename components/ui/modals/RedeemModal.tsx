import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../buttons/PrimaryButton";
import BusinessDropdown from "../dropdown/BusinessDropdown";

interface Option {
  label: string;
  value: string;
}

const RedeemModal = ({ visible, onClose, data, namePlate }: any) => {
  const leaveTypes = [
    {
      label: "Sick Leave",
      value: "sick",
      avatar:
        "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
    },
    {
      label: "Personal Leave",
      value: "personal",
      avatar:
        "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
    },
    {
      label: "Work From Home",
      value: "wfh",
      avatar:
        "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
    },
    {
      label: "Emergency Leave",
      value: "emergency",
      avatar:
        "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
    },
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options: Option[] = [
    { label: "6 hours – 1,000 Tokens", value: "6 hours – 1,000 Tokens" },
    { label: "12 hours – 2,000 Tokens", value: "12 hours – 2,000 Tokens" },
    { label: "24 hours – 3,000 Tokens", value: "24 hours – 3,000 Tokens" },
    { label: "42 hours – 4,200 Tokens", value: "42 hours – 4,200 Tokens" },
  ];

  const handleDone = () => {
    onClose();
  };

  const [selectedLeave, setSelectedLeave] = useState<string>("");

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
          <ScrollView
            className="h-[70%] px-5 py-7"
            contentContainerStyle={{
              paddingBottom: 80,
            }}
          >
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              {" "}
              Ready to Redeem?{" "}
            </Text>
            <View className="flex-row items-center mx-auto mt-3">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
              <View className="px-4 py-1 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
                <Text className="text-xs font-proximanova-semibold">540</Text>
              </View>
            </View>

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary text-center mt-2.5">
              {" "}
              This action will use your tokens to unlock the selected reward.
              Please confirm to proceed.
            </Text>

            {/* name plate */}
            {namePlate ? (
              <View className="mt-5">{namePlate}</View>
            ) : (
              <View className="bg-[#EFF9FF]  rounded-xl p-2 w-full flex-row items-center -z-40 mt-5">
                <Image
                  source={data.img}
                  contentFit="contain"
                  style={{ width: 60, height: 60, margin: 15 }}
                />
                <View className="-z-30">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                    {data.title}
                  </Text>
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary text-sm mt-2.5">
                    {data.subtitle}
                  </Text>
                  <View className="flex-row items-center mt-3  -z-20">
                    <Image
                      source={require("@/assets/images/hiruu-coin.svg")}
                      style={{
                        width: 22,
                        height: 22,
                      }}
                      contentFit="contain"
                    />
                    <View className="px-4 py-1 bg-[#ffffff] -ml-3 -z-10 rounded-r-[40px]">
                      <Text className="text-xs font-proximanova-semibold">
                        {data.coin}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {data.tag !== "premium" && (
              <View className="mt-4">
                <BusinessDropdown
                  label="Select User"
                  placeholder="Select a user to gift"
                  options={leaveTypes}
                  value={selectedLeave}
                  onSelect={(value: any) => setSelectedLeave(value)}
                />
              </View>
            )}

            <View className="flex-row gap-1.5 items-center">
              <FontAwesome6
                name="crown"
                className="top-1"
                size={15}
                color="#4FB2F3"
              />
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-4">
                {data.listitle}
              </Text>
            </View>

            <View className="bg-white rounded-lg ">
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                {" "}
                1. {data.list1}
              </Text>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                {" "}
                2. {data.list2}
              </Text>
              {data.list3 && (
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  {" "}
                  3. {data.list3}
                </Text>
              )}
              {data.list4 && (
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  {" "}
                  4. {data.list4}
                </Text>
              )}
              {data.lilst5 && (
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  {" "}
                  5. {data.list5}
                </Text>
              )}
              {data.list6 && (
                <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                  {" "}
                  6. {data.list6}
                </Text>
              )}
            </View>

            {data.tag === "me" && (
              <View className="mt-4 mx-1">
                {options.map((option, index) => (
                  <TouchableOpacity
                    onPress={() => setSelectedOption(option.value)}
                    key={index}
                    className="flex-row gap-2.5 mt-1.5"
                  >
                    <View
                      className={`h-4 w-4 rounded-full border-2 ${selectedOption === option.value ? "border-[#4FB2F3]" : "border-[#7A7A7A80]"} `}
                    >
                      <View
                        className={`${selectedOption === option.value ? "bg-[#4FB2F3] h-2 w-2 rounded-full m-auto" : ""}`}
                      ></View>
                    </View>
                    <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View className="flex-row gap-4 items-center">
              {data.tag === "gift" && (
                <>
                  <AntDesign
                    name="warning"
                    className="top-2"
                    size={20}
                    color="red"
                  />
                  <Text className="font-proximanova-regular text-sm text-[#F34F4F] mt-5">
                    Please select a friend before sending the gift
                  </Text>
                </>
              )}
              {data.tag === "me" && (
                <>
                  <AntDesign
                    name="warning"
                    className="top-2"
                    size={20}
                    color="red"
                  />
                  <Text className="font-proximanova-regular text-sm text-[#F34F4F] mt-5">
                    You don’t have enough tokens to redeem this reward
                  </Text>
                </>
              )}
            </View>

            <PrimaryButton title="Confirm & Apply" className="mt-5" />
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default RedeemModal;
