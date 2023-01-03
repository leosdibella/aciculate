import { ICustomElementMixinBinding } from './custom-element-mixin-binding';
import { ICustomElementEventBinding } from './custom-element-event-binding';

export interface ICustomElementHtml<T extends HTMLElement> {
  template: string;
  eventBidnings: ICustomElementEventBinding<T>[];
  mixinBindings: ICustomElementMixinBinding[];
}
