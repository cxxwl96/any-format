export type Nullable<T> = T | null

export interface Result {
  success?: boolean;
  msg?: string;
  data?: string | number | object | any;
}

// 表格列
export interface Column {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number;
  ellipsis?: boolean;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  // eslint-disable-next-line no-empty-pattern
  customRender?: ({}: any) => JSX.Element;
}