import express from 'express';
import cors from 'cors';
import { calendarRouter, calendarEventRouter } from './routers';
import { DbTableName } from '@shared/enums';
import { registry } from '@shared/utilities';
import { IDbContext } from './interfaces';
import { CalendarEntity, DbContext } from './classes';
import { DependencyInjectionToken } from './enums';

const dbContext = new DbContext();

dbContext.migrateSchema({
  [DbTableName.calendar]: new CalendarEntity({}).schema,
  [DbTableName.calendarEvent]: {}
});

registry.provide<IDbContext>(DependencyInjectionToken.dbContext, dbContext);

const app = express();
const port = Number(process.env.ACICULATE_API_PORT);

app.use(
  cors({
    origin: process.env.ACICULATE_APP_ORIGIN,
    optionsSuccessStatus: 200,
    methods: 'GET,PUT,PATCH,POST,DELETE'
  })
);

app.use(express.json());

app.use(`/${DbTableName.calendar}`, calendarRouter);
app.use(`/${DbTableName.calendarEvent}`, calendarEventRouter);

app.listen(port, () => {
  console.log(`Aciculate API listening on port: ${port}`);
});
