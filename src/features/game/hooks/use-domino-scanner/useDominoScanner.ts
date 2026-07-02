import { useState } from "react";

interface UseDominoScannerProps {
  onPointsDetected: (points: number) => void;
  onError: (error: string) => void;
}

export function useDominoScanner({
  onPointsDetected,
  onError,
}: UseDominoScannerProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;

        // .split(',') rompe el texto en: [0] "data:image/jpeg;base64" y [1] "cadenabase64..."
        // Usamos el operador de encadenamiento opcional y un fallback por seguridad de tipos
        const base64String = result.split(",")[1] ?? "";

        if (!base64String) {
          reject(
            new Error("No se pudo extraer la cadena Base64 de la imagen."),
          );
          return;
        }

        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);

    try {
      const base64Image = await fileToBase64(file);

      const response = await fetch("/api/process-domino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la imagen");
      }

      onPointsDetected(data.totalPoints);
    } catch (err: any) {
      onError(err.message || "Error al escanear fichas");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processImage,
  };
}
