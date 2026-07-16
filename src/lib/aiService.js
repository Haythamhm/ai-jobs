/**
 * AI Analysis Service
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is the single integration point for the AI backend.
 *
 * When you have the AI API ready, you only need to replace the implementation
 * inside `analyzeCandidate()`. The rest of the app (ManagerPortal, storage, etc.)
 * will work without any other changes.
 *
 * Expected API contract:
 *
 *  POST /api/ai/analyze-resume
 *  Content-Type: application/json
 *
 *  Request body:
 *  {
 *    "resumeText":     string,   // raw text extracted from the PDF
 *    "jobTitle":       string,
 *    "jobDescription": string,
 *    "requirements":   string[]  // list of required skills/keywords
 *  }
 *
 *  Response body:
 *  {
 *    "score":          number,   // 0–100 compatibility score
 *    "matchedSkills":  string[], // requirements the AI found in the CV
 *    "missingSkills":  string[], // requirements the AI did NOT find
 *    "recommendation": string    // AI-generated paragraph for the manager
 *  }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';
const AI_API_URL = `${BASE_URL}/api/ai/analyze-resume`;

/**
 * Calls the AI backend to analyze a candidate's resume against a job.
 *
 * @param {string} resumeText     - Raw text extracted from the candidate's PDF
 * @param {object} job            - Job object { title, description, requirements }
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeCandidate(resumeText, job) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resumeText,
        jobTitle:       job.title,
        jobDescription: job.description,
        requirements:   job.requirements,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      score:          data.score,
      matchedSkills:  data.matchedSkills,
      missingSkills:  data.missingSkills,
      recommendation: data.recommendation,
      source: 'ai',
    };
  } catch (err) {
    console.error('[AI Service] API call failed, falling back to local analysis:', err);
    return localAnalysis(resumeText, job); // graceful degradation
  }
}

/**
 * Calls the AI backend to organize scrambled resume text.
 *
 * @param {string} resumeText - Raw text extracted from the candidate's PDF
 * @returns {Promise<string>} - Beautifully organized resume text in markdown format
 */
export async function organizeResumeText(resumeText) {
  try {
    const token = localStorage.getItem('auth_token');
    const headers = { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(`${BASE_URL}/api/ai/organize-resume`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) {
      throw new Error(`AI Organize API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.organizedText;
  } catch (err) {
    console.error('[AI Service] Organize resume call failed:', err);
    throw err;
  }
}

/**
 * Local fallback analysis using keyword matching.
 * This is used when the AI API is not yet available.
 * It will be kept as a graceful degradation fallback even after the real API
 * is integrated.
 *
 * @param {string} resumeText
 * @param {object} job
 * @returns {AnalysisResult}
 */
function localAnalysis(resumeText, job) {
  const text = (resumeText || '').toLowerCase();
  const requirements = (job?.requirements || []).filter(Boolean);

  const matchedSkills = requirements.filter(r => text.includes(r.toLowerCase()));
  const missingSkills = requirements.filter(r => !text.includes(r.toLowerCase()));

  const score = requirements.length > 0
    ? Math.round((matchedSkills.length / requirements.length) * 100)
    : null;

  const recommendation = buildRecommendation(score, matchedSkills, missingSkills, job?.title);

  return {
    score,
    matchedSkills,
    missingSkills,
    recommendation,
    source: 'local', // flag so the UI can show "AI Analysis" vs "Basic Analysis"
  };
}

/**
 * Builds a human-readable recommendation string based on the analysis results.
 * When the real AI API is connected, this function will no longer be used for
 * the recommendation field (the AI will generate it directly).
 */
function buildRecommendation(score, matchedSkills, missingSkills, jobTitle) {
  if (score === null) {
    return 'No requirements were defined for this job. Manual review is required.';
  }
  if (score >= 80) {
    return `Strong candidate for ${jobTitle}. Matches ${matchedSkills.length} of the required skills. Recommended for immediate interview.`;
  }
  if (score >= 50) {
    return `Partial match for ${jobTitle}. Has ${matchedSkills.length} key skills but is missing: ${missingSkills.join(', ')}. Consider a screening call.`;
  }
  return `Weak match for ${jobTitle}. Only ${matchedSkills.length} requirement(s) found in the resume. Missing: ${missingSkills.join(', ')}. Manual review advised.`;
}

/**
 * @typedef {Object} AnalysisResult
 * @property {number|null} score          - 0–100 score, or null if no requirements
 * @property {string[]}    matchedSkills  - skills found in the resume
 * @property {string[]}    missingSkills  - required skills not found
 * @property {string}      recommendation - human-readable recommendation text
 * @property {'ai'|'local'} source        - whether real AI or local fallback was used
 */
