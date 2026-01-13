const compress = (str: string, trim?: 'start' | 'end'): string => {
  if (str) {
    return str.split(/\r\n|\r|\n/).map(line => {
      if (trim === 'start') {
        return line.trimStart()
      } else if (trim === 'end') {
        return line.trimEnd()
      } else {
        return line.trim()
      }
    }).join('')
  }
  return str
}

export const StrUtil = { compress }