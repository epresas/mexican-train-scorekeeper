import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// Inicializar el SDK oficial con la API Key oculta en las variables de Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validar el método HTTP correcto
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { image } = req.body;

    // 2. Control de excepciones de la petición entrante
    if (!image) {
      return res
        .status(400)
        .json({ error: "No se recibió ninguna imagen para procesar." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "Falta la API Key de Gemini en el servidor." });
    }

    // 3. Prompt de Ingeniería para forzar el comportamiento estructurado del modelo
    const prompt = `
      Eres un software automático de visión artificial especializado en el juego de dominó "Tren Mexicano". 
      Analiza minuciosamente la imagen adjunta, la cual muestra las fichas de dominó restantes que le quedaron a un jugador al finalizar la ronda.
      
      Instrucciones obligatorias:
      1. Identifica individualmente cada una de las fichas de dominó visibles.
      2. Cuenta de manera exacta la suma de todos los puntos (pips/dots) de cada ficha.
      3. Suma el total de todas las fichas encontradas.
      
      Debes responder de forma EXCLUSIVA un string con formato JSON estructurado idéntico a este molde:
      {
        "totalPoints": 42,
        "reasoning": "Se detectaron 3 fichas: un doble 12 (24 pts), un 5-3 (8 pts) y un 6-4 (10 pts). Total = 42."
      }
      
      No agregues texto explicativo por fuera del JSON. No utilices bloques de código Markdown (\`\`\`json ... \`\`\`). Tu respuesta completa debe ser legible directamente por un JSON.parse().
    `;

    // 4. Consumo nativo Multimodal del Free Tier de Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: image, // String Base64 puro enviado desde tu useDominoScanner
          },
        },
      ],
    });

    const textResponse = response.text?.trim() || "{}";

    // 5. Limpieza de seguridad por si la IA introduce caracteres de formato markdown por inercia
    const cleanJson = textResponse
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();

    // 6. Conversión a objeto nativo para validar que cumpla el contrato
    const result = JSON.parse(cleanJson);

    // 7. Retorno exitoso al cliente de React
    return res.status(200).json({
      totalPoints:
        typeof result.totalPoints === "number" ? result.totalPoints : 0,
      reasoning: result.reasoning || "No se generó desglose.",
    });
  } catch (error: any) {
    console.error("Error crítico en Serverless Function:", error);
    return res.status(500).json({
      error: "Error interno de procesamiento.",
      details: error.message || "Fallo desconocido",
    });
  }
}
