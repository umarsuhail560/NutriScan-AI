import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "imageBase64 is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.replace(
              /^data:image\/\w+;base64,/,
              ""
            ),
          },
        },
        {
          text: `
You are an AI nutrition expert.

Analyze this food product image.

Return ONLY valid JSON.

{
  "productName":"",
  "healthScore":0,
  "grade":"",
  "calories":"",
  "protein":"",
  "fat":"",
  "sugar":"",
  "goodPoints":[],
  "badPoints":[],
  "summary":""
}
`,
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";

    res.status(200).send(text);

  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}