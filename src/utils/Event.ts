import { message } from 'ant-design-vue'

export const handleDragEvent = (event: DragEvent, callback: (content: string) => void) => {
  const files = event.dataTransfer?.files
  if (!files) {
    message.error('请拖拽有效文件')
  } else if (files.length > 1) {
    message.error('仅支持单文件拖拽')
  } else if (files[0].size > 2 * 1024 * 1024) {
    message.error('仅支持2MB大小的文件拖拽')
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      callback(e.target?.result as string)
    }
    reader.readAsText(files[0])
  }
}