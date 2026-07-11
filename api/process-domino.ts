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
Eres un experto en visión artificial especializado en fichas de dominó del 
juego "Tren Mexicano". Las fichas van del doble 0 (blanco, sin puntos) al 
doble 12 (dos mitades de 12 puntos cada una).

Cada ficha de dominó es rectangular, dividida en dos mitades por una línea 
central. Cada mitad tiene un número de puntos (pips) de 0 a 12, representados 
como círculos/puntos distribuidos en un patrón.

TAREA: Identifica cada ficha individual en la imagen y cuenta sus puntos.

Sigue este proceso obligatorio:
1. Cuenta cuántas fichas distintas hay en total en la imagen.
2. Para CADA ficha, identifica por separado:
   - El número de pips en la mitad izquierda (o superior)
   - El número de pips en la mitad derecha (o inferior)
   - La suma de esa ficha específica
3. Lista cada ficha con su desglose antes de dar el total.
4. Suma los totales de todas las fichas para obtener el resultado final.

IMPORTANTE sobre el conteo de pips:
- Los pips están dispuestos en patrones estándar de dominó (como un dado, 
  pero pueden llegar hasta 12 puntos por mitad)
- Cuenta cada punto individualmente, no estimes por el tamaño del patrón
- Si una ficha está parcialmente tapada por otra, indícalo en el reasoning 
  y haz tu mejor estimación
- Los dobles (ambas mitades iguales) son comunes — verifica cuidadosamente 
  que ambas mitades realmente coincidan antes de asumirlo

Responde EXCLUSIVAMENTE con este JSON, sin markdown:
{
  "tiles": [
    { "left": 6, "right": 4, "sum": 10 },
    { "left": 12, "right": 12, "sum": 24 }
  ],
  "totalPoints": 34,
  "reasoning": "Se detectaron 2 fichas: 6-4 (10 pts) y doble 12 (24 pts)."
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
