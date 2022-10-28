import { ComponentTag } from '@enums';
import { customElement } from '@shared/decorators';
import { ajson } from '@shared/utilities';

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
    const subTest = {
      a: 1,
      b: new Date()
    };

    const anotherTest = [Number('1e-4'), BigInt('75'), undefined];
    const otherTest: Record<string, unknown> = {};
    const loopingTestA: unknown[] = [];
    const loopingTestB: Record<string, unknown> = { u: loopingTestA };
    const lastTest: unknown[] = [];

    loopingTestA.push(loopingTestB);

    otherTest.r = otherTest;
    otherTest.s = otherTest;

    lastTest.push(lastTest);

    const test = {
      c: [subTest],
      d: subTest,
      e: {
        f: undefined,
        g: null,
        h: -Infinity,
        i: Infinity,
        j: NaN,
        k: BigInt(1),
        l: 'string',
        m: true,
        n: false,
        o: [1, 2, subTest, []],
        p: anotherTest,
        q: otherTest,
        t: lastTest,
        v: loopingTestA
      }
    };

    const serialized = ajson.serialize(test) ?? '';

    this.shadowRoot!.querySelector('#test')!.innerHTML = serialized;

    const deserialized = ajson.deserialize(serialized);

    console.log(deserialized);
  }

  public constructor() {
    super();
  }
}
