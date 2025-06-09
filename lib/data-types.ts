export interface BaseDataItem {
  id: string
  type: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface TextData extends BaseDataItem {
  type: "text"
  content: string
  format?: "plain" | "markdown" | "html"
  language?: string
}

export interface CodeData extends BaseDataItem {
  type: "code"
  content: string
  language: string
  filename?: string
  description?: string
  executable?: boolean
}

export interface ImageData extends BaseDataItem {
  type: "image"
  url: string
  alt?: string
  caption?: string
  width?: number
  height?: number
  thumbnail?: string
}

export interface TableData extends BaseDataItem {
  type: "table"
  headers: string[]
  rows: (string | number)[][]
  caption?: string
  sortable?: boolean
}

export interface ChartData extends BaseDataItem {
  type: "chart"
  chartType: "line" | "bar" | "pie" | "scatter"
  data: any[]
  title?: string
  xAxis?: string
  yAxis?: string
}

export interface ListData extends BaseDataItem {
  type: "list"
  items: string[]
  ordered?: boolean
  nested?: boolean
}

export interface LinkData extends BaseDataItem {
  type: "link"
  url: string
  title: string
  description?: string
  thumbnail?: string
  domain?: string
}

export interface FileData extends BaseDataItem {
  type: "file"
  filename: string
  size: number
  mimeType: string
  downloadUrl: string
  previewUrl?: string
}

export interface InteractiveData extends BaseDataItem {
  type: "interactive"
  component: string
  props: Record<string, any>
  title?: string
  description?: string
}

export interface ErrorData extends BaseDataItem {
  type: "error"
  message: string
  code?: string
  details?: string
}

export type DataItem =
  | TextData
  | CodeData
  | ImageData
  | TableData
  | ChartData
  | ListData
  | LinkData
  | FileData
  | InteractiveData
  | ErrorData
