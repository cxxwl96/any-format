import x2js from 'x2js';

export type Nullable<T> = T | null

export interface Result {
  success?: boolean;
  msg?: string;
  data?: string | number | object | any;
}

// json、xml互转
export const XML2JSON = new x2js({
  escapeMode: false,
  attributePrefix: '#',
  keepText: false,
});