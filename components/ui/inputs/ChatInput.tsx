import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const ChatInput = ({ message, setMessage }) => {
  return (
    <View className="px-4 py-3.5 border-t border-[#ECECEC] flex-row items-center gap-3">
      {/* input and file attach */}
      <View className="px-3.5 py-1 flex-1 bg-[#F5F5F5] rounded-full flex-row items-center gap-1.5">
        {/* emoji */}
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="emoticon-outline"
            size={22}
            color="#111111"
          />
        </TouchableOpacity>

        {/* chat input */}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type Something...."
          placeholderTextColor="#999"
          className="flex-1 font-proximanova-regular text-sm text-secondary"
        />

        {/* attach file */}
        <TouchableOpacity>
          <MaterialIcons name="attach-file" size={22} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* send button */}
      <TouchableOpacity className="w-12 h-12 bg-[#11293A] rounded-full items-center justify-center">
        <Feather name="send" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;
