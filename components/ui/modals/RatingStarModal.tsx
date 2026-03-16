import { AntDesign, Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const RatingStarModal = ({ visible, onClose, onSubmit, loading }: any) => {
  const DEFAULT_RATING_COMMENT = "Rated from employee profile.";
  const handleDone = () => {
    onClose();
  };
  const starLabels = ["", "Bad", "Average", "Good", "Great", "Amazing"];
  const [paySelect, setPaySelect] = useState<number>();
  const [workSelect, setWorkSelect] = useState<number>();
  const [commonSelect, setCommonSelect] = useState<number>();

  useEffect(() => {
    if (!visible) {
      setPaySelect(undefined);
      setWorkSelect(undefined);
      setCommonSelect(undefined);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!paySelect || !workSelect || !commonSelect || !onSubmit) return;

    onSubmit({
      ratings: {
        onTime: paySelect,
        trustWorthy: workSelect,
        communication: commonSelect,
      },
      comment: DEFAULT_RATING_COMMENT,
    });
  };

  const isDisabled = !paySelect || !workSelect || !commonSelect || loading;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              {" "}
              Add your Rating{" "}
            </Text>
            <Text className="text-center text-sm mt-2.5 font-proximanova-regular text-secondary dark:text-dark-secondary">
              Your rating helps improve workplace transparency
            </Text>

            {/*  Pay On Time  */}
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
              Pay On Time
            </Text>
            <View className="flex-row justify-between mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setPaySelect(star)}
                  className="items-center"
                >
                  <AntDesign
                    name="star"
                    size={50}
                    color={paySelect === star ? "#4FB2F3" : "#EEEEEE"}
                  />
                  <Text
                    className={`text-center mt-1 font-semibold -top-12 ${paySelect === star && "text-white"} `}
                  >
                    {star}
                  </Text>
                  <Text className="text-center -mt-6 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {starLabels[star]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/*  work enviroment  */}
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
              Work Enviroment
            </Text>
            <View className="flex-row justify-between mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setWorkSelect(star)}
                  className="items-center"
                >
                  <AntDesign
                    name="star"
                    size={50}
                    color={workSelect === star ? "#4FB2F3" : "#EEEEEE"}
                  />
                  <Text
                    className={`text-center mt-1 font-semibold -top-12 ${workSelect === star && "text-white"} `}
                  >
                    {star}
                  </Text>
                  <Text className="text-center -mt-6 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {starLabels[star]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/*  communication  */}
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
              Communication
            </Text>
            <View className="flex-row justify-between mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setCommonSelect(star)}
                  className="items-center"
                >
                  <AntDesign
                    name="star"
                    size={50}
                    color={commonSelect === star ? "#4FB2F3" : "#EEEEEE"}
                  />
                  <Text
                    className={`text-center mt-1 font-semibold -top-12 ${commonSelect === star && "text-white"} `}
                  >
                    {star}
                  </Text>
                  <Text className="text-center -mt-6 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {starLabels[star]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <PrimaryButton
              title="Submit"
              className="mt-8 py-3.5"
              onPress={handleSubmit}
              loading={loading}
              disabled={isDisabled}
              showIcon={false}
            />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default RatingStarModal;
