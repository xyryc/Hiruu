import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import SimpleStatusBadge from "../badges/SimpleStatusBadge";
import SmallButton from "../buttons/SmallButton";

const PerformerCard = () => {
  return (
    <View
      style={{
        width: 320,
      }}
      className="border border-[#EEEEEE] rounded-xl mt-4 mr-4"
    >
      <View className="flex-row items-start justify-between gap-4 p-4">
        <View className="flex-row gap-2.5">
          <Image
            source="https://media.licdn.com/dms/image/v2/D5603AQFMeZ7i9ybZgw/profile-displayphoto-shrink_200_200/B56ZS29wLQHwAY-/0/1738236429558?e=2147483647&v=beta&t=RTX-UGEWSzuEb-Gv2bqXqREzQX15FMKi0TK1HJBAKuE"
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
            }}
            contentFit="cover"
          />
          <View>
            <Text>Md Talath Un Nabi Anik</Text>
            <Text className="text-sm font-proximanova-regular text-[#4FB2F3] mt-1">
              15 shift completed
            </Text>
          </View>
        </View>

        <SmallButton title="Get Tokens" />
      </View>

      <View className="flex-row pl-4 pb-4 overflow-hidden">
        <SimpleStatusBadge
          className="mr-1.5"
          title="On Time"
          textColor="#6998EF"
          bgColor="#E9F0FD"
        />

        <SimpleStatusBadge
          className="mr-1.5"
          title="High Rated"
          textColor="#EAC324"
          bgColor="#EAC3241F"
        />

        <SimpleStatusBadge
          className="mr-1.5"
          title="Reliable"
          textColor="#3EBF5A"
          bgColor="#3EBF5A1F"
        />

        <SimpleStatusBadge
          className="mr-1.5"
          title="High Achiever"
          textColor="#F3934F"
          bgColor="#F3934F1F"
        />

        <SimpleStatusBadge
          className="mr-1.5"
          title="High Achiever"
          textColor="#F3934F"
          bgColor="#F3934F1F"
        />
      </View>
    </View>
  );
};

export default PerformerCard;
