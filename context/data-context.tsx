/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client"

import React from "react"
import type { Example } from "@/lib/types"

interface DataContextType {
  examples: Example[]
  isLoading: boolean
  setExamples: React.Dispatch<React.SetStateAction<Example[]>>
  defaultExample: Example
}

export const DataContext = React.createContext<DataContextType | undefined>(undefined)

export function useDataContext() {
  const context = React.useContext(DataContext)
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider")
  }
  return context
}
