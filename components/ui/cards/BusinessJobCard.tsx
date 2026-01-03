import { BusinessJobCardProps } from "@/types";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";
import SecondaryButton from "../buttons/SecondaryButton";
import SmallButton from "../buttons/SmallButton";
import BusinessOfferModal from "../modals/BusinessOfferModal";

const BusinessJobCard = ({
  className,
  status,
  candidate,
  received,
}: BusinessJobCardProps) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setShowModal(true)}
      className={`${className}
      ${status === "featured" && "bg-[#E5F4FD]"}
      p-2.5 rounded-xl border border-[#4FB2F330]`}
    >
      {/* top */}
      <View className="relative">
        {/* content */}
        <View className="flex-row items-center gap-2.5 p-1 z-10">
          {/* profile image */}
          <Image
            source="https://images.squarespace-cdn.com/content/v1/5521b031e4b06ebe90178744/1560360135937-3YXVZ3124L1YL2FOASSQ/headshots-linkedin-photographer.jpg"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
            }}
            contentFit="cover"
          />

          {/* name */}
          <View>
            <Text className="text-base font-proximanova-semibold">
              Cashier{" "}
              <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
            </Text>

            <Text className="text-sm font-proximanova-regular">
              Md Talath Un Nabi Anik
            </Text>
          </View>
        </View>

        {/* background */}
        {status === "featured" && (
          <View className="absolute top-0 left-0 w-full">
            <Image
              source={require("@/assets/images/featured.png")}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 10,
              }}
              contentFit="cover"
            />
          </View>
        )}
      </View>

      {/* mid */}
      <View className="flex-row items-center justify-between gap-20 mt-2.5">
        <View className="flex-row items-center gap-1.5">
          <SimpleLineIcons name="location-pin" size={12} color="black" />
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            New York, North Bergen
          </Text>
        </View>

        <View className="flex-row">
          <Text className="text-xl font-proximanova-semibold text-primary">
            5-10$
          </Text>
          <Text className="text-lg font-proximanova-regular text-secondary">
            /hr
          </Text>
        </View>
      </View>

      {/* badges */}
      <View className="flex-row gap-1.5 mt-2.5">
        {status === "featured" || candidate ? (
          <View className="flex-row gap-1.5 items-center px-2.5 py-1 bg-[#3F98FF4D] rounded-full">
            <MaterialIcons name="verified" size={16} color="#3090FF" />
            <Text className="text-xs font-proximanova-regular text-primary">
              Verified
            </Text>
          </View>
        ) : (
          <StatusBadge status="available" size="small" />
        )}

        <View
          className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
        >
          <FontAwesome name="star" size={16} color="#F1C400" />
          <Text className="text-xs font-proximanova-regular">4</Text>
        </View>

        <View
          className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
        >
          <Text className="text-xs font-proximanova-regular">Full Time</Text>
        </View>

        <View
          className={`flex-row gap-1.5 items-center px-2.5 py-1 rounded-full
                ${status === "featured" ? "bg-white" : "bg-[#F5F5F5]"}
          `}
        >
          <Text className="text-xs font-proximanova-regular">2km away</Text>
        </View>
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          height: 1,
          width: "100%",
          marginVertical: 10,
        }}
        contentFit="contain"
      />

      {/* bottom */}
      {received || (
        <View className="flex-row justify-between">
          {/* left */}
          <View className="flex-row gap-2.5 items-center">
            <View
              className={`h-10 w-10 rounded-full flex-row items-center justify-center
             ${status === "featured" ? "bg-white" : "bg-[#E5F4FD]"}`}
            >
              <Image
                source={require("@/assets/images/messages-fill.svg")}
                contentFit="contain"
                style={{ height: 22, width: 22 }}
              />
            </View>

            <Image
              source={require("@/assets/images/vertical-line.svg")}
              style={{
                height: 18,
                width: 0.5,
              }}
            />

            <View
              className={`h-10 w-10 rounded-full flex-row items-center justify-center
             ${status === "featured" ? "bg-white" : "bg-[#E5F4FD]"}`}
            >
              <Ionicons name="call" size={20} color="#4FB2F3" />
            </View>
          </View>

          {/* right */}
          {candidate ? (
            <StatusBadge status="submitted" />
          ) : (
            <SmallButton
              title="View Profile"
              onPress={() =>
                router.replace("/screens/jobs/business/user-profile-preview")
              }
            />
          )}
        </View>
      )}

      {/* bottom */}
      {received && (
        <View className="flex-row items-center justify-between">
          {/* left */}
          <SecondaryButton
            title="View Details"
            textClass="text-[#4FB2F3]"
            iconBackground="bg-white"
            iconColor="#4FB2F3"
          />

          {/* right */}
          <View className="flex-row items-center gap-1.5">
            <View className="bg-[#E5F4FD] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
              <Ionicons name="chatbubbles" size={22} color="#4FB2F3" />
            </View>

            <MaterialCommunityIcons
              name="close-circle"
              size={40}
              color="#F34F4F"
            />

            <Ionicons name="checkmark-circle" size={40} color="#292D32" />
          </View>
        </View>
      )}

      {/* modal */}
      <BusinessOfferModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </TouchableOpacity>
  );
};

export default BusinessJobCard;
