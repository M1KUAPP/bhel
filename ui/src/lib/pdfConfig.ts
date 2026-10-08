/**
 * PDF.js Configuration Module
 *
 * Configures pdf.js worker for react-pdf library.
 * Sets up the worker source URL for client-side PDF rendering.
 *
 * Note: Only configures worker in browser environment (not SSR).
 * Worker is loaded from unpkg CDN matching the installed pdfjs-dist version.
 */
import { pdfjs } from 'react-pdf'

/** Configure PDF.js worker source (client-side only) */
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

/** Re-export configured pdfjs for use in other modules */
export { pdfjs }
