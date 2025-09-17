import type { JupyterNotebook, ProcessOptions, ProcessResult } from '@/types/notebook'
import { removeComments } from './commentRemover'

export class NotebookProcessor {
  static process(
    notebook: JupyterNotebook,
    options: ProcessOptions,
    originalFileName?: string
  ): ProcessResult {
    const codeCells = notebook.cells.filter(
      (cell) => cell.cell_type === 'code' && this.getCellSource(cell).trim()
    )

    if (codeCells.length === 0) {
      throw new Error('No code cells found in the notebook')
    }

    // Generate filename based on original file name
    const baseFileName = this.extractBaseFileName(originalFileName)

    let content: string
    let filename: string

    if (options.outputFormat === 'python') {
      content = this.generatePythonFile(codeCells, options)
      filename = `${baseFileName}_extracted.py`
    } else {
      content = this.generateMarkdownFile(codeCells, options)
      filename = `${baseFileName}_extracted.md`
    }

    return {
      content,
      filename,
      cellCount: codeCells.length,
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
      let code = this.getCellSource(cell)

      if (options.removeComments) {
        code = removeComments(code)
      }

      if (code.trim()) {
        codeBlocks.push(`# Cell ${index + 1}\n${code}`)
      }
    })

    return codeBlocks.join('\n\n')
  }

  private static generateMarkdownFile(cells: any[], options: ProcessOptions): string {
    const lines: string[] = []
    lines.push('# Extracted Code from Jupyter Notebook\n')

    cells.forEach((cell, index) => {
      let code = this.getCellSource(cell)

      if (options.removeComments) {
        code = removeComments(code)
      }

      if (code.trim()) {
        lines.push(`## Cell ${index + 1}\n`)
        lines.push('```python')
        lines.push(code)
        lines.push('```\n')
      }
    })

    return lines.join('\n')
  }
}
