import { CustomElementAttribute } from 'src/enums';
import { ICustomElementHtml } from '../interfaces';

export const customElementBindingPrefix = 'ornamnet';
export const customElementBidningQuerySelectorSuffix = 'id';

let customElementBidningQuerySelectorId = BigInt(0);

const customElementBindingAttributePrefixes = Object.values(
  CustomElementAttribute
).map(
  (customElementAttribute) =>
    `${customElementBindingPrefix}:${customElementAttribute}_`
);

const domParser = new DOMParser();

function parseHtml(html: string) {
  const body =
    domParser.parseFromString(html, 'text/html').querySelector('body') ??
    undefined;

  return body ? body.children : undefined;
}

export function parseCustomElementHtml<T extends HTMLElement>(html: string) {
  const htmlCollection = parseHtml(html);

  if (!htmlCollection) {
    return undefined;
  }

  const customElementHtml: ICustomElementHtml<T> = {
    template: html,
    eventBidnings: [],
    mixinBindings: []
  };

  const stack = Array.from(htmlCollection);

  while (stack.length) {
    const element = stack.pop()!;

    const customElementQuerySelectorAttributeName = `${customElementBindingPrefix}:${customElementBidningQuerySelectorSuffix}`;
    const customElementQuerySelectorAttributeValue = `${++customElementBidningQuerySelectorId}`;

    element.setAttribute(
      customElementQuerySelectorAttributeName,
      customElementQuerySelectorAttributeValue
    );

    customElementBindingAttributePrefixes.forEach(
      (customElementBindingAttributePrefix) => {
        const boundAttributes = Array.from(element.attributes).filter(
          (a) => a.name.indexOf(customElementBindingAttributePrefix) === 0
        );

        boundAttributes.forEach((boundAttribute) => {
          const customElementBindingAttributeSuffix =
            boundAttribute.name.substring(
              customElementBindingAttributePrefix.length,
              boundAttribute.name.length
            );

          const querySelector = `[${customElementQuerySelectorAttributeName}='${customElementQuerySelectorAttributeValue}'][${boundAttribute.name}]`;

          if (
            customElementBindingAttributePrefix.indexOf(
              CustomElementAttribute.event
            )
          ) {
            customElementHtml.eventBidnings.push({
              querySelector,
              type: customElementBindingAttributeSuffix as keyof HTMLElementEventMap,
              propertyKey: boundAttribute.value as keyof T & string
            });
          } else if (
            customElementBindingAttributePrefix.indexOf(
              CustomElementAttribute.mixin
            )
          ) {
            customElementHtml.mixinBindings.push({
              querySelector,
              name: customElementBindingAttributeSuffix
            });
          }
        });
      }
    );

    if (element.children.length) {
      Array.from(element.children).forEach((e) => stack.push(e));
    }
  }

  return customElementHtml;
}
