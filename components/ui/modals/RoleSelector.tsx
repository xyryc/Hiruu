import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const roleData = [
  { name: "employee" },
  { name: "manager" },
  { name: "HR / recruiter" },
  { name: "shift supervisor" },
  { name: "auditor" },
  { name: "trainer" },
  { name: "team lead" },
  { name: "project manager" },
  { name: "assistant manager" },
  { name: "customer service" },
  { name: "sales associate" },
  { name: "marketing specialist" },
  { name: "product owner" },
  { name: "data analyst" },
  { name: "software engineer" },
  { name: "graphic designer" },
];

const RoleSelector = ({ className }: { className?: string }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roleData.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setSearchQuery("");
  };

  return (
    <View className={`${className}`}>
      <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
        Predefined role
      </Text>

      {/* Role Selector Button */}
      <TouchableOpacity
        onPress={handleDropdownToggle}
        className="flex-row items-center border border-[#EEEEEE] py-2.5 px-3 mt-4 rounded-lg bg-white mb-3"
      >
        <Text
          className={`flex-1 font-proximanova-semibold text-sm text-primary dark:text-dark-primary capitalize`}
        >
          {selectedRole ? selectedRole : "Select Role"}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className="py-1 px-5 bg-[#11293A] rounded-full">
            <Text className="font-proximanova-semibold text-sm text-[#FFFFFF]">
              Save
            </Text>
          </View>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Content */}
      {isDropdownOpen && (
        <View className="border border-[#EEEEEE] rounded-lg bg-white overflow-hidden">
          {/* Search Bar */}
          <View className="mx-4 mt-4 ">
            <View className="flex-row items-center border border-[#EEEEEE] rounded-lg px-3 ">
              <Ionicons name="search" size={20} color="#666" className="mr-2" />
              <TextInput
                placeholder="Search here..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 pt-3 text-base font-proximanova-regular text-secondary dark:text-dark-secondary"
                autoFocus={true}
                placeholderTextColor="#666"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialIcons name="clear" size={20} color="#7A7A7A" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Roles List using ScrollView */}
          <ScrollView
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={true}
          >
            {filteredRoles.map((item) => (
              <TouchableOpacity
                style={{
                  marginBottom: item.name === "graphic designer" ? 15 : 0,
                }}
                key={item.name}
                onPress={() => handleRoleSelect(item.name)}
                className={`px-4 mt-4 ${
                  selectedRole === item.name ? "bg-blue-50" : "bg-white"
                } `}
              >
                <Text
                  className={`text-sm font-proximanova-regular text-primary dark:text-dark-primary capitalize `}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
            {filteredRoles.length === 0 && (
              <View className="p-4 items-center">
                <Text className="text-base text-gray-600">No roles found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default RoleSelector;
