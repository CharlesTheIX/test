import logError from "../../logError";
import getCompanyById from "./getCompanyById";
import Model from "../../../models/Company.model";
import mongoose, { isValidObjectId } from "mongoose";
import updateUserById from "../users/updateUserById";
import applyMongoFilters from "../applyMongoFilters";
import removeUserCompanyId from "../users/removeUserCompanyId";
import { BAD, NO_CONTENT, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

type Props = {
  _id: string;
  update: Partial<CompanyData>;
  filters?: Partial<ApiFilters>;
};

export default async (props: Props): Promise<ApiResponse> => {
  const { _id, update, filters } = props;

  // Check if valid _id
  const _id_validation = isValidObjectId(_id);
  if (!_id_validation) return { ...BAD, message: "Invalid _id" };

  try {
    // Check id company exists
    const existing_doc = await getCompanyById(_id, { fields: ["user_ids"] });
    if (existing_doc.error) return existing_doc;

    // Create valid user_id array
    const object_id = new mongoose.Types.ObjectId(_id);
    const new_user_ids: mongoose.Types.ObjectId[] = [];
    const query: any = { $set: { updatedAt: new Date() }, $unset: {} };
    if (update.user_ids) {
      const valid: SimpleError = { error: false, message: "" };
      update.user_ids.forEach((i) => {
        if (valid.error) return;
        if (!isValidObjectId(i)) return (valid.error = true);
        const object_id = new mongoose.Types.ObjectId(i);
        new_user_ids.push(object_id);
      });

      if (valid.error) return { ...BAD, message: "User ids contains an invalid id" };
      else query.$set.user_ids = new_user_ids;
    }

    // Update document
    const updated_doc = await applyMongoFilters(Model.findByIdAndUpdate(object_id, query, { new: true }), filters)
      .lean()
      .exec();
    if (!updated_doc) throw new Error("Company not updated");

    // Remove the user company_id if exists in the user_ids
    var user_updates_error = false;
    if (existing_doc.data.user_ids.length > 0) {
      const user_updates_res = await Promise.all(existing_doc.data.user_ids.map((i: string) => removeUserCompanyId(i)));
      user_updates_res.forEach((i) => {
        if (user_updates_error) return;
        if (i.error) user_updates_error = true;
      });
    }

    // Add the user company_id if exists in the user_ids
    if (new_user_ids.length > 0) {
      const user_updates_res = await Promise.all(new_user_ids.map((i) => updateUserById({ _id: i.toString(), update: { company_id: _id } })));
      user_updates_res.forEach((i) => {
        if (user_updates_error) return;
        if (i.error) user_updates_error = true;
      });
    }

    var res = NO_CONTENT;
    if (user_updates_error) {
      res = { ...PARTIAL_UPDATE, message: `Company ${_id} was created but failed to update users ${update.user_ids?.join(", ")}` };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
