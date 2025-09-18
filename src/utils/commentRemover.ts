/**
 * 智能删除Python代码中的注释
 * 支持：
 * 1. 单行 # 注释
 * 2. 多行 """ 或 ''' 注释块
 * 3. 函数/类的 docstring
 */
export function removeComments(code: string): string {
  const lines = code.split('\n')
  const processedLines: string[] = []
  let inMultilineComment = false
  let multilineQuote = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 如果当前在多行注释中
    if (inMultilineComment) {
      if (line.includes(multilineQuote)) {
        inMultilineComment = false
        multilineQuote = ''
        continue
      } else {
        continue
      }
    }

    // 检查是否是多行注释开始
    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      const quote = trimmed.substring(0, 3)

      // 简单判断：如果行只包含引号和文本，很可能是注释
      const isLikelyComment =
        /^\s*['"]{3}/.test(line) &&
        !line.includes('=') &&
        !line.includes('(') &&
        !line.includes('[')

      if (isLikelyComment) {
        // 检查是否在同一行结束
        const restOfLine = line.substring(line.indexOf(quote) + 3)
        if (restOfLine.includes(quote)) {
          // 单行注释块，直接跳过
          continue
        } else {
          // 多行注释块开始
          inMultilineComment = true
          multilineQuote = quote
          continue
        }
      }
    }

    // 处理单行注释
    const processedLine = removeSingleLineComments(line)

    // 只保留非空行
    if (processedLine.trim()) {
      processedLines.push(processedLine)
    }
  }

  return processedLines.join('\n')
}

/**
 * 处理单行注释
 */
function removeSingleLineComments(line: string): string {
  let result = ''
  let inSingleQuote = false
  let inDoubleQuote = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const prevChar = i > 0 ? line[i - 1] : ''

    // 处理转义字符
    if (prevChar === '\\') {
      result += char
      continue
    }

    // 处理引号
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      result += char
      continue
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      result += char
      continue
    }

    // 如果遇到 # 且不在字符串内
    if (char === '#' && !inSingleQuote && !inDoubleQuote) {
      break
    }

    result += char
  }

  return result.trimEnd()
}
