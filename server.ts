import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __dirname = process.cwd();

const app = express();

const PORT = parseInt(process.env.PORT || '3000', 10);

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  express.json({
    limit: '50mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);

/* =========================================================
   GEMINI INITIALIZATION
========================================================= */

function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables.'
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/* =========================================================
   COMMON JSON CLEANER
========================================================= */

function cleanGeminiJson(text: string) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/* =========================================================
   NUTRISCAN AI SYSTEM PROMPT
========================================================= */

const FOOD_ANALYSIS_SYSTEM_PROMPT = `
You are NutriScan AI, an expert food nutrition and food-label analysis assistant.

Your task is to analyze food products using ONLY the information actually visible
or provided in the product image / barcode metadata.

IMPORTANT ACCURACY RULES:

1. Never invent ingredients, nutrition values, allergens, additives, or product facts.
2. If information is missing, write "Data unavailable" instead of guessing.
3. If the image is unclear, say that the information could not be verified.
4. Do not claim a product is safe for a medical condition when required information
   is unavailable.
5. Health score must be based only on available evidence.
6. If important nutrition information is unavailable, reduce confidence and explain
   this in the summary.
7. Keep the language simple and understandable.

Return ONLY valid JSON matching this structure:

{
  "productName": "Product Name",
  "brand": "Brand Name",
  "healthScore": 50,
  "grade": "C",
  "riskLevel": "Moderate",

  "calories": "Data unavailable",
  "protein": "Data unavailable",
  "fat": "Data unavailable",
  "sugar": "Data unavailable",
  "salt": "Data unavailable",
  "fiber": "Data unavailable",
  "carbohydrates": "Data unavailable",

  "servingSize": "100g",

  "ingredients": [],
  "artificialColors": [],
  "preservatives": [],
  "artificialSweeteners": [],
  "additives": [],
  "allergens": [],

  "suitability": {
    "forChildren": false,
    "childrenNotes": "Cannot verify safety without sufficient ingredient and allergen information.",

    "forDiabetics": false,
    "diabeticNotes": "Sugar and carbohydrate information is unavailable.",

    "forPregnant": false,
    "pregnantNotes": "Product ingredients could not be sufficiently verified.",

    "forElderly": false,
    "elderlyNotes": "Nutritional and sodium information is unavailable.",

    "forGym": false,
    "gymNotes": "Protein and macronutrient information is unavailable."
  },

  "goodPoints": [],
  "badPoints": [],
  "warnings": [],

  "benefits": [],

  "dailyAdvice": "Check the product packaging for complete nutrition and ingredient information before regular consumption.",

  "alternatives": [],

  "summary": "The available product information is insufficient for a complete nutritional assessment."
}

GRADE RULES:

90-100 = A+
75-89 = A
60-74 = B
45-59 = C
30-44 = D
0-29 = E

RISK LEVEL:

90-100 = Very Healthy
75-89 = Healthy
60-74 = Moderate
45-59 = Moderate
30-44 = Unhealthy
0-29 = Avoid Frequently

When nutrition data is missing, DO NOT pretend the product is healthy or unhealthy.
Use a conservative score around 50 only when there is genuinely insufficient data,
and clearly state that the score is limited by missing information.

For allergens, identify only allergens that are explicitly present or clearly stated
in the provided information.

For additives, identify only additives that are explicitly present.

Do not diagnose diseases or provide medical treatment.
`;

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

/* =========================================================
   ANALYZE IMAGE
========================================================= */

app.post('/api/analyze-image', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      userPrompt,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'imageBase64 is required',
      });
    }

    const ai = getGeminiAI();

    const cleanBase64 = imageBase64.replace(
      /^data:image\/[^;]+;base64,/i,
      ''
    );

    const prompt = `
Analyze this food product image carefully.

Look for:

- Product name
- Brand
- Front packaging
- Nutrition label
- Ingredients list
- Allergens
- Additives
- Preservatives
- Artificial colours
- Artificial sweeteners
- Serving size
- Calories
- Protein
- Fat
- Sugar
- Salt
- Fibre
- Carbohydrates

If the image does not contain enough information, DO NOT GUESS.

${userPrompt ? `Additional user information: ${userPrompt}` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',

      contents: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],

      config: {
        systemInstruction: FOOD_ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text || '';

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    const cleanJsonString = cleanGeminiJson(text);

    let data;

    try {
      data = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('Gemini JSON parsing failed:', cleanJsonString);

      throw new Error(
        'AI returned invalid JSON. Please try scanning the product again.'
      );
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-image:', err);

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to analyze food product image.',
    });
  }
});

/* =========================================================
   ANALYZE BARCODE
========================================================= */

app.post('/api/analyze-barcode', async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        error: 'Barcode is required',
      });
    }

    console.log(`Barcode lookup requested: ${barcode}`);

    /* -----------------------------------------------------
       OPEN FOOD FACTS LOOKUP
    ----------------------------------------------------- */

    const offUrl =
      `https://world.openfoodfacts.org/api/v2/product/` +
      `${encodeURIComponent(barcode)}.json`;

    const offRes = await fetch(offUrl);

    let offData: any = null;

    if (offRes.ok) {
      offData = await offRes.json();
    }

    /* -----------------------------------------------------
       PRODUCT NOT FOUND
    ----------------------------------------------------- */

    if (
      !offData ||
      offData.status !== 1 ||
      !offData.product
    ) {
      return res.json({
        found: false,
        barcode,
        message:
          'Product not found in the barcode database. Please scan or upload clear front and back images of the product for AI analysis.',
      });
    }

    /* -----------------------------------------------------
       EXTRACT PRODUCT DATA
    ----------------------------------------------------- */

    const p = offData.product;

    const productName =
      p.product_name ||
      p.product_name_en ||
      'Unknown Product';

    const brand =
      p.brands ||
      'Unknown Brand';

    const ingredientsText =
      p.ingredients_text_en ||
      p.ingredients_text ||
      '';

    const nutriments =
      p.nutriments || {};

    const getValue = (
      primary: any,
      secondary: any
    ) => {
      if (
        primary !== undefined &&
        primary !== null &&
        primary !== ''
      ) {
        return primary;
      }

      if (
        secondary !== undefined &&
        secondary !== null &&
        secondary !== ''
      ) {
        return secondary;
      }

      return 'Data unavailable';
    };

    const calories = getValue(
      nutriments['energy-kcal_100g'],
      nutriments['energy-kcal']
    );

    const protein = getValue(
      nutriments.proteins_100g,
      nutriments.proteins
    );

    const fat = getValue(
      nutriments.fat_100g,
      nutriments.fat
    );

    const sugar = getValue(
      nutriments.sugars_100g,
      nutriments.sugars
    );

    const salt = getValue(
      nutriments.salt_100g,
      nutriments.salt
    );

    const fiber = getValue(
      nutriments.fiber_100g,
      nutriments.fiber
    );

    const carbohydrates = getValue(
      nutriments.carbohydrates_100g,
      nutriments.carbohydrates
    );

    const imageUrl =
      p.image_url ||
      p.image_front_url ||
      p.image_front_small_url ||
      '';

    const servingSize =
      p.serving_size ||
      '100g';

    /* -----------------------------------------------------
       GEMINI ENRICHMENT
    ----------------------------------------------------- */

    const ai = getGeminiAI();

    const promptText = `
Analyze this food product using the barcode database information below.

Barcode:
${barcode}

Product name:
${productName}

Brand:
${brand}

Ingredients:
${ingredientsText || 'Data unavailable'}

Serving size:
${servingSize}

Nutrition per 100g:

Calories:
${calories}

Protein:
${protein}

Fat:
${fat}

Sugar:
${sugar}

Salt:
${salt}

Fiber:
${fiber}

Carbohydrates:
${carbohydrates}

Nutri-Score from database:
${p.nutriscore_grade || 'Data unavailable'}

IMPORTANT:

Use the supplied information.

Do NOT invent missing nutrition or ingredient information.

If an important value is missing, report:
"Data unavailable"

Provide:

- Health score
- Grade
- Risk level
- Ingredients
- Additives
- Preservatives
- Artificial colours
- Artificial sweeteners
- Allergens
- Children suitability
- Diabetic suitability
- Pregnancy suitability
- Elderly suitability
- Gym/athlete suitability
- Good points
- Bad points
- Warnings
- Benefits
- Daily advice
- Healthier alternatives
- Simple summary
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',

      contents: promptText,

      config: {
        systemInstruction: FOOD_ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text || '';

    if (!text) {
      throw new Error(
        'Gemini returned an empty barcode analysis.'
      );
    }

    const cleanJsonString =
      cleanGeminiJson(text);

    let aiResult;

    try {
      aiResult =
        JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error(
        'Barcode Gemini JSON parsing failed:',
        cleanJsonString
      );

      throw new Error(
        'AI returned invalid barcode analysis.'
      );
    }

    /* -----------------------------------------------------
       FORCE VERIFIED BARCODE DATABASE VALUES
       INTO RESULT WHEN AVAILABLE
    ----------------------------------------------------- */

    aiResult.productName =
      productName;

    aiResult.brand =
      brand;

    aiResult.barcode =
      barcode;

    aiResult.servingSize =
      servingSize;

    if (
      calories !== 'Data unavailable'
    ) {
      aiResult.calories =
        `${calories} kcal`;
    }

    if (
      protein !== 'Data unavailable'
    ) {
      aiResult.protein =
        `${protein} g`;
    }

    if (
      fat !== 'Data unavailable'
    ) {
      aiResult.fat =
        `${fat} g`;
    }

    if (
      sugar !== 'Data unavailable'
    ) {
      aiResult.sugar =
        `${sugar} g`;
    }

    if (
      salt !== 'Data unavailable'
    ) {
      aiResult.salt =
        `${salt} g`;
    }

    if (
      fiber !== 'Data unavailable'
    ) {
      aiResult.fiber =
        `${fiber} g`;
    }

    if (
      carbohydrates !== 'Data unavailable'
    ) {
      aiResult.carbohydrates =
        `${carbohydrates} g`;
    }

    if (ingredientsText) {
      aiResult.ingredients =
        ingredientsText
          .split(',')
          .map(
            (item: string) =>
              item.trim()
          )
          .filter(Boolean);
    }

    if (imageUrl) {
      aiResult.imageUrl =
        imageUrl;
    }

    /* -----------------------------------------------------
       RETURN RESULT
    ----------------------------------------------------- */

    return res.json({
      found: true,
      data: aiResult,
    });
  } catch (err: any) {
    console.error(
      'Error in /api/analyze-barcode:',
      err
    );

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to process barcode.',
    });
  }
});

/* =========================================================
   SEARCH PRODUCTS
========================================================= */

app.post('/api/search-products', async (req, res) => {
  try {
    const { query } = req.body;

    if (
      !query ||
      typeof query !== 'string'
    ) {
      return res.status(400).json({
        error:
          'Search query string is required',
      });
    }

    const offUrl =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodeURIComponent(query)}` +
      `&search_simple=1` +
      `&action=process` +
      `&json=1` +
      `&page_size=8`;

    const offRes =
      await fetch(offUrl);

    let products: any[] = [];

    if (offRes.ok) {
      const data =
        await offRes.json();

      if (
        data &&
        Array.isArray(data.products)
      ) {
        products =
          data.products.map(
            (p: any) => ({
              productName:
                p.product_name ||
                p.product_name_en ||
                query,

              brand:
                p.brands ||
                'Various',

              barcode:
                p.code || '',

              nutriscore:
                (
                  p.nutriscore_grade ||
                  'N/A'
                ).toUpperCase(),

              imageUrl:
                p.image_small_url ||
                p.image_front_small_url ||
                '',

              calories:
                p.nutriments?.[
                  'energy-kcal_100g'
                ] !== undefined
                  ? `${p.nutriments['energy-kcal_100g']} kcal`
                  : 'Data unavailable',

              sugar:
                p.nutriments?.[
                  'sugars_100g'
                ] !== undefined
                  ? `${p.nutriments.sugars_100g} g`
                  : 'Data unavailable',

              protein:
                p.nutriments?.[
                  'proteins_100g'
                ] !== undefined
                  ? `${p.nutriments.proteins_100g} g`
                  : 'Data unavailable',
            })
          );
      }
    }

    return res.json({
      success: true,
      results: products,
    });
  } catch (err: any) {
    console.error(
      'Error in /api/search-products:',
      err
    );

    return res.status(500).json({
      error:
        'Failed to search products.',
    });
  }
});

/* =========================================================
   VITE DEVELOPMENT / PRODUCTION
========================================================= */

async function startServer() {
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    /* ---------------------------------------------
       DEVELOPMENT
    --------------------------------------------- */

    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },

        appType: 'spa',
      });

    app.use(
      vite.middlewares
    );
  } else {
    /* ---------------------------------------------
       PRODUCTION
    --------------------------------------------- */

    const distPath =
      path.join(
        __dirname,
        'dist'
      );

    app.use(
      express.static(
        distPath
      )
    );

    /*
      SPA fallback.

      Using app.use() here instead of app.get('*')
      avoids Express 5 route-pattern problems.
    */

    app.use(
      (req, res, next) => {
        if (
          req.method === 'GET' &&
          !req.path.startsWith('/api/')
        ) {
          return res.sendFile(
            path.join(
              distPath,
              'index.html'
            )
          );
        }

        next();
      }
    );
  }

  /* ---------------------------------------------
     START SERVER
  --------------------------------------------- */

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `[NutriScan AI] Server running on port ${PORT}`
      );
    }
  );
}

/* =========================================================
   START
========================================================= */

startServer().catch(
  (error) => {
    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);
  }
);