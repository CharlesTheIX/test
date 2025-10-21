import logError from "../../logError";
import getUserById from "./getUserById";
import Model from "../../../models/User.model";
import mongoose, { isValidObjectId } from "mongoose";
import removeCompanyUser from "../companies/removeCompanyUserId";
import { BAD, NO_CONTENT, OK, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

export default async (_id: string): Promise<ApiResponse> => {
  // Check if valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  try {
    // Check if user exists
    const user = await getUserById(_id, { fields: ["company_id"] });
    if (user.error) return user;

    // Delete document
    const object_id = new mongoose.Types.ObjectId(_id);
    const deleted_doc = await Model.findByIdAndDelete(object_id).exec();
    if (!deleted_doc) throw new Error(`User could not deleted`);

    var res = NO_CONTENT;
    if (!user.data.company_id) return res;

    // Remove the user_id from the Company if it exists
    var company_update_res = OK;
    if (user.data.company_id) company_update_res = await removeCompanyUser(user.data.company_id, _id);
    if (company_update_res?.error) {
      res = {
        ...PARTIAL_UPDATE,
        message: `User ${_id} deleted, but not removed from company ${user.data.company_id} - ${company_update_res.message}`,
      };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
