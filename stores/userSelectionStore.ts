import { create } from "zustand";

export type SelectableUser = {
  id: string;
  name: string | null;
  avatar: string | null;
  address?: {
    city?: string | null;
    state?: string | null;
    address?: string | null;
    country?: string | null;
  } | null;
};

type UserSelectionStore = {
  selectedUsersByKey: Record<string, SelectableUser | null>;
  setSelectedUser: (key: string, user: SelectableUser | null) => void;
  clearSelectedUser: (key: string) => void;
};

export const useUserSelectionStore = create<UserSelectionStore>((set) => ({
  selectedUsersByKey: {},
  setSelectedUser: (key, user) =>
    set((state) => ({
      selectedUsersByKey: {
        ...state.selectedUsersByKey,
        [key]: user,
      },
    })),
  clearSelectedUser: (key) =>
    set((state) => {
      const next = { ...state.selectedUsersByKey };
      delete next[key];
      return { selectedUsersByKey: next };
    }),
}));
