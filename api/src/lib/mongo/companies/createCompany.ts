import logError from "../../logError";
import { isValidObjectId } from "mongoose";
import companyExists from "./getCompanyExists";
import Model from "../../../models/Company.model";
import updateUserById from "../users/updateUserById";
import { BAD, CONFLICT, DB_UPDATED, OK, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

export default async (data: Partial<CompanyData>): Promise<ApiResponse> => {
  const { name, user_ids = [] } = data;

  try {
    // Check if all user_ids are valid
    const valid: SimpleError = { error: false, message: "" };
    user_ids.forEach((i) => {
      if (valid.error) return;
      if (!isValidObjectId(i)) valid.error = true;
    });
    if (valid.error) return { ...BAD, message: "User ids contains an invalid id" };

    // Check company exists
    const existing_doc = await companyExists(name || "");
    if (existing_doc.error) return existing_doc;
    if (existing_doc.status === OK.status) return { ...CONFLICT, message: "Company name already exists" };

    // Create new document
    const new_doc = new Model({ name, user_ids });
    if (!new_doc) throw new Error("Company not created");

    // Save document
    const created_doc = await new_doc.save();
    if (!created_doc) throw new Error("Company not created");

    // Add company_id to relevant Users
    var user_updates_error = false;
    if (user_ids.length > 0) {
      const user_updates_res = await Promise.all(user_ids.map((i: string) => updateUserById({ _id: i, update: { company_id: new_doc._id.toString() } })));
      user_updates_res.forEach((i) => {
        if (user_updates_error) return;
        if (i.error) user_updates_error = true;
      });
    }

    var res = DB_UPDATED;
    if (user_updates_error) {
      res = { ...PARTIAL_UPDATE, message: `Company ${new_doc._id.toString()} was created but failed to update users ${user_ids.join(", ")}` };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
