export interface IRoute {
  path: string;
  component: HTMLElement;
  children?: IRoute[];
}
