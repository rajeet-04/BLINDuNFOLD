import { OCRResult } from "../types";

// We assume Tesseract is loaded globally via CDN in index.html to avoid large bundle issues in this environment
declare const Tesseract: any;

let worker: any = null;

export const initializeOCR = async () => {
  if (!worker) {
    try {
      // Initialize with English, Hindi, Urdu, and Bengali
      // Note: Tesseract will download .traineddata for these languages on first load
      worker = await Tesseract.createWorker('eng+hin+urd+ben', 1, {
        logger: (m: any) => console.debug(m)
      });
    } catch (e) {
      console.error("Failed to initialize Tesseract worker", e);
    }
  }
  return worker;
};

export const recognizeText = async (image: HTMLCanvasElement | HTMLImageElement | string): Promise<OCRResult> => {
  if (!worker) await initializeOCR();
  if (!worker) return { text: "", confidence: 0 };

  try {
    const { data: { text, confidence } } = await worker.recognize(image);
    return { text: text.trim(), confidence };
  } catch (e) {
    console.error("OCR Error", e);
    return { text: "", confidence: 0 };
  }
};

export const terminateOCR = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};