import { ShiftHeaderProps } from "@/types";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import UserCalenderShidulModal from "../ui/modals/UserCalenderShidulModal";

const ShiftHeader = ({
  setShowModal,
  displayContent,
}: ShiftHeaderProps | any) => {
  const [isCalenderModal, setCalenderModal] = useState(false);

  return (
    <View className="px-5 pb-4 pt-2.5">
      <View className="flex-row justify-between items-center mb-2">
        <View>
          <Text className="font-proximanova-regular text-primary dark:text-dark-primary">
            All Shift
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xl font-proximanova-bold text-primary dark:text-dark-primary">
              12 June, 2025
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color="#666"
              className="ml-2.5"
            />
          </View>
        </View>

        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            onPress={() => setCalenderModal(true)}
            className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="calendar-outline" size={20} color="#111111" />
          </TouchableOpacity>

          {/* notification */}
          <TouchableOpacity
            onPress={() => router.push("/shared/notification")}
            className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full w-10 h-10 items-center justify-center"
          >
            <Image
              source={require("@/assets/images/bell.svg")}
              style={{
                width: 20,
                height: 20,
              }}
              contentFit="contain"
            />
            <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
              <Text className="text-[10px] text-white">4</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-7">
        <Text className="text-lg font-proximanova-semibold text-primary dark:text-dark-primary">
          Friday, 16 June, 2025
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
        <UserCalenderShidulModal
          visible={isCalenderModal}
          onClose={() => setCalenderModal(false)}
        />
      </View>
    </View>
  );
};

export default ShiftHeader;
