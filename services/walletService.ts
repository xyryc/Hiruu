import axiosInstance from "@/utils/axios";

class WalletService {
  async getWallet(): Promise<any> {
    const response = await axiosInstance.get("/wallet");
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to get wallet");
    }

    return result;
  }

  async getCoinTransactions(params?: {
    type?: "earned" | "spent";
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await axiosInstance.get("/coin-transactions", {
      params,
    });
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to get coin transactions");
    }

    return result;
  }
}

export const walletService = new WalletService();
