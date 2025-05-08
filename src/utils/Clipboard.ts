import { message } from 'ant-design-vue'

/**
 * 复制
 *
 * @param value
 */
const copyText = (value: string) => {
  if (!value) {
    return
  }
  const element = document.createElement('textarea')
  const previouslyFocusedElement = document.activeElement

  element.value = value

  element.setAttribute('readonly', '');

  (element.style as any).contain = 'strict'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.fontSize = '12pt'

  const selection = document.getSelection()
  let originalRange
  if (selection && selection.rangeCount > 0) {
    originalRange = selection.getRangeAt(0)
  }

  document.body.append(element)
  element.select()

  element.selectionStart = 0
  element.selectionEnd = value.length

  let isSuccess = false
  try {
    isSuccess = document.execCommand('copy')
  } catch (e) {
    // @ts-ignore
    throw new Error(e)
  }

  element.remove()

  if (originalRange && selection) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  if (previouslyFocusedElement) {
    (previouslyFocusedElement as HTMLElement).focus()
  }
  if (isSuccess) {
    message.success('复制成功')
  } else {
    message.success('复制失败')
  }
}

/**
 * 粘贴
 */
const pasteText = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    // @ts-ignore
    navigator.permissions.query({ name: 'clipboard-read' }).then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.read().then((data) => {
          if (data.length > 0) {
            data[0].getType('text/plain').then((blob) => {
              const reader = new FileReader()
              reader.readAsText(blob, 'utf-8')
              reader.onload = function() {
                resolve(reader.result as string || '')
                reject(reader.result as string || '')
                message.success('粘贴成功')
              }
            })
          }
        })
      }
    })
  })
}

export const useClipboard = () => {
  return {
    copyText,
    pasteText,
  }
}