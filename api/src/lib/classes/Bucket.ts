import fs from "fs";
import Minio from "./Minio";
import logError from "../logError";
import Validation from "./Validation";
import handleError from "../handleError";
import Model from "../../models/Bucket.model";
import mongoose, { isValidObjectId } from "mongoose";
import { LifecycleConfig, LifecycleRule } from "minio";
import applyMongoFilters from "../mongo/applyMongoFilters";
import getCompanyById from "../mongo/companies/getCompanyById";
import addCompanyBucketId from "../mongo/companies/addCompanyBucketId";
import removeCompanyBucketId from "../mongo/companies/removeCompanyBucketId";
import { BAD, CONFLICT, DB_UPDATED, NO_CONTENT, NOT_FOUND, OK, PARTIAL_UPDATE } from "../../globals";

export default class Bucket {
  // --------------------------------------------------------------------------
  // Public Static Functions
  // --------------------------------------------------------------------------
  /* A */
  public static addBucketLifecycle = async (
    bucket_id: string,
    identifier: string,
    type: string,
    status: boolean,
    days: number,
    prefix?: string
  ): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const rule: LifecycleRule = {
        ID: identifier,
        Status: status ? "Enabled" : "Disabled",
      };

      if (prefix) rule.Filter = { Prefix: prefix };

      switch (type) {
        case "Expiration":
          rule.Expiration = { Days: days };
          break;
        case "NoncurrentVersionExpiration":
          rule.NoncurrentVersionExpiration = { NoncurrentDays: days };
          break;
        case "AbortIncompleteMultipartUpload":
          rule.AbortIncompleteMultipartUpload = { DaysAfterInitiation: days };
          break;
        default:
          return { ...BAD, message: `Invalid lifecycle type ${type}` };
      }

      const config: LifecycleConfig = { Rule: [] };
      const lifecycle = await Minio.getBucketLifecycle(bucket_name);
      if (lifecycle.error) return lifecycle;
      if (!lifecycle.data) config.Rule = [rule];
      else if (!Array.isArray(lifecycle.data.Rule)) config.Rule = [{ ...lifecycle.data.Rule }, rule];
      else config.Rule = [...lifecycle.data.Rule, rule];

      return await Minio.setBucketLifecycle(bucket_name, config);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static addBucketObjectLockConfig = async (bucket_id: string, config: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const tags = await Minio.getBucketObjectLockConfig(bucket_name);
      if (tags.error) return tags;

      var update: any = {};
      // if (!tags.data) {
      //   update[`${tag}`] = tag;
      // } else {
      //   const exists = tags.data.find((t: any) => t.Key === tag);
      //   if (exists) return { ...CONFLICT, message: `Tag ${tag} already exists` };

      //   update[`${tag}`] = tag;
      //   tags.data.forEach((t: any) => {
      //     update[`${t.Key}`] = t.Value;
      //   });
      // }

      return await Minio.setBucketObjectLockConfig(bucket_name, update);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static addBucketTag = async (bucket_id: string, tag: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const tags = await Minio.getBucketTagging(bucket_name);
      if (tags.error) return tags;

      var update: any = {};
      if (!tags.data) {
        update[`${tag}`] = tag;
      } else {
        const exists = tags.data.find((t: any) => t.Key === tag);
        if (exists) return { ...CONFLICT, message: `Tag ${tag} already exists` };

        update[`${tag}`] = tag;
        tags.data.forEach((t: any) => {
          update[`${t.Key}`] = t.Value;
        });
      }

      return await Minio.setBucketTagging(bucket_name, update);
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* C */
  public static createBucket = async (
    bucket_name: string,
    max_size_bytes: number,
    company_id: string,
    permissions: number[]
  ): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(company_id);
      if (company_id && !valid) return { ...BAD, message: `Invalid company_id ${company_id}` };

      var exists = await this.getBucketExists(bucket_name);
      if (exists.error) return exists;
      if (exists.status === OK.status) return { ...CONFLICT, message: `Bucket name ${bucket_name} already exists` };

      exists = await Minio.getBucketExists(bucket_name);
      if (exists.error) return exists;
      if (exists.status === OK.status) return { ...CONFLICT, message: `Bucket name ${bucket_name} already exists` };

      const new_bucket = await Minio.createBucket(bucket_name);
      if (new_bucket.error) return new_bucket;

      var res = DB_UPDATED;
      const new_doc = await new Model({ name: bucket_name, max_size_bytes, company_id, permissions }).save();
      if (!new_doc) {
        res = { ...PARTIAL_UPDATE, message: `Minio bucket ${bucket_name} created but failed to created bucket in database` };
        logError(res);
        return res;
      }

      if (company_id) {
        const company_update = await addCompanyBucketId(company_id, new_doc._id.toString());
        if (company_update.error) {
          res = { ...PARTIAL_UPDATE, message: `Minio & database bucket ${bucket_name} created but failed to update company ${company_id} ` };
          logError(res);
          return res;
        }
      }

      return res;
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* G */
  public static getBucketById = async (bucket_id: string, filters?: Partial<ApiFilters>): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const _id = new mongoose.Types.ObjectId(bucket_id);
      const query = Model.findById(_id);
      const data = await applyMongoFilters(query, filters).lean().exec();
      if (!data) return NOT_FOUND;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketByName = async (bucket_name: string, filters?: Partial<ApiFilters>): Promise<ApiResponse> => {
    try {
      const valid = Validation.isValidBucketName(bucket_name);
      if (valid.error) return { ...BAD, message: valid.message };

      const query = Model.findOne({ name: bucket_name });
      const data = await applyMongoFilters(query, filters).lean().exec();
      if (!data) return NOT_FOUND;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketExists = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const validation = Validation.isValidBucketName(bucket_name);
      if (validation.error) return { ...BAD, message: validation.message };

      const data = !!(await Model.findOne({ name: bucket_name }).select({ _id: 1 }).lean().exec());
      if (!data) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketLifecycles = async (bucket_id: string): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      return await Minio.getBucketLifecycle(bucket_name);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketObjectLockConfig = async (bucket_id: string): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      return await Minio.getBucketObjectLockConfig(bucket_name);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketTags = async (bucket_id: string): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      return await Minio.getBucketTagging(bucket_name);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getObject = async (bucket_id: string, object_name: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      valid = Validation.isValidObjectName(object_name);
      if (valid.error) return { ...BAD, message: valid.message };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const exists = await Minio.getBucketExists(bucket_name);
      if (exists.error) return exists;
      if (exists.status !== OK.status) return NOT_FOUND;

      return await Minio.getObject(object_name, bucket_name);
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getObjectPresignedUrl = async (
    bucket_id: string,
    object_name: string,
    expiration_s?: number,
    download?: boolean
  ): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      valid = Validation.isValidObjectName(object_name);
      if (valid.error) return { ...BAD, message: valid.message };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const exists = await Minio.getBucketExists(bucket_name);
      if (exists.error) return exists;
      if (exists.status !== OK.status) return NOT_FOUND;

      return await Minio.getObjectPresignedUrl(object_name, bucket_name, expiration_s, download);
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* L */
  public static listBuckets = async (filters?: Partial<ApiFilters>): Promise<ApiResponse> => {
    try {
      const query = Model.find();
      const data = await applyMongoFilters(query, filters).lean().exec();
      if (data.length === 0) return NO_CONTENT;

      const collection_count = await Model.countDocuments();
      return { ...OK, data, meta: { collection_count } };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static listBucketsByCompanyId = async (company_id: string, filters?: Partial<ApiFilters>): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(company_id);
      if (!valid) return { ...BAD, message: `Invalid company_id ${company_id}` };

      const company = await getCompanyById(company_id);
      if (company.error) return company;

      const query = Model.find({ company_id });
      const data = await applyMongoFilters(query, filters).lean().exec();
      if (data.length === 0) return NO_CONTENT;

      const collection_count = await Model.countDocuments();
      return { ...OK, data, meta: { collection_count } };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static listObjects = async (bucket_id: string): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const exists = await Minio.getBucketExists(bucket_name);
      if (exists.error) return exists;
      if (exists.status !== OK.status) return NOT_FOUND;

      return await Minio.listObjects(bucket_name);
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* R */
  public static removeAllBuckets = async (): Promise<ApiResponse> => {
    try {
      await Model.deleteMany({}).exec();
      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucketById = async (bucket_id: string): Promise<ApiResponse> => {
    try {
      const valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name", "company_id"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const minio_res = await Minio.removeBucket(bucket_name);
      if (minio_res.error) return minio_res;

      const _id = new mongoose.Types.ObjectId(bucket_id);
      const deleted_doc = await Model.findByIdAndDelete(_id).exec();
      if (!deleted_doc) {
        const res = { ...PARTIAL_UPDATE, message: `Bucket ${bucket_name} removed from Minio but failed to remove ${bucket_id} from the database` };
        logError(res);
        return res;
      }

      const company_id = bucket.data.company_id;
      if (company_id) {
        const company_update = await removeCompanyBucketId(company_id, bucket_id);
        if (company_update.error) {
          const res = {
            ...PARTIAL_UPDATE,
            message: `Bucket ${bucket_name} removed from Minio and database but failed to remove ${bucket_id} from company ${company_id}`,
          };
          logError(res);
          return res;
        }
      }

      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucketLifecycle = async (bucket_id: string, identifier: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const config: LifecycleConfig = { Rule: [] };
      const lifecycle = await Minio.getBucketLifecycle(bucket_name);
      if (lifecycle.error) return lifecycle;
      if (!lifecycle.data) return NO_CONTENT;
      if (!Array.isArray(lifecycle.data.Rule)) {
        if (lifecycle.data.Rule.ID === identifier) return await Minio.removeBucketLifecycle(bucket_name);
        else return NO_CONTENT;
      } else config.Rule = lifecycle.data.Rule.filter((r: LifecycleRule) => r.ID !== identifier);

      const update = await Minio.setBucketLifecycle(bucket_name, config);
      if (update.error) return update;
      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucketTag = async (bucket_id: string, tag: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const tags = await Minio.getBucketTagging(bucket_name);
      if (tags.error) return tags;
      if (!tags.data) return NO_CONTENT;

      const update: any = {};
      tags.data.forEach((t: any) => {
        if (t.Key == `${tag}`) return;
        update[`${t.Key}`] = t.Value;
      });

      if (Object.keys(update).length === 0) {
        const res = await Minio.removeBucketTagging(bucket_name);
        if (res.error) return res;
      } else {
        const res = await Minio.setBucketTagging(bucket_name, update);
        if (res.error) return res;
      }

      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeObject = async (bucket_id: string, object_name: string): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      valid = Validation.isValidObjectName(object_name);
      if (valid.error) return { ...BAD, message: valid.message };

      // Check bucket exists
      const bucket = await this.getBucketById(bucket_id, { fields: ["name", "object_count", "consumption_bytes"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const object = await Minio.getObject(object_name, bucket_name);
      if (object.error) return object;

      var res = await Minio.removeObject(object_name, bucket_name);
      if (res.error) return res;

      const bucket_update = await this.updateBucketById(bucket_id, {
        object_count: bucket.data.object_count - 1,
        consumption_bytes: bucket.data.consumption_bytes - object.data.size,
      });
      if (bucket_update.error) {
        return {
          ...PARTIAL_UPDATE,
          message: `Removed object ${object_name} from bucket ${bucket_name} but failed to update bucket data ${bucket_id}`,
        };
      }

      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* U */
  public static updateBucketById = async (bucket_id: string, update: Partial<BucketData>, filters?: Partial<ApiFilters>): Promise<ApiResponse> => {
    try {
      var valid = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      valid = isValidObjectId(update.company_id);
      if (update.company_id && !valid) return { ...BAD, message: `Invalid company_id ${update.company_id}` };

      const exists = await this.getBucketById(bucket_id);
      if (exists.error) return exists;

      const _id = new mongoose.Types.ObjectId(bucket_id);
      const query: any = { $set: { updatedAt: new Date() }, $unset: {} };

      if (update.permissions) query.$set.permissions = update.permissions;
      if (update.object_count || update.object_count === 0) query.$set.object_count = update.object_count;
      if (update.max_size_bytes || update.max_size_bytes === 0) query.$set.max_size_bytes = update.max_size_bytes;
      if (update.consumption_bytes || update.consumption_bytes === 0) query.$set.consumption_bytes = update.consumption_bytes;

      const updated_doc = await applyMongoFilters(Model.findByIdAndUpdate(_id, query, { new: true }), filters)
        .lean()
        .exec();
      if (!updated_doc) throw new Error("Bucket not updated");

      return NO_CONTENT;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static uploadObject = async (
    bucket_id: string,
    file: Express.Multer.File,
    object_name?: string,
    from_source?: string
  ): Promise<ApiResponse> => {
    try {
      var valid: boolean | SimpleError = isValidObjectId(bucket_id);
      if (!valid) return { ...BAD, message: `Invalid bucket_id ${bucket_id}` };

      const bucket = await this.getBucketById(bucket_id, { fields: ["name", "object_count", "consumption_bytes"] });
      if (bucket.error) return bucket;

      const bucket_name = bucket.data.name;
      const file_name = object_name || file.originalname;
      valid = Validation.isValidObjectName(file_name);
      if (valid.error) return { ...BAD, message: valid.message };

      const file_path = file.path;
      const file_size = fs.statSync(file_path).size;
      const bucket_exists = await Minio.getBucketExists(bucket_name);
      if (bucket_exists.error) return bucket_exists;
      else if (bucket_exists.status !== OK.status) return NOT_FOUND;

      const object_exists = await Minio.getObjectExists(file_name, bucket_name);
      if (object_exists.error) return object_exists;
      else if (object_exists.status === OK.status) return { ...CONFLICT, message: `Object name ${object_name} already exists` };

      var upload = await Minio.uploadObject(bucket_name, file, object_name, from_source);
      if (upload.error) return upload;

      const update = { object_count: bucket.data.object_count + 1, consumption_bytes: bucket.data.consumption_bytes + file_size };
      const updated_mongo_bucket = await this.updateBucketById(bucket_id, update);
      if (updated_mongo_bucket.error) {
        const res = {
          ...PARTIAL_UPDATE,
          message: `Object ${file_name} created in minio bucket ${bucket_name}. but failed to update mongo bucket ${bucket_id} data - ${updated_mongo_bucket.message}`,
        };
        logError(res);
        return res;
      }

      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };
}
