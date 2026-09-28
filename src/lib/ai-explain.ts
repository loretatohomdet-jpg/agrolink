import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MatchExplanationInput {
  buyer: {
    name: string;
    product: string;
    quantity: number;
    unit: string;
    grade: string;
    lga: string;
    state: string;
    requiredDate: string;
  };
  farmer: {
    name: string;
    farmName: string;
    quantity: number;
    unit: string;
    grade: string;
    lga: string;
    state: string;
    harvestDate: string;
    avgRating: number;
    completedTx: number;
  };
  scores: {
    quantity: number;
    quality: number;
    timing: number;
    location: number;
    reliability: number;
    final: number;
  };
  language: 'en' | 'ha';
}

/**
 * Deterministic template-based fallback generator for matching explanation
 */
function getFallbackExplanation(input: MatchExplanationInput): string {
  const { buyer, farmer, scores, language } = input;
  const ratingText = farmer.avgRating > 0 ? farmer.avgRating.toFixed(1) : '4.5';

  if (language === 'ha') {
    const reasons = [];
    if (scores.quantity >= 90) reasons.push(`za su iya samar da kusan duka yawan produce da kuke nema (${farmer.quantity} ${farmer.unit})`);
    else reasons.push(`za su iya samar da ${farmer.quantity} ${farmer.unit} na buƙatarku`);

    if (scores.quality >= 90) reasons.push(`ingancin amfanin gonarsu (${farmer.grade}) ya dace sarai da abin da kuke buƙata`);
    if (scores.timing >= 90) reasons.push(`lokacin girbinsu (${new Date(farmer.harvestDate).toLocaleDateString('ha-NG')}) ya yi daidai da lokacin bayarwa da kuke buƙata`);
    if (scores.location >= 85) reasons.push(`suna kusa da ku a yankin ${farmer.lga}`);
    if (scores.reliability >= 85) reasons.push(`suna da kyakkyawan tarihin cika ma'amaloli tare da kima mai kyau (taurari ${ratingText}/5)`);

    return `AgroLink ta ba da shawarar ${farmer.farmName} (${farmer.name}) domin ${reasons.join(', ')}. Gabaɗayan daidaituwar ma'amalar ku ita ce kashi ${scores.final}%.`;
  }

  // English default fallback
  const reasons = [];
  if (scores.quantity >= 90) reasons.push(`can supply the requested volume (${farmer.quantity} ${farmer.unit})`);
  else reasons.push(`can supply ${farmer.quantity} ${farmer.unit} of your request`);

  if (scores.quality >= 90) reasons.push(`matches the required quality grade (${farmer.grade})`);
  if (scores.timing >= 90) reasons.push(`harvest window (${new Date(farmer.harvestDate).toLocaleDateString('en-NG')}) aligns with your required delivery date`);
  if (scores.location >= 85) reasons.push(`is located nearby in ${farmer.lga}`);
  if (scores.reliability >= 85) reasons.push(`has a strong fulfillment history with a rating of ${ratingText}/5 stars`);

  return `AgroLink recommended ${farmer.farmName} (${farmer.name}) because the farm ${reasons.join(', ')}. The final match score is ${scores.final}%.`;
}

/**
 * Main explainable AI service that handles Gemini API generation or fallback
 */
export async function generateMatchExplanation(input: MatchExplanationInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // If no key is set, use the high-quality deterministic fallback
    return getFallbackExplanation(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.2,
      }
    });

    const promptEn = `
You are AgroLink's transparent agricultural matching assistant.
Explain why this supplier was recommended to the buyer based ONLY on these matching factors. Do not invent facts, exaggerate, or infer unprovided information. Keep it to 2-3 short sentences.

Buyer Request:
- Crop: ${input.buyer.product}
- Needed Quantity: ${input.buyer.quantity} ${input.buyer.unit}
- Quality Grade Needed: ${input.buyer.grade}
- Delivery Location: ${input.buyer.lga}, ${input.buyer.state}
- Needed Delivery Date: ${input.buyer.requiredDate}

Supplier Offer:
- Farm Name: ${input.farmer.farmName}
- Farmer Name: ${input.farmer.name}
- Available Quantity: ${input.farmer.quantity} ${input.farmer.unit}
- Quality Grade Offered: ${input.farmer.grade}
- Farm Location: ${input.farmer.lga}, ${input.farmer.state}
- Expected Harvest Date: ${input.farmer.harvestDate}
- Rating: ${input.farmer.avgRating > 0 ? input.farmer.avgRating : 'New Supplier'} (Completed Orders: ${input.farmer.completedTx})

Calculated Match Scores (out of 100):
- Quantity Fit: ${input.scores.quantity}%
- Quality Fit: ${input.scores.quality}%
- Timing Fit: ${input.scores.timing}%
- Location Fit: ${input.scores.location}%
- Reliability Score: ${input.scores.reliability}%
- Total Match Score: ${input.scores.final}%

Format the output as a concise, professional explanation for the buyer in English.
`;

    const promptHa = `
You are AgroLink's transparent agricultural matching assistant.
Explain why this supplier was recommended to the buyer based ONLY on these matching factors. Do not invent facts, exaggerate, or infer unprovided information. Keep it to 2-3 short sentences.

Buyer Request:
- Crop: ${input.buyer.product}
- Needed Quantity: ${input.buyer.quantity} ${input.buyer.unit}
- Quality Grade Needed: ${input.buyer.grade}
- Delivery Location: ${input.buyer.lga}, ${input.buyer.state}
- Needed Delivery Date: ${input.buyer.requiredDate}

Supplier Offer:
- Farm Name: ${input.farmer.farmName}
- Farmer Name: ${input.farmer.name}
- Available Quantity: ${input.farmer.quantity} ${input.farmer.unit}
- Quality Grade Offered: ${input.farmer.grade}
- Farm Location: ${input.farmer.lga}, ${input.farmer.state}
- Expected Harvest Date: ${input.farmer.harvestDate}
- Rating: ${input.farmer.avgRating > 0 ? input.farmer.avgRating : 'Sabuwar Gona'} (Kammala oda: ${input.farmer.completedTx})

Calculated Match Scores (out of 100):
- Quantity Fit: ${input.scores.quantity}%
- Quality Fit: ${input.scores.quality}%
- Timing Fit: ${input.scores.timing}%
- Location Fit: ${input.scores.location}%
- Reliability Score: ${input.scores.reliability}%
- Total Match Score: ${input.scores.final}%

Format the output as a concise, professional explanation for the buyer in HAUSA (Hausa language).
`;

    const selectedPrompt = input.language === 'ha' ? promptHa : promptEn;

    const result = await model.generateContent(selectedPrompt);
    const text = result.response.text().trim();
    return text || getFallbackExplanation(input);
  } catch (error) {
    console.error('AI Explanation Service Error, falling back:', error);
    return getFallbackExplanation(input);
  }
}
