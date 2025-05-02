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

interface MatchRes {
  matched: boolean;
  text: string;
}
export const config: AnyFormatConfig = {
  startChars: ['{', '[', '(', '<\\w+>'],
  endChars: ['}', ']', ')', '</\\w+>'],
  breakChars: [';', ','],
  tabCount: 4
}
export default function useFormat(conf: AnyFormatConfig = config) {
  const { startChars, endChars, breakChars, tabCount } = conf
  // 任意格式化
  function anyFormat(text: string) {
    if (!text) {
      return text
    }
    const arr = text.split(/\r\n|\r|\n/).map(line => line.trim()).join('')
    let formatted = ''
    let level = 0
    let lastCharBreak = false
    for (let i = 0; i < arr.length;) {
      let ch = arr[i]
      let matchRes: MatchRes
      if ((matchRes = isMatched(startChars, arr, i)).matched) {
        formatted = formatted.concat(matchRes.text)
        formatted = formatted.concat(breakSpace(++level))
        lastCharBreak = true
        i += matchRes.text.length
      } else if ((matchRes = isMatched(endChars, arr, i)).matched) {
        formatted = formatted.concat(breakSpace(--level))
        formatted = formatted.concat(matchRes.text)
        lastCharBreak = false
        i += matchRes.text.length
      } else if ((matchRes = isMatched(breakChars, arr, i)).matched) {
        formatted = formatted.concat(matchRes.text)
        formatted = formatted.concat(breakSpace(level))
        lastCharBreak = true
        i += matchRes.text.length
      } else {
        if (lastCharBreak) {
          while (i < arr.length && (ch = arr[i]) === ' ') {
            i++
          }
          lastCharBreak = false
        } else {
          formatted = formatted.concat(ch)
          i++
        }
      }
    }
    return formatted.split(/\r\n|\r|\n/).filter(line => line.trim() !== '').join('\n')
  }

  function isMatched(conditions: string[], arr: string, index: number): MatchRes {
    let newConditions: string[] = [...conditions]
    // 文本比较
    let i = index + 1
    for (; i < arr.length; i++) {
      const tempConditions = newConditions.filter(condition => condition.startsWith(arr.substring(index, i)))
      if (tempConditions.length > 0) {
        newConditions = tempConditions
      } else {
        break
      }
    }
    if (newConditions.length === 1 && newConditions[0] === arr.substring(index, Math.max(index, i - 1))) {
      return {
        matched: true,
        text: newConditions[0]
      }
    }
    // 正则比较
    for (const condition of conditions) {
      // 单个字符不进行正则比较
      if (condition.length === 1) {
        continue
      }
      try {
        const matchs = arr.substring(index).matchAll(new RegExp('^' + condition, 'g'))
        for (const match of matchs) {
          return {
            matched: true,
            text: match[0]
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return {
      matched: false,
      text: ''
    }
  }

  function breakSpace(level: number) {
    let s = '\n'
    let n = Math.max(0, level) * tabCount
    while (n-- > 0) {
      s = s.concat(' ')
    }
    return s
  }

  return {
    anyFormat
  }
}