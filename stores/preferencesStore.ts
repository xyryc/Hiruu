import { getCalendars } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const resolveDeviceTimezone = () => getCalendars()[0]?.timeZone || "UTC";

interface PreferencesState {
  timezone: string;
  setTimezone: (timezone: string) => void;
  resetTimezoneToDevice: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      timezone: resolveDeviceTimezone(),
      setTimezone: (timezone) => set({ timezone: timezone || "UTC" }),
      resetTimezoneToDevice: () => set({ timezone: resolveDeviceTimezone() }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        timezone: state.timezone,
      }),
    }
  )
);
