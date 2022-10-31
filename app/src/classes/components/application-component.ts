import { ComponentTag } from '@enums';
import { customElement } from '@shared/decorators';

const html = `
  <div id="test">
  </div>
  <aciculate-login>
  </aciculate-login>
`;

const styles = ``;
const tag = ComponentTag.application;

@customElement({
  html,
  styles,
  tag
})
export class ApplicationComponent extends HTMLElement {
  public connectedCallback() {
    
  }

  public constructor() {
    super();
  }
}
