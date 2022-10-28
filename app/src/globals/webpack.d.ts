import * as components from '@classes/components';
import { ComponentTag } from '@enums';

export {};

declare global {
  export const ACICULATE_API_ORIGIN: string;

  export interface HTMLElementTagNameMap {
    [ComponentTag.login]: components.LoginComponent;
    [ComponentTag.application]: components.ApplicationComponent;
  }
}
