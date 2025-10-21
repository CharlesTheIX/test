import logError from "../../logError";
import { isValidObjectId } from "mongoose";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import { SERVER_ERROR, NO_CONTENT, BAD } from "../../../globals";

export default async (_id: string, bucket_id: string): Promise<ApiResponse> => {
  // Check valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  // Check valid bucket_id
  const bucket_id_validation = isValidObjectId(bucket_id);
  if (!bucket_id_validation) return { ...BAD, message: "Invalid _id" };

  try {
    // Check company exists
    const company = await getCompanyById(_id);
    if (company.error) return company;

    // Update document
    const query = { $pull: { bucket_ids: bucket_id } };
    const update = await Model.findByIdAndUpdate(_id, query).exec();
    if (!update) throw new Error("Could not remove bucket to company");

    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
