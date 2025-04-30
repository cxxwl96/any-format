
export interface MenuItem {
  label: string;
  key: string;
  component: any;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hide?: boolean;
  fullContent?:boolean;
}