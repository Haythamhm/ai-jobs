const OpenAI = require('openai');

// @desc    Analyze resume text against job description using OpenRouter/OpenAI
// @route   POST /api/ai/analyze-resume
// @access  Private (Manager)
const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText, jobTitle, jobDescription, requirements } = req.body;

    if (resumeText === undefined || resumeText === null) {
      res.status(400);
      throw new Error('Resume text is required');
    }

    const openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are an expert HR Technical Recruiter AI. 
Your task is to analyze a candidate's resume text against a specific job role and return a structured JSON evaluation.

IMPORTANT RULES FOR ANALYSIS:
1. SEMANTIC MATCHING: Look for semantic matches, not just exact keywords. For example, "ASP.NET Core" or "C#" matches ".NET", "Laravel" matches "PHP", "Next.js" matches "React", and "AWS" is equivalent to Cloud experience.
2. MULTILINGUAL SUPPORT: The resume might be in French, Spanish, or another language. Translate and map requirements conceptually (e.g., "Ingénieur" = "Engineer", "Développement" = "Development", "Stage" = "Internship").
3. LENIENT EXPERIENCE PARSING: Resumes often list projects, academic training, or overlapping roles. If you see evidence of the required technology used in a project, consider it a MATCH.
4. FAIR SCORING: Score from 0 to 100 based on how well the candidate fits the requirements. Be generous if they have strong related fundamentals.

JOB DETAILS:
Title: ${jobTitle}
Description: ${jobDescription}
Requirements: ${requirements ? requirements.join(', ') : 'None'}

You MUST output ONLY valid JSON using exactly this structure:
{
  "score": <number between 0-100 indicating compatibility>,
  "matchedSkills": ["<list of required skills that the candidate possesses>"],
  "missingSkills": ["<list of required skills that the candidate completely lacks>"],
  "recommendation": "<A 2-3 sentence paragraph summarizing the candidate's fit, highlighting key strengths and major gaps, and recommending whether to interview or reject>"
}
`;

    const userMessage = `CANDIDATE RESUME TEXT:\n${resumeText}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
    });

    const aiContent = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiContent);

    // Return the required structure
    res.status(200).json({
      score: parsedData.score || 0,
      matchedSkills: parsedData.matchedSkills || [],
      missingSkills: parsedData.missingSkills || [],
      recommendation: parsedData.recommendation || 'Analysis completed.',
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    next(error);
  }
};

// @desc    Organize scrambled resume text using OpenRouter/OpenAI
// @route   POST /api/ai/organize-resume
// @access  Private (Candidate/Manager)
const organizeResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      res.status(400);
      throw new Error('Resume text is required');
    }

    const openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are an expert Resume Editor & Optimizer AI.
Your task is to take raw, messy, or unformatted text extracted from a PDF resume and reorganize it into a professional, clear, and well-structured CV format.

Please follow these strict guidelines:
1. DO NOT fabricate or add any new information (no fake jobs, fake skills, fake locations, fake contact info, or fake education).
2. DO NOT lose any critical information from the original text (names, company names, dates, job titles, technologies, languages, certificates, and bullet points must all be retained).
3. If the input text is in a foreign language (e.g. French, Spanish), keep the content in that same language but clean up and standardize the terminology.
4. Correct spelling, punctuation, typos, spacing, and broken/unjoined lines resulting from PDF extraction.
5. Structure the text clearly using the following sections in professional Markdown formatting:
   - **Full Name & Contact Info** (Email, Phone, LinkedIn, Portfolio - clearly formatted at the top)
   - **Professional Title**
   - **Professional Summary** (A concise summary of the candidate's profile)
   - **Work Experience** (List roles in reverse chronological order, with Company Name, Title, Dates, and Bullet Points of achievements and technologies used)
   - **Projects** (If any, list key projects with descriptions and technologies)
   - **Education** (Degree, Institution, Dates)
   - **Skills** (Categorized cleanly, e.g. Technical Skills, Languages, Soft Skills)

Make the final output highly clean, professional, and readable.
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `RAW RESUME TEXT:\n${resumeText}` }
      ],
      temperature: 0.3,
    });

    const organizedText = completion.choices[0].message.content;

    res.status(200).json({ organizedText });
  } catch (error) {
    console.error('AI Organize Error:', error);
    next(error);
  }
};

module.exports = {
  analyzeResume,
  organizeResume,
};
