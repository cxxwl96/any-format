// @ts-nocheck
import { jsonlint } from './jsonlint.js'
import { isString } from './is'

export function validateJson(value: string | object | any): {
  value: string;
  error: boolean;
  message: string;
} {
  const result = {
    value: '',
    error: false,
    message: 'OK',
  };
  try {
    result.value =
      jsonlint.parse(value) &&
      isString(value) ? JSON.stringify(JSON.parse(value), null, 4) : JSON.stringify(value, null, 4);
  } catch (e: any) {
    if (e?.name === 'Error') {
      result.error = true;
      result.message = e?.message;
    }
    result.value = value as string;
  }
  return result;
}