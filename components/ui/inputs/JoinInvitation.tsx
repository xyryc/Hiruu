import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JoinInvitation = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Get parameters from the QR code scan
  const params = useLocalSearchParams();
  const businessName = params.business as string;
  const code = params.code as string;
  const employeeName = params.employee as string;
  const invitationType = params.type as string;

  const handleJoinBusiness = () => {
    // Handle joining the business
    // You can navigate to the next screen or make an API call
    console.log("Joining business:", { businessName, code, employeeName });

    // Example: Navigate to registration or confirmation screen
    // router.push('/registration');
  };

  const handleDecline = () => {
    // Handle declining the invitation
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 40 }}
      >
        {/* Logo/Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-[#E5F4FD] dark:bg-dark-card rounded-full items-center justify-center">
            <Ionicons
              name="business"
              size={48}
              color={isDark ? "#4FB2F3" : "#1E90FF"}
            />
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-proximanova-bold text-primary dark:text-dark-primary text-center mb-3">
          Join {businessName}
        </Text>

        <Text className="text-base font-proximanova-regular text-secondary dark:text-dark-secondary text-center mb-8">
          You've been invited to join as an employee
        </Text>

        {/* Invitation Card */}
        <View className="bg-[#E5F4FD] dark:bg-dark-card rounded-2xl p-6 mb-6">
          {/* Business Info */}
          <View className="mb-6">
            <Text className="text-xs font-proximanova-regular text-secondary dark:text-dark-secondary mb-2">
              Business Name
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name="business-outline"
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="ml-3 text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                {businessName}
              </Text>
            </View>
          </View>

          {/* Invitation Code */}
          <View className="mb-6">
            <Text className="text-xs font-proximanova-regular text-secondary dark:text-dark-secondary mb-2">
              Invitation Code
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name="key-outline"
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className="ml-3 text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                {code}
              </Text>
            </View>
          </View>

          {/* Employee Name */}
          {employeeName && (
            <View>
              <Text className="text-xs font-proximanova-regular text-secondary dark:text-dark-secondary mb-2">
                Invited As
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text className="ml-3 text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                  {employeeName}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Benefits Section */}
        <View className="mb-8">
          <Text className="text-lg font-proximanova-semibold text-primary dark:text-dark-primary mb-4">
            What you'll get:
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                Access to {businessName}'s employee dashboard
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                Track your shifts and schedule
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                Receive notifications and updates
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                Collaborate with your team
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-5 pb-6 pt-4 bg-white dark:bg-dark-background border-t border-gray-200 dark:border-gray-800">
        <PrimaryButton
          onPress={handleJoinBusiness}
          title={`Join ${businessName}`}
          className="mb-3"
        />

        <TouchableOpacity onPress={handleDecline} className="py-3 items-center">
          <Text className="font-proximanova-semibold text-secondary dark:text-dark-secondary">
            Not now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default JoinInvitation;
