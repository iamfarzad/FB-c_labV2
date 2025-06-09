"use client"

import type React from "react"
import { useState } from "react"
import { ChevronUp, ChevronDown, Download } from "lucide-react"
import type { TableData } from "@/lib/data-types"

interface TableRendererProps {
  data: TableData
  theme: "light" | "dark"
  className?: string
}

export const TableRenderer: React.FC<TableRendererProps> = ({ data, theme, className = "" }) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [sortedRows, setSortedRows] = useState(data.rows)

  const handleSort = (columnIndex: number) => {
    if (!data.sortable) return

    const newDirection = sortColumn === columnIndex && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(columnIndex)
    setSortDirection(newDirection)

    const sorted = [...data.rows].sort((a, b) => {
      const aVal = a[columnIndex]
      const bVal = b[columnIndex]

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newDirection === "asc" ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (newDirection === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

    setSortedRows(sorted)
  }

  const handleDownload = () => {
    const csvContent = [
      data.headers.join(","),
      ...sortedRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `table-${data.id}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`glassmorphism rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
        {data.caption && <h3 className="text-lg font-semibold text-[var(--text-primary)]">{data.caption}</h3>}

        <button
          onClick={handleDownload}
          className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-200"
          aria-label="Download as CSV"
        >
          <Download size={16} className="text-[var(--text-primary)]" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] ${
                    data.sortable ? "cursor-pointer hover:bg-[var(--color-orange-accent)]/5" : ""
                  }`}
                  onClick={() => handleSort(index)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{header}</span>
                    {data.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          size={12}
                          className={`${
                            sortColumn === index && sortDirection === "asc"
                              ? "text-[var(--color-orange-accent)]"
                              : "text-[var(--text-primary)]/30"
                          }`}
                        />
                        <ChevronDown
                          size={12}
                          className={`${
                            sortColumn === index && sortDirection === "desc"
                              ? "text-[var(--color-orange-accent)]"
                              : "text-[var(--text-primary)]/30"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--glass-border)] hover:bg-[var(--color-orange-accent)]/5 transition-colors duration-200"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {typeof cell === "number" ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
