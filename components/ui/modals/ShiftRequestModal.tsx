import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "../inputs/DatePicker";
import TimePicker from "../inputs/TimePicker";

const ShiftRequestModal = ({ visible, onClose }: any) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const reasonTypes = [
    { id: "1", label: "Personal Leave", icon: "user" },
    { id: "2", label: "Sick Leave", icon: "heart" },
    { id: "3", label: "Vacation", icon: "umbrella-beach" },
    { id: "4", label: "Emergency", icon: "exclamation-triangle" },
    { id: "5", label: "Doctor Appointment", icon: "stethoscope" },
    { id: "6", label: "Family Event", icon: "users" },
  ];

  const handleDone = () => {
    onClose();
  };

  const handleSave = () => {
    console.log({ selectedReason, reasonNote });
    onClose();
  };

  const handleCancel = () => {
    setSelectedReason("");
    setReasonNote("");
    setIsDropdownOpen(false);
    onClose();
  };

  const selectedReasonData = reasonTypes.find(
    (reason) => reason.id === selectedReason
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl min-h-[70%]">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2 z-10">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="flex-1">
            <ScrollView
              className="flex-1 px-5 py-7"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View>
                {/* Date Selection */}
                <View className="mb-6">
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mb-2">
                    Select Dates
                  </Text>
                  <DatePicker className="mt-2.5" />
                </View>

                {/* Time Selection */}
                <View className="mb-6">
                  <View className="flex-row gap-4 items-center">
                    <View className="flex-1">
                      <TimePicker title="Start Time" />
                    </View>
                    <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      To
                    </Text>
                    <View className="flex-1">
                      <TimePicker title="End Time" />
                    </View>
                  </View>
                </View>

                {/* Reason Type Dropdown */}
                <View className="mb-6">
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mb-2">
                    Reason Type
                  </Text>

                  {/* Dropdown Trigger */}
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex-row items-center justify-between p-4 rounded-xl border border-[#eeeeee] bg-white"
                  >
                    <View className="flex-row items-center">
                      {selectedReason ? (
                        <>
                          <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-[#11293A]">
                            <FontAwesome5
                              name={selectedReasonData?.icon as any}
                              size={14}
                              color="white"
                            />
                          </View>
                          <Text className="text-base font-medium text-gray-800">
                            {selectedReasonData?.label}
                          </Text>
                        </>
                      ) : (
                        <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                          Missed Clock-out
                        </Text>
                      )}
                    </View>

                    {/* Dropdown Arrow */}
                    <MaterialIcons
                      name={
                        isDropdownOpen
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <View className="mt-2 border border-[#eeeeee] rounded-xl bg-white max-h-48 overflow-hidden">
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {reasonTypes.map((reason) => (
                          <TouchableOpacity
                            key={reason.id}
                            onPress={() => {
                              setSelectedReason(reason.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex-row items-center p-3 border-b border-gray-100 ${
                              selectedReason === reason.id
                                ? "bg-blue-50"
                                : "bg-white"
                            }`}
                          >
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                selectedReason === reason.id
                                  ? "bg-[#11293A]"
                                  : "bg-gray-100"
                              }`}
                            >
                              <FontAwesome5
                                name={reason.icon as any}
                                size={14}
                                color={
                                  selectedReason === reason.id
                                    ? "white"
                                    : "#6B7280"
                                }
                              />
                            </View>
                            <Text
                              className={`text-base font-medium ${
                                selectedReason === reason.id
                                  ? "text-[#11293A]"
                                  : "text-gray-700"
                              }`}
                            >
                              {reason.label}
                            </Text>

                            {/* Checkmark for selected item */}
                            {selectedReason === reason.id && (
                              <View className="ml-auto">
                                <MaterialIcons
                                  name="check-circle"
                                  size={20}
                                  color="#11293A"
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Reason Notes Section */}
                <View className="mb-6">
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mb-2">
                    Reason (Optional)
                  </Text>

                  <View className="border border-[#eeeeee] rounded-xl bg-white">
                    <TextInput
                      value={reasonNote}
                      onChangeText={setReasonNote}
                      placeholder="Mention any reason or notes for manager....."
                      placeholderTextColor="#7a7a7a"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      className="p-4 min-h-[100px] font-proximanova-semibold text-sm text-primary dark:text-dark-primary"
                      style={{ textAlignVertical: "top" }}
                    />
                  </View>
                </View>

                {/* Footer Buttons */}
                <View className="pt-4">
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleCancel}
                      className="flex-1 border border-[#11111133] rounded-full py-4"
                    >
                      <Text className="text-center text-gray-700 font-semibold text-base">
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={!selectedReason}
                      className={`flex-1 rounded-full py-4 bg-[#11293A]`}
                    >
                      <Text
                        className={`text-center font-semibold text-base text-white`}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ShiftRequestModal;
