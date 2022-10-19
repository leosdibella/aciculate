import * as jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2 } from 'crypto';
import { IUserContext } from '@interfaces';
import {
  hoursPerDay,
  minutesPerHour,
  secondsPerMinute
} from '@shared/utilities';

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
