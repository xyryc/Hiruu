import { LimitedNamePlateCardProps } from "@/types/components/input";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, View } from "react-native";

const BlankNamePlateCard = ({
  variant,
  onPress,
  isSelected,
}: LimitedNamePlateCardProps) => {
  const getGradientColors = () => {
    switch (variant) {
      case "variant1":
        return ["#fff3fd", "#FE383861"];
      case "variant2":
        return ["#FBFBFB", "#A4928E"];
      case "variant3":
        return ["#E5FDEE", "#C0FFCE"];
      case "variant4":
        return ["#E5F4FD", "#99D7FF"];
      case "variant5":
        return ["#FDF5E5", "#F7EDC0"];
      case "variant6":
        return ["#FFFFFF", "#D2D2D2"];
      case "variant7":
        return ["#FFF7EF", "#E3CEB9"];
      case "variant8":
        return ["#EFFEFF", "#C5EDF2"];
      case "variant9":
        return ["#EFF8FF", "#C3DDFF"];
      case "variant10":
        return ["#F4FBFF", "#C7CBE0"];
      case "variant11":
        return ["#FFF7F4", "#F6CEBC"];

      default:
        return ["#fff3fd", "#FE383861"];
    }
  };

  const getColors = () => {
    switch (variant) {
      case "variant1":
        return "#E74C69";
      case "variant2":
        return "#867470";
      case "variant3":
        return "#89BC94";
      case "variant4":
        return "#4FB2F3";
      case "variant5":
        return "#C7A474";
      case "variant6":
        return "#7B7B7B";
      case "variant7":
        return "#867470";
      case "variant8":
        return "#79A8AD";
      case "variant9":
        return "#8294AC";
      case "variant10":
        return "#8F7467";
      case "variant11":
        return "#CEA694";

      default:
        return "#E74C69";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderRadius: 12,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 3,
        borderColor: getColors(),
      }}
    >
      <View className="overflow-hidden rounded-xl">
        {/* backgrounds */}
        {variant === "variant1" ? (
          <>
            <View className="absolute bottom-0 right-0">
              <Image
                source={require("@/assets/images/nameplates/rose.png")}
                style={{
                  width: 132,
                  height: 80,
                }}
                contentFit="contain"
              />
            </View>
            <View className="absolute bottom-0 right-0 w-full h-full -z-10">
              <Image
                source={require("@/assets/images/nameplates/rectangle.png")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
              />
            </View>
          </>
        ) : (
          <View className="absolute top-0 -right-44 z-10">
            <Image
              source={require("@/assets/images/nameplates/honeycomb.svg")}
              style={{
                width: 193,
                height: 210,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant2" && (
          <View className="absolute bottom-0 right-0 z-10">
            <Image
              source={require("@/assets/images/nameplates/coffee.svg")}
              style={{
                width: 92,
                height: 120,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant3" && (
          <View className="absolute top-5 -right-5 z-10">
            <Image
              source={require("@/assets/images/nameplates/cart.svg")}
              style={{
                width: 81,
                height: 81,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant4" && (
          <View className="absolute top-0 right-0 z-10">
            <Image
              source={require("@/assets/images/nameplates/cloths.svg")}
              style={{
                width: 95,
                height: 115,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant5" && (
          <View className="absolute top-1.5 -right-3 z-10">
            <Image
              source={require("@/assets/images/nameplates/fast-food.svg")}
              style={{
                width: 80,
                height: 104,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant6" && (
          <View className="absolute top-6 -right-1 z-10">
            <Image
              source={require("@/assets/images/nameplates/cash-register.svg")}
              style={{
                width: 66,
                height: 70,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant7" && (
          <View className="absolute bottom-3 right-0 z-10">
            <Image
              source={require("@/assets/images/nameplates/book.svg")}
              style={{
                width: 85,
                height: 115,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant8" && (
          <View className="absolute top-2 -right-8 z-10">
            <Image
              source={require("@/assets/images/nameplates/laptop.svg")}
              style={{
                width: 82,
                height: 94,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant9" && (
          <View className="absolute top-6 -right-3 z-10">
            <Image
              source={require("@/assets/images/nameplates/med.svg")}
              style={{
                width: 69,
                height: 69,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant10" && (
          <View className="absolute -top-2 -right-7 z-10">
            <Image
              source={require("@/assets/images/nameplates/bolt.svg")}
              style={{
                width: 91,
                height: 114,
              }}
              contentFit="contain"
            />
          </View>
        )}
        {variant === "variant11" && (
          <View className="absolute bottom-0 -right-5 z-10">
            <Image
              source={require("@/assets/images/nameplates/forklift.svg")}
              style={{
                width: 82,
                height: 82,
              }}
              contentFit="contain"
            />
          </View>
        )}

        <LinearGradient
          //@ts-ignore
          colors={getGradientColors()}
          start={variant === "variant1" ? { x: 0, y: 0 } : { x: 1, y: 1 }}
          end={variant === "variant1" ? { x: 1, y: 1 } : { x: 0, y: 0 }}
        >
          <View className={`px-4 py-8 flex-row items-center gap-2 rounded-2xl`}>
            {/* profile image */}
            <Image
              source={require("@/assets/images/reward/user.svg")}
              style={{
                width: 50,
                height: 50,
                borderRadius: 999,
              }}
              contentFit="cover"
            />

            {/* name, location, rating */}
            <View className="flex-row items-center justify-between gap-6 flex-1">
              {/* skeleton */}
              <View
                className="h-3.5 w-36 rounded-[30px]"
                style={{
                  backgroundColor: getColors(),
                }}
              />

              {/* conditional radio button */}
              <Ionicons
                className="z-10 bg-white rounded-full"
                name={isSelected ? "radio-button-on" : "radio-button-off"}
                size={20}
                color="#11293A"
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default BlankNamePlateCard;
