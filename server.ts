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

Your task is to analyze products using ONLY the information actually visible
or provided in the product image / verified barcode database metadata.

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
8. Barcode numbers alone must NEVER be treated as proof of product identity.
9. When barcode database information is supplied, use that information as the
   verified source for product identity and nutrition values.
10. Do not invent information that is not present in the supplied data or image.

EDIBLE PRODUCT CLASSIFICATION:

You MUST determine whether the scanned product is an edible food or beverage.

Set "isEdible" to true ONLY when the product is intended to be consumed as
food or beverage.

Set "isEdible" to false for products such as:

- Cosmetics
- Skincare products
- Shampoo
- Conditioner
- Soap
- Detergent
- Cleaning products
- Household products
- Medicines
- Toiletries
- Personal-care products
- Beauty products
- Other non-food products

If the product is clearly non-edible, DO NOT perform a normal nutritional
health assessment.

For a non-edible product:
- healthScore MUST be 0
- grade MUST be "E"
- riskLevel MUST be "Avoid Frequently"
- nutrition values MUST be "Data unavailable"
- suitability values MUST be false
- do not invent food benefits
- do not recommend consuming the product
- clearly state that the product is not an edible food or beverage

Return ONLY valid JSON matching this structure:

{
  "isEdible": true,

  "productName": "Product Name",
  "brand": "Brand Name",

  "healthScore": 0,
"grade": "E",
"riskLevel": "Avoid Frequently",

  "calories": "Data unavailable",
  "protein": "Data unavailable",
  "fat": "Data unavailable",
  "sugar": "Data unavailable",
  "salt": "Data unavailable",
  "fiber": "Data unavailable",
  "carbohydrates": "Data unavailable",

  "servingSize": "Data unavailable",

  "ingredients": [],
  "artificialColors": [],
  "preservatives": [],
  "artificialSweeteners": [],
  "additives": [],
  "allergens": [],

  "suitability": {
    "forChildren": false,
    "childrenNotes": "Data unavailable",

    "forDiabetics": false,
    "diabeticNotes": "Data unavailable",

    "forPregnant": false,
    "pregnantNotes": "Data unavailable",

    "forElderly": false,
    "elderlyNotes": "Data unavailable",

    "forGym": false,
    "gymNotes": "Data unavailable"
  },

  "goodPoints": [],
  "badPoints": [],
  "warnings": [],

  "benefits": [],

  "dailyAdvice": "Data unavailable",

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

For edible products:

When nutrition data is missing, DO NOT invent a health score based on missing values.

The health score must be based only on nutrition and ingredient information that
is actually visible or verified.

If there is not enough verified information to calculate a meaningful health score,
set:

healthScore = 0
grade = "E"
riskLevel = "Avoid Frequently"

and clearly state that the health assessment could not be completed because
verified nutrition information is unavailable.

NEVER use 50 as a default score.
NEVER use 50 merely because information is missing.
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
Analyze this product image carefully.

FIRST determine whether this product is an edible food or beverage.

Set "isEdible" to:
- true for food and beverages intended for consumption
- false for cosmetics, skincare, shampoo, soap, detergent, medicine,
  household products, toiletries, personal-care products, beauty products,
  or any other non-food product.

For an edible food/beverage, look for:

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

For a non-edible product:

- Set "isEdible" to false.
- Set healthScore to 0.
- Set grade to "E".
- Set riskLevel to "Avoid Frequently".
- Do not invent nutritional information.
- Nutrition fields must say "Data unavailable".
- Do not provide food benefits or consumption recommendations.

IMPORTANT:

Use ONLY information visible in the image.

If the image does not contain enough information, DO NOT GUESS.

Return "Data unavailable" for information that cannot be verified.

${userPrompt ? `Additional user information: ${userPrompt}` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',

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
      console.error(
        'Gemini JSON parsing failed:',
        cleanJsonString
      );

      throw new Error(
        'AI returned invalid JSON. Please try scanning the product again.'
      );
    }

    /* =====================================================
       SERVER-SIDE NON-EDIBLE ENFORCEMENT
    ===================================================== */

    if (data.isEdible === false) {
      data.healthScore = 0;
      data.grade = 'E';
      data.riskLevel = 'Avoid Frequently';

      data.calories = 'Data unavailable';
      data.protein = 'Data unavailable';
      data.fat = 'Data unavailable';
      data.sugar = 'Data unavailable';
      data.salt = 'Data unavailable';
      data.fiber = 'Data unavailable';
      data.carbohydrates = 'Data unavailable';
      data.servingSize = 'Data unavailable';

      data.suitability = {
        forChildren: false,
        childrenNotes: 'This is not an edible food or beverage.',

        forDiabetics: false,
        diabeticNotes: 'This is not an edible food or beverage.',

        forPregnant: false,
        pregnantNotes: 'This is not an edible food or beverage.',

        forElderly: false,
        elderlyNotes: 'This is not an edible food or beverage.',

        forGym: false,
        gymNotes: 'This is not an edible food or beverage.',
      };

      data.goodPoints = [];
      data.benefits = [];
      data.alternatives = [];

      data.warnings = [
        'This product is not an edible food or beverage.'
      ];

      data.dailyAdvice =
        'Do not treat this product as food.';

      data.summary =
        'This product is not an edible food or beverage, so it is not suitable for nutritional assessment.';
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error(
      'Error in /api/analyze-image:',
      err
    );

    return res.status(500).json({
      error:
        err?.message ||
        'Failed to analyze food product image.',
    });
  }
});

/* =========================================================
   OPEN FOOD FACTS HELPER
========================================================= */

async function lookupBarcodeInOpenFoodFacts(
  barcode: string
) {
  console.log(
    `[Barcode] Starting Open Food Facts lookup: ${barcode}`
  );

  /* -------------------------------------------------------
     METHOD 1: DIRECT PRODUCT ENDPOINT
  ------------------------------------------------------- */

  const directUrl =
    `https://world.openfoodfacts.org/api/v2/product/` +
    `${encodeURIComponent(barcode)}.json`;

  console.log(
    `[Barcode] Direct lookup URL: ${directUrl}`
  );

  try {
    const response = await fetch(directUrl);

    console.log(
      `[Barcode] Direct lookup HTTP status: ${response.status}`
    );

    if (response.ok) {
      const data: any = await response.json();

      console.log(
        `[Barcode] Direct lookup database status: ${data?.status}`
      );

      if (
        data &&
        data.status === 1 &&
        data.product
      ) {
        console.log(
          `[Barcode] Product FOUND using direct lookup.`
        );

        return data;
      }
    }
  } catch (error) {
    console.error(
      '[Barcode] Direct Open Food Facts lookup failed:',
      error
    );
  }

  /* -------------------------------------------------------
     METHOD 2: SEARCH ENDPOINT USING BARCODE
  ------------------------------------------------------- */

  console.log(
    `[Barcode] Direct lookup failed. Trying secondary search...`
  );

  const searchUrl =
    `https://world.openfoodfacts.org/api/v2/search` +
    `?code=${encodeURIComponent(barcode)}` +
    `&page_size=1`;

  console.log(
    `[Barcode] Secondary lookup URL: ${searchUrl}`
  );

  try {
    const response = await fetch(searchUrl);

    console.log(
      `[Barcode] Secondary lookup HTTP status: ${response.status}`
    );

    if (response.ok) {
      const data: any = await response.json();

      if (
        data &&
        Array.isArray(data.products) &&
        data.products.length > 0
      ) {
        const product = data.products[0];

        console.log(
          `[Barcode] Product FOUND using secondary lookup.`
        );

        return {
          status: 1,
          product,
        };
      }
    }
  } catch (error) {
    console.error(
      '[Barcode] Secondary Open Food Facts lookup failed:',
      error
    );
  }

  console.log(
    `[Barcode] Product NOT FOUND in Open Food Facts: ${barcode}`
  );

  return null;
}

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

    const cleanBarcode = String(barcode).trim();

    if (!cleanBarcode) {
      return res.status(400).json({
        error: 'Barcode is required',
      });
    }

    console.log(
      `=================================================`
    );

    console.log(
      `[Barcode] Lookup requested: ${cleanBarcode}`
    );

    console.log(
      `=================================================`
    );

    /* -----------------------------------------------------
       OPEN FOOD FACTS LOOKUP
    ----------------------------------------------------- */

    const offData =
      await lookupBarcodeInOpenFoodFacts(
        cleanBarcode
      );

    /* -----------------------------------------------------
       PRODUCT NOT FOUND
    ----------------------------------------------------- */

    if (
      !offData ||
      offData.status !== 1 ||
      !offData.product
    ) {
      console.log(
        `[Barcode] No verified product data found for ${cleanBarcode}.`
      );

      return res.json({
        found: false,
        barcode: cleanBarcode,

        fallbackToImageAnalysis: true,

        message:
          'The barcode was scanned correctly, but this product is not currently available in our barcode database. Please upload clear front and back images of the product for AI analysis.',

        reason:
          'NO_BARCODE_DATABASE_MATCH',
      });
    }

    /* -----------------------------------------------------
       EXTRACT PRODUCT DATA
    ----------------------------------------------------- */

    const p = offData.product;

    console.log(
      `[Barcode] Verified product received from database.`
    );

    console.log(
      `[Barcode] Product name: ${
        p.product_name ||
        p.product_name_en ||
        'Unknown Product'
      }`
    );

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

    /* -----------------------------------------------------
       SAFE VALUE HELPER
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       VERIFIED NUTRITION VALUES
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       OTHER DATABASE DATA
    ----------------------------------------------------- */

    const imageUrl =
      p.image_url ||
      p.image_front_url ||
      p.image_front_small_url ||
      '';

    const servingSize =
      p.serving_size ||
      '100g';

    const nutriScore =
      p.nutriscore_grade ||
      'Data unavailable';

    /* -----------------------------------------------------
       GEMINI ENRICHMENT
    ----------------------------------------------------- */

    const ai = getGeminiAI();

    const promptText = `
Analyze this food product using the VERIFIED barcode database information below.

Barcode:
${cleanBarcode}

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
${nutriScore}

IMPORTANT:

The product identity and numerical values supplied above come from the
barcode database.

Do NOT change or invent those verified values.

Do NOT invent information that is marked "Data unavailable".

Use the supplied information to determine:

- Whether the product is an edible food or beverage
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

For allergens and additives, only identify items that are explicitly supported
by the supplied ingredients or product information.

If something cannot be verified, write:
"Data unavailable".
`;

    console.log(
      `[Barcode] Sending verified database information to Gemini...`
    );

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',

      contents: promptText,

      config: {
        systemInstruction:
          FOOD_ANALYSIS_SYSTEM_PROMPT,

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
        '[Barcode] Gemini JSON parsing failed:',
        cleanJsonString
      );

      throw new Error(
        'AI returned invalid barcode analysis.'
      );
    }

    /* -----------------------------------------------------
       FORCE VERIFIED DATABASE VALUES
    ----------------------------------------------------- */

    aiResult.productName =
      productName;

    aiResult.brand =
      brand;

    aiResult.barcode =
      cleanBarcode;

    aiResult.servingSize =
      servingSize;

    /* -----------------------------------------------------
       VERIFIED NUTRITION
    ----------------------------------------------------- */

    if (
      calories !== 'Data unavailable'
    ) {
      aiResult.calories =
        `${calories} kcal`;
    } else {
      aiResult.calories =
        'Data unavailable';
    }

    if (
      protein !== 'Data unavailable'
    ) {
      aiResult.protein =
        `${protein} g`;
    } else {
      aiResult.protein =
        'Data unavailable';
    }

    if (
      fat !== 'Data unavailable'
    ) {
      aiResult.fat =
        `${fat} g`;
    } else {
      aiResult.fat =
        'Data unavailable';
    }

    if (
      sugar !== 'Data unavailable'
    ) {
      aiResult.sugar =
        `${sugar} g`;
    } else {
      aiResult.sugar =
        'Data unavailable';
    }

    if (
      salt !== 'Data unavailable'
    ) {
      aiResult.salt =
        `${salt} g`;
    } else {
      aiResult.salt =
        'Data unavailable';
    }

    if (
      fiber !== 'Data unavailable'
    ) {
      aiResult.fiber =
        `${fiber} g`;
    } else {
      aiResult.fiber =
        'Data unavailable';
    }

    if (
      carbohydrates !==
      'Data unavailable'
    ) {
      aiResult.carbohydrates =
        `${carbohydrates} g`;
    } else {
      aiResult.carbohydrates =
        'Data unavailable';
    }

    /* -----------------------------------------------------
       VERIFIED INGREDIENTS
    ----------------------------------------------------- */

    if (ingredientsText) {
      aiResult.ingredients =
        ingredientsText
          .split(',')
          .map(
            (item: string) =>
              item.trim()
          )
          .filter(Boolean);
    } else {
      aiResult.ingredients = [];
    }

    /* -----------------------------------------------------
       PRODUCT IMAGE
    ----------------------------------------------------- */

    if (imageUrl) {
      aiResult.imageUrl =
        imageUrl;
    }

    /* -----------------------------------------------------
       DATABASE METADATA
    ----------------------------------------------------- */

    aiResult.barcodeVerified = true;

    aiResult.barcodeSource =
      'Open Food Facts';

    aiResult.nutriScore =
      nutriScore;

    /* -----------------------------------------------------
       RETURN RESULT
    ----------------------------------------------------- */

    console.log(
      `[Barcode] Analysis completed successfully for ${cleanBarcode}.`
    );

    console.log(
      `=================================================`
    );

    return res.json({
      found: true,

      barcode: cleanBarcode,

      data: aiResult,
    });
  } catch (err: any) {
    console.error(
      '================================================='
    );

    console.error(
      '[Barcode] Error in /api/analyze-barcode:',
      err
    );

    console.error(
      '================================================='
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

    console.log(
      `[Search] Product search requested: ${query}`
    );

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
                  ? `${p.nutriments['sugars_100g']} g`
                  : 'Data unavailable',

              protein:
                p.nutriments?.[
                  'proteins_100g'
                ] !== undefined
                  ? `${p.nutriments['proteins_100g']} g`
                  : 'Data unavailable',
            })
          );
      }
    }

    console.log(
      `[Search] Products returned: ${products.length}`
    );

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

    /* ---------------------------------------------
       SPA FALLBACK
    --------------------------------------------- */

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

      console.log(
        `[NutriScan AI] Environment: ${
          process.env.NODE_ENV ||
          'development'
        }`
      );

      console.log(
        `[NutriScan AI] Gemini API key configured: ${
          process.env.GEMINI_API_KEY
            ? 'YES'
            : 'NO'
        }`
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