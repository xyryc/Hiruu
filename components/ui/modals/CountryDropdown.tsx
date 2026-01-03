import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CountryPicker from "react-native-country-picker-modal"; // Correct import

const CountryDropdown: React.FC = () => {
  // Default selected country set to Bangladesh with full details
  const defaultCountry = {
    callingCode: ["880"],
    cca2: "BD", // Country code
    currency: ["BDT"], // Currency
    flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAMAAABpA6zvAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAKtQTFRFClwSC1sSDVsSDlsSDFsSBF4SAGESAGISBF8SIVMSUkERbTYRUUERL04Sqx8Q8wQP/wAPqR8QLk8SZzkR+AIP/QAP+QEP+AEP9wIPZDoR+wEP+wAP/AAPAV8SMU0S9wMP+gEP9QMPAl8SqSAQpSIQI1MS8AUP/gAP7gYPIFQSBV4SC1wSTkIRbjYRajgRMU4S9gMP9QQPZjkRYzoRqh8Q8gQPLU8SIFMS////SO84FQAAAAFiS0dEOKAHpdYAAAAJcEhZcwAAAEgAAABIAEbJaz4AAADSSURBVDjL1ZPJEoIwEEQhLAMoMqIQhai47/v2/39mtCzNIcRUedE+v5qu6ekxjH+TSSyLmB8xmzgugOsQW80RD/ygUqn64BElB2EtQq6oHgNRcY0mJimlaYKtdjnJOcxozrhymmEpaXe6PVawp4qkHw/kGxF3iJS9RHHkSkeazngyzd9gjrP5YikdGGDKBBW4ko60YC063703YH0DaltrL6MdDw98uxMD35cFzk94EE94VB378C7FUV2f8PSo2Xl4AXUhn8W9fiiu/isY2s/1q7oBVsgdRZ6IiLwAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMTAtMDdUMTM6MTU6MjErMDI6MDCSpmzCAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTEwLTA3VDEzOjE1OjIxKzAyOjAw4/vUfgAAAABJRU5ErkJggg==",
    name: "Bangladesh",
    region: "Asia",
    subregion: "Southern Asia",
  };

  const [isVisible, setIsVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(defaultCountry);

  // Handle the country selection
  const handleSelect = (country: any) => {
    setSelectedCountry(country);
    setIsVisible(false);
  };

  return (
    <View style={{ position: "relative" }}>
      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#DDDDDD",
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* If a country is selected, show the country name and flag */}
        <Text style={{ flex: 1, fontSize: 16 }}>
          {selectedCountry ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: selectedCountry.flag }}
                style={{ width: 20, height: 15, marginRight: 10 }}
              />
              <Text>{selectedCountry.name}</Text>
            </View>
          ) : (
            "Select Country"
          )}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7D7D7D" />
      </TouchableOpacity>

      {/* Dropdown list when visible */}
      {isVisible && (
        <View
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#DDDDDD",
            maxHeight: 300,
            overflow: "scroll",
            marginTop: 10,
          }}
        >
          <CountryPicker
            countryCode={selectedCountry?.cca2 || ""} // Handle undefined/empty fallback
            withFlag
            withAlphaFilter
            withCallingCode
            onSelect={handleSelect}
            visible={isVisible}
          />
        </View>
      )}
    </View>
  );
};

export default CountryDropdown;
