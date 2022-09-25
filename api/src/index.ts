import express from 'express';
import cors from 'cors';
import { calendarRouter, calendarEventRouter, userRouter } from './routers';
import { HttpVerb } from '@shared/enums';
import { registry } from '@shared/utilities';
import { IDbContext } from './interfaces';
import { CalendarEntity, CalendarEventEntity, DbContext } from './classes';
import { DbTableName, DependencyInjectionToken } from './enums';
import { DbSchema, DbTable } from './types';
import { OrganizationEntity } from './classes/organization-entity';
import { UserEntity } from './classes/user-entity';
import { RoleEntity } from './classes/role-entity';

const dbContext = new DbContext();

const dbSchema: { [key in DbTableName]: DbSchema<DbTable<key>> } = {
  [DbTableName.calendar]: CalendarEntity.schema,
  [DbTableName.calendarEvent]: CalendarEventEntity.schema,
  [DbTableName.organization]: OrganizationEntity.schema,
  [DbTableName.user]: UserEntity.schema,
  [DbTableName.role]: RoleEntity.schema
};

(Object.keys(dbSchema) as DbTableName[]).forEach((t) => {
  dbContext.migrateSchema(t, dbSchema[t]);
});

registry.provide<IDbContext>(DependencyInjectionToken.dbContext, dbContext);

const app = express();
const port = Number(process.env.ACICULATE_API_PORT);

app.use(
  cors({
    origin: process.env.ACICULATE_APP_ORIGIN,
    optionsSuccessStatus: 200,
    methods: Object.keys(HttpVerb)
      .map((v) => v.toUpperCase())
      .join()
  })
);

app.use(express.json());

app.use(`/${DbTableName.calendar}`, calendarRouter);
app.use(`/${DbTableName.calendarEvent}`, calendarEventRouter);
app.use(`/${DbTableName.user}`, userRouter);
app.use(`/${DbTableName.organization}`, organizationRouter);

app.listen(port, () => {
  console.log(`Aciculate API listening on port: ${port}`);
});
