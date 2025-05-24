const compress = (str: string): string => {
  if (str) {
    return str.replace(/\s*\n\s*/g, '').trim()
  }
  return str
}

export const StrUtil = { compress }