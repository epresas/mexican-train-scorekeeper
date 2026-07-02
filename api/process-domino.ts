import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// Inicialización correcta utilizando variables de entorno en el SDK moderno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Asegurar cabeceras CORS y JSON siempre
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { image, imag } = req.body;
    const imageData = image || imag;

    if (!imageData) {
      return res
        .status(400)
        .json({ error: "No se recibió ninguna imagen para procesar." });
    }

    // El SDK de Google busca automáticamente la variable GEMINI_API_KEY en process.env.
    // Validamos manualmente su existencia para darte un mensaje claro si falta.
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          "Falta configurar la variable GEMINI_API_KEY en el entorno local/.env.local",
      });
    }

    const prompt = `
      Eres un software de visión artificial para el juego "Tren Mexicano". 
      Analiza la imagen adjunta con fichas de dominó restantes.
      Suma el total de todos los puntos de las fichas encontradas.
      Responde EXCLUSIVAMENTE con este formato JSON plano, sin bloques de código markdown:
      {
        "totalPoints": 0,
        "reasoning": "Explicación breve"
      }
    `;

    // Consumo del modelo utilizando la sintaxis de generación de contenido
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData,
          },
        },
      ],
    });

    const textResponse = response.text?.trim() || "{}";
    const cleanJson = textResponse
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
    const result = JSON.parse(cleanJson);

    return res.status(200).json({
      totalPoints:
        typeof result.totalPoints === "number" ? result.totalPoints : 0,
      reasoning: result.reasoning || "No se generó desglose.",
    });
  } catch (error: any) {
    console.error("Error detallado en la función de Vercel:", error);

    // GARANTIZAMOS devolver JSON ante cualquier excepción para evitar el error "Unexpected token A"
    return res.status(500).json({
      error: "Error interno de procesamiento en el servidor de IA.",
      details: error.message || String(error),
    });
  }
}
