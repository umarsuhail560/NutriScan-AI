import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to initialize Gemini safely
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt template for food analysis
const FOOD_ANALYSIS_SYSTEM_PROMPT = `
You are NutriScan AI, an expert clinical nutritionist and food safety inspector.
Analyze the provided food product photo (or text metadata) and evaluate its ingredients, additives, nutrition facts, and health score.

Strictly respond with ONLY valid JSON matching this exact structure:
{
  "productName": "Product Name",
  "brand": "Brand Name or Unknown",
  "healthScore": 85,
  "grade": "A+|A|B|C|D|E",
  "riskLevel": "Very Healthy|Healthy|Moderate|Unhealthy|Avoid Frequently",
  "calories": "250 kcal",
  "protein": "12g",
  "fat": "4.5g",
  "sugar": "2.1g",
  "salt": "0.3g",
  "fiber": "6g",
  "carbohydrates": "38g",
  "servingSize": "100g",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "artificialColors": [],
  "preservatives": [],
  "artificialSweeteners": [],
  "additives": [],
  "allergens": [],
  "suitability": {
    "forChildren": true,
    "childrenNotes": "Reason why safe or unsafe for kids",
    "forDiabetics": false,
    "diabeticNotes": "Sugar/glycemic impact notes",
    "forPregnant": true,
    "pregnantNotes": "Pregnancy safety notes",
    "forElderly": true,
    "elderlyNotes": "Digestive & sodium notes for seniors",
    "forGym": true,
    "gymNotes": "Protein & recovery value"
  },
  "goodPoints": ["Good point 1", "Good point 2"],
  "badPoints": ["Bad point 1", "Bad point 2"],
  "warnings": ["Warning if any"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "dailyAdvice": "Daily consumption guidance",
  "alternatives": [
    { "name": "Healthier Alternative Name", "reason": "Why it's better" }
  ],
  "summary": "Clear, simple summary understandable by anyone in plain English."
}

Rules:
1. Health score must be an integer from 0 to 100 based on Nutri-Score standards, sugar content, ultra-processing level, and harmful additives.
2. Grade must correlate: 90-100 = A+, 75-89 = A, 60-74 = B, 45-59 = C, 30-44 = D, 0-29 = E.
3. Identify any artificial colors (E102, Yellow 5, Red 40, etc.), preservatives, artificial sweeteners (Aspartame, Sucralose, etc.), food additives (E-numbers), and common allergens (nuts, milk, soy, wheat).
4. Do not include markdown formatting or backticks around the JSON output if possible. Output raw clean JSON.
`;

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Analyze Image endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userPrompt } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getGeminiAI();
    // Strip header prefix if present (e.g., data:image/png;base64,)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      },
      {
        text: `Analyze this food packaging/nutrition label/product image in detail. ${userPrompt ? `User notes: ${userPrompt}` : ''}`,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: FOOD_ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    // Clean string in case model wrapped it in codeblocks
    const cleanJsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanJsonString);

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in /api/analyze-image:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze food product image',
    });
  }
});

// Barcode Lookup & AI Enrichment endpoint
app.post('/api/analyze-barcode', async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Attempt Open Food Facts API lookup
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
    let offData: any = null;
    if (offRes.ok) {
      offData = await offRes.json();
    }

    if (!offData || offData.status !== 1 || !offData.product) {
      return res.json({
        found: false,
        barcode,
        message: 'Product not found in international barcode database. Please upload front and back photos of the product for AI analysis.',
      });
    }

    const p = offData.product;
    const productName = p.product_name || p.product_name_en || 'Unknown Product';
    const brand = p.brands || 'Unknown Brand';
    const ingredientsText = p.ingredients_text_en || p.ingredients_text || '';
    const nutriments = p.nutriments || {};

    const extractedInfo = {
      productName,
      brand,
      barcode,
      ingredientsText,
      servingSize: p.serving_size || '100g',
      calories: `${nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 'N/A'} kcal`,
      protein: `${nutriments.proteins_100g || nutriments.proteins || 'N/A'} g`,
      fat: `${nutriments.fat_100g || nutriments.fat || 'N/A'} g`,
      sugar: `${nutriments.sugars_100g || nutriments.sugars || 'N/A'} g`,
      salt: `${nutriments.salt_100g || nutriments.salt || 'N/A'} g`,
      fiber: `${nutriments.fiber_100g || nutriments.fiber || 'N/A'} g`,
      carbohydrates: `${nutriments.carbohydrates_100g || nutriments.carbohydrates || 'N/A'} g`,
      nutriscore: p.nutriscore_grade || '',
      imageUrl: p.image_url || p.image_front_url || '',
    };

    // Enrich with Gemini AI analysis
    const ai = getGeminiAI();
    const promptText = `
Product Metadata from Barcode Database (${barcode}):
Name: ${productName}
Brand: ${brand}
Ingredients List: ${ingredientsText}
Nutritional Info (per 100g): Calories: ${extractedInfo.calories}, Protein: ${extractedInfo.protein}, Fat: ${extractedInfo.fat}, Sugar: ${extractedInfo.sugar}, Salt: ${extractedInfo.salt}, Fiber: ${extractedInfo.fiber}, Carbs: ${extractedInfo.carbohydrates}

Perform a thorough nutritional safety analysis, risk level classification, population suitability checks (children, diabetics, pregnant, elderly, gym users), warnings, additives identification, and healthy alternatives for this product.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction: FOOD_ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleanJsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResult = JSON.parse(cleanJsonString);

    // Merge image URL if available from barcode database
    if (extractedInfo.imageUrl && !aiResult.imageUrl) {
      aiResult.imageUrl = extractedInfo.imageUrl;
    }
    aiResult.barcode = barcode;

    return res.json({ found: true, data: aiResult });
  } catch (err: any) {
    console.error('Error in /api/analyze-barcode:', err);
    return res.status(500).json({ error: err.message || 'Failed to process barcode' });
  }
});

// Search Food Products & AI quick query
app.post('/api/search-products', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query string is required' });
    }

    // Try Open Food Facts search
    const offRes = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8`);
    let offProducts: any[] = [];
    if (offRes.ok) {
      const data = await offRes.json();
      if (data && data.products) {
        offProducts = data.products.map((p: any) => ({
          productName: p.product_name || p.product_name_en || query,
          brand: p.brands || 'Various',
          barcode: p.code || '',
          nutriscore: (p.nutriscore_grade || 'c').toUpperCase(),
          imageUrl: p.image_small_url || p.image_front_small_url || '',
          calories: `${p.nutriments?.['energy-kcal_100g'] || '150'} kcal`,
          sugar: `${p.nutriments?.sugars_100g || '5'} g`,
          protein: `${p.nutriments?.proteins_100g || '3'} g`,
        }));
      }
    }

    return res.json({ success: true, results: offProducts });
  } catch (err: any) {
    console.error('Error in /api/search-products:', err);
    return res.status(500).json({ error: 'Failed to search products' });
  }
});

// Vite Middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NutriScan AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
