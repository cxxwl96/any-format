import { ref, watch } from 'vue'

import { isDef } from '@/utils/is'

interface Options {
  target?: HTMLElement;
}

export function useCopyToClipboard(initial?: string) {
  const clipboardRef = ref(initial || '')
  const isSuccessRef = ref(false)
  const copiedRef = ref(false)

  watch(
    clipboardRef,
    (str?: string) => {
      if (isDef(str)) {
        copiedRef.value = true
        isSuccessRef.value = copyTextToClipboard(str)
      }
    },
    { immediate: !!initial, flush: 'sync' }
  )

  return { clipboardRef, isSuccessRef, copiedRef }
}

export function copyTextToClipboard(input: string, { target = document.body }: Options = {}) {
  const element = document.createElement('textarea')
  const previouslyFocusedElement = document.activeElement

  element.value = input

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

  target.append(element)
  element.select()

  element.selectionStart = 0
  element.selectionEnd = input.length

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
  return isSuccess
}

export function getTextFromClipboard() {
  const promise = new Promise<string>((resolve, reject) => {
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
              }
            })
          }
        })
      }
    })
  })
  return promise
}