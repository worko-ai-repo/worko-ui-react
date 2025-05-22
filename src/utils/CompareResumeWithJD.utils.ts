import { JobDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";
export interface ScoreWeightsDto {
  coreSkills: number;
  softSkills: number;
  experience: number;
  // salary: number; //@Remove it 
  // remainingWeight: number;
}

interface compareResumeWithJDProps {
  jobDescription: JobDto;
  userBasicDetails: UserBasicDetailsDto;
  scoreWeights?: ScoreWeightsDto;
}
// Define scoreWeights for different components
export const defaultScoreWeights = {
  coreSkills: 60,        // Most critical – reflects actual technical fit
  softSkills: 10,        // Communication/collaboration value
  experience: 30,        // Years of experience must align
  // salary: 20,            // Important, but not a blocker always
  // remainingWeight: 20,   // Text similarity for general relevance
};
export function compareResumeWithJD(
  jobDescription: JobDto,
  userBasicDetails: UserBasicDetailsDto,
  scoreWeights: ScoreWeightsDto = defaultScoreWeights
): number {  
  
  let totalScore = 0;

  /*
    *  ========================================================= Helper Functions =========================================================
    * These functions are used to extract unique words from the job description and resume text.
    * They are used for text matching and scoring.
    * ===============================================================================================================================
    */
  const getUniqueWordsSet = (phrases: string[]) =>
    new Set(
      phrases
        .flatMap((phrase) => phrase.toLowerCase().split(/\s+/))
        .filter(Boolean)
    );

  /**
   *  ========================================================= Core Skills =========================================================
   * This section checks for core skills in the job description and the resume.
   * It calculates a score based on the number of matched core skills.
   * ===============================================================================================================================
   */
  if (jobDescription.coreSkills && userBasicDetails.coreSkills) {
    const jdWordsSet = getUniqueWordsSet(jobDescription.coreSkills);
    const resumeWordsSet = getUniqueWordsSet(userBasicDetails.coreSkills.map(s => s.skillName));
  
    let matchCount = 0;
    jdWordsSet.forEach(word => {
      if (resumeWordsSet.has(word)) matchCount++;
    });
    console.log("JD Core Skills: ", jdWordsSet);
    const coreSkillsScore = jdWordsSet.size > 0
      ? (matchCount / jdWordsSet.size) * scoreWeights.coreSkills
      : 0;
    console.log("Resume Core Skills: ", resumeWordsSet); 
    totalScore += coreSkillsScore;
    console.info("[1]:Core Skills Score (word-match): ", coreSkillsScore);
  }

  /**
   *  ========================================================= Soft Skills =========================================================
   * This section checks for soft skills in the job description and the resume.
   * It calculates a score based on the number of matched soft skills.
   * ===============================================================================================================================
   */
  if (jobDescription.softSkills && userBasicDetails.softSkills) {
    const jdSoftSkills = getUniqueWordsSet(jobDescription.softSkills);
    console.log("JD Soft Skills: ", jdSoftSkills);
    const resumeSoftSkills = getUniqueWordsSet(userBasicDetails.softSkills.map((skill) => skill.skillName.toLowerCase()).filter(Boolean));
    console.log("Resume Soft Skills: ", resumeSoftSkills);
    let matchCount = 0;
    jdSoftSkills.forEach((skill) => {
      if (resumeSoftSkills.has(skill)) {
        matchCount++;
      }
    });

    const softSkillsScore = jdSoftSkills.size > 0 ? (matchCount / jdSoftSkills.size) * scoreWeights.softSkills : 0;

    totalScore += softSkillsScore;
    console.info("[2]:Soft Skills Score Generated: ", softSkillsScore);
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
      // Candidate has enough or more experience – give full score
      experienceScore = scoreWeights.experience;
    } else {
      // Candidate is underqualified – score decreases based on the gap
      const gap = min - userBasicDetails.YOE;
      experienceScore = Math.max(0, scoreWeights.experience * (1 - gap / min));
    }
  
    totalScore += experienceScore;
    console.info("[3]:Experience Score Generated: ", experienceScore);
  }

  /**
   *  ========================================================= Salary =========================================================
   * This section checks for salary expectations in the job description and the resume.
   * It calculates a score based on the salary range and the candidate's expected salary.
   * ===============================================================================================================================
   */
/*   if (jobDescription.salaryRange && userBasicDetails.ECTC !== undefined) {
    const { min, max } = jobDescription.salaryRange;
    let salaryScore = 0;

    //Check if the ECTC is a large number (in lakhs) or a small number (in thousands)
    // If its a small number lets say less than 3 digits, we can assume its LPA not in lakhs  
    let candidateEctc = userBasicDetails.ECTC;
    if (candidateEctc < 1000) {
      // Convert to lakhs
      candidateEctc *= 100000;
    } else if (candidateEctc < 100000) {
      // Convert to lakhs
      candidateEctc *= 1000;
    }

    console.info("Candidate ECTC: ", candidateEctc);
    // Convert to comparable units
    const jdMinInRupees = min * 100000;
    const jdMaxInRupees = max * 100000;
    if (candidateEctc >= jdMinInRupees && candidateEctc <= jdMaxInRupees) {
      // Perfect salary match
      salaryScore = scoreWeights.salary;
    } else if (candidateEctc < jdMinInRupees) {
      // Candidate expects less than minimum offered
      // They might be under-qualified or willing to compromise
      const gap = jdMinInRupees - candidateEctc;
      const gapPercentage = gap / jdMinInRupees;

      // If gap is small (less than 20%), give partial score
      if (gapPercentage <= 0.2) {
        salaryScore = scoreWeights.salary * (1 - gapPercentage);
      } else {
        // Bigger gap means likely not qualified
        salaryScore = 0;
      }
    } else if (candidateEctc > jdMaxInRupees) {
      // Candidate expects more than maximum offered
      // They might be over-qualified or unlikely to accept
      const gap = candidateEctc - jdMaxInRupees;
      const gapPercentage = gap / jdMaxInRupees;

      // If gap is small (less than 20%), give partial score
      if (gapPercentage <= 0.2) {
        salaryScore = scoreWeights.salary * (1 - gapPercentage);
      } else {
        // Bigger gap means likely won't accept
        salaryScore = 0;
      }
    }

    totalScore += salaryScore;
    console.info("[4]:Salary Score Generated: ", salaryScore);
  }
 */
  /**
   *  ========================================================= Text Matching =========================================================
   * This section checks for text matching in the job description and the resume.
   * It calculates a score based on the number of matched words.
   * ===============================================================================================================================
   */
  // Optional: Generic text matching for other fields
  // Use the original similarity scoring for any remaining text comparison
 /*  const jdText = jobDescription.jobDescription || "";
  const resumeText = userBasicDetails.cvExtract || "";

  if (jdText && resumeText) {
    // Define stopwords
    const stopwords = new Set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]);

    // Tokenize and clean text
    const tokenizeAndClean = (text:string) =>
      String(text)
        .toLowerCase()
        .match(/\b\w+\b/g) // extract words
        ?.filter((word) => !stopwords.has(word)) || [];

    const jdWords = new Set(tokenizeAndClean(jdText));
    const resumeWords = new Set(tokenizeAndClean(resumeText));

    // Count common words
    let matchCount = 0;
    jdWords.forEach((word) => {
      if (resumeWords.has(word)) {
        matchCount++;
      }
    });


   
    const textScore = jdWords.size > 0 ? (matchCount / jdWords.size) * scoreWeights.remainingWeight : 0;

    totalScore += textScore;
    console.info("[5]:Text Matching Score Generated: ", textScore);
  }
 */
  // Ensure score is between 0-90
  totalScore = Math.min(90, Math.max(0, totalScore));
  console.info("[6]:Total Score Generated for jobId: ", jobDescription.id, "is: ", totalScore);
  // Round to nearest integer
  console.info("=======END=======");
  console.info("=======END=======");
  return Math.round(totalScore);
}



