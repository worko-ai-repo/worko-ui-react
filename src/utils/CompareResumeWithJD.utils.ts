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
  
  let totalScore = 0;
  let allCriteriaScores = {
    coreSkills: 0,
    softSkills: 0,
    experience: 0,
    responsibilities: 0, // Placeholder for future implementation
  }

  /**
   *  ========================================================= Core Skills =========================================================
   * This section checks for core skills in the job description and the resume.
   * It calculates a score based on the number of matched core skills.
   * ===============================================================================================================================
   */
  if (jobDescription.coreSkills && userBasicDetails.coreSkills) {
    const jdWordsSet = new Set(jobDescription.coreSkills.map(s => s.toLowerCase()));
    const resumeWordsSet = new Set(userBasicDetails.coreSkills.map(s => s.skillName.toLowerCase()));
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
  
    // console.log("JD Core Skills: ", jdWordsSet);
    // console.log("Resume Core Skills: ", resumeWordsSet);
    // console.info("[1]:Core Skills Score (word-match): ", coreSkillsScore, '%');
  } else {
    // Default fallback if data is missing
    allCriteriaScores.coreSkills = 0;
    // console.warn("[1]:Core Skills Score: Skipped due to missing data. Defaulting to 0%.");
  }

  /**
   *  ========================================================= Soft Skills =========================================================
   * This section checks for soft skills in the job description and the resume.
   * It calculates a score based on the number of matched soft skills.
   * ===============================================================================================================================
   */
  if (jobDescription.softSkills && userBasicDetails.softSkills) {
    const jdWordsSet = new Set(jobDescription.softSkills.map(s => s.toLowerCase()));
    const resumeWordsSet = new Set(userBasicDetails.softSkills.map(s => s.skillName.toLowerCase()));
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
  
    // console.log("JD Soft Skills: ", jdWordsSet);
    // console.log("Resume Soft Skills: ", resumeWordsSet);
    // console.info("[1]:Soft Skills Score (word-match): ", softSkillsScore, '%');
  }else {
    // Default fallback if data is missing
    allCriteriaScores.softSkills = 0;
    // console.warn("[1]:Soft Skills Score: Skipped due to missing data. Defaulting to 0%.");
  }

  /**
   *  ========================================================= Experience =========================================================
   * This section checks for experience in the job description and the resume.
   * It calculates a score based on the years of experience.
   * ===============================================================================================================================
   */
  if (jobDescription.experienceRange && userBasicDetails.YOE !== undefined) {
    const { min, max } = jobDescription.experienceRange;
    let experienceScore = 0;
  
    if (userBasicDetails.YOE >= min) {
      // Candidate's experience is within or above the required range → full score
      // Example: Required = 3–5 years, Candidate = 3, 4, 5, or 6 → full score (90%)
      experienceScore = 90;
    } else {
      // Candidate is underqualified → penalize based on the gap
      // Example: Required = 3 years, Candidate = 2 → gap = 1
      // Score = 90 * (1 - gap / min) = 90 * (1 - 1/3) = 60
      const gap = min - userBasicDetails.YOE;
      const rawScore = 90 * (1 - gap / min);
      experienceScore = Math.max(0, Math.round(rawScore)); // Round and ensure non-negative
    }
    allCriteriaScores.experience = experienceScore;
    totalScore += experienceScore;
    // console.info("[3]:Experience Score Generated: ", experienceScore);
  }else {
    // Default fallback if data is missing
    allCriteriaScores.experience = 0;
    // console.warn("[1]:Experience Score: Skipped due to missing data. Defaulting to 0%.");
  }
  
  /**
   * ========================================================= Responsibilities =========================================================
   * This section checks for responsibilities in the job description and the resume.
   * It calculates a score based on the number of matched responsibilities.
   */
  if (allCriteriaScores.experience != undefined && allCriteriaScores.softSkills != undefined) {

    // Count the number of matches
    let matchCount = (allCriteriaScores.experience + allCriteriaScores.softSkills) * 0.35;
  
    // Calculate the base responsibilities score
    let responsibilitiesScore = Math.min(90, Math.round(matchCount));
  
    // @TODO: Cap responsibilities score to 10 if coreSkills is less than 20
    if (allCriteriaScores.coreSkills != undefined && allCriteriaScores.coreSkills < 20) {
      responsibilitiesScore = Math.min(responsibilitiesScore, 10);
    }
  
    allCriteriaScores.responsibilities = responsibilitiesScore;
    totalScore += allCriteriaScores.responsibilities;
    // console.info("[4]:Responsibilities Score Generated: ", allCriteriaScores.responsibilities);
  
  }else {
    // Default fallback if data is missing
    allCriteriaScores.responsibilities = 0;
    // console.warn("[1]:Responsibilities Score: Skipped due to missing data. Defaulting to 0%.");
  }
 
  // Ensure score is between 0-90
  totalScore = Math.min(90, Math.max(0, totalScore/ 400)*100);
  // console.info("[6]:Total Score Generated for jobId: ", jobDescription.id, "is: ", totalScore);
  // Round to nearest integer
  // console.info("=======END=======");
  // console.info("=======END=======");
  return {
    totalScore: Math.round(totalScore),
    coreSkillsScore:Math.round(allCriteriaScores.coreSkills),
    softSkillsScore: Math.round(allCriteriaScores.softSkills),
    experienceScore: Math.round(allCriteriaScores.experience),
    responsibilitiesScore:  Math.round(allCriteriaScores.responsibilities),
  };
}


