import { Entypo, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const hourLimitData = [
  {
    name: "weekly",
  },
  {
    name: "monthly",
  },
  {
    name: "daily",
  },
];

const WorkingHourSettingsModal: React.FC<any> = ({
  visible,
  onClose,
  initialPeriod,
  initialAmount,
  onApply,
  applying = false,
}) => {
  const [selectCheck, setSelectCheck] = useState("");
  const [workHourAmount, setWorkHourAmount] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setSelectCheck(initialPeriod || "");
    setWorkHourAmount(
      typeof initialAmount === "number" && Number.isFinite(initialAmount)
        ? String(initialAmount)
        : ""
    );
  }, [visible, initialPeriod, initialAmount]);

  useEffect(() => {
    if (!visible) return;

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      setKeyboardOffset(0);
    };
  }, [visible]);

  const handleApply = () => {
    if (!onApply) return;
    onApply({
      workHourPeriod: selectCheck || null,
      workHourAmount: Number.isFinite(Number(workHourAmount))
        ? Number(workHourAmount)
        : null,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            paddingBottom: keyboardOffset,
          }}
        >
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            {/* Close Button */}
            <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
              <TouchableOpacity onPress={onClose}>
                <View className="bg-[#000] rounded-full p-2.5">
                  <Entypo name="cross" size={30} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <SafeAreaView edges={["bottom"]}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View className="py-7 px-5">
                  <Text className="text-center font-proximanova-bold text-xl">
                    Working Hour Settings
                  </Text>

                  {/* Hours limite  */}
                  <View className="mt-8">
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary ">
                      Work Hour Period
                    </Text>

                    {/* Hours limit check mark  */}
                    <View className="flex-row gap-6 mt-4">
                      {hourLimitData.map((item) => (
                        <TouchableOpacity
                          onPress={() => setSelectCheck(item.name)}
                          key={item.name}
                          className="rounded-full flex-row justify-center gap-1.5"
                        >
                          <View
                            className={`h-5 w-5 border border-secondary dark:border-dark-secondary rounded-full flex-row justify-center items-center ${selectCheck === item.name && "bg-[#11293A]"} `}
                          >
                            {selectCheck === item.name && (
                              <Feather name="check" size={15} color="white" />
                            )}
                          </View>
                          <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary capitalize">
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* time input */}
                  <View className="flex-row justify-between items-center mt-5 gap-2.5">
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary ">
                      Work Hour Amount
                    </Text>

                    {/* input box */}
                    <TextInput
                      value={workHourAmount}
                      onChangeText={setWorkHourAmount}
                      keyboardType="number-pad"
                      placeholder="e.g. 160"
                      placeholderTextColor="#999"
                      className="w-28 rounded-xl border border-[#EEEEEE] px-3 py-2 text-right"
                    />
                  </View>

                  <PrimaryButton
                    title={applying ? "Applying..." : "Apply"}
                    className="mt-6"
                    onPress={handleApply}
                    loading={applying}
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default WorkingHourSettingsModal;
