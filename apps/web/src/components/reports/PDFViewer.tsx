/**
 * PDF Viewer Component
 *
 * Displays PDF documents with scrollable pages using react-pdf.
 * Renders all pages with text and annotation layers.
 *
 * Features:
 * - Renders all pages of a PDF document
 * - Responsive width based on container
 * - Text layer for copy/paste support
 * - Annotation layer for links/forms
 * - Loading spinner during PDF load
 * - Handles URL strings or Blob objects
 *
 * Dependencies:
 * - react-pdf for PDF rendering
 * - pdfjs-dist worker configuration from @/lib/pdfConfig
 */
'use client'

import '@/lib/pdfConfig'
import { useCallback, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

/** Props for the PDFViewer component */
interface PDFViewerProps {
  /** PDF source as URL string or Blob (null to hide) */
  file: string | Blob | null
}

/**
 * Renders a scrollable PDF viewer with all pages.
 *
 * @param file - PDF source URL or Blob
 * @returns PDF viewer with all pages or null if no file
 */
export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageWidth, setPageWidth] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }, [])
  const onDocumentLoadError = useCallback(() => {
    setIsLoading(false)
  }, [])
  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setPageWidth(node.clientWidth)
    }
  }, [])
  if (!file) return null
  return (
    <div className="h-full bg-white">
      <div ref={handleContainerRef} className="h-full overflow-auto bg-white">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }
          className="flex flex-col items-center"
        >
          {!isLoading &&
            Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth > 0 ? pageWidth : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="bg-white"
              />
            ))}
        </Document>
      </div>
    </div>
  )
}
