import { CorporateUserDetail } from "@Context/App.context";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { AuthLoginForGeneralUserDto } from "@Interfaces/Auth.dto";
import { cvExtractParsed } from "@Interfaces/JobsAndCompany.dto";
import SecureStorage from "@Services/LocalStorage.service";
import secureStorage from "./SecureStorage.utils";

export interface NormalizedUser {
  id: string;
  email: string;
  updatedAt: string;
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  fullName: string;
  userType: string[]; // e.g. ['CAND', 'EMP'] or ['corporate-admin']
  isCorporate: boolean;

  // Optional depending on user type
  companyId?: string;

  // General User only
  profileImageAwsS3SignedUrl?: string;
  CV?: string; // Base64 encoded CV file content
  cvUrl?: string;
  CTC?: number;
  ECTC?: number;
  YOE?: number;
  noticePeriod?: number;
  location?: string;
  about?: string;
  cvExtractParsed?: cvExtractParsed | null;
  lastAccessedDash?: string; // @Todo make it enum
  referralCount?: number;
  cvDuplicacyAccess: boolean;
  // Shared
  createdAt: string;
}
export function normalizeUserData(raw: Partial<CorporateUserDetail | AuthLoginForGeneralUserDto>): NormalizedUser {
   const isCorporate = "cognitoUserId" in raw;

  let fullName: string;
  if (isCorporate) {
    fullName = [raw.firstName?.trim() ?? "", raw.lastName?.trim() ?? ""].filter(Boolean).join(" ") || "Corporate User";
  } else {
    fullName = raw.name?.trim() ?? "User";
  }

  return {
    id: raw.id ?? "",
    email: isCorporate ? raw.email ?? "" : raw.emailList?.primary ?? raw.email ?? "",
    fullName,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    PK: raw.PK ?? "",
    SK: isCorporate ? raw.SK ?? "" : "",
    GSI1PK: raw.GSI1PK ?? "",
    GSI1SK: raw.GSI1SK ?? "",
    userType: isCorporate ? (raw.corporateUserType ? [raw.corporateUserType] : []) : Array.isArray(raw.userType) ? raw.userType : [],
    isCorporate,

    // Corporate
    companyId: isCorporate ? raw.companyId ?? "" : undefined,

    // General
    profileImageAwsS3SignedUrl:  raw.profileImageAwsS3SignedUrl ?? "",
    CV:  raw.CV ?? "",
    cvUrl:  raw.cvAwsS3SignedUrl ?? "",
    CTC:  raw.CTC ?? 0,
    ECTC:  raw.ECTC ?? 0,
    YOE:  raw.YOE ?? 0,
    noticePeriod:  raw.noticePeriod ?? 0,
    location:  raw.location ?? "",
    about:  raw.about ?? "",
    lastAccessedDash:  raw.lastAccessedDash ?? "",
    referralCount:  raw.referralCount ?? 0,
    cvDuplicacyAccess:  (raw as any)?.cvDuplicacyAccess ?? false,

    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}
