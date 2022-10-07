=import { registry } from '@shared/utilities';
import { IDbContext, IApplicationContext } from '@interfaces';
import { ApplicationContext, DbContext } from '@classes';
import { exit } from 'process';

const dbContext: IDbContext = new DbContext();
const applicationContext: IApplicationContext = new ApplicationContext();

dbContext
  .migrate()
  .then(() => applicationContext.startApi)
  .catch((e) => {
    console.log(e);
    exit(1);
  });
