import {
    ProfileResponse,
    UpdatePreferencesData,
    UpdatePreferencesResponse,
    UpdateProfileData
} from '@/types';
import axiosInstance from '@/utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_STORAGE_KEY = 'auth_access_token';

class ProfileService {
    private isFileLike(value: any): value is { uri: string; type: string; name: string } {
        return Boolean(
            value &&
            typeof value === "object" &&
            typeof value.uri === "string" &&
            typeof value.type === "string" &&
            typeof value.name === "string"
        );
    }

    private appendFormValue(formData: FormData, key: string, value: any) {
        if (value === null || value === undefined) return;

        if (this.isFileLike(value)) {
            formData.append(key, value as any);
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item === null || item === undefined) return;
                if (typeof item === "object" && !this.isFileLike(item)) {
                    this.appendFormValue(formData, `${key}[]`, item);
                } else {
                    formData.append(key, String(item));
                }
            });
            return;
        }

        if (value instanceof Date) {
            formData.append(key, value.toISOString());
            return;
        }

        if (typeof value === "object") {
            Object.entries(value).forEach(([childKey, childValue]) => {
                this.appendFormValue(formData, `${key}[${childKey}]`, childValue);
            });
            return;
        }

        formData.append(key, String(value));
    }

    private toIsoString(value: any): string | undefined {
        if (!value) return undefined;
        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
        }
        if (typeof value === "string") {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
        }
        return undefined;
    }

    private normalizeExperiencePayload(experience: any) {
        return {
            companyId: experience?.companyId,
            position: experience?.position || undefined,
            description: experience?.description || undefined,
            startDate: this.toIsoString(experience?.startDate),
            endDate: this.toIsoString(experience?.endDate),
            isCurrent: Boolean(experience?.isCurrent),
        };
    }

    private isExperienceChanged(existing: any, next: any): boolean {
        const existingStart = this.toIsoString(existing?.startDate);
        const existingEnd = this.toIsoString(existing?.endDate);
        return (
            (existing?.position || "") !== (next?.position || "") ||
            (existing?.description || "") !== (next?.description || "") ||
            (existingStart || "") !== (next?.startDate || "") ||
            (existingEnd || "") !== (next?.endDate || "") ||
            Boolean(existing?.isCurrent) !== Boolean(next?.isCurrent)
        );
    }

    async syncExperiences(experiences: any[], existingExperiences: any[] = []): Promise<void> {
        try {
            if (!Array.isArray(experiences)) return;

            const existingByCompanyId = new Map<string, any>();
            existingExperiences.forEach((item) => {
                if (item?.companyId) {
                    existingByCompanyId.set(item.companyId, item);
                }
            });

            const incomingCompanyIds = new Set<string>();
            experiences.forEach((exp) => {
                if (exp?.companyId) incomingCompanyIds.add(exp.companyId);
            });

            // Delete experiences removed from the edit list
            for (const existing of existingExperiences) {
                if (!existing?.id || !existing?.companyId) continue;
                if (!incomingCompanyIds.has(existing.companyId)) {
                    await axiosInstance.delete(`/experiences/${existing.id}`);
                }
            }

            for (const raw of experiences) {
                const payload = this.normalizeExperiencePayload(raw);
                if (!payload.companyId) continue;
                if (!payload.startDate) continue;

                const existing = existingByCompanyId.get(payload.companyId);
                if (existing?.id) {
                    if (!this.isExperienceChanged(existing, payload)) {
                        continue;
                    }
                    await axiosInstance.patch(`/experiences/${existing.id}`, payload);
                } else {
                    await axiosInstance.post("/experiences", payload);
                }
            }
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Update user profile
    async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
        try {
            const formData = new FormData();
            let hasFile = false;

            Object.keys(data).forEach((key) => {
                const value = data[key as keyof UpdateProfileData];
                if (this.isFileLike(value)) {
                    hasFile = true;
                }
                this.appendFormValue(formData, key, value);
            });

            if (hasFile) {
                const baseUrl = process.env.EXPO_PUBLIC_API_URL;
                if (!baseUrl) {
                    throw new Error('API URL not configured');
                }

                const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
                console.log("[ProfileService] PATCH /users/profile multipart form-data");
                const response = await fetch(`${baseUrl}/users/profile`, {
                    method: 'PATCH',
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                    body: formData,
                });

                const result = await response.json();
                console.log("[ProfileService] multipart response", JSON.stringify(result, null, 2));

                if (!response.ok || !result?.success) {
                    throw new Error(result?.message || 'Profile update failed');
                }

                return result;
            }

            console.log("[ProfileService] PATCH /users/profile json payload", JSON.stringify(data, null, 2));
            const response = await axiosInstance.patch('/users/profile', data);
            const result = response.data;
            console.log("[ProfileService] json response", JSON.stringify(result, null, 2));

            // Check if update was successful
            if (!result.success) {
                throw new Error(result.message || 'Profile update failed');
            }

            return result;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    async updatePreferences(data: UpdatePreferencesData): Promise<UpdatePreferencesResponse> {
        try {
            const response = await axiosInstance.patch('/users/preferences', data);
            const result = response.data;

            if (!result?.success) {
                throw new Error(result?.message || 'Failed to update preferences');
            }

            return result;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Get user profile
    async getProfile(): Promise<ProfileResponse> {
        try {
            const response = await axiosInstance.get('/users/profile');
            const result = response.data;

            // Check if request was successful
            if (!result.success) {
                throw new Error(result.message || 'Failed to get profile');
            }

            return result;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Handle API errors
    private handleError(error: any): Error {
        if (error.response?.data) {
            const errorData = error.response.data;
            if (Array.isArray(errorData.data) && errorData.data.length > 0) {
                const firstValidationError = errorData.data[0];
                if (typeof firstValidationError === "string") {
                    return new Error(firstValidationError);
                }
            }
            return new Error(errorData.message || 'An error occurred');
        }
        return new Error(error.message || 'Network error occurred');
    }
}

export const profileService = new ProfileService();
