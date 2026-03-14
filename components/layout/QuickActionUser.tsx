import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import ActionIconCard from "../ui/cards/ActionIconCard";

type QuickActionUserProps = {
  className?: string;
};

const QuickActionUser = ({ className }: QuickActionUserProps) => {
  const router = useRouter();

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        Quick Actions
      </Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ActionIconCard
          icon={<Ionicons name="time" size={24} color="#4FB2F3" />}
          title="Track Hours"
          onPress={() => router.push("/screens/home/shift/track-hours")}
        />

        <ActionIconCard
          icon={<MaterialIcons name="timer" size={24} color="#4FB2F3" />}
          title="OT Request"
          onPress={() => router.push("/screens/home/shift/overtime-request")}
        />

        <ActionIconCard
          icon={<FontAwesome name="users" size={20} color="#4FB2F3" />}
          title="Leave"
          onPress={() => router.push("/screens/home/leave/history")}
        />

        <ActionIconCard
          icon={
            <AntDesign
              name="swap"
              size={16}
              color="white"
              className="bg-[#4FB2F3] rounded-full p-1"
            />
          }
          title="Swap Request"
          onPress={() => router.push("/screens/home/shift/swap-request")}
        />
      </ScrollView>
    </View>
  );
};

export default QuickActionUser;
