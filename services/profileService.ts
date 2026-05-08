import {
    ProfileResponse,
    UpdatePreferencesData,
    UpdatePreferencesResponse,
    UpdateProfileData
} from '@/types';
import axiosInstance from '@/utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from "expo-file-system/legacy";

const ACCESS_TOKEN_STORAGE_KEY = 'auth_access_token';

class ProfileService {
    private isSystemManagedExperience(experience: any) {
        if (!experience || typeof experience !== "object") return false;

        // Backend rejects edit/delete for system-added experiences.
        // Typical indicators: official source and/or linked employment record.
        const source = String(experience?.source || "").toLowerCase();
        return Boolean(
            experience?.employmentId ||
            source === "official" ||
            experience?.isOfficial === true
        );
    }

    private getSafeFileName(name: string, mimeType: string) {
        const sanitizedBase = (name || "file")
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 80);

        const extByMime: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
        };
        const ext = extByMime[mimeType] || "bin";
        return `${sanitizedBase || "file"}.${ext}`;
    }

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
        const normalizedBusinessId = experience?.businessId;
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

    private async prepareExperiencePayload(payload: Record<string, any>) {
        const nextPayload: Record<string, any> = { ...payload };
        const logo = nextPayload.customBusinessLogo;
        if (!this.isFileLike(logo)) return nextPayload;

        const safeFileName = this.getSafeFileName(logo.name, logo.type);
        let uploadUri = logo.uri;
        if (uploadUri.startsWith("content://")) {
            const targetPath = `${FileSystem.cacheDirectory}${Date.now()}_${safeFileName}`;
            await FileSystem.copyAsync({
                from: uploadUri,
                to: targetPath,
            });
            uploadUri = targetPath;
        }

        nextPayload.customBusinessLogo = {
            uri: uploadUri,
            name: safeFileName,
            type: logo.type,
        };

        return nextPayload;
    }

    private hasFileInExperiencePayload(payload: Record<string, any>) {
        return Object.values(payload).some((value) => this.isFileLike(value));
    }

    private async sendExperienceMultipart(
        method: "POST" | "PATCH",
        path: string,
        payload: Record<string, any>
    ) {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL;
        if (!baseUrl) {
            throw new Error("API URL not configured");
        }
        const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        const formData = this.buildExperienceFormData(payload);
        const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            body: formData,
        });

        const rawText = await response.text();
        let result: any = null;
        try {
            result = rawText ? JSON.parse(rawText) : null;
        } catch {
            result = null;
        }

        if (!response.ok || result?.success === false) {
            throw new Error(result?.message || "Failed to sync experience");
        }

        return result;
    }

    private compactPayload<T extends Record<string, any>>(payload: T): Partial<T> {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as Partial<T>;
    }

    async syncExperiences(
        experiences: any[],
        existingExperiences: any[] = []
    ): Promise<{
        created: number;
        updated: number;
        deleted: number;
        skippedNoChanges: number;
        skippedSystemManaged: number;
    }> {
        try {
            const summary = {
                created: 0,
                updated: 0,
                deleted: 0,
                skippedNoChanges: 0,
                skippedSystemManaged: 0,
            };
            if (!Array.isArray(experiences)) return summary;

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
                    if (this.isSystemManagedExperience(existing)) {
                        console.log("[ProfileService] DELETE /experiences/:id skipped (system-managed)", {
                            id: existing.id,
                        });
                        summary.skippedSystemManaged += 1;
                        continue;
                    }
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
                    summary.deleted += 1;
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
                const preparedPayload = await this.prepareExperiencePayload(requestPayload);

                if (existing?.id) {
                    if (this.isSystemManagedExperience(existing)) {
                        console.log("[ProfileService] PATCH /experiences skipped (system-managed)", {
                            id: existing.id,
                        });
                        summary.skippedSystemManaged += 1;
                        continue;
                    }
                    if (!this.isExperienceChanged(existing, preparedPayload)) {
                        console.log("[ProfileService] PATCH /experiences skipped (no changes)", {
                            id: existing.id,
                        });
                        summary.skippedNoChanges += 1;
                        continue;
                    }
                    console.log("[ProfileService] PATCH /experiences/:id", {
                        id: existing.id,
                        payload: preparedPayload,
                    });
                    const patchResponse = this.hasFileInExperiencePayload(preparedPayload)
                        ? await this.sendExperienceMultipart(
                            "PATCH",
                            `/experiences/${existing.id}`,
                            preparedPayload
                        )
                        : await axiosInstance.patch(`/experiences/${existing.id}`, preparedPayload);
                    const patchResult = this.hasFileInExperiencePayload(preparedPayload)
                        ? patchResponse
                        : patchResponse?.data;
                    console.log("[ProfileService] PATCH /experiences/:id response", {
                        id: existing.id,
                        result: patchResult,
                    });
                    if (patchResult?.success === false) {
                        throw new Error(patchResult?.message || "Failed to update experience");
                    }
                    summary.updated += 1;
                } else {
                    console.log("[ProfileService] POST /experiences", {
                        payload: preparedPayload,
                    });
                    const postResponse = this.hasFileInExperiencePayload(preparedPayload)
                        ? await this.sendExperienceMultipart(
                            "POST",
                            "/experiences",
                            preparedPayload
                        )
                        : await axiosInstance.post("/experiences", preparedPayload);
                    const postResult = this.hasFileInExperiencePayload(preparedPayload)
                        ? postResponse
                        : postResponse?.data;
                    console.log("[ProfileService] POST /experiences response", {
                        result: postResult,
                    });
                    if (postResult?.success === false) {
                        throw new Error(postResult?.message || "Failed to create experience");
                    }
                    summary.created += 1;
                }
            }
            return summary;
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
