import ScreenHeader from "@/components/header/ScreenHeader";
import AnimatedFABMenu from "@/components/ui/dropdown/AnimatedFabMenu";
import AssignRoleModal from "@/components/ui/modals/AssignRoleModal";
import WorkingHourSettingsModal from "@/components/ui/modals/WorkingHourSettingsModal";
import { AntDesign, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const assignRole = [
  {
    id: "1",
    name: "Employee",
  },
  {
    id: "2",
    name: "Manager",
  },
  {
    id: "3",
    name: "HR / Recruiter",
  },
  {
    id: "4",
    name: "Shift Supervisor",
  },
  {
    id: "5",
    name: "Auditor",
  },
];

const ManageTeamPanel = () => {
  const [selectedTab, setSelectedTab] = useState("Team Member(50)");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignRole, setSelectedAssignRole] = useState();
  const [showWorkingHourSettingsModal, setShowWorkingHourSettingsModal] =
    useState(false);
  const filterOptions = [
    { label: "All", value: "all", count: 50 },
    { label: "Manager", value: "manager", count: 1 },
    { label: "Cashier", value: "cashier", count: 2 },
    { label: "Bartender", value: "bartender", count: 1 },
  ];

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Amid Hazelwood",
      role: "Cashier",
      profilePic: "https://i.pravatar.cc/150?img=33",
      shiftTime: "6:00 AM - 2:00 PM",
      location: "New York, North Bergen",
    },
    {
      id: 2,
      name: "Barhen Mehta",
      role: "Bartender",
      profilePic: "https://i.pravatar.cc/150?img=12",
      shiftTime: "6:00 AM - 2:00 PM",
      location: "New York, North Bergen",
    },
    {
      id: 3,
      name: "Priya Mehta",
      role: "Housekeeping",
      profilePic: "https://i.pravatar.cc/150?img=45",
      shiftTime: "6:00 AM - 2:00 PM",
      location: "New York, North Bergen",
    },
    {
      id: 4,
      name: "John Smith",
      role: "Manager",
      profilePic: "https://i.pravatar.cc/150?img=68",
      shiftTime: "9:00 AM - 5:00 PM",
      location: "New York, North Bergen",
    },
    {
      id: 5,
      name: "Sarah Johnson",
      role: "Cashier",
      profilePic: "https://i.pravatar.cc/150?img=23",
      shiftTime: "2:00 PM - 10:00 PM",
      location: "New York, North Bergen",
    },
  ];

  // Joining requests data
  const joiningRequests = [
    {
      id: 1,
      name: "Housekeeping Staff",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Helped close the store",
      hotel: "Hotel Paradise",
      status: "pending",
      profilePic: "https://i.pravatar.cc/150?img=56",
      location: "New York, North Bergen",
    },
    {
      id: 4,
      name: "Housekeeping Staff",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Helped close the store",
      hotel: "Hotel Paradise",
      status: "pending",
      profilePic: "https://i.pravatar.cc/150?img=50",
      location: "New York, North Bergen",
    },
    {
      id: 5,
      name: "Housekeeping Staff",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Helped close the store",
      hotel: "Hotel Paradise",
      status: "pending",
      profilePic: "https://i.pravatar.cc/150?img=36",
      location: "New York, North Bergen",
    },
    {
      id: 2,
      name: "Security Guard",
      date: "13 Jun, 2025",
      start: "10:00 PM",
      end: "1:00 AM",
      reason: "Extra shift due to safety concerns",
      hotel: "City View Hotel",
      status: "pending",
      profilePic: "https://i.pravatar.cc/150?img=14",
      location: "New York, North Bergen",
    },
    {
      id: 3,
      name: "Chef Assistant",
      date: "14 Jun, 2025",
      start: "8:00 PM",
      end: "11:00 PM",
      reason: "Overtime to prepare extra meals",
      hotel: "Gourmet Inn",
      status: "pending",
      profilePic: "https://i.pravatar.cc/150?img=28",
      location: "New York, North Bergen",
    },
  ];

  const menuItems = [
    {
      id: 1,
      title: "Create Role",
      icon: "create-outline",
      onPress: () => {
        console.log("Navigate to Create Role");
        // router.push("/create-role");
      },
    },
    {
      id: 2,
      title: "Create Template",
      icon: "document-text-outline",
      onPress: () => {
        // console.log("Navigate to Create Template");
        router.push("/screens/schedule/business/create-template");
      },
    },
    {
      id: 3,
      title: "Weekly Schedule",
      icon: "calendar-outline",
      onPress: () => {
        router.push("/screens/schedule/business/weekly-schedule");
      },
    },
    {
      id: 4,
      title: "Saved Shift Template",
      icon: "document-attach-outline",
      onPress: () => {
        router.push("/screens/schedule/business/saved-shift-template");
      },
    },
  ];

  const pendingData = joiningRequests.filter(
    (item) => item.status === "pending"
  ).length;

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesFilter =
      filter === "all" || member.role.toLowerCase() === filter;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderTeamMember = ({ item }: any) => (
    <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-3xl p-4">
      <View className="flex-row items-start justify-between ">
        <View className="flex-row items-center gap-3">
          <Image
            source={item.profilePic}
            contentFit="cover"
            style={{ width: 42, height: 42, borderRadius: 24 }}
          />
          <View>
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {item.name}
            </Text>
            <Text className="text-sm text-secondary dark:text-dark-secondary">
              {item.role}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className=" w-10 h-10 rounded-full flex-row justify-center items-center bg-[#E5F4FD]">
            <Image
              source={require("@/assets/images/messages-fill.svg")}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <View className="flex-row justify-between mt-4">
          <Text className="text-secondary dark:text-dark-secondary  text-sm font-proximanova-regular">
            Shift Time:
          </Text>
          <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-regular">
            {item.shiftTime}
          </Text>
        </View>
        <View className="flex-row justify-between mt-2.5">
          <Text className="text-secondary dark:text-dark-secondary  text-sm font-proximanova-regular">
            Location:
          </Text>
          <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-regular">
            {item.location}
          </Text>
        </View>
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        contentFit="contain"
        style={{ width: 360, height: 2, marginTop: 15 }}
      />

      <View className=" mt-2.5 flex-row items-center justify-between">
        {/* view profile */}
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text className="text-[#4FB2F3] text-sm font-proximanova-semibold">
            View Profile
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#4FB2F3" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          {/* working hour */}
          <TouchableOpacity
            onPress={() => setShowWorkingHourSettingsModal(true)}
            className="p-1"
          >
            <AntDesign name="field-time" size={24} color="black" />
          </TouchableOpacity>

          {/* manage role */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-[#11293A] px-5 py-2 rounded-full"
          >
            <Text className="text-[#ffffff] text-sm font-proximanova-semibold">
              Manage Role
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderJoiningRequest = ({ item }: any) => (
    <View className="mt-4 mx-5 border border-[#EEEEEE] mb-3 rounded-xl p-4 bg-white dark:bg-dark-secondary">
      {/* Header with Profile */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5 flex-1">
          <Image
            source={item.profilePic}
            contentFit="contain"
            style={{ width: 42, height: 42, borderRadius: 100 }}
          />
          <View className="flex-1">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {item.name}
            </Text>
            <Text className="text-secondary dark:text-dark-secondary  text-sm mt-1.5">
              {item.location}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className=" w-10 h-10 rounded-full flex-row justify-center items-center bg-[#E5F4FD]">
            <Image
              source={require("@/assets/images/messages-fill.svg")}
              contentFit="contain"
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* dotate line */}
      <Image
        source={require("@/assets/images/dotted-line.svg")}
        contentFit="contain"
        style={{ width: 360, height: 2, marginTop: 10 }}
      />

      <View className="flex-row  justify-between mt-2.5 items-center">
        {/* View Profile Link */}
        <TouchableOpacity className="">
          <Text className="text-[#4FB2F3] font-proximanova-semibold text-base text-center">
            View Profile →
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row gap-3 ">
          <TouchableOpacity className="bg-[#F34F4F] h-10 w-10 flex-row justify-center items-center rounded-full">
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#292D32] h-10 w-10 flex-row justify-center items-center rounded-full">
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Team Panel(50)"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
        {/* Tabs */}
        <View className="flex-row mx-5 mt-4 dark:bg-dark-background">
          {["Team Member(50)", "Joining Request"].map((tab) => (
            <TouchableOpacity
              className={`w-1/2 ${selectedTab === tab ? "border-b-2 border-[#11293A] pb-2" : ""}`}
              key={tab}
              onPress={() => setSelectedTab(tab)}
            >
              <View className="flex-row justify-center gap-2">
                <Text
                  className={`text-center  ${selectedTab === tab ? "font-proximanova-semibold dark:text-dark-primary text-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"}`}
                >
                  {tab}
                </Text>
                {selectedTab === tab && (
                  <View className="bg-[#4FB2F3] px-2 py-1 rounded-full">
                    <Text className="text-[#FFFFFF] font-proximanova-semibold text-sm  ">
                      {pendingData}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Content */}
      <View className="flex-1">
        {/* Search Bar */}
        <View className="flex-row items-center border border-[#EEEEEE] rounded-xl px-3 py-2 mx-5 mt-5">
          <EvilIcons name="search" size={24} color="#666" />
          <TextInput
            placeholder="Search here..."
            className="flex-1 ml-2 py-1.5 text-gray-700 dark:text-dark-primary"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filter Buttons */}
        <View>
          {selectedTab === "Team Member(50)" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    filter === option.value
                      ? "bg-[#11293A] border-[#11293A]"
                      : "bg-white dark:bg-dark-background border-[#EEEEEE]"
                  }`}
                >
                  <Text
                    className={`font-proximanova-regular text-sm ${
                      filter === option.value
                        ? "text-white font-proximanova-semibold"
                        : "text-primary dark:text-dark-primary"
                    }`}
                  >
                    {option.label} ({option.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        {/* List */}
        {selectedTab === "Team Member(50)" ? (
          <FlatList
            data={filteredTeamMembers}
            renderItem={renderTeamMember}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={joiningRequests}
            renderItem={renderJoiningRequest}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Add Button */}

      <AnimatedFABMenu
        menuItems={menuItems}
        fabColor="#11293A"
        menuItemColor="#11293A"
      />

      <WorkingHourSettingsModal
        visible={showWorkingHourSettingsModal}
        onClose={() => setShowWorkingHourSettingsModal(false)}
      />

      {/* hapiness bar */}

      <AssignRoleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        assignRole={assignRole}
        selectedAssignRole={selectedAssignRole}
        setSelectedAssignRole={setSelectedAssignRole}
      />
    </SafeAreaView>
  );
};

export default ManageTeamPanel;
