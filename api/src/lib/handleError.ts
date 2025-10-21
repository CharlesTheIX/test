import logError from "./logError";
import { SERVER_ERROR } from "../globals";

export default (err: any): ApiResponse => {
  const message = err.message || SERVER_ERROR.message;
  logError({ ...SERVER_ERROR, message });
  return { ...SERVER_ERROR, data: err, message };
};
