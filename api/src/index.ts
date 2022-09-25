import express from 'express';
import cors from 'cors';
import { calendarRouter, calendarEventRouter, userRouter } from './routers';
import { HttpVerb } from '@shared/enums';
import { registry } from '@shared/utilities';
import { IDbContext, IUserService, IDbEntityConstructor } from './interfaces';
import { CalendarEntity, CalendarEventEntity, DbContext } from './classes';
import { DbTableName, DependencyInjectionToken } from './enums';
import { DbSchema, DbModel } from './types';
import { OrganizationEntity } from './classes/organization-entity';
import { UserEntity } from './classes/user-entity';
import { RoleEntity } from './classes/role-entity';
import { UserService } from './classes/user-service';
import { Entity } from '@shared/enums/entity';

const dbContext = new DbContext();

const dbSchema: { [key in DbTableName]: DbSchema<DbModel<key>> } = {
  [DbTableName.calendar]: CalendarEntity.schema,
  [DbTableName.calendarEvent]: CalendarEventEntity.schema,
  [DbTableName.organization]: OrganizationEntity.schema,
  [DbTableName.user]: UserEntity.schema,
  [DbTableName.role]: RoleEntity.schema
};

const seedableEnttiyConstructors: Partial<{
  [key in DbTableName]: IDbEntityConstructor<DbModel<key>>;
}> = {
  [DbTableName.role]: RoleEntity,
  [DbTableName.user]: UserEntity
};

(Object.keys(dbSchema) as DbTableName[]).forEach((t) => {
  dbContext.migrateSchema(t, dbSchema[t]);
});

(Object.keys(seedableEnttiyConstructors) as DbTableName[]).forEach((t) => {
  const seedableConstructor = seedableEnttiyConstructors[t]!;

  dbContext.seed<DbModel<typeof t>>(
    seedableConstructor as IDbEntityConstructor<DbModel<typeof t>>
  );
});

registry.provide<IDbContext>(DependencyInjectionToken.dbContext, dbContext);

registry.provide<IUserService>(
  DependencyInjectionToken.userService,
  new UserService()
);

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

app.use(`/${Entity.calendar}`, calendarRouter);
app.use(`/${Entity.calendarEvent}`, calendarEventRouter);
app.use(`/${Entity.user}`, userRouter());
app.use(`/${Entity.organization}`, organizationRouter);

app.listen(port, () => {
  console.log(`Aciculate API listening on port: ${port}`);
});
