import users from "@/assets/data/users.json";
import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import SwapRequestModal from "@/components/ui/modals/SwapRequestModal";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SwapShiftsRequest = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const isSelected = (userId: string) => {
    return selectedUsers.includes(userId);
  };

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Deselect user
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      // Select user (check max limit)
      if (selectedUsers.length < users.length) {
        setSelectedUsers([...selectedUsers, userId]);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-background">
      <StatusBar style="dark" backgroundColor="#E5F4FD" />

      {/* Custom Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-4 pb-6 rounded-b-3xl"
        title="Swap Shift"
        titleClass="dark:text-primary"
        iconColor="#111111"
        components={
          <SimpleStatusBadge
            title="All Cashiers"
            className="border-[0.5px] border-[#F3934F4D] !bg-white"
            textColor="#F3934F"
          />
        }
      />

      <View className="p-5 bg-white flex-1">
        <SearchBar />

        <View className="mt-4">
          <Text className="font-semibold text-primary dark:text-dark-primary mb-4">
            Select ({users.length - selectedUsers.length}/{users.length})
          </Text>

          {/* user List */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => toggleUser(user.id)}
                className="flex-row items-center pb-3 mb-3 border-b border-[#0B113C1A]"
              >
                {/* User Avatar */}
                <View className="rounded-full mr-4 justify-center items-center">
                  <Image
                    source={user.imageUrl}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                    }}
                    contentFit="cover"
                  />
                </View>

                {/* User Name */}
                <Text className="flex-1 font-proximanova-regular">
                  {user.name}
                </Text>

                {/* Selection Indicator */}
                <View>
                  {isSelected(user.id) ? (
                    <Feather name="circle" size={20} color="#7A7A7A" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4FB2F3"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 py-5 items-center justify-end bg-[#E5F4FD] dark:bg-dark-background rounded-t-[20px]">
        <PrimaryButton
          className="mx-5"
          title="Send Request"
          onPress={() => setShowModal(true)}
        />
      </View>

      <SwapRequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </SafeAreaView>
  );
};

export default SwapShiftsRequest;
