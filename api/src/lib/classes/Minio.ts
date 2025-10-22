import fs from "fs";
import Validation from "./Validation";
import getEnvVars from "../getEnvVars";
import handleError from "../handleError";
import { BAD, CONFLICT, DB_UPDATED, FORBIDDEN, NO_CONTENT, NOT_FOUND, OK } from "../../globals";
import { Client, CopyDestinationOptions, CopySourceOptions, NotificationConfig, RemoveOptions } from "minio";
import {
  ObjectLockInfo,
  LifecycleConfig,
  EncryptionConfig,
  type RETENTION_MODES,
  PreSignRequestParams,
  ReplicationConfigOpts,
  BucketVersioningConfiguration,
} from "minio/dist/main/internal/type";

export default class Minio {
  // --------------------------------------------------------------------------
  // Private Static Constants
  // --------------------------------------------------------------------------
  private static bucket_creation_default_options = { region: getEnvVars().minio.region, makeOptions: { ObjectLocking: false } };
  private static bucket_SSE_encryption: EncryptionConfig = { Rule: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }] };
  private static bucket_versioning_default: BucketVersioningConfiguration = { Status: "Enabled", ExcludedPrefixes: [], ExcludeFolders: false };
  private static list_objects_default_options = { prefix: "", recursive: false };
  private static remove_object_default_options = {};

  // --------------------------------------------------------------------------
  // Private Static Functions
  // --------------------------------------------------------------------------
  private static getClient = (): Client => {
    const vars = getEnvVars().minio;
    return new Client({
      useSSL: vars.use_SSL,
      port: Number(vars.port),
      endPoint: vars.endpoint,
      accessKey: vars.access_key,
      secretKey: vars.secret_key,
    });
  };

  // --------------------------------------------------------------------------
  // Public Static Functions
  // --------------------------------------------------------------------------
  /* C */
  public static createBucket = async (bucket_name: string, options = { ...this.bucket_creation_default_options }): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error && exists_res.status !== NOT_FOUND.status) return exists_res;
      else if (exists_res.status === OK.status) return { ...CONFLICT, message: `Bucket name ${bucket_name} already exists` };

      const client = this.getClient();
      const { region, makeOptions } = options;
      await client.makeBucket(bucket_name, region, makeOptions);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static copyObject = async (props: {
    src: { bucket_name: string; object_name: string };
    dest: { bucket_name: string; object_name: string };
  }): Promise<ApiResponse> => {
    const { src, dest } = props;

    try {
      var exists_res = await this.getBucketExists(src.bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getBucketExists(dest.bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getObjectExists(src.object_name, src.bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getObjectExists(dest.object_name, dest.bucket_name);
      if (exists_res.error && exists_res.status !== NOT_FOUND.status) return exists_res;
      else if (exists_res.status === OK.status) return { ...CONFLICT, message: `Object name ${dest.object_name} already exists` };

      const client = this.getClient();
      const source = new CopySourceOptions({ Bucket: src.bucket_name, Object: src.object_name });
      const destination = new CopyDestinationOptions({ Bucket: dest.bucket_name, Object: dest.object_name });
      await client.copyObject(source, destination);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* G */
  public static getBucket = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const res = await client.listBuckets();
      const data = res.find((i) => i.name === bucket_name);
      if (!data) return NOT_FOUND;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketEncryption = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.getBucketEncryption(bucket_name);
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "ServerSideEncryptionConfigurationNotFoundError") return { ...NOT_FOUND, message: err.message };
      return handleError(err);
    }
  };

  public static getBucketExists = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const valid = Validation.isValidBucketName(bucket_name);
      if (valid.error) return { ...BAD, message: valid.message };

      const client = this.getClient();
      const data = !!(await client.bucketExists(bucket_name));
      if (!data) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketLifecycle = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.getBucketLifecycle(bucket_name);
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NoSuchLifecycleConfiguration") return { ...NO_CONTENT, message: err.message };
      return handleError(err);
    }
  };

  public static getBucketNotification = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.getBucketNotification(bucket_name);
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketObjectLockConfig = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await new Promise<ObjectLockInfo | null>((resolve, reject) => {
        client.getObjectLockConfig(bucket_name, (err, res) => {
          if (err) return reject(err);
          resolve(res || null);
        });
      });
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "ObjectLockConfigurationNotFoundError") return { ...NO_CONTENT, message: err.message };
      return handleError(err);
    }
  };

  public static getBucketPolicy = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      var data: any = await client.getBucketPolicy(bucket_name);
      data = Validation.parseJSON(data);
      if (data === "") return NO_CONTENT;
      if (!data) throw new Error("Invalid bucket policy.");
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NoSuchBucketPolicy") return { ...NO_CONTENT, message: err.message };
      return handleError(err);
    }
  };

  public static getBucketSize = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await new Promise((resolve, reject) => {
        var total_size: number = 0;
        const stream = client.listObjectsV2(bucket_name, "", true);
        stream.on("data", (obj) => (total_size += obj.size));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(total_size));
      });

      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getBucketTagging = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.getBucketTagging(bucket_name);
      if (data.length === 0) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NoSuchTagSet") return { ...NO_CONTENT, message: err.message };
      return handleError(err);
    }
  };

  public static getBucketVersioning = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.getBucketVersioning(bucket_name);
      if (!data) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static getObject = async (object_name: string, bucket_name: string): Promise<ApiResponse> => {
    try {
      var exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getObjectExists(object_name, bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = await client.statObject(bucket_name, object_name);
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NotFound") return NOT_FOUND;
      return handleError(err);
    }
  };

  public static getObjectExists = async (object_name: string, bucket_name: string): Promise<ApiResponse> => {
    try {
      const valid = Validation.isValidObjectName(object_name);
      if (valid.error && valid.message) return { ...BAD, message: valid.message };

      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const data = !!(await client.statObject(bucket_name, object_name));
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NotFound") return NO_CONTENT;
      return handleError(err);
    }
  };

  public static getObjectPresignedUrl = async (
    object_name: string,
    bucket_name: string,
    expires_s: number = 3600,
    download: boolean = false
  ): Promise<ApiResponse> => {
    try {
      var exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getObjectExists(object_name, bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const resHeaders: PreSignRequestParams = {};
      if (download) resHeaders["response-content-disposition"] = `attachment; filename="${object_name}"`;
      const data = await client.presignedGetObject(bucket_name, object_name, expires_s, resHeaders);
      return { ...OK, data };
    } catch (err: any) {
      if (err.code === "NoSuchBucket") return { ...NOT_FOUND, message: err.message };
      return handleError(err);
    }
  };

  /* L */
  public static listBuckets = async (): Promise<ApiResponse> => {
    try {
      const client = this.getClient();
      var data = await client.listBuckets();
      if (data.length === 0) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static listIncompleteUploads = async (
    bucket_name: string,
    options: any = { ...this.list_objects_default_options }
  ): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const { prefix, recursive } = options;
      const data = await new Promise<any[]>((resolve, reject) => {
        const objects: any[] = [];
        const stream = client.listIncompleteUploads(bucket_name, prefix, recursive);

        stream.on("data", (obj) => objects.push(obj));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(objects));
      });

      if (data.length === 0) return NO_CONTENT;
      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static listObjects = async (bucket_name: string, options: any = { ...this.list_objects_default_options }): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      const { prefix, recursive } = options;
      const data = await new Promise<any[]>((resolve, reject) => {
        const objects: any[] = [];
        const stream = client.listObjectsV2(bucket_name, prefix, recursive);

        stream.on("data", (obj) => objects.push(obj));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(objects));
      });

      return { ...OK, data };
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* R */
  public static removeAllBucketNotifications = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeAllBucketNotification(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucket = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeBucket(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      if (err.code === "BucketNotEmpty") return { ...FORBIDDEN, message: err.message };
      return handleError(err);
    }
  };

  public static removeBucketEncryption = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeBucketEncryption(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucketLifecycle = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeBucketLifecycle(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeBucketReplication = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeBucketReplication(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      if (err.code === "XMinioAdminRemoteTargetNotFoundError") return { ...NO_CONTENT, message: err.message };
      return handleError(err);
    }
  };

  public static removeBucketTagging = async (bucket_name: string): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeBucketTagging(bucket_name);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static removeObject = async (
    object_name: string,
    bucket_name: string,
    options: RemoveOptions = { ...this.remove_object_default_options }
  ): Promise<ApiResponse> => {
    try {
      var exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      exists_res = await this.getObjectExists(object_name, bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.removeObject(bucket_name, object_name, options);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* S */
  //TODO: figure out encryption
  public static setBucketEncryption = async (bucket_name: string, config?: EncryptionConfig): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.setBucketEncryption(bucket_name, config);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketLifecycle = async (bucket_name: string, config: LifecycleConfig): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.setBucketLifecycle(bucket_name, config);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  //TODO: figure out notifications
  public static setBucketNotification = async (bucket_name: string, config: NotificationConfig): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.setBucketNotification(bucket_name, config);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketObjectLockConfig = async (bucket_name: string, config: Omit<ObjectLockInfo, "objectLockEnabled">): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      client.setObjectLockConfig(bucket_name, config);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketPolicy = async (bucket_name: string, policy: any): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const stringed_policy = Validation.stringifyJSON(policy);
      if (!stringed_policy) return { ...BAD, message: "Invalid bucket policy" };

      const client = this.getClient();
      client.setBucketPolicy(bucket_name, stringed_policy);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketReplication = async (bucket_name: string, config: ReplicationConfigOpts): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      client.setBucketReplication(bucket_name, config);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketTagging = async (bucket_name: string, tags: any): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.setBucketTagging(bucket_name, tags);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  public static setBucketVersioning = async (bucket_name: string, config: BucketVersioningConfiguration): Promise<ApiResponse> => {
    try {
      const exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const client = this.getClient();
      await client.setBucketVersioning(bucket_name, this.bucket_versioning_default);
      return OK;
    } catch (err: any) {
      return handleError(err);
    }
  };

  /* U */
  public static uploadObject = async (
    bucket_name: string,
    file: Express.Multer.File,
    object_name?: string,
    from_source?: string
  ): Promise<ApiResponse> => {
    try {
      var exists_res = await this.getBucketExists(bucket_name);
      if (exists_res.error) return exists_res;

      const file_name = object_name || file.originalname;
      const valid = Validation.isValidObjectName(file_name);
      if (valid.error && valid.message) return { ...BAD, message: valid.message };

      exists_res = await this.getObjectExists(file_name, bucket_name);
      if (exists_res.error && exists_res.status !== NOT_FOUND.status) return exists_res;
      else if (exists_res.status === OK.status) return { ...CONFLICT, message: `Object name ${object_name} already exists` };

      const file_path = file.path;
      const file_size = fs.statSync(file_path).size;
      const file_stream = fs.createReadStream(file_path);
      const metaData = {
        "Content-Type": file.mimetype,
        "X-Amz-Meta-Uploaded-From": from_source || "unknown",
      };

      const client = this.getClient();
      const info = await client.putObject(bucket_name, file_name, file_stream, file_size, metaData);
      if (!info) throw new Error(`Failed to upload object ${file_name} to bucket ${bucket_name}.`);
      return DB_UPDATED;
    } catch (err: any) {
      return handleError(err);
    }
  };
}
