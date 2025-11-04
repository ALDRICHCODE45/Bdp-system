import { Err, Ok, Result } from "../result/result";

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
