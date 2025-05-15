export function compareResumeWithJD(jobDescription: string, resume: string) {
    // Define a list of common English stopwords
    const stopwords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
      'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
      'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
      'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
      'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
      'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
      'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
      'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
      'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
      'just', 'don', 'should', 'now'
    ]);
  
    // Tokenize and clean text
    const tokenizeAndClean = (text: string): string[] =>
      text
        .toLowerCase()
        .match(/\b\w+\b/g) // extract words
        ?.filter((word: string) => !stopwords.has(word)) || [];
  
    const jdWords = new Set(tokenizeAndClean(jobDescription));
    const resumeWords = new Set(tokenizeAndClean(resume));
  
    // Count common words
    let matchCount = 0;
    jdWords.forEach(word => {
      if (resumeWords.has(word)) {
        matchCount++;
      }
    });
  
    const score = jdWords.size > 0 ? matchCount / jdWords.size : 0;
    return Math.round(score * 100);
  }
  
  
 /*  
  const jd = "We are looking for a full-stack developer with experience vite in React and Node.js.";
  const resume = "";
  
  const similarityScore = compareResumeWithJD(jd, jobDescription);
  console.log("Similarity score:", Math.round(similarityScore * 100));
   */
  
  