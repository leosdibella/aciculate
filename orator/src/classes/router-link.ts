import { routerDependencyInjectionTokens } from '../data';
import { inject } from '@obelisk/decorators';
import { IRouter } from '../interfaces';
import {
  extendedCustomElement,
  hostEvent,
  observedAttribute
} from '@ornament/decorators';
import { OratorCustomElementTag } from 'src/enums';
import { NativeHtmlElementTag } from '@ornament/enums';

@extendedCustomElement({
  is: OratorCustomElementTag.routerLink,
  extends: NativeHtmlElementTag.anchor
})
export class RouterLink extends HTMLAnchorElement {
  #router: IRouter;

  @observedAttribute()
  public path = '';

  @observedAttribute()
  public state: unknown;

  @observedAttribute()
  public queryStringParameters: Record<string, unknown> | undefined;

  @observedAttribute()
  public routeParameters: Record<string, unknown> | undefined;

  @hostEvent('click')
  public handleClick() {
    if (this.path) {
      this.#router.redirect(
        this.path,
        this.state,
        this.routeParameters,
        this.queryStringParameters
      );
    }
  }

  public constructor(
    @inject(routerDependencyInjectionTokens.router)
    router: IRouter
  ) {
    super();

    this.#router = router;
  }
}
