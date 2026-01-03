import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import JobApplyModal from "@/components/ui/modals/JobApplyModal";
import {
  Feather,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JobProfile = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Check out Md Talath Un Nabi Anik's profile on Hiruu!\nhttps://hiruu.com/profile/mohammad-anik",
        title: "Md Talath Un Nabi Anik's Profile",
      });
    } catch (error) {
      Alert.alert("Error", "Could not share profile");
    }
  };

  return (
    <SafeAreaView
      className="bg-[#E5F4FD] dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader
        className="mx-5 pb-20"
        title=""
        components={
          <Ionicons
            onPress={() => handleShare()}
            className="p-2 bg-white rounded-full"
            name="share-outline"
            size={20}
            color="black"
          />
        }
      />

      {/* content */}
      <View className="bg-white">
        {/* profile */}
        <View className="absolute -top-16 inset-x-0">
          {/* profile image */}
          <View className="border-2 border-[#11293A] rounded-full mx-auto p-1">
            <Image
              source="https://images-platform.99static.com//gkoGE5-VZ1k4SXxg0mrUj7O0V38=/250x0:1750x1500/fit-in/500x500/99designs-contests-attachments/102/102585/attachment_102585463"
              style={{
                width: 100,
                height: 100,
                borderRadius: 999,
              }}
              contentFit="cover"
            />
          </View>

          {/* name */}
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-center mt-4">
            Farout Beach Club{" "}
            <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
          </Text>

          <View className="flex-row items-center justify-center mt-2.5 gap-7">
            <View className="flex-row items-center gap-2.5 border-r-hairline border-[#7A7A7A] pr-7">
              <SimpleLineIcons name="location-pin" size={14} color="#7A7A7A" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                New York, North Bergen
              </Text>
            </View>

            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              4.8/5 <Fontisto name="star" size={14} color="#F1C400" />
            </Text>
          </View>
        </View>

        <ScrollView
          className="mt-40 mx-5"
          contentContainerStyle={{
            paddingBottom: 300,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Job Description
          </Text>

          {/* about the role */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="file-document-check-outline"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                About the Role
              </Text>
            </View>

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
              Join the core team at Space Hotel, a unique dining experience
              known for its space-themed interiors and premium service.....Read
              More
            </Text>
          </View>

          {/* key info */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Octicons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="repo-forked"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Key Info
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2.5 mt-2.5">
              <SimpleStatusBadge title="Hiring: Bartender" bgColor="#F5F5F5" />
              <SimpleStatusBadge title="Gender: Male" bgColor="#F5F5F5" />
              <SimpleStatusBadge title="Experience: 1 Year" bgColor="#F5F5F5" />
              <SimpleStatusBadge
                title="Location: 845, junior street, plaisis"
                bgColor="#F5F5F5"
              />
              <SimpleStatusBadge title="Age: 18-25" bgColor="#F5F5F5" />
              <SimpleStatusBadge
                title="Shift: 10:00 AM – 11:00 PM"
                bgColor="#F5F5F5"
              />
              <SimpleStatusBadge title="Salary: 5-10$/hr" bgColor="#F5F5F5" />
            </View>
          </View>

          {/* hiring manager */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Feather
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="user"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Hiring Manager
              </Text>
            </View>

            {/* profile */}
            <View className="bg-[#4FB2F3] p-2.5 rounded-xl flex-row justify-between items-center mt-4">
              <View className="flex-row items-center gap-2.5">
                <Image
                  source="https://i0.wp.com/ridethewave.co/wp-content/uploads/2023/11/RTW0041-Edit_websize.jpg?resize=739%2C924&ssl=1"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                  }}
                  contentFit="cover"
                />
                <Text className="font-proximanova-bold text-white">
                  Meclizine Johnsen
                </Text>
              </View>

              <View className="bg-white rounded-full p-2">
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>

          {/* Contact Us On */}
          <View className="mt-7">
            <View className="flex-row items-center gap-2">
              <Ionicons
                className="p-2 bg-[#E5F4FD] rounded-full"
                name="call-outline"
                size={18}
                color="black"
              />
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Contact Us On
              </Text>
            </View>

            {/* socials */}
            <View className="mt-4 border-hairline border-[#EEEEEE] rounded-xl">
              {/* facebook */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/facebook2.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  @alvarez_f
                </Text>
              </View>

              {/* linkedin */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/linkedin.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  in/albert-flore-12562f25
                </Text>
              </View>

              {/* whatsapp */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/whatsapp.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  +1(125) 256 25612
                </Text>
              </View>

              {/* twitter */}
              <View className="flex-row justify-between items-center p-3 border-b-hairline border-[#EEEEEE]">
                <TouchableOpacity className="flex-row items-center gap-1.5">
                  <Image
                    style={{
                      height: 36,
                      width: 36,
                    }}
                    source={require("@/assets/images/twitter.svg")}
                    contentFit="contain"
                  />

                  <Text className="text-sm font-proximanova-semibold">
                    Facebook
                  </Text>
                </TouchableOpacity>

                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  @alber256
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            className="mt-7"
            title="Apply This Job"
            onPress={() => setShowModal(true)}
          />
        </ScrollView>
      </View>

      <JobApplyModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
};

export default JobProfile;
