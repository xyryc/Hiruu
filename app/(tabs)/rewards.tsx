import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import {
  FontAwesome,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserRewards = () => {
  const screenWidth = Dimensions.get("window").width;

  const cardData = [
    {
      coin: "05",
      text1: "Complate",
      text2: "Profile",
      imageSource: require("@/assets/images/reward/complate-profile.svg"),
      border: "#3EBF5A",
      back: "#ECF9EF",
      route: "/(setup)/user-setup/progress",
    },
    {
      coin: 20,
      text1: "Refer A",
      text2: "Friend",
      imageSource: require("@/assets/images/reward/refer-friend.svg"),
      border: "#F3934F",
      back: "#FEEFE5",
      route: "screens/profile/settings/refer",
    },
    {
      coin: 30,
      text1: "Refer A",
      text2: "Business",
      imageSource: require("@/assets/images/reward/refer-business.svg"),
      border: "#788CFF",
      back: "#788CFF10",
      route: "screens/profile/settings/refer",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        className="flex-1 justify-center items-center"
      >
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View className="mx-5">
            <Text className="font-proximanova-regular text-base text-secondary dark:text-dark-secondary text-center mt-2.5">
              Total Tokens
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/screens/rewards/token-activity")}
              className="w-10 h-10 items-center justify-center bg-[#ffffff] rounded-full absolute top-2.5 right-0"
            >
              <Octicons name="history" size={18} color="black" />
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-1 gap-2.5">
              <View>
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  contentFit="contain"
                  style={{ height: 44, width: 40 }}
                />
              </View>
              <Text className="font-proximanova-bold text-[40px] text-[#4FB2F3]">
                5,405
              </Text>
            </View>

            <PrimaryButton
              title="Redeem"
              onPress={() => router.push("/screens/rewards/redeem-tokens")}
              className="w-44 justify-center items-center mx-auto mt-4"
              iconSize={18}
            />

            <Text className="font-proximanova-regular text-sm text-center text-primary dark:text-dark-primary mt-2.5">
              Earn tokens as you unlock and level up badges!
            </Text>

            <View className="bg-[#4FB2F3] p-4 rounded-2xl mt-8">
              <Text className="font-proximanova-semibold text-lg text-[#FFFFFF]">
                You've Completed 3 Shifts In A Row!
              </Text>

              <View className="flex-row gap-2 mt-3">
                <View>
                  <Image
                    source={require("@/assets/images/reward/reward-complite-spark.svg")}
                    contentFit="contain"
                    style={{ width: 44, height: 44 }}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="font-proximanova-regular text-sm text-[#ffffff]">
                      <Text className="text-[#ffffff]/70">Completed:</Text> 3/5
                      Shifts
                    </Text>
                    <Text className="font-proximanova-semibold text-sm text-[#ffffff]">
                      20 Tokens
                    </Text>
                  </View>

                  <Image
                    source={require("@/assets/images/reward/reward-complite-slider.svg")}
                    contentFit="fill"
                    style={{ height: 24, width: "100%" }}
                  />
                </View>
              </View>
            </View>

            <View>
              <Image
                source={require("@/assets/images/shift-ongoing-bg.svg")}
                contentFit="contain"
                style={{ height: 34, width: 250, marginHorizontal: "auto" }}
              />
              <View className="flex-row items-center justify-center">
                <Text className="text-center -top-8 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                  Your Time Remaining:{" "}
                </Text>
                <Image
                  source={require("@/assets/images/reward/timer.svg")}
                  contentFit="contain"
                  style={{
                    height: 20,
                    width: 20,
                    marginVertical: "auto",
                    top: -26,
                  }}
                />
                <Text className="text-center -top-7 font-proximanova-bold text-[#F3934F]">
                  {" "}
                  00:59:21
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-8 mx-5">
            <View className="flex-row justify-between items-center">
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Standard Challenges
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/screens/rewards/challenges")}
              >
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* standard challenges */}
            <ScrollView
              horizontal
              className="mt-4"
              showsHorizontalScrollIndicator={false}
            >
              {cardData.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: screenWidth * 0.3,
                  }}
                  className="border-[#EEEEEE] border p-3 rounded-xl mr-1 items-center"
                  //@ts-ignore
                  onPress={() => router.push(card.route)}
                >
                  <View
                    className="h-[72px] w-[63px] border border-b-[3px] justify-between items-center flex-row rounded-xl"
                    style={{
                      backgroundColor: card.back,
                      borderColor: card.border,
                    }}
                  >
                    <Image
                      source={card.imageSource}
                      contentFit="contain"
                      style={{ height: 57, width: 59 }}
                    />
                  </View>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5 text-center ">
                    {card.text1}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center ">
                    {card.text2}
                  </Text>

                  <View className="flex-row justify-between items-center"></View>

                  <View className="flex-row items-center justify-between gap-2 mt-2">
                    <Image
                      source={require("@/assets/images/hiruu-coin.svg")}
                      style={{
                        width: 22,
                        height: 22,
                      }}
                      contentFit="contain"
                    />
                    <View className="px-2.5 py-0.5 bg-[#DDF1FF]  -ml-2.5 -z-10 rounded-r-[40px]">
                      {/*bg-[#DDF1FF]*/}
                      <Text className="text-xs font-proximanova-semibold">
                        {card.coin}
                      </Text>
                    </View>
                    <FontAwesome6
                      name="crown"
                      className="ml-0.5"
                      size={15}
                      color="#4FB2F3"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* redeem rewards */}
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-6">
              Redeem Rewards
            </Text>

            <View className="relative mt-4">
              {/* background */}
              <Image
                source={require("@/assets/images/reward/subtract.svg")}
                style={{
                  width: screenWidth * 0.9,
                  height: 230,
                }}
                contentFit="fill"
              />

              {/* content */}
              <View className="absolute top-0 left-0 w-full">
                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <FontAwesome6 name="crown" size={15} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Premium for a month
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <MaterialCommunityIcons
                      name="gift"
                      size={15}
                      color="#4FB2F3"
                    />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Gift Premium for a month
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <Ionicons name="person" size={15} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Be feature profile as user
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <Ionicons
                      name="person-circle-outline"
                      size={15}
                      color="#4FB2F3"
                    />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Be feature profile as business
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <FontAwesome name="map-signs" size={15} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Featured profile nameplate
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default UserRewards;
