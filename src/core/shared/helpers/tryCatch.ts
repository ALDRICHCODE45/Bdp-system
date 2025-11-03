// type SuccesResult<T> = readonly [T, null];

import { Err, Ok, Result } from "../result/result";

// type ErrorResult<E = Error> = readonly [null, E];

// type Result<T, E = Error> = SuccesResult<T> | ErrorResult<E>;

// export const TryCatch = async <T, E = Error>(
//   promise: Promise<T>
// ): Promise<Result<T, E>> => {
//   try {
//     const data = await promise;
//     return [data, null];
//   } catch (error) {
//     return [null, error as E];
//   }
// };

export const TryCatch = async <T, E extends Error>(
  promise: Promise<T>
): Promise<Result<T, E>> => {
  try {
    const data = await promise;
    return Ok(data);
  } catch (error) {
    return Err(error as E);
  }
};
