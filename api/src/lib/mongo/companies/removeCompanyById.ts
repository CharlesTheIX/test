import logError from "../../logError";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import removeUserCompanyId from "../users/removeUserCompanyId";
import mongoose, { isValidObjectId, ObjectId } from "mongoose";
import { BAD, NO_CONTENT, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

export default async (_id: string): Promise<ApiResponse> => {
  // Check valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  try {
    // Check company exists
    const company = await getCompanyById(_id, { fields: ["user_ids", "bucket_ids"] });
    if (company.error) return company;
    else if (company.data.bucket_ids.length > 0) return { ...BAD, message: "Company cannot be removed whilst with active buckets" };

    // Update document
    const object_id = new mongoose.Types.ObjectId(_id);
    const deleted_doc = await Model.findByIdAndDelete(object_id).exec();
    if (!deleted_doc) throw new Error("Company not deleted");

    // Remove company_id from users in user_ids
    var user_updates_error = false;
    if (company.data.user_ids.length > 0) {
      const user_updates_res = await Promise.all(company.data.user_ids.map((i: ObjectId) => removeUserCompanyId(i.toString())));
      user_updates_res.forEach((i) => {
        if (user_updates_error) return;
        if (i.error) user_updates_error = true;
      });
    }

    var res = NO_CONTENT;
    if (user_updates_error) {
      res = {
        ...PARTIAL_UPDATE,
        message: `Company ${_id} was deleted but failed to update users ${company.data.user_ids.map((i: string) => i).join(", ")}`,
      };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
