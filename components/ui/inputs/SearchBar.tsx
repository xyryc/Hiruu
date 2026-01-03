import { SearchBarProps } from "@/types/components/input";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function SearchBar({ className, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text); // Optional chaining
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch?.(""); // Optional chaining
  };

  return (
    <View
      className={`flex-row items-center rounded-[10px] px-4 ${className} border ${
        isFocused ? "border-[#00000027]" : "border-[#EEEEEE]"
      }`}
    >
      <Feather name="search" size={18} color="#6B7280" className="mr-2" />

      <TextInput
        style={{ fontFamily: "ProximaNova-Regular" }}
        className="flex-1"
        placeholder="Search here..."
        placeholderTextColor="#7A7A7A"
        value={searchQuery}
        onChangeText={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        keyboardAppearance="dark"
      />

      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Feather name="x" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}
