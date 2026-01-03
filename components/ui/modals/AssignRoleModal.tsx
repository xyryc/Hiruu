import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const AssignRoleModal: React.FC<any> = ({
  visible,
  onClose,
  assignRole,
  setSelectedAssignRole,
  selectedAssignRole,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="pb-14">
            {/* Header */}
            <View className="px-6 py-7 flex-row justify-between">
              <Text className="font-proximanova-bold text-xl" numberOfLines={1}>
                Assign Role
              </Text>
              <View className="h-10 w-10 bg-[#eeeeee] rounded-full flex-row items-center justify-center">
                <Feather name="edit" size={20} color="black" />
              </View>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5 mt-4">
              <EvilIcons name="search" size={24} color="#666" />
              <TextInput
                placeholder="Search here..."
                className="flex-1 ml-2 py-1.5 text-primary dark:text-dark-primary"
                placeholderTextColor="#999"
              />
            </View>

            {/* Business List */}
            <ScrollView className="px-6 mt-5">
              {assignRole.map((role: any) => (
                <TouchableOpacity
                  onPress={() => setSelectedAssignRole(role.id)}
                  key={role.id}
                  className={`flex-row items-center py-4 px-4 mb-3 rounded-xl border-b border-[#eeeeee] ${selectedAssignRole === role.id ? "bg-[#4FB2F3]" : ""}  `}
                >
                  {/* Business Name */}
                  <Text
                    className={`flex-1 font-proximanova-semibold ${selectedAssignRole === role.id ? "text-white" : "text-primary"} `}
                  >
                    {role.name}
                  </Text>

                  {/* Selection Indicator */}
                  {selectedAssignRole === role.id && (
                    <Ionicons
                      name="checkmark-circle-sharp"
                      size={24}
                      color="white"
                    />
                  )}
                  {selectedAssignRole === role.id || (
                    <View
                      className={`w-6 h-6 rounded-full border border-[#7a7a7a] justify-center items-center`}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <PrimaryButton title="Apply" className="mx-5 mb-5" />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default AssignRoleModal;
