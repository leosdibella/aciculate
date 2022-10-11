/*
import './classes';
import { TicalComponentName, TicalMode, TicalTheme } from './enums';
import { fillArray, millisecondsPerSecond } from './utilities';

const app = document.createElement(TicalComponentName.ticalContainer);
const numberOfGuys = 8;

app.eventSeparations = fillArray(numberOfGuys).map((_, i) => ({
  id: i,
  label: `Guy Number ${i}`
}));

document.body.appendChild(app);

setTimeout(() => {
  app.swapOrientation = true;

  setTimeout(() => {
    app.theme = {
      [TicalTheme.colorSecondary]: 'pink'
    };

    setTimeout(() => {
      app.eventSeparations = fillArray(2 * app.eventSeparations.length).map(
        (_, i) => ({
          id: i,
          label: `Hombre Numero ${i + 1}`
        })
      );

      setTimeout(() => {
        app.mode = TicalMode.week;
      }, millisecondsPerSecond);
    }, millisecondsPerSecond);
  }, millisecondsPerSecond);
}, millisecondsPerSecond);
*/

import { EntityName } from '@shared/enums';

const app = document.createElement('div');

app.innerHTML = 'HI';

document.body.appendChild(app);

fetch(`http://${ACICULATE_API_ORIGIN}/${EntityName.calendar}/0`).then(
  async (res) => {
    const json = await res.json();
    console.log(json);
  }
);
