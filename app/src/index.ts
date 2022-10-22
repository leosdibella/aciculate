import { Entity } from '@shared/enums';

const app = document.createElement('div');

app.innerHTML = 'HI';

document.body.appendChild(app);

fetch(`${ACICULATE_API_ORIGIN}/${Entity.calendar}/0`).then(async (res) => {
  const json = await res.json();
  console.log(json);
});
