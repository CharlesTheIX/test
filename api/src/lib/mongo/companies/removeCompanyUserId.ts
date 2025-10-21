import logError from "../../logError";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import mongoose, { isValidObjectId } from "mongoose";
import { SERVER_ERROR, NO_CONTENT, BAD } from "../../../globals";

export default async (_id: string, user_id: string): Promise<ApiResponse> => {
  // Check valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  // Check valid user_id
  const user_id_validation = isValidObjectId(user_id);
  if (!user_id_validation) return { ...BAD, message: "Invalid user_id" };

  try {
    // Check company exists
    const company = await getCompanyById(_id);
    if (company.error) return company;

    // Remove user id from user_ids
    const update = { $pull: { user_ids: new mongoose.Types.ObjectId(user_id) } };
    const res = await Model.findByIdAndUpdate(_id, update, { new: true }).exec();
    if (!res) throw new Error("Could not remove user from company");

    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
