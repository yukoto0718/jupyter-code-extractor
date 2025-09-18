export interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw'
  source: string | string[]
  metadata?: Record<string, any>
  execution_count?: number | null
  outputs?: any[]
}

export interface NotebookMetadata {
  kernelspec?: {
    display_name: string
    language: string
    name: string
  }
  language_info?: {
    name: string
    version: string
  }
}

export interface JupyterNotebook {
  cells: NotebookCell[]
  metadata: NotebookMetadata
  nbformat: number
  nbformat_minor: number
}

export interface ProcessOptions {
  removeMarkdown: boolean
  removeSingleLineComments: boolean // 新增：去除单行注释 (#)
  removeMultiLineComments: boolean // 新增：去除多行注释 (""")
  outputFormat: 'python' | 'markdown'
}

export interface ProcessResult {
  content: string
  filename: string
  cellCount: number
}
