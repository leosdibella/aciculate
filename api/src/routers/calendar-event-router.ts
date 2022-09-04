import Router from 'express-promise-router';
import { Pool } from 'pg';

// eslint-disable-next-line new-cap
const calendarEventRouter = Router();
const pool = new Pool();

calendarEventRouter.get('/:id', async (req, res) => {
  const doesCalendarDatabaseExist = await pool.query(
    `SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${process.env.PGDATABASE}');`
  );

  return res.send(doesCalendarDatabaseExist);
});

export { calendarEventRouter };
