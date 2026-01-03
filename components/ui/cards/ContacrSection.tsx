import { Image } from "expo-image";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, Fontisto } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";

const ContacrSection = () => {
  const [isLock, setIsLock] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestContactPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === "granted") {
        // Fetch contacts
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        });

        if (data.length > 0) {
          // Format contacts for display
          const formattedContacts = data
            .filter(
              (contact) =>
                contact.phoneNumbers && contact.phoneNumbers.length > 0
            )
            .map((contact, index) => ({
              id: contact.id || index,
              name: contact.name || "Unknown",
              // @ts-ignore
              phone: contact.phoneNumbers[0]?.number || "No phone",
              avatar: contact.imageAvailable
                ? { uri: contact.image?.uri }
                : null,
            }));

          // @ts-ignore
          setContacts(formattedContacts);
          setIsLock(false);
        } else {
          Alert.alert(
            "No Contacts Found",
            "There are no contacts available on your device.",
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Permission Denied",
          "We need access to your contacts to invite them.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      Alert.alert(
        "Error",
        "Something went wrong while requesting permission.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  // @ts-ignore
  const renderContactItem = (item, index) => (
    <View key={index} className="flex-row justify-between mb-5">
      <View className="flex-row items-center gap-3">
        <View className="border-hairline rounded-full overflow-hidden bg-gray-200">
          {item.avatar ? (
            <Image
              source={item.avatar}
              contentFit="cover"
              style={{ height: 40, width: 40 }}
            />
          ) : (
            <View
              style={{ height: 40, width: 40 }}
              className="bg-gray-300 items-center justify-center"
            >
              <Text className="text-gray-600 font-proximanova-semibold text-lg">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View>
          <Text className="font-proximanova-semibold text-base">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">{item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-[#11293A] px-7 py-3 rounded-full">
        <Text className="font-proximanova-semibold text-sm text-white">
          Invite
        </Text>
      </TouchableOpacity>
    </View>
  );

  const placeholderContacts = [
    { id: 1, name: "David Miller", phone: "+917 124 1425214" },
    { id: 2, name: "James Wilson", phone: "+917 124 1425214" },
    { id: 3, name: "Anna Martinez", phone: "+917 124 1425214" },
    { id: 4, name: "Michael Chen", phone: "+917 124 1425214" },
  ];

  const renderPlaceholder = () => {
    return (
      <>
        {placeholderContacts.map((contact, index) => (
          <View key={index} className="flex-row justify-between mb-5">
            <View className="flex-row items-center gap-3">
              <View className="border-hairline rounded-full overflow-hidden bg-gray-200">
                <View
                  style={{ height: 40, width: 40 }}
                  className="bg-gray-300 items-center justify-center"
                >
                  <Text className="text-gray-600 font-proximanova-semibold text-lg">
                    {contact.name.charAt(0)}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="font-proximanova-semibold text-base">
                  {contact.name}
                </Text>
                <Text className="text-sm text-gray-500">{contact.phone}</Text>
              </View>
            </View>
            <View className="bg-[#11293A] px-7 py-3 rounded-full">
              <Text className="font-proximanova-semibold text-sm text-white">
                Invite
              </Text>
            </View>
          </View>
        ))}
      </>
    );
  };

  return (
    <View>
      <Text className="font-proximanova-semibold text-xl mt-4 text-primary dark:text-dark-primary mb-4">
        {isLock ? "Allow Access to Contact" : "Invite from Contact"}
      </Text>

      {loading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="large" color="#4FB2F3" />
          <Text className="mt-4 text-gray-500">Loading contacts...</Text>
        </View>
      ) : (
        <View style={{ position: "relative" }}>
          {/* Content */}
          {isLock ? (
            <View className="overflow-hidden">{renderPlaceholder()}</View>
          ) : (
            <View>
              {contacts.length > 0 ? (
                contacts.map((contact, index) =>
                  renderContactItem(contact, index)
                )
              ) : (
                <Text className="text-center text-gray-500 mt-10">
                  No contacts with phone numbers found
                </Text>
              )}
            </View>
          )}

          {/* Frosted glass overlay */}
          {isLock && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
              pointerEvents="none"
            />
          )}

          {/* lock icon */}
          {isLock && (
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -12 }, { translateY: -12 }],
              }}
              pointerEvents="none"
            >
              <Fontisto name="locked" size={20} color="#4FB2F3" />
            </View>
          )}
        </View>
      )}

      {isLock && (
        <TouchableOpacity
          onPress={requestContactPermission}
          disabled={loading}
          className={`p-0.5 bg-[#fffff] rounded-full border border-[#11111133] flex-row items-center justify-center pl-10 mt-4 ${loading ? "opacity-50" : ""}`}
        >
          <Text className="text-black text-center font-proximanova-semibold flex-1">
            Grant Permission
          </Text>

          <Feather
            name="arrow-right"
            size={24}
            color="#000000"
            className="p-2 bg-white rounded-full border border-[#11111133]"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ContacrSection;
