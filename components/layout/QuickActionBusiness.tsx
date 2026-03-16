import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ActionIconCard from "../ui/cards/ActionIconCard";
import { useBusinessStore } from "@/stores/businessStore";

type QuickActionBusinessProps = {
  className?: string;
};

const QuickActionBusiness = ({ className }: QuickActionBusinessProps) => {
  const router = useRouter();
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const isBusinessProfile = selectedBusinesses.length > 0;

  if (!isBusinessProfile) {
    return null;
  }

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        Quick Actions
      </Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ActionIconCard
          icon={<Ionicons name="calendar" size={24} color="#4FB2F3" />}
          title="Leave"
          onPress={() => router.push("/screens/home/leave/request")}
        />

        <ActionIconCard
          icon={
            <MaterialCommunityIcons
              name="timer-settings"
              size={24}
              color="#4FB2F3"
            />
          }
          title="Shift Request"
          onPress={() => router.push("/screens/home/team/shift-requests")}
        />

        <ActionIconCard
          icon={<FontAwesome name="users" size={20} color="#4FB2F3" />}
          title="Team Panel"
          onPress={() => router.push("/screens/home/team/manage-team")}
        />

        <ActionIconCard
          icon={
            <MaterialCommunityIcons
              name="calendar-plus-outline"
              size={24}
              color="#4FB2F3"
            />
          }
          title="Week Schedule"
          onPress={() => router.push("/screens/schedule/business/weekly-schedule")}
        />
      </ScrollView>
    </View>
  );
};

export default QuickActionBusiness;
