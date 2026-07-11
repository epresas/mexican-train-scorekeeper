import { useState } from "react";

interface UseDominoScannerProps {
  onPointsDetected: (points: number) => void;
  onError: (error: string) => void;
}

async function compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        resolve(base64);
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function useDominoScanner({
  onPointsDetected,
  onError,
}: UseDominoScannerProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const processImage = async (file: File) => {
    setIsProcessing(true);

    try {
      const base64Image = await compressImage(file);

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