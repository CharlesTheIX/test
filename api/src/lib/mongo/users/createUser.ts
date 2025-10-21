import logError from "../../logError";
import userExists from "./getUserExists";
import { isValidObjectId } from "mongoose";
import Model from "../../../models/User.model";
import addCompanyUser from "../companies/addCompanyUserId";
import { BAD, CONFLICT, DB_UPDATED, OK, PARTIAL_UPDATE, SERVER_ERROR } from "../../../globals";

// NOTE: This function assumes that the company_id is not required

export default async (data: Partial<UserData>): Promise<ApiResponse> => {
  const { username, permissions, company_id, first_name, surname } = data;

  // Validate the company_id if it exists
  const company_id_validation = isValidObjectId(company_id);
  if (company_id && !company_id_validation) return { ...BAD, message: "Invalid company_id" };

  try {
    // Check for existing username
    const existing_doc = await userExists(username || "");
    if (existing_doc.error) return existing_doc;
    else if (existing_doc.status === OK.status) return { ...CONFLICT, message: "Username already exists" };

    // Create new document
    const new_doc = new Model({ username, permissions, company_id: company_id || undefined, first_name, surname });
    if (!new_doc) throw new Error("User could not be created");

    // Save new document
    const created_doc = await new_doc.save();
    if (!created_doc) throw new Error("User could not be created");

    // Add the new document _id to the company if it exists
    var res = DB_UPDATED;
    var company_update_res = OK;
    if (company_id) company_update_res = await addCompanyUser(company_id, created_doc._id.toString());
    if (company_update_res.error) {
      res = { ...PARTIAL_UPDATE, message: `User created, but failed to update company ${company_id} - ${company_update_res.message}` };
      logError(res);
    }

    return res;
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return { ...SERVER_ERROR, data: err };
  }
};
