import logError from "../../logError";
import getUserById from "./getUserById";
import Model from "../../../models/User.model";
import mongoose, { isValidObjectId } from "mongoose";
import applyMongoFilters from "../applyMongoFilters";
import getCompanyById from "../companies/getCompanyById";
import addCompanyUser from "../companies/addCompanyUserId";
import removeCompanyUser from "../companies/removeCompanyUserId";
import { BAD, CONFLICT, NO_CONTENT, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

type Props = {
  _id: string;
  update: Partial<UserData>;
  filters?: Partial<ApiFilters>;
};

export default async (props: Props): Promise<ApiResponse> => {
  const { _id, update, filters } = props;

  // Validate the _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  // Validate the company_id if it exists
  const company_id_validation = isValidObjectId(update.company_id);
  if (update.company_id && !company_id_validation) return { ...BAD, message: "Invalid company_id" };

  try {
    // Check for existing document
    const existing_doc = await getUserById(_id, { fields: ["company_id"] });
    if (existing_doc.error) return existing_doc;

    // Check if the company exists if the update contains a none empty company_id
    if (update.company_id && update.company_id !== "") {
      const existing_company = await getCompanyById(update.company_id);
      if (!existing_company.data) return existing_company;
      else if (existing_doc.data.company_id && update.company_id) return CONFLICT; //NOTE: Remove if company_id can be changed if already exists
    }

    // Update document
    const object_id = new mongoose.Types.ObjectId(_id);
    const query: any = { $set: { updatedAt: new Date() }, $unset: {} };

    if (update.surname) query.$set.surname = update.surname;
    if (update.first_name) query.$set.first_name = update.first_name;
    if (update.permissions) query.$set.permissions = update.permissions;

    if (update.company_id === "") query.$unset.company_id = 1;
    else query.$set.company_id = update.company_id;

    const updated_doc = await applyMongoFilters(Model.findByIdAndUpdate(object_id, query, { new: true }), filters)
      .lean()
      .exec();
    if (!updated_doc) throw new Error("User not updated");

    // Add or remove the user_id from the company_id is present
    var company_update_res = NO_CONTENT;
    if (update.company_id === "" && existing_doc.data.company_id) company_update_res = await removeCompanyUser(existing_doc.data.company_id, _id);
    else if (update.company_id) company_update_res = await addCompanyUser(update.company_id, _id);

    var res = NO_CONTENT;
    if (company_update_res?.error) {
      res = { ...PARTIAL_UPDATE, message: `User ${_id} updated, but failed to update company ${update.company_id}` };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
