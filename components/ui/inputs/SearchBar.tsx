import { SearchBarProps } from "@/types/components/input";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function SearchBar({ className, onSearch, value }: SearchBarProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputValue = typeof value === "string" ? value : searchQuery;

  const handleSearchChange = (text: string) => {
    if (typeof value !== "string") {
      setSearchQuery(text);
    }
    onSearch?.(text); // Optional chaining
  };

  const handleClear = () => {
    if (typeof value !== "string") {
      setSearchQuery("");
    }
    onSearch?.(""); // Optional chaining
  };

  return (
    <View
      className={`flex-row items-center rounded-[10px] px-4 ${className} border ${isFocused ? "border-[#00000027]" : "border-[#EEEEEE]"
        }`}
    >
      <Feather name="search" size={18} color="#6B7280" className="mr-2" />

      <TextInput
        style={{ fontFamily: "ProximaNova-Regular" }}
        className="flex-1 py-3"
        placeholder={t("common.searchHere")}
        placeholderTextColor="#7A7A7A"
        value={inputValue}
        onChangeText={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        keyboardAppearance="dark"
      />

      {inputValue.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Feather name="x" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}
