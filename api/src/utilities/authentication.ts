import * as jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2 } from 'crypto';
import { IUserContext } from '@interfaces';
import {
  hoursPerDay,
  minutesPerHour,
  secondsPerMinute
} from '@shared/utilities';
import { ApiErrorCode, HttpStatusCode, Role } from '@shared/enums';
import { Request, Response, NextFunction } from 'express';
import { RoleEntity } from '@classes';
import { ApiError } from '@shared/classes';

const saltByteLength = 64;
const jwtAlgorithm = 'HS512';
const keyLength = 1024;
const iterations = 10_000;
const digest = 'sha512';
const bufferEncodiing = 'base64';
const tokenDurationSeconds = secondsPerMinute * minutesPerHour * hoursPerDay;

const jwtOptions: jwt.SignOptions = {
  algorithm: jwtAlgorithm,
  expiresIn: tokenDurationSeconds
};

export function generateToken(userContext: IUserContext, secret: string) {
  return jwt.sign(userContext, secret, jwtOptions);
}

export function generateSalt() {
  return randomBytes(saltByteLength).toString(bufferEncodiing);
}

async function verifyJwt(token: string) {
  return new Promise<IUserContext>((resolve, reject) => {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: jwt.VerifyErrors, userContext: IUserContext) => {
        if (err) {
          reject(err);
        } else {
          resolve(userContext);
        }
      }
    );
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.sendStatus(HttpStatusCode.unauthorized);
  }

  verifyJwt(token)
    .then((userContext) => {
      res.locals.userContext = userContext;
      next();
    })
    .catch(() => {
      res.sendStatus(HttpStatusCode.forbidden);
      next();
    });
}

export function authorize(roles: Role[]) {
  return function authorizeHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.sendStatus(HttpStatusCode.unauthorized);
    }

    verifyJwt(token)
      .then((userContext) => {
        const role = RoleEntity.values.find((r) => r.id === userContext.roleId);

        if (!role || roles.indexOf(role.name!) === -1) {
          throw new ApiError([
            {
              errorCode: ApiErrorCode.insufficientPermissionsError,
              message: `A role belonging to the set [${roles.join()}] is required to perform this operation.`
            }
          ]);
        }

        res.locals.userContext = userContext;
        next();
      })
      .catch(() => {
        res.sendStatus(HttpStatusCode.forbidden);
        next();
      });
  };
}

export async function generateHash(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      digest,
      (error: Error, derivedKey: Buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(derivedKey.toString(bufferEncodiing));
        }
      }
    );
  });
}
