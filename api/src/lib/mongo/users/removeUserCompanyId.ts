import logError from "../../logError";
import getUserById from "./getUserById";
import Model from "../../../models/User.model";
import mongoose, { isValidObjectId } from "mongoose";
import { BAD, NO_CONTENT, SERVER_ERROR } from "../../../globals";

export default async (_id: string): Promise<ApiResponse> => {
  // Check if valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  try {
    // Check if user exists
    const existing_doc = await getUserById(_id, { fields: ["company_id"] });
    if (existing_doc.error) return existing_doc;
    else if (!existing_doc.data.company_id) return NO_CONTENT;

    // Update document
    const object_id = new mongoose.Types.ObjectId(_id);
    const query: any = { $set: { updatedAt: new Date() }, $unset: { company_id: 1 } };
    const updated_doc = await Model.findByIdAndUpdate(object_id, query, { new: true });
    if (!updated_doc) throw new Error("User not updated");

    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
