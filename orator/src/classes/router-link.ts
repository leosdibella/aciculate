import { routerDependencyInjectionTokens } from '../data';
import { inject } from '@obelisk/decorators';
import { IRouter } from '../interfaces';

export class RouterLink extends HTMLAnchorElement {
  #router: IRouter;

  public constructor(
    @inject(routerDependencyInjectionTokens.router)
    router: IRouter
  ) {
    super();

    this.#router = router;
  }
}

customElements.define("confirm-link", ConfirmLink, { 
  extends: "a" 
});
