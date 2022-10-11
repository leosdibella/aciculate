import { ApiError } from '../classes';
import { ApiErrorCode, TimeInterval } from '../enums';

export function validateTimeZone(timezone: string, locale = 'en-US'): string {
  const date = new Date();

  try {
    date.toLocaleDateString(locale, { timeZone: 'cool' });
  } catch {
    throw new ApiError([
      {
        errorCode: ApiErrorCode.databseSchemaValidationError,
        message: `Timezone: ${timezone} is invalid.`
      }
    ]);
  }

  return timezone;
}

export function validateTimeInterval(timeInterval: string) {
  if (TimeInterval[timeInterval as keyof typeof TimeInterval]) {
    return timeInterval as TimeInterval;
  }

  throw new ApiError([
    {
      errorCode: ApiErrorCode.databseSchemaValidationError,
      message: `TimeInterval: ${timeInterval} is invalid.`
    }
  ]);
}
