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
        const normalizedBusinessId =
            experience?.businessId ||
            (typeof experience?.companyId === "string" &&
            !experience.companyId.startsWith("custom_")
                ? experience.companyId
                : undefined);
        const normalizedCustomBusinessName = !normalizedBusinessId
            ? experience?.customBusinessName || experience?.companyName
            : undefined;
        const normalizedCustomBusinessLogo = !normalizedBusinessId
            ? experience?.customBusinessLogo ||
              (typeof experience?.logo === "string" &&
              /^https?:\/\//i.test(experience.logo)
                  ? experience.logo
                  : undefined)
            : undefined;

        return {
            id: experience?.id,
            businessId: normalizedBusinessId,
            customBusinessName: normalizedCustomBusinessName || undefined,
            customBusinessLogo: normalizedCustomBusinessLogo || undefined,
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
        const nextIsOfficial = Boolean(next?.businessId);
        return (
            (!nextIsOfficial &&
              (existing?.customBusinessName || "") !== (next?.customBusinessName || "")) ||
            (existing?.position || "") !== (next?.position || "") ||
            (existing?.description || "") !== (next?.description || "") ||
            (existingStart || "") !== (next?.startDate || "") ||
            (existingEnd || "") !== (next?.endDate || "") ||
            Boolean(existing?.isCurrent) !== Boolean(next?.isCurrent)
        );
    }

    private buildExperienceFormData(payload: Record<string, any>) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") return;
            if (this.isFileLike(value)) {
                formData.append(key, value as any);
                return;
            }
            formData.append(key, String(value));
        });
        return formData;
    }

    private hasFileInExperiencePayload(payload: Record<string, any>) {
        return Object.values(payload).some((value) => this.isFileLike(value));
    }

    private compactPayload<T extends Record<string, any>>(payload: T): Partial<T> {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as Partial<T>;
    }

    async syncExperiences(experiences: any[], existingExperiences: any[] = []): Promise<void> {
        try {
            if (!Array.isArray(experiences)) return;

            const existingById = new Map<string, any>();
            existingExperiences.forEach((item) => {
                if (item?.id) existingById.set(String(item.id), item);
            });

            const incomingIds = new Set<string>();
            experiences.forEach((exp) => {
                const normalized = this.normalizeExperiencePayload(exp);
                if (normalized?.id) incomingIds.add(String(normalized.id));
            });

            // Delete experiences removed from the edit list
            for (const existing of existingExperiences) {
                if (!existing?.id) continue;
                if (!incomingIds.has(String(existing.id))) {
                    console.log("[ProfileService] DELETE /experiences/:id", {
                        id: existing.id,
                    });
                    const deleteResponse = await axiosInstance.delete(`/experiences/${existing.id}`);
                    const deleteResult = deleteResponse?.data;
                    console.log("[ProfileService] DELETE /experiences/:id response", {
                        id: existing.id,
                        result: deleteResult,
                    });
                    if (deleteResult?.success === false) {
                        throw new Error(deleteResult?.message || "Failed to delete experience");
                    }
                }
            }

            for (const raw of experiences) {
                const payload = this.normalizeExperiencePayload(raw);
                if (!payload.businessId && !payload.customBusinessName) continue;
                if (!payload.startDate) continue;

                const existing = payload.id ? existingById.get(String(payload.id)) : undefined;

                const requestPayload = this.compactPayload({
                    businessId: payload.businessId,
                    customBusinessName: payload.businessId
                        ? undefined
                        : payload.customBusinessName,
                    customBusinessLogo: payload.businessId
                        ? undefined
                        : payload.customBusinessLogo,
                    position: payload.position,
                    description: payload.description,
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    isCurrent: payload.isCurrent,
                });

                if (existing?.id) {
                    if (!this.isExperienceChanged(existing, requestPayload)) {
                        console.log("[ProfileService] PATCH /experiences skipped (no changes)", {
                            id: existing.id,
                        });
                        continue;
                    }
                    console.log("[ProfileService] PATCH /experiences/:id", {
                        id: existing.id,
                        payload: requestPayload,
                    });
                    const patchResponse = this.hasFileInExperiencePayload(requestPayload)
                        ? await axiosInstance.patch(
                            `/experiences/${existing.id}`,
                            this.buildExperienceFormData(requestPayload),
                            { headers: { "Content-Type": "multipart/form-data" } }
                        )
                        : await axiosInstance.patch(`/experiences/${existing.id}`, requestPayload);
                    const patchResult = patchResponse?.data;
                    console.log("[ProfileService] PATCH /experiences/:id response", {
                        id: existing.id,
                        result: patchResult,
                    });
                    if (patchResult?.success === false) {
                        throw new Error(patchResult?.message || "Failed to update experience");
                    }
                } else {
                    console.log("[ProfileService] POST /experiences", {
                        payload: requestPayload,
                    });
                    const postResponse = this.hasFileInExperiencePayload(requestPayload)
                        ? await axiosInstance.post(
                            "/experiences",
                            this.buildExperienceFormData(requestPayload),
                            { headers: { "Content-Type": "multipart/form-data" } }
                        )
                        : await axiosInstance.post("/experiences", requestPayload);
                    const postResult = postResponse?.data;
                    console.log("[ProfileService] POST /experiences response", {
                        result: postResult,
                    });
                    if (postResult?.success === false) {
                        throw new Error(postResult?.message || "Failed to create experience");
                    }
                }
            }
        } catch (error: any) {
            console.log("[ProfileService] syncExperiences error", {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });
            throw this.handleError(error);
        }
    }

    // Update user profile
    async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
        try {
            const nonFilePayload: Record<string, any> = {};
            const filePayload: Record<string, { uri: string; type: string; name: string }> = {};

            Object.keys(data).forEach((key) => {
                const value = data[key as keyof UpdateProfileData];
                if (this.isFileLike(value)) {
                    filePayload[key] = value;
                } else {
                    nonFilePayload[key] = value;
                }
            });

            const hasFile = Object.keys(filePayload).length > 0;

            if (hasFile) {
                let finalResult: any = null;

                // Send non-file fields as JSON so numeric values (e.g. address lat/lng) keep their types.
                if (Object.keys(nonFilePayload).length > 0) {
                    const jsonResponse = await axiosInstance.patch('/users/profile', nonFilePayload);
                    const jsonResult = jsonResponse.data;

                    if (!jsonResult?.success) {
                        throw new Error(jsonResult?.message || 'Profile update failed');
                    }
                    finalResult = jsonResult;
                }

                // Send file fields separately as multipart.
                const baseUrl = process.env.EXPO_PUBLIC_API_URL;
                if (!baseUrl) {
                    throw new Error('API URL not configured');
                }
                const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

                for (const [key, value] of Object.entries(filePayload)) {
                    const formData = new FormData();
                    formData.append(key, value as any);

                    const response = await fetch(`${baseUrl}/users/profile`, {
                        method: 'PATCH',
                        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
                        body: formData,
                    });

                    const result = await response.json();

                    if (!response.ok || !result?.success) {
                        throw new Error(result?.message || 'Profile update failed');
                    }

                    finalResult = result;
                }

                return finalResult;
            }

            const response = await axiosInstance.patch('/users/profile', data);
            const result = response.data;

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
            if (errorData?.cloudflare_error || [502, 503, 504].includes(error.response?.status)) {
                const serverError = new Error('SERVER_UNAVAILABLE');
                (serverError as any).isServerUnavailable = true;
                return serverError;
            }
            if (Array.isArray(errorData.data) && errorData.data.length > 0) {
                const firstValidationError = errorData.data[0];
                if (typeof firstValidationError === "string") {
                    return new Error(firstValidationError);
                }
            }
            return new Error(errorData.message || 'An error occurred');
        }
        if (error?.isServerUnavailable || String(error?.message || '').includes('SERVER_UNAVAILABLE')) {
            const serverError = new Error('SERVER_UNAVAILABLE');
            (serverError as any).isServerUnavailable = true;
            return serverError;
        }
        return new Error(error.message || 'Network error occurred');
    }
}

export const profileService = new ProfileService();
