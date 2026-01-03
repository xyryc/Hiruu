import { Entypo, Fontisto, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";
import SmallButton from "../buttons/SmallButton";
import BusinessDropdown from "../dropdown/BusinessDropdown";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BusinessOfferModal = ({ visible, onClose }: any) => {
  const [showDetails, setShowDetails] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();
  const [selectedLeave, setSelectedLeave] = useState<string>("");

  useEffect(() => {
    if (showDetails) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_WIDTH);
    }
  }, [showDetails]);

  const handleDone = () => {
    if (showDetails) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowDetails(false);
        onClose();
      });
    } else {
      onClose();
    }
  };

  const handleApplyNow = () => {
    setShowDetails(true);
  };

  const handleBackToJobBoard = () => {
    handleDone();
    setShowDetails(false);
    // router.replace("/(tabs)/business-jobs");
  };

  // Sample data
  const businessData = [
    {
      label: "Hapiness bar",
      value: "hb",
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

  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [role, setRole] = useState("");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* image */}
              <Image
                source={
                  "https://media.licdn.com/dms/image/v2/D5603AQFMeZ7i9ybZgw/profile-displayphoto-shrink_200_200/B56ZS29wLQHwAY-/0/1738236429558?e=2147483647&v=beta&t=RTX-UGEWSzuEb-Gv2bqXqREzQX15FMKi0TK1HJBAKuE"
                }
                style={{
                  width: 100,
                  height: 100,
                  marginHorizontal: "auto",
                  borderRadius: 999,
                }}
                contentFit="cover"
              />

              {/* name */}
              <Text className="text-xl text-center font-proximanova-semibold text-primary dark:text-dark-primary mt-2.5">
                Md Talath Un Nabi Anik
              </Text>

              {/* location */}
              <View className="flex-row items-center justify-center mt-2.5 gap-7">
                <View className="flex-row items-center gap-2.5 border-r-hairline border-[#7A7A7A] pr-7">
                  <SimpleLineIcons
                    name="location-pin"
                    size={20}
                    color="#7A7A7A"
                  />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    New York, North Bergen
                  </Text>
                </View>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  4.8/5 <Fontisto name="star" size={14} color="#F1C400" />
                </Text>
              </View>

              {/* note */}
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                To apply for this job, please share Details so the business can
                contact you.
              </Text>

              {/* business */}
              <View className="mb-7">
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Business
                </Text>

                <BusinessDropdown
                  placeholder="Choose a business"
                  options={businessData}
                  value={selectedBusiness}
                  onSelect={(value: any) => setSelectedBusiness(value)}
                />
              </View>

              <View className="mb-7">
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Role
                </Text>

                <TextInput
                  placeholder="Enter Email"
                  value={role}
                  onChangeText={setRole}
                  className="px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="font-proximanova-semibold text-sm text-primary mb-2.5">
                  Salary Per Hour
                </Text>

                <View className="flex-row gap-3">
                  <TextInput
                    placeholder="Min: $5"
                    value={role}
                    onChangeText={setRole}
                    className="w-[48%] px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <TextInput
                    placeholder="Max: $10"
                    value={role}
                    onChangeText={setRole}
                    className="w-[48%] px-4 py-3.5 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A] placeholder:font-proximanova-regular text-sm"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* button */}
              <PrimaryButton
                title="Apply Now"
                className="mt-7"
                onPress={handleApplyNow}
              />
            </ScrollView>
          </SafeAreaView>

          {/* Details Screen - Slides from Right */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <SafeAreaView
              edges={["bottom"]}
              className="flex-1 px-5 py-7 justify-center"
            >
              <Image
                source={require("@/assets/images/complete.svg")}
                style={{
                  width: 156,
                  height: 120,

                  alignSelf: "center",
                }}
                contentFit="cover"
              />

              <Text className="text-center text-lg font-proximanova-semibold mt-3 mb-2">
                Offer sent successfully!
              </Text>

              {/* note */}
              <Text className="w-4/6 mx-auto text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2.5">
                You sent offer to Md Talath Un Nabi Anik. He may contact you
                soon. Good luck!
              </Text>

              <View>
                <SmallButton
                  onPress={handleBackToJobBoard}
                  className="bg-white border-hairline mt-5"
                  title="Back to Job Board"
                  textClass="!text-primary"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default BusinessOfferModal;
