import httpServiceObj from "@Services/ApiHandler.service";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";

const APP_API_URI = import.meta.env.APP_API_URI || '';

// Data entity types for API calls
export type DataEntity = 'profile' | 'details' | 'education' | 'experience' | 'skills' | 'achievement' | 'subscription' | 'socialprofile' | 'preference' | 'multipleCandidateExperience';

export interface CognitoUserDetails {
  aud: string;
  auth_time: number;
  'cognito:groups'?: string[];
  'cognito:username': string;
  email: string;
  email_verified: boolean;
  event_id: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  origin_jti: string;
  phone_number: string;
  phone_number_verified: boolean;
  sub: string;
  token_use: 'id';
}

class ProfileService {
  // Get current user from secure storage
  getCurrentUser(): CognitoUserDetails | null {
    const userDetails = secureStorage.getItem(SecureStorageKeyEnum.COGNITOUSERDETAILS);
    return userDetails ? (userDetails as CognitoUserDetails) : null;
  }

  // Generic data fetching function
  async fetchUserData(email: string, entity: DataEntity): Promise<any> {
    if (!email) throw new Error("Email is required");

    const endpoint = entity === 'skills' ? 'Skill' : entity;
    // const url = entity === 'preference'
    //   ? `${APP_API_URI}/user/${endpoint}/${email}`
    //   : `${APP_API_URI}/user/${email}/${endpoint}`;
    const url = `${APP_API_URI}/user/${email}/${endpoint}`

    try {
      const { response } = await httpServiceObj.get(`${url}`, true, {}, true);
      return response;
    } catch (error: any) {
      const status = error?.response?.status || error?.status;

      if (entity === 'preference' && status === 404) {
        return {}; 
      }

      throw error; 
    }
  }

async fetchAllUserData(email: string): Promise<Record<DataEntity, any>> {
  if (!email) throw new Error("Email is required");

  const entitiesToFetch: DataEntity[] = [
    'profile',
    'details',
    'education',
    'experience',
    'skills',
    'achievement',
    'socialprofile',
    'preference',
  ];

  const result: Partial<Record<DataEntity, any>> = {};

  // Map each fetch to a try/catch wrapper to isolate failures
  const fetchPromises = entitiesToFetch.map(async (entity) => {
    try {
      const data = await this.fetchUserData(email, entity);
      result[entity] = data;
    } catch (err) {
      if (
        entity === 'preference' &&
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        (err as any).status === 404
      ) {
        result[entity] = {}; // Treat 404 as empty object
      } else {
        console.error(`Failed to fetch entity ${entity}`, err);
        throw err;
      }
    }
  });

  await Promise.all(fetchPromises);

  return result as Record<DataEntity, any>;
}
  //Generic data fetching function (old one was breaking because calling preference api initially fails wit 404)

  // async fetchUserData(email: string, entity: DataEntity): Promise<any> {
  //   if (!email) throw new Error("Email is required");

  //   // Handle the special case for skills endpoint
  //   const endpoint = entity === 'skills' ? 'Skill' : entity;
    
  //   // backend api changed so condition statement has been used
  //   const url = entity === 'preference'
  //     ? `${APP_API_URI}/user/${endpoint}/${email}`   
  //     : `${APP_API_URI}/user/${email}/${endpoint}`; 

  //   const { response, error } = await httpServiceObj.get(
  //     `${url}`, 
  //     true, 
  //     {}, 
  //     true
  //   );
  //   // console.log(response,"response")
  //   if (error) {
  //     if (entity === 'preference' && (error as any).status === 404) {
  //       return {};
  //     }
  //     throw error;
  //   }

  //   return response;
  // }
  
  // Fetch all user data types (old one was breaking because calling preference api initially fails wit 404)
  // async fetchAllUserData(email: string): Promise<Record<DataEntity, any>> {
  //   if (!email) throw new Error("Email is required");
    
  //   // Define entities to fetch
  //   const entitiesToFetch: DataEntity[] = [
  //     'profile', 
  //     'details', 
  //     'education', 
  //     'experience', 
  //     'skills', 
  //     'achievement',
  //     'socialprofile',
  //     'preference',
  //   ];

  //   const result: Partial<Record<DataEntity, any>> = {};

  //   try {
  //     // Create array of promises for all entities
  //     const fetchPromises = entitiesToFetch.map(async entity => {
  //       const data = await this.fetchUserData(email, entity);
  //       result[entity] = data;
  //       return data;
  //     });
      
  //     // Execute all promises in parallel
  //     await Promise.all(fetchPromises);
  //     // console.log("✅ All user data fetched:\n", JSON.stringify(result, null, 2));
  //     return result as Record<DataEntity, any>;
  //   } catch (err) {
  //     console.error("Failed to fetch user data:", err);
  //     throw new Error("Failed to fetch user data");
  //   }
  // }



  // Generic data updating function
  async updateUserData(email: string, entity: DataEntity, data: any, method: 'POST' | 'PUT' | "PATCH" = 'POST'): Promise<boolean> {
    if (!email) return false;
    try {
      // Handle the special case for skills endpoint
      const endpoint = entity === 'skills' ? 'Skill' : entity;
      const url = `${APP_API_URI}/user/${email}/${endpoint}`
      // const url = entity === 'preference'
      // ? `${APP_API_URI}/user/${endpoint}/${email}`   
      // : `${APP_API_URI}/user/${email}/${endpoint}`;

      // console.log(email, entity,data,method,url)
      if(entity === 'preference' && method === "POST"){
        const { response, error } = await httpServiceObj[method.toLowerCase() as 'post'](
          `${APP_API_URI}/user/${endpoint}/`, 
          data,
          true, 
          {}, 
          true
        );
        if (error) throw error;
        return true;
      }
      
      const { response, error } = await httpServiceObj[method.toLowerCase() as 'post' | 'put'](
        `${url}`, 
        data,
        true, 
        {}, 
        true
      );
      // console.log(response)
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Failed to update ${entity}:`, err);
      return false;
    }
  }

  // Update profile data
  async updateProfileData(email: string, data: any): Promise<boolean> {
    return await this.updateUserData(email, 'profile', data);
  }

  // Update details data
  async updateDetailsData(email: string, currentData: any, newData: Partial<any>): Promise<boolean> {
    // console.log(currentData)
    if (!currentData) {
      console.error("Details data is null or undefined");
      return false;
    }
    //below fields are allowed only and compulsory as per old api that is why its done
    const allowedFields = new Set([
    "CTC","ECTC","PK","SK","YOE","about","candidateExperience","country","emailList","isCandidateFresher","isCvUpdated","isEmailVerified","isNumberVerified","isSubscribed","lastAccessedDash","linkedinUrl","location","name","noticePeriod","number","referralCount","userType","isNoticePeriodNegotiable","gender","responsibilities","isNumberVerified","multipleCandidateExperience"
  ]);
  const sanitizedNewData = Object.fromEntries(
    Object.entries(newData).filter(([key]) => allowedFields.has(key))
  );

    // Handle both array and object formats for detailsData
    let updatedDetailsData;
    
    if (Array.isArray(currentData)) {
      // If it's an array, update the first item
      if(!currentData[0]?.isCandidateFresher){
        updatedDetailsData = {
          ...currentData[0],
          ...sanitizedNewData,
          isCandidateFresher:false
        };
      }else{
        updatedDetailsData = {
          ...currentData[0],
          ...sanitizedNewData
        };
      }
    } else {
      // If it's already an object, just update it directly
      if(!currentData?.isCandidateFresher){
        updatedDetailsData = {
          ...currentData,
          ...sanitizedNewData,
          isCandidateFresher:false
        };
      }else{
        updatedDetailsData = {
          ...currentData,
          ...sanitizedNewData
        };
      }
    }
let payload = { ...updatedDetailsData };

const hasCandidateExperience =
  'candidateExperience' in payload &&
  payload.candidateExperience &&
  Object.keys(payload.candidateExperience).length > 0;

  const hasMultipleCandidateExperience =
    'multipleCandidateExperience' in payload &&
    Array.isArray(payload.multipleCandidateExperience) &&
    payload.multipleCandidateExperience.length > 0;

  if (!hasCandidateExperience && !hasMultipleCandidateExperience) {
    payload.isCandidateFresher = true;
  } else if (hasCandidateExperience && hasMultipleCandidateExperience) {
    payload.isCandidateFresher = false;
  } else if (hasMultipleCandidateExperience && !hasCandidateExperience) {
    payload.isCandidateFresher = false;
    payload.candidateExperience = payload.multipleCandidateExperience[0];
  } else if (!hasMultipleCandidateExperience && hasCandidateExperience) {
    payload.isCandidateFresher = false;
  }
    // console.log(payload,"payload 297")
    return await this.updateUserData(email, 'details', payload, 'PUT');
  }

  async updateDetailsData2(email: string, currentData: any, newData: Partial<any>): Promise<boolean> {
  if (!currentData) {
    console.error("Details data is null or undefined");
    return false;
  }

  let updatedDetailsData;

  if (Array.isArray(currentData)) {
    updatedDetailsData = {
      ...currentData[0],
      ...newData,
    };
  } else {
    updatedDetailsData = {
      ...currentData,
      ...newData,
    };
  }

  let payload = { ...updatedDetailsData };

  const hasCandidateExperience =
    'candidateExperience' in payload &&
    payload.candidateExperience &&
    Object.keys(payload.candidateExperience).length > 0;

    const hasMultipleCandidateExperience =
      'multipleCandidateExperience' in payload &&
      Array.isArray(payload.multipleCandidateExperience) &&
      payload.multipleCandidateExperience.length > 0;

    if (!hasCandidateExperience && !hasMultipleCandidateExperience) {
      payload.isCandidateFresher = true;
    } else if (hasCandidateExperience && hasMultipleCandidateExperience) {
      payload.isCandidateFresher = false;
    } else if (hasMultipleCandidateExperience && !hasCandidateExperience) {
      payload.isCandidateFresher = false;
      payload.candidateExperience = payload.multipleCandidateExperience[0];
    } else if (!hasMultipleCandidateExperience && hasCandidateExperience) {
      payload.isCandidateFresher = false;
    }

  // console.log(payload,"payload 356")
  return await this.updateUserData(email, 'details', payload, 'PUT');
}

  // Update education data
  async updateEducationData(email: string, data: any, currentData: any[] | null, index?: number): Promise<boolean> {
    // console.log(email,data,"data",currentData,"currentdata",index)
    // If index is provided, update existing education entry
    // if (currentData && currentData[index || 0]) {
      const updatedData = {
        ...data
      };
      // console.log("updateddata",updatedData)
      return await this.updateUserData(email, 'education', [updatedData], 'POST');
    // } 
    // Otherwise add new education entry
    // else {
    //   return await this.updateUserData(email, 'education', [data],"POST");
    // }
  }

  // Update experience data
  async updateExperienceData(email: string, data: any, currentData: any[] | null, index?: number): Promise<boolean> {
    // If index is provided, update existing experience entry
    if (index !== undefined && currentData && currentData[index]) {
      const updatedData = {
        ...currentData[index],
        ...data
      };
      return await this.updateUserData(email, 'experience', updatedData, 'PUT');
    } 
    // Otherwise add new experience entry
    else {
      return await this.updateUserData(email, 'experience', data);
    }
  }

  // Update skills data
  async updateSkillsData(email: string, currentData: any, data: Partial<any>, skillType: string): Promise<boolean> {
    if (!currentData) return false;

    const updatedSkills = [...currentData]; // Clone the entire array
    
    // Update the specific skill type within the first element
    updatedSkills[0] = {
      ...updatedSkills[0],             // Keep all existing data
      [skillType]: data[skillType],    // Update only the specific skill type
    };
    // console.log(updatedSkills,"updated skills")
    return await this.updateUserData(email, 'skills', updatedSkills[0]);
  }

  // Update preference data
  async updatePreferenceData(email: string, currentData: any, data: Partial<any>, preferenceType: string): Promise<boolean> {
    let updatedPreference = {...currentData}; 
      updatedPreference = {
        ...updatedPreference,            
        [preferenceType]: data[preferenceType], 
    };
      const {userPreferredRoles, userPreferredIndustries, userPreferredDepartments, userPreferredlocations} = updatedPreference
      // console.log(userPreferredRoles, userPreferredIndustries, userPreferredDepartments, userPreferredlocations,"updated skills")
      // console.log(updatedPreference,"updatedPreference")
      return await this.updateUserData(email, 'preference', {
      email,
      userPreferredRoles: userPreferredRoles,
      userPreferredIndustries: userPreferredIndustries,
      userPreferredDepartments: userPreferredDepartments ,
      userPreferredlocations: userPreferredlocations,
    }, "POST");
  }

  // Update achievement data
  async updateAchievementData(
    email: string,
    currentData: any, 
    data: any | string, 
    type: 'achievement' | 'responsibility', 
    index?: number
  ): Promise<boolean> {
    // console.log("currentData",currentData)
    // if (!currentData) return false;
    // console.log("currentData",currentData)
    let updatedData = { ...currentData };
    
    if (type === 'achievement') {
      // Update or add achievement
      if (index !== undefined && updatedData.achievements && updatedData.achievements[index]) {
        updatedData.achievements[index] = {
          ...updatedData.achievements[index],
          ...(data as any)
        };
      } else {
        // Format according to expected payload structure
        updatedData = {
          achievements: (data.achievements as any[]).map((item) => ({
            ...item,
            acquiredFrom: item.acquiredFrom || 'exam', // Use existing acquiredFrom or default to 'exam'
            timestamps: {
              createdAt: item.timestamps?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })),
          SK: "ACHIEVEMENT#",
          PK: `USR#EML#${email}`
        };
      }
    } else if (type === 'responsibility') {
      // Update or add responsibility
      if (!updatedData.responsibilities) {
        updatedData.responsibilities = [];
      }
      
      if (index !== undefined && updatedData.responsibilities[index]) {
        updatedData.responsibilities[index] = data as string;
      } else {
        updatedData.responsibilities = [
          ...updatedData.responsibilities,
          data as string
        ];
      }
    }
    // console.log("currentData",updatedData)
    return await this.updateUserData(email, 'achievement', updatedData);
  }

  async updateSocialData(email: string,currentData: any, index?: number): Promise<boolean> {

    if (!currentData) return false;

    // console.log(currentData,"currentdata")
    const updatedSocials = currentData
    // console.log(updatedSocials)
    return await this.updateUserData(email, 'socialprofile', updatedSocials);
  }

  // Remove skill
  async removeSkill(email: string, currentData: any, skillType: string, index: number): Promise<boolean> {
    if (!currentData || !currentData[skillType]) return false;
    
    const updatedSkills = { ...currentData };
    updatedSkills[skillType] = [
      ...updatedSkills[skillType].slice(0, index),
      ...updatedSkills[skillType].slice(index + 1)
    ];
    
    return await this.updateUserData(email, 'skills', updatedSkills);
  }

  // Remove achievement
  async removeAchievement(email: string, currentData: any, type: 'achievement' | 'responsibility', index: number): Promise<boolean> {
    if (!currentData) return false;
    
    const updatedData = { ...currentData };
    
    if (type === 'achievement' && updatedData.achievements) {
      updatedData.achievements = [
        ...updatedData.achievements.slice(0, index),
        ...updatedData.achievements.slice(index + 1)
      ];
    } else if (type === 'responsibility' && updatedData.responsibilities) {
      updatedData.responsibilities = [
        ...updatedData.responsibilities.slice(0, index),
        ...updatedData.responsibilities.slice(index + 1)
      ];
    }
    
    return await this.updateUserData(email, 'achievement', updatedData);
  }

  // Get subscription plan
  async getSubscriptionPlan(email: string): Promise<any> {
    // console.log(email);
    if (!email) {
      return null;
    }
    
    try {
        // console.log('In get subscription plan');
      return await this.fetchUserData(email, 'subscription');
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      return null;
    }
  }
}

// Create singleton instance
const profileService = new ProfileService();
export default profileService;