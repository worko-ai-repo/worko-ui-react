import { JobDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";

export interface ScoreWeightsDto {
  coreSkills: number;
  softSkills: number;
  experience: number;
  responsibilities: number;
}

export interface DetailedScoreResult {
  totalScore: number;
  coreSkillsScore: number;
  softSkillsScore: number;
  experienceScore: number;
  responsibilitiesScore: number;
  breakdown: {
    coreSkillsWeighted: number;
    softSkillsWeighted: number;
    experienceWeighted: number;
    responsibilitiesWeighted: number;
  };
}

// Default weights that sum to 1.0
const DEFAULT_WEIGHTS: ScoreWeightsDto = {
  coreSkills: 0.4, // 40%
  softSkills: 0.2, // 20%
  experience: 0.3, // 30%
  responsibilities: 0.1, // 10%
};

export function compareResumeWithJD(
  jobDescription: JobDto,
  userBasicDetails: UserBasicDetailsDto,
  customWeights?: Partial<ScoreWeightsDto>
): DetailedScoreResult {
  // Guard against null/undefined inputs
  if (!jobDescription || !userBasicDetails) {
    console.warn("Missing jobDescription or userBasicDetails");
    return createEmptyResult();
  }

  // Merge custom weights with defaults
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  // Validate weights sum to 1.0 (with small tolerance for floating point)
  const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    console.warn(`Weights don't sum to 1.0 (sum: ${weightSum}), normalizing...`);
    Object.keys(weights).forEach((key) => {
      weights[key as keyof ScoreWeightsDto] /= weightSum;
    });
  }

  let individualScores = {
    coreSkills: 0,
    softSkills: 0,
    experience: 0,
    responsibilities: 0,
  };

  /**
   * =============================== Core & Soft Skills (from initial matching) ===============================
   */
  const initialScore =
    parseFloat(jobDescription.initialMatchingScoreDetails?.finalScore?.toFixed(2) || "0") * 100;

  let resumeCoreMatches = 0;
  let resumeSoftMatches = 0;
  let dynamicCoreRatio = 0;
  let dynamicSoftRatio = 0;
  if (jobDescription && jobDescription?.coreSkills && jobDescription?.softSkills) {
    const userResumeCoreSkills = userBasicDetails?.coreSkills || [];
    const userResumeSoftSkills = userBasicDetails?.softSkills || [];
    // split ratio (e.g. 70% core, 30% soft)
    resumeCoreMatches = calculateSkillScore({
      jdSkills: jobDescription?.coreSkills,
      resumeSkills: userResumeCoreSkills,
    });
    resumeSoftMatches = calculateSkillScore({
      jdSkills: jobDescription?.softSkills,
      resumeSkills: userResumeSoftSkills,
    });
    dynamicCoreRatio = 0.7 + (resumeCoreMatches > resumeSoftMatches ? 0.1 : 0); // 70% baseline + 10% boost
    dynamicSoftRatio = 1 - dynamicCoreRatio;
  } else {
    // split ratio (e.g. 70% core, 30% soft)
    const totalSkillWeight = weights.coreSkills + weights.softSkills;
    dynamicCoreRatio = weights.coreSkills / totalSkillWeight; // 0.4 / 0.6 = 0.667
    dynamicSoftRatio = weights.softSkills / totalSkillWeight; // 0.2 / 0.6 = 0.333
  }
  // Apply ratio to split
  individualScores.coreSkills = Math.min(90, Math.round(initialScore * dynamicCoreRatio));
  individualScores.softSkills = Math.min(90, Math.round(initialScore * dynamicSoftRatio));

  // Alternative Approach 2: If you want to use the raw initial score for both
  // individualScores.coreSkills = Math.min(90, initialScore);
  // individualScores.softSkills = Math.min(90, initialScore);

  /**
   * =============================== Experience Score ===============================
   */
  individualScores.experience = calculateExperienceScore(jobDescription, userBasicDetails);

  /**
   * =============================== Responsibilities Score ===============================
   */
  individualScores.responsibilities = calculateResponsibilitiesScore(individualScores);

  /**
   * =============================== Final Weighted Calculation ===============================
   */
  const weightedScores = {
    coreSkillsWeighted: individualScores.coreSkills * weights.coreSkills,
    softSkillsWeighted: individualScores.softSkills * weights.softSkills,
    experienceWeighted: individualScores.experience * weights.experience,
    responsibilitiesWeighted: individualScores.responsibilities * weights.responsibilities,
  };

  const totalScore = Math.min(
    90,
    Math.max(
      0,
      Math.round(
        weightedScores.coreSkillsWeighted +
          weightedScores.softSkillsWeighted +
          weightedScores.experienceWeighted +
          weightedScores.responsibilitiesWeighted
      )
    )
  );

  return {
    totalScore,
    coreSkillsScore: Math.round(individualScores.coreSkills),
    softSkillsScore: Math.round(individualScores.softSkills),
    experienceScore: Math.round(individualScores.experience),
    responsibilitiesScore: Math.round(individualScores.responsibilities),
    breakdown: {
      coreSkillsWeighted: Math.round(weightedScores.coreSkillsWeighted * 100) / 100,
      softSkillsWeighted: Math.round(weightedScores.softSkillsWeighted * 100) / 100,
      experienceWeighted: Math.round(weightedScores.experienceWeighted * 100) / 100,
      responsibilitiesWeighted: Math.round(weightedScores.responsibilitiesWeighted * 100) / 100,
    },
  };
}

function calculateExperienceScore(
  jobDescription: JobDto,
  userBasicDetails: UserBasicDetailsDto
): number {
  if (
    !jobDescription.experienceRange ||
    typeof jobDescription.experienceRange !== "object" ||
    typeof jobDescription.experienceRange.min !== "number" ||
    typeof jobDescription.experienceRange.max !== "number" ||
    typeof userBasicDetails.YOE !== "number" ||
    isNaN(userBasicDetails.YOE)
  ) {
    return 0;
  }

  try {
    const { min: jdMinYOE, max: jdMaxYOE } = jobDescription.experienceRange;
    const userYOE = userBasicDetails.YOE;

    // Validate range
    if (jdMinYOE < 0 || jdMaxYOE < 0 || jdMinYOE > jdMaxYOE) {
      console.warn("Invalid experience range:", { jdMinYOE, jdMaxYOE });
      return 0;
    }

    let experienceScore = 0;

    // Special case: JD asks for 0 YOE and candidate has experience
    if (jdMinYOE === 0 && jdMaxYOE === 0 && userYOE > 0) {
      experienceScore = 90;
    }
    // Candidate fits within the required range
    else if (userYOE >= jdMinYOE && userYOE <= jdMaxYOE) {
      experienceScore = 90;
    }
    // Candidate has less experience than required
    else if (userYOE < jdMinYOE) {
      const matchRatio = jdMinYOE > 0 ? Math.min(userYOE / jdMinYOE, 1) : 0;
      experienceScore = Math.round(matchRatio * 90); // Scale to max 90
    }
    // Candidate is overqualified
    else if (userYOE > jdMaxYOE) {
      // Penalize overqualification less severely
      const overQualificationPenalty = Math.min((userYOE - jdMaxYOE) / jdMaxYOE, 0.5); // Max 50% penalty
      experienceScore = Math.round(90 * (1 - overQualificationPenalty));
    }

    return Math.min(90, Math.max(0, experienceScore));
  } catch (error) {
    console.error("Error processing experience:", error);
    return 0;
  }
}

function calculateResponsibilitiesScore(scores: {
  coreSkills: number;
  softSkills: number;
  experience: number;
}): number {
  try {
    // Base responsibilities score on experience and soft skills
    const baseScore = (scores.experience + scores.softSkills) * 0.35;
    let responsibilitiesScore = Math.min(90, Math.round(baseScore));

    // Apply penalty if core skills are very low
    if (scores.coreSkills < 20) {
      responsibilitiesScore = Math.min(responsibilitiesScore, 10);
    }
    // Additional scaling based on core skills strength
    else if (scores.coreSkills < 50) {
      const scalingFactor = scores.coreSkills / 50; // 0.4 to 1.0 scaling
      responsibilitiesScore = Math.round(responsibilitiesScore * (0.6 + 0.4 * scalingFactor));
    }

    return Math.min(90, Math.max(0, responsibilitiesScore));
  } catch (error) {
    console.error("Error processing responsibilities:", error);
    return 0;
  }
}

function createEmptyResult(): DetailedScoreResult {
  return {
    totalScore: 0,
    coreSkillsScore: 0,
    softSkillsScore: 0,
    experienceScore: 0,
    responsibilitiesScore: 0,
    breakdown: {
      coreSkillsWeighted: 0,
      softSkillsWeighted: 0,
      experienceWeighted: 0,
      responsibilitiesWeighted: 0,
    },
  };
}

// Utility function for skill matching (if you need it later)
export function calculateSkillScore({
  jdSkills,
  resumeSkills,
  maxScore = 90,
  extractResumeSkill = (s: any) => s?.skillName,
}: {
  jdSkills: (string | null | undefined)[];
  resumeSkills: any[];
  maxScore?: number;
  extractResumeSkill?: (skill: any) => string | null | undefined;
}): number {
  try {
    const jdSet = new Set(
      jdSkills
        .filter((s) => typeof s === "string" && s.trim().length > 0)
        .map((s) => s!.toLowerCase().trim())
    );

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
