import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import DateOfBirthInput from "@/components/ui/inputs/DateOfBirthInput";
import GenderSelection from "@/components/ui/inputs/GenderSelection";
import { GenderOption } from "@/types";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function Step1({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const [value, setValue] = useState(null);
  const states = [
    {
      label: "Central Park, New York, NY",
      value: "Central Park, New York, NY",
    },
    { label: "Central Park, New York, NY", value: "AK" },
    {
      label: "central park South, New York, NY",
      value: "central park South, New York, NY",
    },
  ];

  // dob
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  // gender
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
    null
  );

  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title="Personal Details"
        className="mt-3"
      />

      {/* progress details */}
      <View className="my-7">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm font-proximanova-semibold">
            Your Progress: {currentStep * 20}%
          </Text>

          <Text className="text-sm font-proximanova-semibold">
            {getStepName(currentStep)}
          </Text>
        </View>

        <AnimatedView layout={Layout.springify()}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={11}
            color="#11293A"
            unfilledColor="#FFFFFF"
            borderWidth={0}
            borderRadius={100}
            animated={true}
            animationConfig={{ duration: 300 }}
          />
        </AnimatedView>
      </View>

      {/* main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding here
        className="flex-1" // Add flex-1 to ScrollView
      >
        {/* name */}
        <View>
          <Text className="text-sm font-proximanova-semibold mb-2.5">Name</Text>

          <TextInput
            placeholder="Enter Email"
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* location*/}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Location
          </Text>

          <Dropdown
            data={states}
            labelField="label"
            valueField="value"
            placeholder="Select location"
            value={value}
            onChange={(item) => setValue(item.value)}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            containerStyle={styles.containerStyle}
            itemTextStyle={styles.itemTextStyle}
          />
        </View>

        {/* date of birth */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Date of Birth
          </Text>

          <DateOfBirthInput value={dateOfBirth} onDateChange={setDateOfBirth} />
        </View>

        {/* gender */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Date of Birth
          </Text>

          <GenderSelection
            value={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </View>

        {/* socials */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Connect Your Socials
          </Text>

          <ConnectSocials />
        </View>
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton title="Next" className="w-full" onPress={onComplete} />
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 10,
    padding: 12,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#111111",
  },
  containerStyle: {
    borderRadius: 10,
    backgroundColor: "white",
  },
  itemTextStyle: {
    fontSize: 14,
    color: "#3D3D3D",
  },
});
