import React, { useState } from "react";
import { Text, View } from "react-native";
import PhoneInput from "react-native-phone-input";

const PhoneNumberInput = ({ phoneNumber, setPhoneNumber }: any) => {
  let phoneRef: any = null;
  const [isValidPhone, setIsValidPhone] = useState(true);

  const handlePhoneChange = () => {
    const number = phoneRef.getValue();
    const isValid = phoneRef.isValidNumber();

    setPhoneNumber(number);
    setIsValidPhone(isValid);
  };

  return (
    <View>
      <PhoneInput
        ref={(ref) => {
          phoneRef = ref;
        }}
        onChangePhoneNumber={handlePhoneChange}
        initialCountry={"us"}
        style={{
          borderWidth: 1,
          borderColor: "#EEEEEE",
          borderRadius: 10,
          paddingHorizontal: 15,
          paddingVertical: 12,
          backgroundColor: "#fff",
        }}
        textStyle={{
          fontSize: 14,
          color: "#7A7A7A",
        }}
        flagStyle={{
          width: 25,
          height: 18,
        }}
        autoFormat={true}
        allowZeroAfterCountryCode={false}
        textProps={{
          placeholder: "Enter phone number",
          placeholderTextColor: "#9CA3AF",
        }}
      />

      {!isValidPhone && phoneNumber && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          Please enter a valid phone number
        </Text>
      )}
    </View>
  );
};

export default PhoneNumberInput;
