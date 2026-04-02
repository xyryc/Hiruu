import axiosInstance from "@/utils/axios";
import { create } from "zustand";

export type CosmeticStoreType = "nameplate";
export type CosmeticHighlight = "limited" | "featured" | "";

export type SizeValue = number | string;

export type Point = {
  x: number;
  y: number;
};

export type Position = {
  top?: SizeValue | null;
  right?: SizeValue | null;
  bottom?: SizeValue | null;
  left?: SizeValue | null;
};

export type Box = {
  width?: SizeValue | null;
  height?: SizeValue | null;
};

export type GradientStyle = {
  colors: string[];
  start?: Point | null;
  end?: Point | null;
};

export type ImageStyle = {
  url: string;
  position?: Position;
  size?: Box;
  opacity?: number;
  repeat?: "no-repeat" | "repeat";
};

export type BackgroundStyle = {
  type: "color" | "gradient" | "image";
  color?: string | null;
  gradient?: GradientStyle | null;
  image?: ImageStyle | null;
};

export type BorderShadowStyle = {
  color: string;
  blur: number;
  x?: number;
  y?: number;
  spread?: number;
};

export type BorderStyle = {
  color: string;
  width: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  radius?: number;
  style?: "solid" | "dashed" | "dotted";
  shadow?: BorderShadowStyle | null;
};

export type IconStyle = {
  url: string;
  position?: Position;
  size?: Box;
  tintColor?: string | null;
  opacity?: number;
  zIndex?: number;
};

export type OverlayStyle = {
  type: "shape" | "asset";
  color?: string;
  url?: string;
  position?: Position;
  size?: Box;
  opacity?: number;
  zIndex?: number;
};

export type ElementStyle = {
  icon?: IconStyle | null;
  overlays?: OverlayStyle[];
};

export type NameplateMetadataV2 = {
  background: BackgroundStyle;
  border: BorderStyle;
  element: ElementStyle;
};

export type CosmeticStoreItem = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  type: CosmeticStoreType;
  coinPrice?: number | null;
  accessPolicy?: string;
  validityPolicy?: string;
  validityDays?: number | null;
  requiresPremiumToEquip?: boolean;
  metadata?: NameplateMetadataV2 | null;
  highlight?: CosmeticHighlight | null;
  isActive?: boolean;
  isVisible?: boolean;
  isOwnedActive?: boolean;
  isEquipped?: boolean;
  canPurchase?: boolean;
  canClaimPremium?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} | null;

type RewardStoreState = {
  cosmeticsStoreItems: CosmeticStoreItem[];
  cosmeticsStoreLoading: boolean;
  cosmeticsStoreLoadingMore: boolean;
  isPurchasingCosmetic: boolean;
  cosmeticsStoreError: string | null;
  cosmeticsStorePagination: Pagination;
  fetchCosmeticsStore: (params?: {
    type?: CosmeticStoreType;
    highlight?: CosmeticHighlight;
    page?: number;
    limit?: number;
    append?: boolean;
  }) => Promise<CosmeticStoreItem[]>;
  purchaseCosmetic: (id: string) => Promise<{
    ownership: any;
    newBalance: number;
  }>;
  clearCosmeticsStoreError: () => void;
};

export const useRewardStore = create<RewardStoreState>((set, get) => ({
  cosmeticsStoreItems: [],
  cosmeticsStoreLoading: false,
  cosmeticsStoreLoadingMore: false,
  isPurchasingCosmetic: false,
  cosmeticsStoreError: null,
  cosmeticsStorePagination: null,

  fetchCosmeticsStore: async (params) => {
    const page = params?.page ?? 1;
    const shouldAppend = Boolean(params?.append || page > 1);

    try {
      set({
        cosmeticsStoreLoading: !shouldAppend,
        cosmeticsStoreLoadingMore: shouldAppend,
        cosmeticsStoreError: null,
      });

      const response = await axiosInstance.get("/cosmetics/store", {
        params: {
          type: params?.type ?? "nameplate",
          highlight: params?.highlight || undefined,
          page,
          limit: params?.limit ?? 10,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load cosmetics store");
      }

      const incoming = Array.isArray(result?.data) ? result.data : [];
      const previous = shouldAppend ? get().cosmeticsStoreItems : [];
      const merged = shouldAppend
        ? [
            ...previous,
            ...incoming.filter(
              (item: CosmeticStoreItem) =>
                !previous.some((prev) => prev?.id === item?.id)
            ),
          ]
        : incoming;

      set({
        cosmeticsStoreItems: merged,
        cosmeticsStorePagination: result?.pagination || null,
        cosmeticsStoreLoading: false,
        cosmeticsStoreLoadingMore: false,
        cosmeticsStoreError: null,
      });

      return merged;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load cosmetics store";

      set({
        cosmeticsStoreLoading: false,
        cosmeticsStoreLoadingMore: false,
        cosmeticsStoreError: message,
      });
      throw new Error(message);
    }
  },

  purchaseCosmetic: async (id) => {
    if (!id) {
      throw new Error("Cosmetic id is required");
    }

    try {
      set({ isPurchasingCosmetic: true, cosmeticsStoreError: null });

      const response = await axiosInstance.post(`/cosmetics/store/${id}/purchase`);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to purchase cosmetic");
      }

      set({ isPurchasingCosmetic: false });

      return {
        ownership: result?.data?.ownership,
        newBalance: Number(result?.data?.newBalance ?? 0),
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to purchase cosmetic";

      set({
        isPurchasingCosmetic: false,
        cosmeticsStoreError: message,
      });
      throw new Error(message);
    }
  },

  clearCosmeticsStoreError: () => set({ cosmeticsStoreError: null }),
}));
