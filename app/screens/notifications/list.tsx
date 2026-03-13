import ScreenHeader from "@/components/header/ScreenHeader";
import NotificationCard from "@/components/ui/cards/NotificationCard";
import NotificationModal from "@/components/ui/modals/NotificationModal";
import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      {/* Header */}
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-14 px-5 pb-4">
        <ScreenHeader
          onPressBack={() => router.back()}
          title="Notifications"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          }
        />
      </View>

      {/* ✅ Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        <NotificationCard
          className="mt-8"
          timeTitle="Today"
          title="Missed clock-out"
          details="You missed logging out on your shift. Please submit a correction request. "
          time="2h ago"
          buttonTitle="Submit Correction"
          border
          icon={<Ionicons name="warning-outline" size={22} color="#F34F4F" />}
          iconBackgroundColor="#F34F4F4D"
        />
        <NotificationCard
          title="Tomorrow’s shift reminder:"
          details="Shift at 10:00 AM, ABC Mall. Don’t forget to clock in"
          time="2h ago"
          border
          icon={<Ionicons name="calendar-outline" size={20} color="#4FB2F3" />}
          iconBackgroundColor="#E5F4FD"
        />
        <NotificationCard
          title="Message from Sarah (Manager)"
          details="Can you cover the evening shift tomorrow?"
          time="2h ago"
          icon={<Feather name="message-circle" size={20} color="#3EBF5A" />}
          iconBackgroundColor="#3EBF5A26"
        />
        <NotificationCard
          className="mt-8"
          timeTitle="Yesterday"
          title="Achievement Unlocked!"
          details="Completed 5 shifts this week - Great work!"
          time="1d ago"
          border
          icon={<Ionicons name="trophy-outline" size={20} color="#F1C400" />}
          iconBackgroundColor="#F1C40026"
        />
        <NotificationCard
          title="Shift Cancelled"
          details="Your shift scheduled on 6 June at Downtown Cafe has been cancelled"
          time="1d ago"
          icon={<EvilIcons name="close-o" size={20} color="#F34F4F" />}
          iconBackgroundColor="#F34F4F4D"
        />
        <NotificationCard
          className="mt-8"
          timeTitle="Last Week"
          title="Feedback Requested"
          details="We’d love to hear about your experience "
          time="5d ago"
          border
          icon={<Feather name="edit" size={20} color="#F3934F" />}
          iconBackgroundColor="#F3934F4D"
        />
        <NotificationCard
          title="Feedback Requested"
          details="We’d love to hear about your experience "
          time="5d ago"
          icon={<Feather name="edit" size={20} color="#F3934F" />}
          iconBackgroundColor="#F3934F4D"
        />
      </ScrollView>
      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;
