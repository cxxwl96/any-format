import moment from 'moment'

// @ts-ignore
document.context = {
  /**
   * moment文档：https://momentjs.cn
   * 时间戳（毫秒）：moment().valueOf()
   * 时间戳（秒）：moment().unix()
   */
  moment: () => moment(),

  /**
   * xhr
   * 响应状态：xhr.status
   * 响应文本：xhr.responseText
   */
  xhr: (url: string, config?: {
    method?: string;
    async?: string;
    timeout?: number;
    header?: { [key: string]: string };
    body?: Document | XMLHttpRequestBodyInit | null
  }) => {
    const { method, async, timeout, header } = config || {}
    const xhr = new XMLHttpRequest()
    xhr.open(method || 'GET', url, !!async)
    if (async) {
      xhr.timeout = timeout || 5000
    }
    if (header) {
      Object.keys(header).forEach(key => {
        xhr.setRequestHeader(key, header[key])
      })
    }
    xhr.send()
    return xhr
  }
}