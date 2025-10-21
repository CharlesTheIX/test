import logError from "../../logError";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import { isValidObjectId, ObjectId } from "mongoose";
import { SERVER_ERROR, OK, NO_CONTENT, BAD } from "../../../globals";

export default async (_id: string, bucket_id: string): Promise<ApiResponse> => {
  // Check if valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  // Check if valid bucket_id
  const bucket_id_validation = isValidObjectId(bucket_id);
  if (!bucket_id_validation) return { ...BAD, message: "Invalid bucket_id" };

  try {
    // Check if the company exists
    const company = await getCompanyById(_id, { fields: ["bucket_ids"] });
    if (company.error) return company;
    if (company.data.bucket_ids.map((i: ObjectId) => i.toString()).includes(bucket_id)) return OK;

    // Update the document
    const query = { $push: { bucket_ids: bucket_id } };
    const update = await Model.findByIdAndUpdate(_id, query).exec();
    if (!update) throw new Error("Could not add bucket to company");

    return NO_CONTENT;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
