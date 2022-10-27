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

const tokenLifespanMinutes = +(
  process.env.ACICULATE_API_TOKEN_LIFESPAN_MINUTES ?? 'NaN'
);

const tokenDurationSeconds = Math.ceil(
  Math.abs(
    isNaN(tokenLifespanMinutes)
      ? minutesPerHour * hoursPerDay
      : tokenLifespanMinutes
  ) * secondsPerMinute
);

const jwtOptions: jwt.SignOptions = {
  algorithm: jwtAlgorithm,
  expiresIn: isFinite(tokenDurationSeconds) ? tokenDurationSeconds : undefined
};

export async function decodeJwt(
  tokenSecret?: string,
  token?: string
): Promise<IUserContext> {
  return new Promise((resolve, reject) => {
    if (!token || !tokenSecret) {
      reject();
    } else {
      jwt.verify(
        token,
        tokenSecret,
        (err: jwt.VerifyErrors, payload: jwt.JwtPayload) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              userId: payload.userId,
              roleId: payload.roleId,
              organizationId: payload.organizationId,
              userSignature: new Date(payload.userSignature),
              organizationSignature: new Date(payload.organizationSignature),
              systemSignature: new Date(payload.systemSignature),
              organizationIds: payload.organizationIds
            });
          }
        }
      );
    }
  });
}

export function generateToken(userContext: IUserContext, tokenSecret: string) {
  return jwt.sign(userContext, tokenSecret, jwtOptions);
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
