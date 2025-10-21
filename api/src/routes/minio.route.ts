import fs from "fs";
import multer from "multer";
import logError from "../lib/logError";
import Minio from "../lib/classes/Minio";
import { SERVER_ERROR, BAD } from "../globals";
import Validation from "../lib/classes/Validation";
import express, { Router, Request, Response } from "express";

// ----------------------------------------------------------------------------
// Admin Router
// ----------------------------------------------------------------------------
const router: Router = express.Router();
const upload = multer({ dest: "/tmp" });

// Buckets
router.route("/buckets").post(async (_, response: Response) => {
  try {
    const res = await Minio.listBuckets();
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/by-name").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeBucket(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/by-name").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucket(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/create").put(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.createBucket(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/encryption").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeBucketEncryption(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/encryption").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketEncryption(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/encryption").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.setBucketEncryption(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/exists").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketExists(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/incomplete-uploads").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.listIncompleteUploads(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/lifecycle").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeBucketLifecycle(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/lifecycle").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketLifecycle(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/lifecycle").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name || !config) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, config` });

  try {
    const res = await Minio.setBucketLifecycle(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/notification").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeAllBucketNotifications(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/notification").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketNotification(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/notification").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name || !config) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, config` });

  try {
    const res = await Minio.setBucketNotification(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/object-lock-config").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketObjectLockConfig(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/object-lock-config").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name || !config) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, config` });

  try {
    const res = await Minio.setBucketObjectLockConfig(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/policy").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketPolicy(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/policy").put(async (request: Request, response: Response) => {
  const { bucket_name, policy } = request.body;
  if (!bucket_name || !policy) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, policy` });

  try {
    const res = await Minio.setBucketPolicy(bucket_name, policy);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/replication").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeBucketReplication(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/replication").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name || !config) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, config` });

  try {
    const res = await Minio.setBucketReplication(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/size").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketSize(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/tagging").delete(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.removeBucketTagging(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/tagging").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketTagging(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/tagging").put(async (request: Request, response: Response) => {
  const { bucket_name, tags } = request.body;
  if (!bucket_name || !tags) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, tags` });

  try {
    const res = await Minio.setBucketTagging(bucket_name, tags);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/versioning").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.getBucketVersioning(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/buckets/versioning").put(async (request: Request, response: Response) => {
  const { bucket_name, config } = request.body;
  if (!bucket_name || !config) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, config` });

  try {
    const res = await Minio.setBucketVersioning(bucket_name, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

// Objects
router.route("/objects").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Minio.listObjects(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/by-name").delete(async (request: Request, response: Response) => {
  const { bucket_name, object_name } = request.body;
  if (!bucket_name || !object_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, object_name` });

  try {
    const res = await Minio.removeObject(object_name, bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/by-name").post(async (request: Request, response: Response) => {
  const { bucket_name, object_name } = request.body;
  if (!bucket_name || !object_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, object_name` });

  try {
    const res = await Minio.getObject(object_name, bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/copy").put(async (request: Request, response: Response) => {
  const { src, dest } = request.body;
  if (!src || !dest) return response.json({ ...BAD, message: `Missing required value(s): src, dest` });

  try {
    const res = await Minio.copyObject({ src, dest });
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/exists").post(async (request: Request, response: Response) => {
  const { bucket_name, object_name } = request.body;
  if (!bucket_name || !object_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name, object_name` });

  try {
    const res = await Minio.getObjectExists(object_name, bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/presigned-url").post(async (request: Request, response: Response) => {
  const { bucket_name, object_name, expires_s, download } = request.body;
  if (!bucket_name || !object_name) {
    return response.json({ ...BAD, message: "Missing Required value(s): bucket_name, object_url." });
  }

  try {
    const res = await Minio.getObjectPresignedUrl(object_name, bucket_name, expires_s, download);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json(SERVER_ERROR);
  }
});

router.route("/objects/upload").put(upload.single("file"), async (request: Request, response: Response) => {
  const { bucket_name, object_name, from_source } = request.body;
  const file = request.file;
  if (!bucket_name || !file) return response.json({ ...BAD, message: "Missing Required value(s): bucket_name, file." });

  const valid_mimetype = Validation.isValidMimeType(file);
  if (valid_mimetype.error) {
    fs.unlinkSync(file.path);
    return response.json({ ...BAD, message: valid_mimetype.message });
  }

  try {
    const res = await Minio.uploadObject(bucket_name, file, object_name, from_source);
    fs.unlinkSync(file.path);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json(SERVER_ERROR);
  }
});

export default router;
