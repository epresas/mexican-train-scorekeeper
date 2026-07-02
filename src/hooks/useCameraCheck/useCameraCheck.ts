import { useState, useEffect } from "react";

export function useCameraCheck() {
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("useEffect ejecutándose");
    async function checkCamera(): Promise<void> {
      try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isMobile) {
          setHasCamera(false);
          return;
        }

        if (!navigator.mediaDevices?.enumerateDevices) {
          setHasCamera(false);
          return;
        }

        if (!navigator.mediaDevices?.enumerateDevices) {
          console.warn(
            "⚠️ useCameraCheck: navigator.mediaDevices no está disponible (¿Falta HTTPS/SSL?)",
          );
          setHasCamera(false);
          setIsLoading(false);
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setHasCamera(videoDevices.length > 0);
      } catch (error) {
        console.error("Error en camera check:", error);
        setHasCamera(false);
      } finally {
        setIsLoading(false); // ← GARANTIZADO que se ejecuta siempre
      }
    }

    checkCamera();
  }, []);

  return { hasCamera, isLoading };
}
