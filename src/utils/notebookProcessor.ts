import type { JupyterNotebook, ProcessOptions, ProcessResult } from '@/types/notebook'
import { removeComments } from './commentRemover'

export class NotebookProcessor {
  static process(
    notebook: JupyterNotebook,
    options: ProcessOptions,
    originalFileName?: string
  ): ProcessResult {
    // 根据选项决定要处理的单元格
    let cellsToProcess

    if (options.removeMarkdown) {
      // 只保留代码单元格
      cellsToProcess = notebook.cells.filter(
        (cell) => cell.cell_type === 'code' && this.getCellSource(cell).trim()
      )
    } else {
      // 保留所有单元格
      cellsToProcess = notebook.cells.filter((cell) => this.getCellSource(cell).trim())
    }

    if (cellsToProcess.length === 0) {
      throw new Error('No cells with content found in the notebook')
    }

    // Generate filename based on original file name
    const baseFileName = this.extractBaseFileName(originalFileName)

    let content: string
    let filename: string

    if (options.outputFormat === 'python') {
      content = this.generatePythonFile(cellsToProcess, options)
      filename = `${baseFileName}_extracted.py`
    } else {
      content = this.generateMarkdownFile(cellsToProcess, options)
      filename = `${baseFileName}_extracted.md`
    }

    return {
      content,
      filename,
      cellCount: cellsToProcess.filter((cell) => cell.cell_type === 'code').length,
    }
  }

  private static extractBaseFileName(originalFileName?: string): string {
    if (!originalFileName) {
      return 'notebook'
    }

    // Remove .ipynb extension and any path
    const baseName =
      originalFileName
        .split('/')
        .pop() // Remove path
        ?.split('\\')
        .pop() // Remove Windows path
        ?.replace(/\.ipynb$/i, '') || // Remove .ipynb extension
      'notebook'

    // Clean filename: remove special characters, keep only alphanumeric, hyphens, underscores
    return (
      baseName
        .replace(/[^a-zA-Z0-9\-_]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '') || 'notebook'
    )
  }

  private static getCellSource(cell: any): string {
    if (Array.isArray(cell.source)) {
      return cell.source.join('')
    }
    return cell.source || ''
  }

  private static generatePythonFile(cells: any[], options: ProcessOptions): string {
    const codeBlocks: string[] = []

    cells.forEach((cell, index) => {
      let cellContent = this.getCellSource(cell)

      if (cell.cell_type === 'code') {
        // 处理代码单元格
        if (options.removeComments) {
          cellContent = removeComments(cellContent)
        }

        if (cellContent.trim()) {
          codeBlocks.push(`# Cell ${index + 1} (Code)\n${cellContent}`)
        }
      } else if (cell.cell_type === 'markdown') {
        // 处理Markdown单元格 - 转换为注释
        if (cellContent.trim()) {
          const commentedContent = cellContent
            .split('\n')
            .map((line) => (line.trim() ? `# ${line}` : '#'))
            .join('\n')
          codeBlocks.push(`# Cell ${index + 1} (Markdown)\n${commentedContent}`)
        }
      }
    })

    return codeBlocks.join('\n\n')
  }

  private static generateMarkdownFile(cells: any[], options: ProcessOptions): string {
    const lines: string[] = []
    lines.push('# Extracted Content from Jupyter Notebook\n')

    cells.forEach((cell, index) => {
      let cellContent = this.getCellSource(cell)

      if (cell.cell_type === 'code') {
        // 处理代码单元格
        if (options.removeComments) {
          cellContent = removeComments(cellContent)
        }

        if (cellContent.trim()) {
          lines.push(`## Cell ${index + 1} (Code)\n`)
          lines.push('```python')
          lines.push(cellContent)
          lines.push('```\n')
        }
      } else if (cell.cell_type === 'markdown') {
        // 处理Markdown单元格 - 保留原格式
        if (cellContent.trim()) {
          lines.push(`## Cell ${index + 1} (Markdown)\n`)
          lines.push(cellContent)
          lines.push('\n')
        }
      }
    })

    return lines.join('\n')
  }
}
