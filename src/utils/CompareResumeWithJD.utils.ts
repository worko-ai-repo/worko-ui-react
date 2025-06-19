import { JobDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";

export interface ScoreWeightsDto {
  coreSkills: number;
  softSkills: number;
  experience: number;
}

export function compareResumeWithJD(
  jobDescription: JobDto,
  userBasicDetails: UserBasicDetailsDto
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
  };

  /**
   * =============================== Skill Matching Utility ===============================
   */
  function calculateSkillScore({ jdSkills, resumeSkills, maxScore = 90, extractResumeSkill = (s: any) => s?.skillName }: { jdSkills: (string | null | undefined)[]; resumeSkills: any[]; maxScore?: number; extractResumeSkill?: (skill: any) => string | null | undefined }): number {
    try {
      const jdSet = new Set(jdSkills.filter((s) => typeof s === "string" && s.trim().length > 0).map((s) => s!.toLowerCase().trim()));

      const userSet = new Set(
        resumeSkills
          .map(extractResumeSkill)
          .filter((s) => typeof s === "string" && s.trim().length > 0)
          .map((s) => s!.toLowerCase().trim())
      );

      let matchCount = 0;
      jdSet.forEach((skill) => {
        if (userSet.has(skill)) matchCount++;
      });

      const matchRatio = jdSet.size > 0 ? matchCount / jdSet.size : 0;
      const rawScore = matchRatio * 100;
      return Math.min(maxScore, Math.round(rawScore));
    } catch (error) {
      console.error("Error processing skills:", error);
      return 0;
    }
  }

  /**
   * =============================== Core Skills ===============================
   */
  allCriteriaScores.coreSkills =
    Array.isArray(jobDescription.coreSkills) && Array.isArray(userBasicDetails.coreSkills)
      ? calculateSkillScore({
          jdSkills: jobDescription.coreSkills,
          resumeSkills: userBasicDetails.coreSkills,
          extractResumeSkill: (s) => s?.skillName,
        })
      : 0;

  totalScore += allCriteriaScores.coreSkills;

  /**
   * =============================== Soft Skills ===============================
   */
  allCriteriaScores.softSkills =
    Array.isArray(jobDescription.softSkills) && Array.isArray(userBasicDetails.softSkills)
      ? calculateSkillScore({
          jdSkills: jobDescription.softSkills,
          resumeSkills: userBasicDetails.softSkills,
          extractResumeSkill: (s) => s?.skillName,
        })
      : 0;

  totalScore += allCriteriaScores.softSkills;

  /**
   * ========================================================= Experience =========================================================
   */
  if (jobDescription.experienceRange && typeof jobDescription.experienceRange === "object" && typeof jobDescription.experienceRange.min === "number" && typeof jobDescription.experienceRange.max === "number" && typeof userBasicDetails.YOE === "number" && !isNaN(userBasicDetails.YOE)) {
    try {
      const { min: jdMinYOE, max: jdMaxYOE } = jobDescription.experienceRange;
      const userYOE = userBasicDetails.YOE;

      let experienceScore = 0;

      // Validate input
      if (jdMinYOE < 0 || jdMaxYOE < 0 || jdMinYOE > jdMaxYOE) {
        console.warn("Invalid experience range:", { jdMinYOE, jdMaxYOE });
        allCriteriaScores.experience = 0;
      } else {
        const matchRatio = jdMinYOE > 0 ? Math.min(userYOE / jdMinYOE, 2) : 0;
        const relevanceRatio = userYOE > 0 ? Math.min(jdMinYOE / userYOE, 1) : 0;

        const rawScore = matchRatio * relevanceRatio * 100;

        experienceScore = Math.min(90, Math.round(rawScore));
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
  if (typeof allCriteriaScores.experience === "number" && typeof allCriteriaScores.softSkills === "number" && !isNaN(allCriteriaScores.experience) && !isNaN(allCriteriaScores.softSkills)) {
    try {
      // Count the number of matches
      let matchCount = (allCriteriaScores.experience + allCriteriaScores.softSkills) * 0.35;

      // Calculate the base responsibilities score
      let responsibilitiesScore = Math.min(90, Math.round(matchCount));

      // Cap responsibilities score to 10 if coreSkills is less than 20
      if (typeof allCriteriaScores.coreSkills === "number" && !isNaN(allCriteriaScores.coreSkills) && allCriteriaScores.coreSkills < 20) {
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
    // Initialize all individual scores to 0 if undefined
    const coreSkillsScore = typeof allCriteriaScores.coreSkills === "number" ? allCriteriaScores.coreSkills : 0;
    const experienceScore = typeof allCriteriaScores.experience === "number" ? allCriteriaScores.experience : 0;
    const softSkillsScore = typeof allCriteriaScores.softSkills === "number" ? allCriteriaScores.softSkills : 0;
    const responsibilitiesScore = typeof allCriteriaScores.responsibilities === "number" ? allCriteriaScores.responsibilities : 0;

    // Apply weighted calculation
    totalScore = coreSkillsScore * 0.4 + experienceScore * 0.3 + softSkillsScore * 0.2 + responsibilitiesScore * 0.1;

    // Clamp final score to 0–100 range
    totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
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
