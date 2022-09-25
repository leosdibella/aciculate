import * as jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2 } from 'crypto';
import { IJwtPayload } from 'src/interfaces/jwt-payload';
import {
  hoursPerDay,
  minutesPerHour,
  secondsPerMinute
} from '@shared/utilities';
import { ApiErrorCode, HttpStatusCode, Role } from '@shared/enums';
import { Request, Response, NextFunction } from 'express';
import { RoleEntity } from 'src/classes/role-entity';
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

export function generateToken(payload: IJwtPayload, secret: string) {
  return jwt.sign(payload, secret, jwtOptions);
}

export function generateSalt() {
  return randomBytes(saltByteLength).toString(bufferEncodiing);
}

async function verifyJwt(token: string) {
  return new Promise<IJwtPayload>((resolve, reject) => {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: jwt.VerifyErrors, payload: IJwtPayload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload);
        }
      }
    );
  });
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.sendStatus(HttpStatusCode.unauthorized);
  }

  verifyJwt(token)
    .then((payload) => {
      res.locals.jwtPayload = payload;
      next();
    })
    .catch(() => {
      res.sendStatus(HttpStatusCode.forbidden);
      next();
    });
}

export function authenticateTokenWithRole(role: Role) {
  return function authenticateTokenWithRoleHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.sendStatus(HttpStatusCode.unauthorized);
    }

    verifyJwt(token)
      .then((payload) => {
        const roleId = RoleEntity.values.find((r) => r.name === role)?.id;

        if (!roleId || payload.roleId !== roleId) {
          throw new ApiError([
            {
              errorCode: ApiErrorCode.insufficientPermissionsError,
              message: `Role of ${role} is required to perform this operation.`
            }
          ]);
        }

        res.locals.jwtPayload = payload;
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
          reject(Error);
        } else {
          resolve(derivedKey.toString(bufferEncodiing));
        }
      }
    );
  });
}
