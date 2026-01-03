import businesses from "@/assets/data/businesses.json";
import { TodaysShiftProps } from "@/types";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ActionCard from "../ui/cards/ActionCard";
import NoTaskCard from "../ui/cards/NoTaskCard";
import TaskCard from "../ui/cards/TaskCard";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

const TodaysShift = ({ className }: TodaysShiftProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const router = useRouter();

  const handleLogin = () => {
    console.log("Login pressed");
  };

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
  };

  const displayContent = getDisplayContent();

  return (
    <View className={`${className} px-4`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-proximanova-semibold">
          Your Today's Shifts
        </Text>

        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-[#E5F4FD] flex-row items-center p-0.5 rounded-[26px]"
        >
          {displayContent?.type === "all" ? (
            <View className="pl-2.5 py-1.5">
              <Text className="font-semibold text-sm text-primary">All</Text>
            </View>
          ) : (
            <Image
              source={displayContent?.content?.imageUrl}
              style={{ width: 30, height: 30, borderRadius: 999 }}
              contentFit="cover"
            />
          )}

          <SimpleLineIcons
            className="p-1.5"
            name="arrow-down"
            size={12}
            color="#111111"
          />
        </TouchableOpacity>
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* cards */}
      <ScrollView
        className="mb-7"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        <TaskCard
          shiftTitle="Hotel & Bar Management"
          startTime="10:00 AM"
          endTime="6:00 PM"
          shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
          teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
          totalMembers={30}
          address="230 Aaron Bushnell St"
          city="Palestine, PL"
          onLoginPress={handleLogin}
          status="upcoming"
        />

        <TaskCard
          shiftTitle="Hotel & Bar Management"
          startTime="10:00 AM"
          endTime="6:00 PM"
          shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
          teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
          totalMembers={30}
          address="230 Aaron Bushnell St"
          city="Palestine, PL"
          onLoginPress={handleLogin}
          status="ongoing"
        />

        <TaskCard
          shiftTitle="Hotel & Bar Management"
          startTime="10:00 AM"
          endTime="6:00 PM"
          shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
          teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
          totalMembers={30}
          address="230 Aaron Bushnell St"
          city="Palestine, PL"
          onLoginPress={handleLogin}
          status="completed"
        />
      </ScrollView>

      <NoTaskCard className="mb-7" />

      {/* rank card */}
      <ActionCard
        title="See your rank on board"
        buttonTitle="View"
        onPress={() => router.push("/screens/home/leaderboard")}
        rightImage={require("@/assets/images/rank.svg")}
        imageClass="absolute bottom-0 right-2.5"
        imageWidth={144}
        imageHeight={95}
        background={require("@/assets/images/chessboard-bg.svg")}
      />
    </View>
  );
};

export default TodaysShift;
