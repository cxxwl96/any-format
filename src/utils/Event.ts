import { message } from 'ant-design-vue'

/**
 * 读取拖拽文件内容
 *
 * @param event
 * @param callback
 * @param options
 */
export const handleReadDragFileEvent = async (event: DragEvent, callback: (content: string | string[]) => void, options?: {
  limit?: number,
  maxSize?: number
}) => {
  const opts = {
    limit: 1,
    maxSize: 2 * 1024 * 1024, // 仅支持2MB大小的文件拖拽
    ...options
  }
  const files = event.dataTransfer?.files
  if (!files) {
    message.error('请拖拽有效文件')
    return
  }
  if (opts.limit > 0 && files.length > opts.limit) {
    message.error(`仅支持${opts.limit}个文件拖拽`)
    return
  }
  if (opts.maxSize > 0) {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > opts.maxSize) {
        message.error(`仅支持${opts.maxSize / 1024.0 / 1024.0}MB大小的文件拖拽`)
        return
      }
    }
  }
  if (opts.limit === 1) {
    const reader = new FileReader()
    reader.onload = (e) => {
      callback(e.target?.result as string || '')
    }
    reader.readAsText(files[0])
    return
  }
  const textArr: string[] = []
  for (let i = 0; i < files.length; i++) {
    const text = await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string || '')
      }
      reader.readAsText(files[i])
    })
    textArr.push(text)
  }
  callback(textArr)
}