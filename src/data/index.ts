export type Nullable<T> = T | null

export interface Result {
  success?: boolean;
  msg?: string;
  data?: string | number | object | any;
}