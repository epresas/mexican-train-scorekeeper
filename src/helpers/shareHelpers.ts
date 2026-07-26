import { toPng } from "html-to-image"

/**
 * Renders the DOM element identified by `elementId` to a PNG Blob.
 *
 * - Uses pixelRatio: 2 so the image is crisp when previewed in
 *   WhatsApp/Telegram at natural size.
 * - Throws a descriptive Error if the element is not found.
 */
export async function generateShareImage(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(
      `generateShareImage: element with id="${elementId}" was not found in the DOM.`,
    )
  }

  const dataUrl = await toPng(element, { pixelRatio: 2 })

  // Convert data URL → Blob via fetch (works in all modern browsers)
  const response = await fetch(dataUrl)
  return response.blob()
}

/**
 * Shares a PNG Blob via the Web Share API if supported, or falls back to
 * triggering a browser download.
 *
 * Returns:
 *  'shared'      — navigator.share was called (including when user cancelled)
 *  'downloaded'  — file was downloaded because share is unsupported
 */
export async function shareImageNative(
  blob: Blob,
  filename: string,
  title: string,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
    } catch (err) {
      // AbortError = user cancelled the native share sheet — not an error state
      if (err instanceof Error && err.name === "AbortError") {
        return "shared"
      }
      // Any other unexpected error should propagate up
      throw err
    }
    return "shared"
  }

  // Fallback: trigger a browser download
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)

  return "downloaded"
}
