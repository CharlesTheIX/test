import logError from "../../logError";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import { isValidObjectId, ObjectId } from "mongoose";
import { SERVER_ERROR, OK, NO_CONTENT, BAD } from "../../../globals";

export default async (_id: string, user_id: string): Promise<ApiResponse> => {
  // Check valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  // Check valid user_id
  const user_id_validation = isValidObjectId(user_id);
  if (!user_id_validation) return { ...BAD, message: "Invalid user_id" };

  try {
    // Check company exists
    const company = await getCompanyById(_id, { fields: ["user_ids"] });
    if (company.error) return company;
    if (company.data.user_ids.map((i: ObjectId) => i.toString()).includes(user_id)) return OK;

    // Update
    const query = { $push: { user_ids: user_id } };
    const update = await Model.findByIdAndUpdate(_id, query).exec();
    if (!update) throw new Error("Could not add user to company");

    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
