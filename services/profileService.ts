import {
    ProfileResponse,
    UpdatePreferencesData,
    UpdatePreferencesResponse,
    UpdateProfileData
} from '@/types';
import axiosInstance from '@/utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    PROFILE_CACHE: 'cache_user_profile_v1',
};

const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedProfilePayload = {
    token: string | null;
    fetchedAt: number;
    data: any;
};

class ProfileService {
    private async readProfileCache(): Promise<CachedProfilePayload | null> {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_CACHE);
            if (!raw) return null;
            return JSON.parse(raw) as CachedProfilePayload;
        } catch {
            return null;
        }
    }

    private async writeProfileCache(data: any): Promise<void> {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            const payload: CachedProfilePayload = {
                token,
                fetchedAt: Date.now(),
                data,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_CACHE, JSON.stringify(payload));
        } catch {
            // Ignore cache write errors and keep API flow resilient.
        }
    }

    async clearProfileCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_CACHE);
        } catch {
            // Ignore cache clear errors.
        }
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

            // Add all profile data fields
            Object.keys(data).forEach((key) => {
                const value = data[key as keyof UpdateProfileData];

                if (value === null || value === undefined) {
                    return; // Skip null/undefined
                }

                // Handle file objects (images)
                if (typeof value === 'object' && 'uri' in value && 'type' in value && 'name' in value) {
                    hasFile = true;
                    formData.append(key, value as any);
                }
                // Handle objects
                else if (typeof value === 'object' && !(value instanceof Date)) {
                    formData.append(key, JSON.stringify(value));
                }
                // Handle dates
                else if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                }
                // Handle primitives
                else {
                    formData.append(key, value.toString());
                }
            });

            if (hasFile) {
                const baseUrl = process.env.EXPO_PUBLIC_API_URL;
                if (!baseUrl) {
                    throw new Error('API URL not configured');
                }

                const accessToken = await AsyncStorage.getItem('auth_access_token');
                const response = await fetch(`${baseUrl}/users/profile`, {
                    method: 'PATCH',
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok || !result?.success) {
                    throw new Error(result?.message || 'Profile update failed');
                }

                await this.writeProfileCache(result.data);
                return result;
            }

            const response = await axiosInstance.patch('/users/profile', data);
            const result = response.data;

            // Check if update was successful
            if (!result.success) {
                throw new Error(result.message || 'Profile update failed');
            }

            await this.writeProfileCache(result.data);
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

            await this.writeProfileCache(result.data);
            return result;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Get user profile
    async getProfile(options?: { forceRefresh?: boolean }): Promise<ProfileResponse> {
        try {
            const forceRefresh = Boolean(options?.forceRefresh);
            const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

            if (!forceRefresh) {
                const cached = await this.readProfileCache();
                const isCacheValid =
                    cached &&
                    cached.token === accessToken &&
                    Date.now() - cached.fetchedAt < PROFILE_CACHE_TTL_MS;

                if (isCacheValid) {
                    return {
                        success: true,
                        data: cached.data,
                    } as ProfileResponse;
                }
            }

            const response = await axiosInstance.get('/users/profile');
            const result = response.data;

            // Check if request was successful
            if (!result.success) {
                throw new Error(result.message || 'Failed to get profile');
            }

            await this.writeProfileCache(result.data);
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
