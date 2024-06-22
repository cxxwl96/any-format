export const MODE = {
  JSON: 'application/json',
  HTML: 'htmlmixed',
  JS: 'javascript',
  SQL: 'text/x-mysql',
  JAVA: 'text/x-java',
  XML: 'text/html',
  TypeScript: 'text/typescript',
  VUE: 'text/x-vue',
}
export const THEME = {
  light: 'idea',
  dark: 'material-palenight'
}
export type Nullable<T> = T | null

export interface Result {
  success?: boolean;
  msg?: string;
  data?: string | number | object | any;
}