import type { JupyterNotebook, ProcessOptions, ProcessResult } from '@/types/notebook'
import { removeComments } from './commentRemover'

export class NotebookProcessor {
  static process(notebook: JupyterNotebook, options: ProcessOptions): ProcessResult {
    const codeCells = notebook.cells.filter(
      (cell) => cell.cell_type === 'code' && this.getCellSource(cell).trim()
    )

    if (codeCells.length === 0) {
      throw new Error('The cell containing the code was not found')
    }

    let content: string
    let filename: string

    if (options.outputFormat === 'python') {
      content = this.generatePythonFile(codeCells, options)
      filename = 'extracted_code.py'
    } else {
      content = this.generateMarkdownFile(codeCells, options)
      filename = 'extracted_code.md'
    }

    return {
      content,
      filename,
      cellCount: codeCells.length,
    }
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
