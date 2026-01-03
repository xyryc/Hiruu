import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import JobCard from "@/components/ui/cards/JobCard";
import RatingBanner from "@/components/ui/cards/RatingBanner";
import RatingProgress from "@/components/ui/cards/RatingProgress";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import {
  EvilIcons,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessProfile = () => {
  const [selectedTab, setSelectedTab] = useState("about");
  const [togolIsOn, setTogolIsOn] = useState(false);
  console.log(selectedTab);

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
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "top"]}
    >
      <ScrollView
        className="bg-[#ffffff] dark:bg-dark-border rounded-b-2xl pt-3.5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Profile Header */}
        <View className="flex-row justify-between mx-5">
          <Text className="font-proximanova-bold text-2xl text-primary dark:text-dark-primary">
            Profile
          </Text>
          <View className="flex-row gap-1.5 items-center justify-center">
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/profile/business/edit-business-profile")
              }
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <SimpleLineIcons name="pencil" size={16} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare()}
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <EvilIcons name="share-apple" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/profile/settings/settings")}
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <Ionicons name="settings-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* cover and prifile */}
        <View className="mt-3 relative">
          {/* cover photo */}
          <Image
            source="https://media-cdn.tripadvisor.com/media/photo-s/09/de/d6/61/infinity-resort.jpg"
            style={{ width: "100%", height: 137 }}
            contentFit="cover"
          />

          {/* profile photo */}
          <View className="absolute -bottom-11 left-6">
            <View className="h-[90px] w-[90px] bg-white flex-row justify-center items-center rounded-full">
              <Image
                source="https://cdn.dribbble.com/userupload/11076335/file/original-991912ab2ec877a6ca29ed851a2c2088.jpg?format=webp&resize=400x300&vertical=center"
                contentFit="cover"
                style={{ height: 86, width: 86, borderRadius: 100 }}
              />
            </View>
          </View>

          <View className="absolute -bottom-3 right-6">
            <Text className="bg-[#11293A] py-1 px-4 rounded-full border font-proximanova-semibold text-sm p-1 text-[#FFFFFF] capitalize">
              actively recruiting
            </Text>
          </View>
        </View>
        {/* prifile name and details */}
        <View className="mx-6 mt-16">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              PalmBeach Hotel
            </Text>

            <MaterialCommunityIcons
              name="check-decagram"
              size={20}
              color="#3EBF5A"
            />
            <View className="h-5 w-5 bg-[#4E57FF]  flex-row justify-center items-center rounded-full">
              <FontAwesome6 name="crown" size={8} color="white" />
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <EvilIcons name="location" size={18} color="black" />

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              New York, North Bergen{"  "} |{"  "} 150 employee
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-5 mt-4 dark:bg-dark-background">
          {["about", "job"].map((tab) => (
            <TouchableOpacity
              className={`w-1/2 ${selectedTab === tab ? "border-b-2 border-[#11293A] pb-2" : "border-b-hairline"}`}
              key={tab}
              onPress={() => setSelectedTab(tab)}
            >
              <View className="flex-row justify-center gap-2">
                <Text
                  className={`text-center capitalize dark:text-dark-primary ${selectedTab === tab ? "font-proximanova-semibold" : "font-proximanova-regular"}`}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/*  About Tabs */}
        {selectedTab === "about" && (
          <View>
            {/* rating summery */}
            <View className="flex-row justify-between items-centers mx-5 mt-4">
              <View className="flex-row items-centers gap-2.5">
                <View className="bg-[#E5F4FD] h-7 w-7 rounded-full flex-row items-center justify-center">
                  {/* <EvilIcons name="star" size={18} color="black" /> */}
                  <SimpleLineIcons name="star" size={14} color="black" />
                </View>
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                  Rating Summary
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/profile/rating")}
                className="items-center"
              >
                <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                  See All Ratings
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mx-5 pt-4 px-2.5 pb-3 border mt-4 border-[#EEEEEE] rounded-2xl">
              <RatingBanner />

              <View className="flex-row justify-between mt-5">
                <View>
                  <RatingProgress rating={4.5} />
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                    Work Enviroment
                  </Text>
                </View>

                <Image
                  source={require("@/assets/images/vertical-line.svg")}
                  contentFit="contain"
                  style={{ height: 70, width: 0.5 }}
                />

                <View>
                  <RatingProgress rating={4.5} />
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                    pay on time
                  </Text>
                </View>

                <Image
                  source={require("@/assets/images/vertical-line.svg")}
                  contentFit="contain"
                  style={{ height: 70, width: 0.5 }}
                />

                <View>
                  <RatingProgress rating={2.1} />
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                    communication
                  </Text>
                </View>
              </View>
            </View>

            {/* About Us */}
            <View className="mx-5 mt-8 flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                {/* <Foundation name="clipboard" size={16} color="black" /> */}
                <SimpleLineIcons name="notebook" size={14} color="black" />
              </View>
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                About Us
              </Text>
            </View>

            <View className="mx-5 mt-4">
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Ocean View Hotel is a premium beachfront destination renowned
                for its exceptional guest service, welcoming atmosphere, and
                dynamic work culture.
              </Text>
            </View>

            {/* Team & Overview */}
            <View className="mx-5 mt-8 flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <Ionicons name="person-outline" size={18} color="black" />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Team & Overview
              </Text>
            </View>

            <View className="mx-5 px-4 py-3 border border-[#eeeeee] mt-4 rounded-xl">
              <View className="flex-row justify-between items-center p-2">
                <View className="flex-row gap-2">
                  <Feather name="users" size={18} color="black" />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Total Employee
                  </Text>
                </View>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary">
                  50 +
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-2.5 p-2">
                <View className="flex-row gap-2">
                  <MaterialCommunityIcons
                    name="file-document-check-outline"
                    size={18}
                    color="black"
                  />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Active job posting:
                  </Text>
                </View>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary">
                  04
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-2.5 p-2">
                <View className="flex-row gap-2">
                  <MaterialCommunityIcons
                    name="account-search"
                    size={18}
                    color="#282930"
                  />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Actively Recruiting
                  </Text>
                </View>
                <ToggleButton
                  isOn={togolIsOn}
                  setIsOn={setTogolIsOn}
                  title={`${togolIsOn ? "YES" : "NO"}`}
                />
              </View>

              <Text className="mt-2.5 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                <Text className="font-proximanova-semibold">Note</Text> : X more
                hire to activate
              </Text>
            </View>

            {/* Contact Us On */}
            <View className="flex-row justify-between items-center mx-5 mt-8">
              <View className="flex-row gap-2.5">
                <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                  <Ionicons name="call-outline" size={16} color="black" />
                </View>
                <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  Contact Us On
                </Text>
              </View>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </View>

            <ConnectSocials className="mx-5 my-4" />
          </View>
        )}

        {/* job tobs */}
        {selectedTab === "job" && (
          <View className="mx-5">
            <Text className="my-4">Open Positions</Text>

            <JobCard
              className="bg-white border border-[#EEEEEE] mb-4"
              status={""}
            />
            <JobCard
              className="bg-white border border-[#EEEEEE] mb-4"
              status={""}
            />
            <JobCard
              className="bg-white border border-[#EEEEEE] mb-4"
              status={""}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessProfile;
