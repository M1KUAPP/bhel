/**
 * Reports API Module
 *
 * API methods for generating and downloading PDF reports.
 * Supports employee, department, and leave reports with PNG export.
 *
 * Features:
 * - Generate yearly employee reports
 * - Generate department reports
 * - Generate leave summary reports
 * - Download as PDF blob
 * - Convert PDF to PNG for preview
 */
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/lib/config'
import { pdfjs } from '@/lib/pdfConfig'

/**
 * Creates authorization header with Bearer token.
 * @returns Headers object with Authorization
 * @throws Error if not authenticated
 */
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    throw new Error('Not authenticated. Please log in again.')
  }
  return {
    Authorization: `Bearer ${token}`
  }
}

/**
 * Fetches a report as a Blob from the given URL.
 * @param url - Full report URL
 * @returns PDF blob data
 * @throws Error on fetch failure
 */
const fetchReport = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    headers: getAuthHeader()
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to generate report')
  }
  return response.blob()
}

/** Report generation API methods */
export const reportsApi = {
  /**
   * Generates yearly report for a specific employee.
   * @param employeeId - Employee ID
   * @param year - Report year (default: current year)
   * @returns PDF blob
   */
  generateEmployeeReport: async (employeeId: number, year?: number): Promise<Blob> => {
    const queryYear = year || new Date().getFullYear()
    return fetchReport(`${API_BASE_URL}/api/reports/employee/${employeeId}/yearly?year=${queryYear}`)
  },

  /**
   * Generates yearly report for a department.
   * @param department - Department name
   * @param year - Report year (default: current year)
   * @returns PDF blob
   */
  generateDepartmentReport: async (department: string, year?: number): Promise<Blob> => {
    const queryYear = year || new Date().getFullYear()
    return fetchReport(
      `${API_BASE_URL}/api/reports/department/${encodeURIComponent(department)}/yearly?year=${queryYear}`
    )
  },

  /**
   * Generates yearly leave summary report.
   * @param year - Report year (default: current year)
   * @returns PDF blob
   */
  generateLeaveReport: async (year?: number): Promise<Blob> => {
    const queryYear = year || new Date().getFullYear()
    return fetchReport(`${API_BASE_URL}/api/reports/leave/yearly?year=${queryYear}`)
  },

  /**
   * Triggers browser download of a blob file.
   * @param blob - File blob to download
   * @param filename - Downloaded file name
   */
  downloadBlob: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  /**
   * Converts PDF blob to PNG and triggers download.
   * Renders all PDF pages and combines into single image.
   * @param pdfBlob - PDF blob to convert
   * @param filename - Output PNG filename
   * @throws Error if conversion fails
   */
  downloadAsPNG: async (pdfBlob: Blob, filename: string) => {
    let pdf: Awaited<ReturnType<typeof pdfjs.getDocument>['promise']> | null = null
    const pageCanvases: HTMLCanvasElement[] = []
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer()
      pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const scale = 2
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        await page.render({ canvasContext: context, viewport, canvas }).promise
        pageCanvases.push(canvas)
      }
      const totalWidth = Math.max(...pageCanvases.map((c) => c.width))
      const totalHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0)
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = totalWidth
      finalCanvas.height = totalHeight
      const finalContext = finalCanvas.getContext('2d')!
      finalContext.fillStyle = '#ffffff'
      finalContext.fillRect(0, 0, totalWidth, totalHeight)
      let yOffset = 0
      for (const pageCanvas of pageCanvases) {
        finalContext.drawImage(pageCanvas, 0, yOffset)
        yOffset += pageCanvas.height
      }
      pageCanvases.length = 0
      const blob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create PNG image'))
          }
        }, 'image/png')
      })
      reportsApi.downloadBlob(blob, filename)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to convert PDF to PNG:', error)
      }
      throw new Error('Failed to convert report to PNG. Please try downloading as PDF instead.')
    } finally {
      if (pdf) {
        pdf.destroy()
      }
    }
  }
}
