import { ICustomElementMixin } from '../interfaces';

const customElementMixins: Partial<
  Record<
    string,
    (
      oldValue: string | null,
      newValue: string | null,
      htmlElement: HTMLElement,
      previousReturnValue?: unknown
    ) => unknown
  >
> = {};

const customElementMixinReturnValueMaps: Partial<
  Record<string, Map<HTMLElement, unknown>>
> = {};

export function getCustomElementMixin(name: string) {
  return customElementMixins[name];
}

export function invokeCustomElementMixin(
  oldValue: string | null,
  newValue: string | null,
  name: string,
  htmlElement: HTMLElement
) {
  const customElementMixin = getCustomElementMixin(name);

  if (!customElementMixin) {
    return;
  }

  const customElementMixinReturnValueMap =
    customElementMixinReturnValueMaps[name] ?? new Map<HTMLElement, unknown>();

  const previousReturnValue =
    customElementMixinReturnValueMap.get(htmlElement) ?? undefined;

  const nextReturnValue = customElementMixin(
    oldValue,
    newValue,
    htmlElement,
    previousReturnValue
  );

  customElementMixinReturnValueMap.set(htmlElement, {
    previousReturnValue: nextReturnValue
  });
}

export function removeCustomElementMixin(
  name: string,
  htmlElement: HTMLElement
) {
  const customElementMixinRegistryMap = customElementMixinReturnValueMaps[name];

  if (customElementMixinRegistryMap) {
    customElementMixinRegistryMap.delete(htmlElement);
  }
}

export function addCustomElementMixin(customElementMixin: ICustomElementMixin) {
  customElementMixins[customElementMixin.name] = customElementMixin.action;
}
