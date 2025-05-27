import { JobDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";

export interface ScoreWeightsDto {
  coreSkills: number;
  softSkills: number;
  experience: number;
}

export function compareResumeWithJD(
  jobDescription: JobDto,
  userBasicDetails: UserBasicDetailsDto,
): {
  totalScore: number;
  coreSkillsScore?: number;
  softSkillsScore?: number;
  experienceScore?: number;
  responsibilitiesScore?: number;
} {  
  
  // Guard against null/undefined inputs
  if (!jobDescription || !userBasicDetails) {
    console.warn("Missing jobDescription or userBasicDetails");
    return {
      totalScore: 0,
      coreSkillsScore: 0,
      softSkillsScore: 0,
      experienceScore: 0,
      responsibilitiesScore: 0,
    };
  }
  
  let totalScore = 0;
  let allCriteriaScores = {
    coreSkills: 0,
    softSkills: 0,
    experience: 0,
    responsibilities: 0,
  }

  /**
   * ========================================================= Core Skills =========================================================
   */
  if (Array.isArray(jobDescription.coreSkills) && 
      Array.isArray(userBasicDetails.coreSkills) && 
      jobDescription.coreSkills.length > 0 && 
      userBasicDetails.coreSkills.length > 0) {
    
    try {
      // Filter out null/undefined values and convert to lowercase
      const jdWordsSet = new Set(
        jobDescription.coreSkills
          .filter(s => s != null && typeof s === 'string' && s.trim().length > 0)
          .map(s => s.toLowerCase().trim())
      );
      
      const resumeWordsSet = new Set(
        userBasicDetails.coreSkills
          .filter(s => s && 
                      typeof s === 'object' && 
                      s.skillName != null && 
                      typeof s.skillName === 'string' && 
                      s.skillName.trim().length > 0)
          .map(s => s.skillName.toLowerCase().trim())
      );
      
      // Count the number of matches
      let matchCount = 0;
      jdWordsSet.forEach(word => {
        if (resumeWordsSet.has(word)) matchCount++;
      });
      
      // Calculate the score based on the number of matches by the total number of JD words
      const rawScore = jdWordsSet.size > 0
        ? (matchCount / jdWordsSet.size) * 100
        : 0;
      
      // Cap the score to 90% max
      const coreSkillsScore = Math.min(90, Math.round(rawScore));
      allCriteriaScores.coreSkills = coreSkillsScore;
      totalScore += coreSkillsScore;
    } catch (error) {
      console.error("Error processing core skills:", error);
      allCriteriaScores.coreSkills = 0;
    }
  } else {
    allCriteriaScores.coreSkills = 0;
  }

  /**
   * ========================================================= Soft Skills =========================================================
   */
  if (Array.isArray(jobDescription.softSkills) && 
      Array.isArray(userBasicDetails.softSkills) && 
      jobDescription.softSkills.length > 0 && 
      userBasicDetails.softSkills.length > 0) {
    
    try {
      // Filter out null/undefined values and convert to lowercase
      const jdWordsSet = new Set(
        jobDescription.softSkills
          .filter(s => s != null && typeof s === 'string' && s.trim().length > 0)
          .map(s => s.toLowerCase().trim())
      );
      
      const resumeWordsSet = new Set(
        userBasicDetails.softSkills
          .filter(s => s && 
                      typeof s === 'object' && 
                      s.skillName != null && 
                      typeof s.skillName === 'string' && 
                      s.skillName.trim().length > 0)
          .map(s => s.skillName.toLowerCase().trim())
      );
      
      // Count the number of matches
      let matchCount = 0;
      jdWordsSet.forEach(word => {
        if (resumeWordsSet.has(word)) matchCount++;
      });
      
      // Calculate the score based on the number of matches by the total number of JD words
      const rawScore = jdWordsSet.size > 0
        ? (matchCount / jdWordsSet.size) * 100
        : 0;
      
      // Cap the score to 90% max
      const softSkillsScore = Math.min(90, Math.round(rawScore));
      allCriteriaScores.softSkills = softSkillsScore;
      totalScore += softSkillsScore;
    } catch (error) {
      console.error("Error processing soft skills:", error);
      allCriteriaScores.softSkills = 0;
    }
  } else {
    allCriteriaScores.softSkills = 0;
  }
  
  /**
   * ========================================================= Experience =========================================================
   */
  if (jobDescription.experienceRange && 
      typeof jobDescription.experienceRange === 'object' &&
      typeof jobDescription.experienceRange.min === 'number' &&
      typeof jobDescription.experienceRange.max === 'number' &&
      typeof userBasicDetails.YOE === 'number' &&
      !isNaN(userBasicDetails.YOE)) {
    
    try {
      const { min, max } = jobDescription.experienceRange;
      let experienceScore = 0;
    
      // Validate min/max values
      if (min < 0 || max < 0 || min > max) {
        console.warn("Invalid experience range:", { min, max });
        allCriteriaScores.experience = 0;
      } else if (userBasicDetails.YOE >= min) {
        experienceScore = 90;
        allCriteriaScores.experience = experienceScore;
        totalScore += experienceScore;
      } else {
        const gap = min - userBasicDetails.YOE;
        const rawScore = 90 * (1 - gap / min);
        experienceScore = Math.max(0, Math.round(rawScore));
        allCriteriaScores.experience = experienceScore;
        totalScore += experienceScore;
      }
    } catch (error) {
      console.error("Error processing experience:", error);
      allCriteriaScores.experience = 0;
    }
  } else {
    allCriteriaScores.experience = 0;
  }
  
  /**
   * ========================================================= Responsibilities =========================================================
   */
  if (typeof allCriteriaScores.experience === 'number' && 
      typeof allCriteriaScores.softSkills === 'number' &&
      !isNaN(allCriteriaScores.experience) &&
      !isNaN(allCriteriaScores.softSkills)) {
    
    try {
      // Count the number of matches
      let matchCount = (allCriteriaScores.experience + allCriteriaScores.softSkills) * 0.35;
    
      // Calculate the base responsibilities score
      let responsibilitiesScore = Math.min(90, Math.round(matchCount));
    
      // Cap responsibilities score to 10 if coreSkills is less than 20
      if (typeof allCriteriaScores.coreSkills === 'number' && 
          !isNaN(allCriteriaScores.coreSkills) && 
          allCriteriaScores.coreSkills < 20) {
        responsibilitiesScore = Math.min(responsibilitiesScore, 10);
      }
    
      allCriteriaScores.responsibilities = responsibilitiesScore;
      totalScore += allCriteriaScores.responsibilities;
    } catch (error) {
      console.error("Error processing responsibilities:", error);
      allCriteriaScores.responsibilities = 0;
    }
  } else {
    allCriteriaScores.responsibilities = 0;
  }
 
  // Ensure totalScore calculation is safe
  try {
    // Validate totalScore before final calculation
    if (typeof totalScore !== 'number' || isNaN(totalScore)) {
      totalScore = 0;
    }
    
    // Ensure score is between 0-90
    totalScore = Math.min(90, Math.max(0, (totalScore / 400) * 100));
    
    // Validate final score
    if (typeof totalScore !== 'number' || isNaN(totalScore)) {
      totalScore = 0;
    }
  } catch (error) {
    console.error("Error calculating total score:", error);
    totalScore = 0;
  }

  return {
    totalScore: Math.round(totalScore),
    coreSkillsScore: Math.round(allCriteriaScores.coreSkills),
    softSkillsScore: Math.round(allCriteriaScores.softSkills),
    experienceScore: Math.round(allCriteriaScores.experience),
    responsibilitiesScore: Math.round(allCriteriaScores.responsibilities),
  };
}