/*
 * Copyright (c) 2021-2024, cxxwl96.com (cxxwl96@sina.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface AnyFormatConfig {
  startChars: string[],
  endChars: string[],
  breakChars: string[],
  tabCount: number,
}

export default function useFormat(config: AnyFormatConfig = {
  startChars: ['{', '[', '('],
  endChars: ['}', ']', ')'],
  breakChars: [';', ','],
  tabCount: 4
}) {
  const { startChars, endChars, breakChars, tabCount } = config

  // 任意格式化
  function anyFormat(text: string) {
    if (!text) {
      return text
    }
    // text = text.split(/\r\n|\r|\n/).map(line => line.trim()).join('\n')
    let formatted = ''
    let level = 0
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (startChars.indexOf(ch) >= 0) {
        formatted = formatted.concat(ch)
        formatted = formatted.concat(breakSpace(++level))
      } else if (endChars.indexOf(ch) >= 0) {
        formatted = formatted.concat(breakSpace(--level))
        formatted = formatted.concat(ch)
      } else if (breakChars.indexOf(ch) >= 0) {
        formatted = formatted.concat(ch)
        formatted = formatted.concat(breakSpace(level))
      } else {
        formatted = formatted.concat(ch)
      }
    }
    return formatted.split(/\r\n|\r|\n/).filter(line => line.trim() !== '').join('\n')
  }

  function breakSpace(level: number) {
    let s = '\n'
    let n = level * tabCount
    while (n-- > 0) {
      s = s.concat(' ')
    }
    return s
  }

  // 压缩文本
  function compressText(text: string) {
    if (text) {
      return text.split(/\r\n|\r|\n/).map(line => line.trim()).filter(line => line !== '').join('\n')
    }
    return text
  }

  return {
    anyFormat,
    compressText
  }
}