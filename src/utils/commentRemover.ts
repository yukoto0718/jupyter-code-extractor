/**
 * 智能删除Python代码中的注释
 * 避免删除字符串中的 # 符号
 */
export function removeComments(code: string): string {
  const lines = code.split('\n')
  const processedLines: string[] = []

  for (const line of lines) {
    const processedLine = removeCommentsFromLine(line)
    // 只有当行不是空白时才添加
    if (processedLine.trim()) {
      processedLines.push(processedLine)
    }
  }

  return processedLines.join('\n')
}

function removeCommentsFromLine(line: string): string {
  let result = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let inTripleQuote = false
  let quoteType = ''
  let i = 0

  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]
    const thirdChar = line[i + 2]

    // 检查三引号
    if (!inSingleQuote && !inDoubleQuote && !inTripleQuote) {
      if (
        (char === '"' && nextChar === '"' && thirdChar === '"') ||
        (char === "'" && nextChar === "'" && thirdChar === "'")
      ) {
        inTripleQuote = true
        quoteType = char
        result += char + nextChar + thirdChar
        i += 3
        continue
      }
    }

    // 检查三引号结束
    if (inTripleQuote && char === quoteType && nextChar === quoteType && thirdChar === quoteType) {
      inTripleQuote = false
      quoteType = ''
      result += char + nextChar + thirdChar
      i += 3
      continue
    }

    // 如果在三引号内，直接添加字符
    if (inTripleQuote) {
      result += char
      i++
      continue
    }

    // 处理转义字符
    if (char === '\\' && (inSingleQuote || inDoubleQuote)) {
      result += char + (nextChar || '')
      i += 2
      continue
    }

    // 处理单引号
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      result += char
      i++
      continue
    }

    // 处理双引号
    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      result += char
      i++
      continue
    }

    // 如果遇到 # 且不在字符串内，删除后面的所有内容
    if (char === '#' && !inSingleQuote && !inDoubleQuote && !inTripleQuote) {
      break
    }

    result += char
    i++
  }

  return result.trimEnd()
}
