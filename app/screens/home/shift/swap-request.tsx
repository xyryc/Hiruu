import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import CustomModal from "@/components/ui/modals/CustomModal";
import { EvilIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const SwapRequestAction = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState("Send Request");
  const [filter, setFilter] = useState<string>("all");
  const filterOptions = ["all", "accepted", "rejected", "pending"];
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded requests array with type (send/receive)
  const requests = [
    {
      name: "Housekeeping Staff",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Helped close the store",
      hotel: "Hotel Paradise",
      status: "accepted",
      type: "send", // 'send' means Send Request
    },
    {
      name: "Housekeeping Staff",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Extended work due to staff shortage",
      hotel: "Space Hotel",
      status: "rejected",
      type: "send", // 'receive' means Received
    },
    {
      name: "Inventory Associate",
      date: "12 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 PM",
      reason: "Completed closing tasks",
      hotel: "Hotel Paradise",
      status: "accepted",
      type: "send",
    },
    {
      name: "Security Guard",
      date: "13 Jun, 2025",
      start: "10:00 PM",
      end: "1:00 AM",
      reason: "Extra shift due to safety concerns",
      hotel: "City View Hotel",
      status: "pending",
      type: "receive",
    },
    {
      name: "Chef",
      date: "14 Jun, 2025",
      start: "8:00 PM",
      end: "11:00 PM",
      reason: "Overtime to prepare extra meals",
      hotel: "Gourmet Inn",
      status: "accepted",
      type: "send",
    },
    {
      name: "Waiter",
      date: "15 Jun, 2025",
      start: "7:00 PM",
      end: "10:00 PM",
      reason: "Assisted during peak hours",
      hotel: "Blue Lagoon",
      status: "pending",
      type: "receive",
    },
    {
      name: "Receptionist",
      date: "16 Jun, 2025",
      start: "9:00 PM",
      end: "12:00 AM",
      reason: "Handled emergency customer requests",
      hotel: "Skyline Resort",
      status: "pending",
      type: "receive",
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState({
    img: "",
    title: "",
    subtitle: "",
  });

  const success = require("@/assets/images/success.svg");
  const reject = require("@/assets/images/reject.png");

  const toggleModalAccepet = (e: any) => {
    setModalVisible(!modalVisible);
    setData({
      img: success, // Success icon
      title: "Request Accepted", // Title
      subtitle: "Your request has been accepted successfully.", // Subtitle
    });
  };
  const toggleModalReject = () => {
    setModalVisible(!modalVisible);
    setData({
      img: reject, // Reject icon
      title: "Request Rejected", // Title
      subtitle: "Your request has been rejected.", // Subtitle
    });
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      filter === "all" || request.status.toLowerCase() === filter;
    const matchesType =
      selectedTab === "Send Request"
        ? request.type === "send"
        : request.type === "receive";
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const getFilterCount = (filter: string) => {
    if (filter === "all") return requests.length;
    return requests.filter((request) => request.status.toLowerCase() === filter)
      .length;
  };

  const renderItem = ({ item }: any) => (
    <View
      key={item.date}
      className="mx-5 border border-[#EEEEEE] mb-3 rounded-3xl p-4"
    >
      {/* Name */}
      <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
        {item.name}
      </Text>
      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Date:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {item.date}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Overtime Start:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {item.start}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Overtime End:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {item.end}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Reason:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {item.reason}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Hotel:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {item.hotel}
        </Text>
      </View>
      <View className=" my-4">
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ height: 2, width: 295 }}
        />
      </View>
      <View className="flex-row justify-between">
        <View className="flex-row gap-4">
          <Image
            source="https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg"
            contentFit="contain"
            style={{ height: 30, width: 30 }}
          />
          <Text className="mt-2 font-proximanova-regular text-placeholder dark:text-dark-placeholder">
            {item.hotel}
          </Text>
        </View>
        <View>
          {item.status === "pending" ? (
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={toggleModalReject}>
                <View className="bg-[#F34F4F] px-3 py-2 rounded-3xl">
                  <Text className="text-white font-proximanova-semibold text-sm">
                    Reject
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleModalAccepet}>
                <View className="bg-[#11293A] px-3 py-2 rounded-3xl">
                  <Text className="text-white font-proximanova-semibold text-sm  ">
                    Accept
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <StatusBadge status={item.status} />
          )}
        </View>
      </View>
    </View>
  );
  const pendingData = requests.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="#E5F4FD"
        translucent={false}
      />

      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title="Swap Request"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />
        {/* Tabs */}
        <View className="flex-row justify-center mx-5">
          {["Send Request", "Received"].map((tab) => (
            <TouchableOpacity
              className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${selectedTab === tab ? "border-[#11293A] border-b-2" : ""}`}
              key={tab}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                className={`text-center ${selectedTab === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"}`}
              >
                {tab}
              </Text>
              <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
                <Text className="font-proximanova-semibold text-sm text-white">
                  {pendingData}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className=" flex-1 bg-white dark:bg-dark-background">
        {/* Search Bar */}
        <View className="flex-row items-center border border-b mt-5 rounded-xl pl-3 p-1 border-[#EEEEEE] mx-5">
          <EvilIcons name="search" size={24} color="black" />
          <TextInput
            placeholder="Search here..."
            className="flex-1 text-gray-600 p-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        {selectedTab === "Send Request" && (
          <View>
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                marginVertical: 15,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setFilter(item.toLowerCase())}
                  className={`py-2 px-4 border-1 border-[#EEEEEE] text-white rounded-full ${filter === item.toLowerCase() ? " bg-[#11293A]" : ""} `}
                >
                  <Text
                    className={`text-center capitalize text-sm font-proximanova-semibold ${filter === item.toLowerCase() ? "text-white dark:text-dark-primary" : "dark:text-dark-primary text-primary"}`}
                  >
                    {item} ({getFilterCount(item.toLowerCase())})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* FlatList to display requests */}
        <FlatList
          data={filteredRequests}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.date + index}
          contentContainerStyle={{ paddingBottom: 20 }}
          className={`${selectedTab === "Received" && "mt-3"}`}
        />
      </View>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
      />
    </SafeAreaView>
  );
};

export default SwapRequestAction;
