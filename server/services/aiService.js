const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const callAI = async (prompt) => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Groq API error:', data);
    throw new Error(data.error?.message || 'AI call failed');
  }

  return data.choices[0].message.content;
};

export const summarizeCase = async (caseData) => {
  const prompt = `You are a case management assistant. Summarize this complaint case in exactly 3 bullet points for a Case Manager. Be concise and professional.

Case Details:
- Tracking ID: ${caseData.trackingId}
- Category: ${caseData.category}
- Department: ${caseData.department}
- Severity: ${caseData.severity}
- Description: ${caseData.description}
- Status: ${caseData.status}
- Notes: ${caseData.notes.map(n => n.text).join(', ') || 'None'}

Respond with exactly 3 bullet points only.`;

  return await callAI(prompt);
};

export const generateTrendInsight = async (analyticsData) => {
  const prompt = `You are a management analyst. Based on the following complaint statistics, write a 3-sentence executive briefing highlighting the most urgent trends and recommended actions. Be direct and actionable.

Statistics:
${JSON.stringify(analyticsData, null, 2)}

Respond with exactly 3 sentences only.`;

  return await callAI(prompt);
};

export const suggestCategoryAndSeverity = async (description) => {
  const prompt = `You are a complaint classification assistant. Based on this complaint description, suggest the most appropriate category and severity level.

Description: "${description}"

Available categories: Safety, Policy, Facilities, HR, Other
Available severity levels: Low, Medium, High

Respond in this exact JSON format only, no other text, no markdown, no backticks:
{"category": "category_here", "severity": "severity_here", "reason": "one sentence reason"}`;

  const result = await callAI(prompt);
  const cleaned = result.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};
