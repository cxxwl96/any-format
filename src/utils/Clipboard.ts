import { message } from 'ant-design-vue'

/**
 * 原始方法复制
 *
 * @param value
 */
const copyTextWithOriginal = (value: string) => {
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
 * 复制
 *
 * @param value
 */
const copyText = (value: string) => {
  if (!value) {
    return
  }
  navigator.clipboard.writeText(value).then(() => message.success('复制成功')).catch(() => message.success('复制失败'))
}

/**
 * 粘贴文本
 */
const pasteText = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    navigator.clipboard.readText().then((data) => {
      if (data) {
        resolve(data)
        reject(data)
        message.success('粘贴成功')
      }
    })
  })
}

/**
 * 粘贴图片
 * 不能粘贴文件类型的图片
 */
const pasteImage = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    navigator.clipboard.read().then((data) => {
      if (data.length > 0) {
        const type = data[0].types.find(type=>type.startsWith('image/'))
        if (type) {
          data[0].getType(type).then((blob) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = function() {
              resolve(reader.result as string || '')
              reject(reader.result as string || '')
              message.success('粘贴成功')
            }
          })
        }
      }
    })
  })
}

export const useClipboard = () => {
  return {
    copyTextWithOriginal,
    copyText,
    pasteText,
    pasteImage,
  }
}