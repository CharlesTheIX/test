import logError from "../../logError";
import Model from "../../../models/User.model";
import { NO_CONTENT, SERVER_ERROR } from "../../../globals";

export default async (): Promise<ApiResponse> => {
  try {
    await Model.deleteMany({}).exec();
    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
