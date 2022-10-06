import * as jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2 } from 'crypto';
import { IUserContext } from '@interfaces';
import {
  hoursPerDay,
  minutesPerHour,
  secondsPerMinute
} from '@shared/utilities';
import { Request, Response, NextFunction } from 'express';

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

export function decodeJwt(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    next();
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: jwt.VerifyErrors, userContext: IUserContext) => {
        if (err) {
          response.locals.userContext = null;
        } else {
          response.locals.userContext = userContext;
        }

        next();
      }
    );
  }
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
