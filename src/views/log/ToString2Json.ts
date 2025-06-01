import type { RegexOption } from '@/components/RegexReplace'
import { message, notification } from 'ant-design-vue'
import { validateJson } from '@/utils/jsonUtil'

export const options: RegexOption[] = [
  { enable: true, originReg: '.*="?null"?;\n?', targetReg: '', comment: '' },
  { enable: true, originReg: '(\\w+)=?\\w*\\s*[\\[\\{]', targetReg: '"$1": {', comment: '' },
  { enable: true, originReg: '[\\]\\}][;,]', targetReg: '},', comment: '' },
  { enable: true, originReg: '(\\w+)=(.*)[;,]', targetReg: '"$1": "$2",', comment: '' },
  { enable: true, originReg: '(\\w+)=(.*)', targetReg: '"$1": "$2"', comment: '' },
  { enable: true, originReg: ',(\\n\\d*\\})', targetReg: '$1', comment: '' },
  { enable: true, originReg: ': "(true|false)"', targetReg: ': $1', comment: '字符串转boolean' },
  { enable: true, originReg: ',(\n\\s*[\\}\\]])', targetReg: '$1', comment: '' },
  { enable: false, originReg: '\\s*\\n\\s*', targetReg: '', comment: '文本压缩' }
]

// JSON格式化校验
export function formatValidate(value: string) {
  if (!value || value === '') {
    message.info('请输入内容')
  }
  const result = validateJson(value)
  if (result.error) {
    notification.error({
      message: 'JSON格式错误',
      description: result.message,
      placement: 'topRight'
    })
  } else {
    message.success('正确的JSON')
  }
}