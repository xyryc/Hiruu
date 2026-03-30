import type { RecruitmentFilterQuery } from "@/types";

type QueryValue = string | number | boolean;

const toCsv = (value?: string[] | string): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const cleaned = value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  return cleaned.length > 0 ? cleaned.join(",") : undefined;
};

const toTrimmed = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNumber = (value?: number): number | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value;
};

const toBoolean = (value?: boolean): boolean | undefined => {
  return typeof value === "boolean" ? value : undefined;
};

const setIfDefined = (
  target: Record<string, QueryValue>,
  key: string,
  value: QueryValue | undefined
) => {
  if (typeof value !== "undefined") {
    target[key] = value;
  }
};

export const buildRecruitmentQuery = (
  params: RecruitmentFilterQuery = {}
): Record<string, QueryValue> => {
  const query: Record<string, QueryValue> = {
    page: toNumber(params.page) ?? 1,
    limit: toNumber(params.limit) ?? 10,
  };

  setIfDefined(query, "search", toTrimmed(params.search));
  setIfDefined(query, "roleId", toTrimmed(params.roleId));
  setIfDefined(query, "businessId", toTrimmed(params.businessId));
  setIfDefined(query, "salaryType", toTrimmed(params.salaryType));
  setIfDefined(query, "shiftType", toTrimmed(params.shiftType));
  setIfDefined(query, "shiftTypes", toCsv(params.shiftTypes));
  setIfDefined(query, "jobType", toTrimmed(params.jobType));
  setIfDefined(query, "jobTypes", toCsv(params.jobTypes));
  setIfDefined(query, "isActive", toBoolean(params.isActive));
  setIfDefined(query, "skills", toCsv(params.skills));
  setIfDefined(query, "gender", toTrimmed(params.gender));
  setIfDefined(query, "experience", toTrimmed(params.experience));
  setIfDefined(query, "experienceLevels", toCsv(params.experienceLevels));
  setIfDefined(query, "experienceRequirements", toCsv(params.experienceRequirements));
  setIfDefined(query, "ageMin", toNumber(params.ageMin));
  setIfDefined(query, "ageMax", toNumber(params.ageMax));
  setIfDefined(query, "shiftStartTime", toTrimmed(params.shiftStartTime));
  setIfDefined(query, "shiftEndTime", toTrimmed(params.shiftEndTime));
  setIfDefined(query, "salaryMin", toNumber(params.salaryMin));
  setIfDefined(query, "salaryMax", toNumber(params.salaryMax));
  setIfDefined(query, "minSalary", toNumber(params.minSalary));
  setIfDefined(query, "maxSalary", toNumber(params.maxSalary));
  setIfDefined(query, "numberOfOpenings", toNumber(params.numberOfOpenings));
  setIfDefined(query, "filledPositions", toNumber(params.filledPositions));
  setIfDefined(query, "postedById", toTrimmed(params.postedById));
  setIfDefined(query, "isClosed", toBoolean(params.isClosed));
  setIfDefined(query, "isFeatured", toBoolean(params.isFeatured));
  setIfDefined(query, "roleIds", toCsv(params.roleIds));
  setIfDefined(query, "location", toTrimmed(params.location));
  setIfDefined(query, "latitude", toNumber(params.latitude));
  setIfDefined(query, "longitude", toNumber(params.longitude));
  setIfDefined(query, "maxDistanceKm", toNumber(params.maxDistanceKm));
  setIfDefined(query, "verifiedOnly", toBoolean(params.verifiedOnly));
  setIfDefined(query, "sortBy", toTrimmed(params.sortBy));

  return query;
};
