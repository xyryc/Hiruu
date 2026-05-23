import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getAllCountries,
  getCountryByCca2,
  ICountry,
} from "react-native-international-phone-number";
import { SafeAreaView } from "react-native-safe-area-context";

type ImportHolidayModalProps = {
  visible: boolean;
  onClose: () => void;
  onImport?: (country: ICountry) => Promise<void> | void;
  isImporting?: boolean;
};

const ImportHolidayModal = ({
  visible,
  onClose,
  onImport,
  isImporting = false,
}: ImportHolidayModalProps) => {
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(
    getCountryByCca2("US") ?? getCountryByCca2("BD") ?? null
  );

  const countries = useMemo(
    () =>
      getAllCountries().sort((a, b) =>
        (a.name?.common || "").localeCompare(b.name?.common || "")
      ),
    []
  );

  const handleDone = () => {
    setIsCountryListOpen(false);
    onClose();
  };

  const handleSelectCountry = (country: ICountry) => {
    setSelectedCountry(country);
    setIsCountryListOpen(false);
  };

  const handleImport = async () => {
    console.log(
      "[ImportHolidayModal] selected country:",
      JSON.stringify(selectedCountry, null, 2)
    );

    if (!selectedCountry?.cca2 || typeof onImport !== "function") {
      handleDone();
      return;
    }

    try {
      await onImport(selectedCountry);
      handleDone();
    } catch {
      // Parent handles the error feedback.
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1" style={{ flex: 1, justifyContent: "flex-end" }}>
        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#2C2C2C] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <Text className="font-proximanova-semibold text-xl text-primary text-center">
              Import National Holidays
            </Text>

            <View className="mt-6">
              <Text className="font-proximanova-regular text-sm text-primary mb-2.5">
                Select Country
              </Text>

              <TouchableOpacity
                onPress={() => setIsCountryListOpen((prev) => !prev)}
                activeOpacity={0.85}
                className="border border-[#EAEAEA] rounded-xl px-3 py-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2.5 flex-1">
                  <Text className="text-2xl">{selectedCountry?.flag || "🌍"}</Text>
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-proximanova-regular text-sm text-[#7A7A7A]"
                  >
                    {selectedCountry?.name?.common || "Select country"}
                  </Text>
                </View>

                <Ionicons
                  name={isCountryListOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#282930"
                />
              </TouchableOpacity>

              {isCountryListOpen ? (
                <View className="mt-2 border border-[#EAEAEA] rounded-xl overflow-hidden max-h-48">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {countries.map((country) => {
                      const isSelected =
                        country.cca2 === selectedCountry?.cca2;

                      return (
                        <TouchableOpacity
                          key={country.cca2}
                          onPress={() => handleSelectCountry(country)}
                          className={`px-3 py-3 flex-row items-center justify-between ${isSelected ? "bg-[#F5FAFE]" : "bg-white"
                            }`}
                        >
                          <View className="flex-row items-center gap-2.5 flex-1">
                            <Text className="text-2xl">{country.flag}</Text>
                            <Text
                              numberOfLines={1}
                              className="flex-1 font-proximanova-regular text-sm text-primary"
                            >
                              {country.name?.common}
                            </Text>
                          </View>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#11293A"
                            />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              <View className="flex-row gap-3 mt-3 items-start">
                <AntDesign name="warning" size={18} color="#F34F4F" />
                <Text className="flex-1 font-proximanova-regular text-sm text-[#F34F4F]">
                  Importing holidays will reset all currently added holidays
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleImport}
                disabled={isImporting}
                activeOpacity={0.85}
                className={`mt-5 bg-[#11293A] rounded-full px-5 py-4 flex-row items-center justify-center relative ${isImporting ? "opacity-80" : ""
                  }`}
              >
                <Text className="font-proximanova-semibold text-white text-base">
                  {isImporting ? "Importing..." : "Import Holidays"}
                </Text>

                <View className="absolute right-1.5 h-11 w-11 rounded-full bg-white items-center justify-center">
                  <Ionicons name="arrow-forward" size={20} color="#11293A" />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ImportHolidayModal;
