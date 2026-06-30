const { genAI, useGemini } = require('../config/gemini');

// Helper to clean JSON string from Gemini (in case responseMimeType fails or isn't used)
const cleanJson = (str) => {
  try {
    let clean = str.trim();
    if (clean.startsWith('```json')) {
      clean = clean.substring(7);
    }
    if (clean.startsWith('```')) {
      clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.substring(0, clean.length - 3);
    }
    return JSON.parse(clean.trim());
  } catch (error) {
    console.error('Error cleaning and parsing JSON:', error);
    throw new Error('Failed to parse AI response as JSON');
  }
};

/**
 * Run AI Analysis on a new Issue submission
 */
exports.analyzeIssue = async (description, categoryOverride = '') => {
  if (!useGemini || !genAI) {
    console.log('Gemini API not configured. Executing fallback AI mock analysis.');
    return getFallbackAnalysis(description, categoryOverride);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const categoriesList = [
      'Waste Management',
      'Water Leakage',
      'Public Safety',
      'Infrastructure Damage',
      'Accessibility Issues',
      'Environmental Hazards',
      'Street Lighting Issues',
      'Other'
    ];

    const prompt = `
You are the CivicPulse AI analyst. Analyze the following citizen civic report:
Description: "${description}"
Category override / suggestion (if any): "${categoryOverride}"

You must categorize the issue and evaluate its impact.
Your output must be a valid JSON object matching the schema below. Do not output any markdown formatting, comments or text outside the JSON.

Expected JSON Schema:
{
  "category": "Must be one of: ${categoriesList.join(', ')}",
  "severityScore": 1-100 (Integer, representing hazard severity),
  "urgencyLevel": "Low" | "Medium" | "High" | "Critical",
  "impactScore": 1-100 (Integer, representing community impact / number of citizens affected),
  "aiSummary": "Concise 1-sentence summary",
  "recommendedAction": "Actionable instructions for city crew",
  "confidence": 0.0-1.0 (Estimate your categorization confidence)
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    const parsedData = cleanJson(responseText);

    // Validate category is one of the enum values
    if (!categoriesList.includes(parsedData.category)) {
      parsedData.category = categoryOverride && categoriesList.includes(categoryOverride)
        ? categoryOverride 
        : 'Other';
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini analyzeIssue failed:', error.message);
    return getFallbackAnalysis(description, categoryOverride);
  }
};

/**
 * Verify if additional evidence media is relevant to the issue
 */
exports.verifyMediaRelevance = async (issueDescription, originalCategory, newMediaDescription) => {
  if (!useGemini || !genAI) {
    console.log('Gemini API not configured. Executing fallback AI media verification.');
    return getFallbackMediaVerification(issueDescription, newMediaDescription);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Analyze whether a newly uploaded image or video is relevant to an existing civic issue.
Existing Issue Description: "${issueDescription}"
Existing Issue Category: "${originalCategory}"
New Media/Evidence Description: "${newMediaDescription}"

Evaluate if they are referring to the same issue, location, or problem type, or if it is spam/unrelated.
Your output must be a valid JSON object. Do not output any markdown formatting or extra text.

Expected JSON Schema:
{
  "relevance": "Relevant" | "Possibly Relevant" | "Unrelated",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation of why it is relevant or not"
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return cleanJson(responseText);
  } catch (error) {
    console.error('Gemini verifyMediaRelevance failed:', error.message);
    return getFallbackMediaVerification(issueDescription, newMediaDescription);
  }
};

/**
 * Generate Predictive Insights for the Civic Health Dashboard
 */
exports.generatePredictiveInsights = async (issues) => {
  if (!useGemini || !genAI || !issues || issues.length === 0) {
    console.log('Gemini API not configured or no issues provided. Executing fallback dashboard insights.');
    return getFallbackInsights(issues);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const issuesData = issues.map(issue => ({
      category: issue.category,
      address: issue.address,
      coords: issue.location.coordinates,
      severity: issue.severityScore,
      urgency: issue.urgencyLevel,
      status: issue.status,
      desc: issue.description,
      date: issue.createdAt
    }));

    const prompt = `
Analyze this array of active community reports to detect trends, clusters, and write predictive insights:
${JSON.stringify(issuesData, null, 2)}

Provide up to 4 actionable insights highlighting critical hot-spots, escalating problem categories, or suggestions for preventative maintenance.
Your output must be a valid JSON object. Do not output any markdown formatting or extra text.

Expected JSON Schema:
{
  "insights": [
    {
      "title": "Short title of warning/insight",
      "description": "Elaborate prediction or trend analysis",
      "type": "warning" | "info" | "success",
      "affectedArea": "Name of street, zone, or general area",
      "actionPlan": "Suggested remedy for authorities"
    }
  ]
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    return cleanJson(responseText);
  } catch (error) {
    console.error('Gemini generatePredictiveInsights failed:', error.message);
    return getFallbackInsights(issues);
  }
};

/**
 * FALLBACK MOCK ENGINES (For development and local testing)
 */
function getFallbackAnalysis(desc, categoryOverride) {
  const text = desc.toLowerCase();
  let category = categoryOverride || 'Other';
  let severityScore = 40;
  let urgencyLevel = 'Medium';
  let impactScore = 30;
  let aiSummary = 'Issue registered with local service department.';
  let recommendedAction = 'Dispatch service agent to verify reports.';

  if (text.includes('leak') || text.includes('water') || text.includes('burst')) {
    category = 'Water Leakage';
    severityScore = 65;
    urgencyLevel = 'High';
    impactScore = 55;
    aiSummary = 'Active water utility leakage reported.';
    recommendedAction = 'Dispatch municipal water works crew to patch pipes and shutoff local valves.';
  } else if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('bridge') || text.includes('crack')) {
    category = 'Infrastructure Damage';
    severityScore = 50;
    urgencyLevel = 'Medium';
    impactScore = 60;
    aiSummary = 'Pothole or road surface degradation reported.';
    recommendedAction = 'Schedule asphalt patching vehicle and place warning cones around damaged lanes.';
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dump') || text.includes('bins')) {
    category = 'Waste Management';
    severityScore = 35;
    urgencyLevel = 'Low';
    impactScore = 40;
    aiSummary = 'Accumulated trash or overflowing waste bin reported.';
    recommendedAction = 'Direct sanitation truck route to clear piles and replace standard waste receptacles.';
  } else if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('bulb') || text.includes('street light')) {
    category = 'Street Lighting Issues';
    severityScore = 45;
    urgencyLevel = 'Medium';
    impactScore = 50;
    aiSummary = 'Broken street lights or dark pedestrian routes.';
    recommendedAction = 'Dispatch electrical maintenance tech to replace burnt bulbs or fix wiring loops.';
  } else if (text.includes('danger') || text.includes('fight') || text.includes('crime') || text.includes('suspicious') || text.includes('harass') || text.includes('drug')) {
    category = 'Public Safety';
    severityScore = 85;
    urgencyLevel = 'Critical';
    impactScore = 70;
    aiSummary = 'Threat to public safety or active danger identified.';
    recommendedAction = 'Alert community watch patrols and request civil authority presence in area.';
  } else if (text.includes('ramp') || text.includes('wheelchair') || text.includes('sidewalk') || text.includes('blocked') || text.includes('stairs')) {
    category = 'Accessibility Issues';
    severityScore = 55;
    urgencyLevel = 'Medium';
    impactScore = 40;
    aiSummary = 'Disabled access route or public walkway blockage.';
    recommendedAction = 'Clear physical barriers and evaluate ramp options to restore universal access.';
  } else if (text.includes('chemical') || text.includes('smoke') || text.includes('pollution') || text.includes('oil') || text.includes('toxic')) {
    category = 'Environmental Hazards';
    severityScore = 80;
    urgencyLevel = 'High';
    impactScore = 75;
    aiSummary = 'Spill or hazard introducing environmental damage.';
    recommendedAction = 'Deploy hazardous containment materials and isolate the contamination zone.';
  }

  return {
    category,
    severityScore,
    urgencyLevel,
    impactScore,
    aiSummary,
    recommendedAction,
    confidence: 0.95
  };
}

function getFallbackMediaVerification(issueDesc, mediaDesc) {
  const id = issueDesc.toLowerCase();
  const md = mediaDesc.toLowerCase();
  
  // Find intersections
  const keywords = ['water', 'leak', 'trash', 'garbage', 'pothole', 'road', 'light', 'dark', 'safety', 'danger', 'spill', 'ramp'];
  let matches = 0;
  keywords.forEach(word => {
    if (id.includes(word) && md.includes(word)) matches++;
  });

  let relevance = 'Unrelated';
  let explanation = 'The uploaded evidence content description does not match the keywords associated with the original issue description.';
  let confidence = 0.85;

  if (matches > 0) {
    relevance = 'Relevant';
    explanation = 'Key topics correspond directly. The image evidence relates closely to the reported civic complaint.';
  } else if (md.length < 10) {
    relevance = 'Possibly Relevant';
    explanation = 'Provided description is too short to fully verify, but details are aligned with general infrastructure issues.';
    confidence = 0.5;
  }

  return {
    relevance,
    confidence,
    explanation
  };
}

function getFallbackInsights(issues) {
  return {
    insights: [
      {
        title: 'Water Leakage Trend Rising',
        description: 'Multiple reports of pipeline issues are occurring near coordinates matching the central grid. High severity risk for surrounding foundations.',
        type: 'warning',
        affectedArea: 'Main St & Downtown Area',
        actionPlan: 'Direct utility inspections to perform pressure tests on local pipelines.'
      },
      {
        title: 'Waste Overflow Hotspots',
        description: 'Sanitation reports peak during weekends, leading to excessive street garbage reports.',
        type: 'info',
        affectedArea: 'North Sector Parks',
        actionPlan: 'Increase public dumpster capacity or schedule additional Sunday morning garbage routes.'
      },
      {
        title: 'Successful Light Restorations',
        description: 'Repaired lighting has led to a 40% reduction in safety hazards reports over the last 15 days.',
        type: 'success',
        affectedArea: 'East Industrial Zone',
        actionPlan: 'Continue regular lighting inspections to keep dark spots fully lit.'
      }
    ]
  };
}
