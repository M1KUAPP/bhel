/**
 * Reports Page Component
 *
 * Report generation page with preview and download functionality.
 * Accessible only to HR and ADMIN roles.
 *
 * Features:
 * - Three report types: Employee, Department, and Organization Leave
 * - Report parameter selection (employee, department, year)
 * - Live PDF preview panel with refresh
 * - Export formats: PDF and PNG
 * - Report info section explaining contents
 * - Statistics cards (employees, departments, selected year)
 * - Loading states and error handling
 *
 * Report Types:
 * - Employee: Individual yearly report with leave history
 * - Department: Team statistics and leave allocation
 * - Leave: Organization-wide leave utilization report
 */
'use client'

import PDFViewer from '@/components/reports/PDFViewer'
import { reportsApi } from '@/lib/api/reports'
import { REPORT_YEAR_RANGE } from '@/lib/config'
import { useEmployeeStore } from '@/lib/store/useEmployeeStore'
import { Building2, Calendar, Download, Eye, FileText, RefreshCw, User, Users, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

/** Available report types */
type ReportType = 'employee' | 'department' | 'leave'

/** Supported export formats */
type ExportFormat = 'pdf' | 'png'

/**
 * Report generation page with preview and export.
 *
 * @returns Reports page with type selection, preview, and download
 */
export default function ReportsPage() {
  const { employees, loading: employeeLoading, fetchEmployees, clearError } = useEmployeeStore()
  const [reportType, setReportType] = useState<ReportType>('employee')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  useEffect(() => {
    clearError()
    fetchEmployees()
  }, [fetchEmployees, clearError])
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])
  const departments = useMemo(() => {
    const deptSet = new Set(employees.map((emp) => emp.department))
    return Array.from(deptSet).sort()
  }, [employees])
  const yearOptions = Array.from({ length: REPORT_YEAR_RANGE }, (_, i) => new Date().getFullYear() - i)
  const getFilename = useCallback(() => {
    const ext = exportFormat
    switch (reportType) {
      case 'employee':
        const employee = employees.find((emp) => emp.id === parseInt(selectedEmployeeId))
        return `${employee?.firstName}_${employee?.lastName}_${selectedYear}_Report.${ext}`
      case 'department':
        return `Department_${selectedDepartment}_${selectedYear}_Report.${ext}`
      case 'leave':
        return `Organization_Leave_Report_${selectedYear}.${ext}`
    }
  }, [reportType, selectedEmployeeId, selectedDepartment, selectedYear, employees, exportFormat])
  const fetchReportBlob = useCallback(async (): Promise<Blob> => {
    if (!selectedYear) throw new Error('Please select a year')
    const year = parseInt(selectedYear)
    switch (reportType) {
      case 'employee':
        if (!selectedEmployeeId) throw new Error('Please select an employee')
        return await reportsApi.generateEmployeeReport(parseInt(selectedEmployeeId), year)
      case 'department':
        if (!selectedDepartment) throw new Error('Please select a department')
        return await reportsApi.generateDepartmentReport(selectedDepartment, year)
      case 'leave':
        return await reportsApi.generateLeaveReport(year)
    }
  }, [reportType, selectedEmployeeId, selectedDepartment, selectedYear])
  const handlePreviewReport = useCallback(async () => {
    setIsPreviewing(true)
    try {
      const blob = await fetchReportBlob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl)
        }
        return url
      })
      setPreviewBlob(blob)
      toast.success('Preview generated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setIsPreviewing(false)
    }
  }, [fetchReportBlob])
  const handleDownloadReport = async () => {
    setIsGenerating(true)
    try {
      const blob = previewBlob || (await fetchReportBlob())
      if (exportFormat === 'png') {
        await reportsApi.downloadAsPNG(blob, getFilename())
        toast.success('Report downloaded as PNG successfully')
      } else {
        reportsApi.downloadBlob(blob, getFilename())
        toast.success('Report downloaded successfully')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download report')
    } finally {
      setIsGenerating(false)
    }
  }
  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPreviewBlob(null)
    }
  }, [previewUrl])
  const hasValidSelection = useCallback(() => {
    if (!selectedYear) return false
    if (reportType === 'employee' && selectedEmployeeId) return true
    if (reportType === 'department' && selectedDepartment) return true
    if (reportType === 'leave') return true
    return false
  }, [reportType, selectedEmployeeId, selectedDepartment, selectedYear])
  useEffect(() => {
    if (hasValidSelection()) {
      // Fetching the preview is the effect; it flags itself as in flight before awaiting the request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handlePreviewReport()
    }
  }, [hasValidSelection, handlePreviewReport])
  const isActionDisabled = () => {
    if (isGenerating || isPreviewing) return true
    if (!selectedYear) return true
    if (reportType === 'employee' && !selectedEmployeeId) return true
    if (reportType === 'department' && !selectedDepartment) return true
    return false
  }
  const getReportInfo = () => {
    switch (reportType) {
      case 'employee':
        return {
          title: 'About Employee Reports',
          description:
            'The employee report includes comprehensive information about the selected employee for the chosen year:',
          items: [
            'Personal information and contact details',
            'Family member information',
            'Leave balance summary',
            'Leave application history with status',
            'Department and position details'
          ]
        }
      case 'department':
        return {
          title: 'About Department Reports',
          description:
            'The department report provides an overview of all employees in the selected department for the chosen year:',
          items: [
            'Department summary and statistics',
            'List of all employees in the department',
            'Leave allocation and usage per employee',
            'Pending leave applications count'
          ]
        }
      case 'leave':
        return {
          title: 'About Organization Leave Reports',
          description:
            'The organization-wide leave report provides comprehensive leave statistics across all departments:',
          items: [
            'Overall organization summary',
            'Total employees and departments',
            'Leave utilization rates',
            'Department-wise leave statistics',
            'Approved, pending, and rejected applications breakdown'
          ]
        }
    }
  }
  const reportInfo = getReportInfo()
  if (employeeLoading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-5">
        <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 text-foreground">
          <FileText className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reports</h1>
          <p className="text-foreground-secondary mt-1 text-lg">Generate, preview, and download various reports</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setReportType('employee')
            clearPreview()
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            reportType === 'employee'
              ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <User className="h-5 w-5" />
          <div className="text-left">
            <p className="font-semibold">Employee Report</p>
            <p className={`text-xs ${reportType === 'employee' ? 'text-gray-300' : 'text-gray-500'}`}>
              Individual yearly report
            </p>
          </div>
        </button>
        <button
          onClick={() => {
            setReportType('department')
            clearPreview()
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            reportType === 'department'
              ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Building2 className="h-5 w-5" />
          <div className="text-left">
            <p className="font-semibold">Department Report</p>
            <p className={`text-xs ${reportType === 'department' ? 'text-gray-300' : 'text-gray-500'}`}>
              Team statistics
            </p>
          </div>
        </button>
        <button
          onClick={() => {
            setReportType('leave')
            clearPreview()
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            reportType === 'leave'
              ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Users className="h-5 w-5" />
          <div className="text-left">
            <p className="font-semibold">Leave Report</p>
            <p className={`text-xs ${reportType === 'leave' ? 'text-gray-300' : 'text-gray-500'}`}>Organization-wide</p>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Generate{' '}
              {reportType === 'employee'
                ? 'Employee'
                : reportType === 'department'
                  ? 'Department'
                  : 'Organization Leave'}{' '}
              Report
            </h2>
            <div className="space-y-5">
              {reportType === 'employee' && (
                <div>
                  <label
                    htmlFor="employee"
                    className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                  >
                    Employee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="employee"
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value)
                      }}
                      disabled={isGenerating || isPreviewing}
                      className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select an employee...</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.department} ({employee.position})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {reportType === 'department' && (
                <div>
                  <label
                    htmlFor="department"
                    className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                  >
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="department"
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value)
                      }}
                      disabled={isGenerating || isPreviewing}
                      className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a department...</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label
                  htmlFor="year"
                  className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value)
                    }}
                    disabled={isGenerating || isPreviewing}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a year...</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="exportFormat"
                  className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Export Format
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Download className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="exportFormat"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    disabled={isGenerating || isPreviewing}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="pdf">PDF - Portable Document Format</option>
                    <option value="png">PNG - Image Format</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleDownloadReport}
                  disabled={isActionDisabled()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download as {exportFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">{reportInfo.title}</h3>
                <p className="text-sm text-blue-800 mb-2">{reportInfo.description}</p>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-0.5">
                  {reportInfo.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-indigo-50 rounded-lg mb-2">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-xs font-medium text-gray-500">Employees</p>
                <p className="text-xl font-semibold text-gray-900">{employees.length}</p>
              </div>
            </div>
            <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-green-50 rounded-lg mb-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs font-medium text-gray-500">Departments</p>
                <p className="text-xl font-semibold text-gray-900">{departments.length}</p>
              </div>
            </div>
            <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-purple-50 rounded-lg mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-500">Year</p>
                <p className="text-xl font-semibold text-gray-900">{selectedYear || '—'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface/60 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-220px)] lg:sticky lg:top-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Report Preview</h3>
            </div>
            {previewUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviewReport}
                  disabled={isPreviewing}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh preview"
                >
                  <RefreshCw className={`h-4 w-4 ${isPreviewing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl)
                    setPreviewUrl(null)
                    setPreviewBlob(null)
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden relative">
            {previewUrl ? (
              <PDFViewer file={previewUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No Preview Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select your report options to see a preview before downloading
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
