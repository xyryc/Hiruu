import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/header/ScreenHeader";
import { router } from "expo-router";
import BadgeCardWidthSlider from "@/components/ui/cards/BadgeCardWidthSlider";
import BadgeModal from "@/components/ui/modals/BadgeModal";

const Badge = () => {
  const [visible, setVisible] = useState(false);
  const redBadge = require("@/assets/images/reward/red-bands.svg");
  const blackBadge = require("@/assets/images/reward/black-bands.svg");
  const blueBadge = require("@/assets/images/reward/blue-bands.svg");
  const goldBadge = require("@/assets/images/reward/gold-bands.svg");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [data, setData] = useState<{
    coin: number;
    img: any;
    badgeBackground: string;
    tagColor: string;
    title?: string;
    buttonTitle?: string;
    time?: string;
    subTitle?: string;
    details?: string;
  }>({
    coin: 0,
    img: "",
    badgeBackground: "",
    tagColor: "",
    title: "",
    buttonTitle: "",
    time: "",
    subTitle: "",
    details: "",
  });

  const bronze = {
    coin: 100,
    img: redBadge,
    badgeBackground: "#FFF4ED",
    tagColor: "#F3934F",
    title: "Hard worker",
    buttonTitle: "Bronze",
    time: "300hrs/ 500hrs",
    subTitle: "Silver badge at 500 Hours",
    details:
      "Earn this badge by working consistent hours over time. Keep going to level up and earn rewardz",
  };

  const gold = {
    coin: 500,
    img: goldBadge,
    badgeBackground: "#FFFBE8",
    tagColor: "#F1C400",
    title: "Early Bird",
    buttonTitle: "Gold",
    time: "50Days/ 100Days",
    subTitle: "Diamond badge at 100 Days",
    details:
      "Log in before 8 AM to earn this badge. Keep your mornings consistent to level up faster",
  };

  const silver = {
    coin: 1000,
    img: blackBadge,
    badgeBackground: "#80808008",
    tagColor: "#808080",
    title: "Night Owl",
    buttonTitle: "Silver",
    time: "20Night/ 50Night",
    subTitle: "Gold Badge at 50 Nights",
    details:
      "Log shifts after 10 PM consistently. Stay active at night to level up.",
  };

  const blue = {
    coin: 1000,
    img: blueBadge,
    badgeBackground: "#EFF9FF",
    tagColor: "#4FB2F3",
    title: "Streak Starter",
    buttonTitle: "Diamond",
    time: "100Days/ 500Days",
    subTitle: "Diamond badge at 500 Days",
    details:
      "Log shifts after 10 PM consistently. Stay active at night to level up.",
  };

  const handleClickOpenModal = (e: string) => {
    console.log(e);
    setVisible(true);
    if (e === "Silver") {
      setData(silver);
    } else if (e === "Gold") {
      setData(gold);
    } else if (e === "Bronze") {
      setData(bronze);
    } else if (e === "Blue") {
      setData(blue);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Badge"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView>
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Bronze")}
          className="mt-5 mx-5"
          badgeBackground="#FFF4ED"
          tagColor="#F3934F"
          img={redBadge}
          title="Hard worker"
          time="300hrs/ 500hrs"
          text="Silver badge at 500 Hours"
          max={500}
          achieved={300}
          tag="Bronze"
        />
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Gold")}
          className="mt-4 mx-5"
          badgeBackground="#FFFBE8"
          tagColor="#F1C400"
          img={goldBadge}
          title="Early Bird"
          time="50Days/ 100Days"
          text="Diamond badge at 100 Days"
          max={100}
          achieved={50}
          tag="Gold"
        />
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Silver")}
          className="mt-5 mx-5"
          badgeBackground="#80808008"
          tagColor="#808080"
          img={blackBadge}
          title="Night Owl"
          time="20Nights/ 50Nights"
          text="Gold Badge at 50 Nights"
          max={50}
          achieved={20}
          tag="Silver"
        />
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Blue")}
          className="mt-4 mx-5"
          badgeBackground="#EFF9FF"
          tagColor="#4FB2F3"
          img={blueBadge}
          title="Streak Starter"
          time="100Days/ 100Days"
          text="Gold Badge at 50 Nights"
          max={100}
          achieved={100}
          tag="Diamond"
        />
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Bronze")}
          className="mt-5 mx-5"
          badgeBackground="#FFF4ED"
          tagColor="#F3934F"
          img={redBadge}
          title="Productive Week"
          time="40hrs/ 60hrs"
          text="Work 60 hours this week Silver!"
          max={60}
          achieved={40}
          tag="Bronze"
        />
        <BadgeCardWidthSlider
          onPress={() => handleClickOpenModal("Gold")}
          className="mt-4 mx-5"
          badgeBackground="#FFFBE8"
          tagColor="#F1C400"
          img={goldBadge}
          title="Reflection Pro"
          time="50Days/ 100Days"
          text="Diamond badge at 100 Days"
          max={100}
          achieved={50}
          tag="Gold"
        />
      </ScrollView>

      <BadgeModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={data}
      />
    </SafeAreaView>
  );
};

export default Badge;
