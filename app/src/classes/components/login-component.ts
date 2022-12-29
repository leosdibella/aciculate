import { dependencyInjectionTokens } from '@data';
import { ComponentTag } from '@enums';
import { IAuthenticationService } from '@interfaces/services';
import { customElement } from '@ornament/decorators';
import { deferInject } from '@obelisk/decorators';

enum LoginSelector {
  username = 'login-username',
  password = 'login-password',
  loginButton = 'loginButton'
}

const html = `
  <div class="login-container">
    <label for="${LoginSelector.username}">
      Username / Email
    </label>
    <input id="${LoginSelector.username}" type="text" />
    <label for="${LoginSelector.password}">
      Password
    </label>
    <input id="${LoginSelector.password}" type="password"/>
    <button id="${LoginSelector.loginButton}" type="button">
      Login
    </button>
  </div>
`;

const styles = `
  <style>
    :host {

    }

    .login-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  </style>
`;

const tag = ComponentTag.login;

@customElement({
  html,
  styles,
  tag
})
export class LoginComponent extends HTMLElement {
  #isWaiting = false;
  #usernameInput!: HTMLInputElement;
  #passwordInput!: HTMLInputElement;

  public authenticate = () => {
    if (this.#isWaiting) {
      return;
    }

    this.#isWaiting = true;

    this._authenticationService
      .authenticate(this.#usernameInput.value, this.#passwordInput.value)
      .then(() => {
        // TODO
      })
      .catch(() => {
        // TODO
      })
      .finally(() => {
        this.#isWaiting = false;
      });
  };

  public connectedCallback() {
    this.#usernameInput = this.shadowRoot!.querySelector(
      `#${LoginSelector.username}`
    )!;

    this.#passwordInput = this.shadowRoot!.querySelector(
      `#${LoginSelector.password}`
    )!;

    this.shadowRoot
      ?.querySelector(`#${LoginSelector.loginButton}`)
      ?.addEventListener('click', this.authenticate);
  }

  @deferInject(dependencyInjectionTokens.authenticationService)
  private readonly _authenticationService!: IAuthenticationService;

  public constructor() {
    super();
  }
}
