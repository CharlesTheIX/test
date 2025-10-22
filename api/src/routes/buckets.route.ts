import fs from "fs";
import multer from "multer";
import logError from "../lib/logError";
import Bucket from "../lib/classes/Bucket";
import { SERVER_ERROR, BAD } from "../globals";
import Validation from "../lib/classes/Validation";
import express, { Router, Request, Response } from "express";

// ----------------------------------------------------------------------------
/* Public Router */
// ----------------------------------------------------------------------------
const router: Router = express.Router();
const upload = multer({ dest: "/tmp" });

router.route("/").post(async (request: Request, response: Response) => {
  const { filters } = request.body;

  try {
    const res = await Bucket.listBuckets(filters);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/by-company-id").post(async (request: Request, response: Response) => {
  const { company_id, filters } = request.body;
  if (!company_id) return response.json({ ...BAD, message: "Missing required value(s): company_id" });

  try {
    const res = await Bucket.listBucketsByCompanyId(company_id, filters);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/by-id").delete(async (request: Request, response: Response) => {
  const { bucket_id } = request.body;
  if (!bucket_id) return response.json({ ...BAD, message: "Missing required value(s): bucket_id" });

  try {
    const res = await Bucket.removeBucketById(bucket_id);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/by-id").patch(async (request: Request, response: Response) => {
  const { bucket_id, update, filters } = request.body;
  if (!bucket_id || !update) return response.json({ ...BAD, message: "Missing required value(s): bucket_id, update" });

  try {
    const res = await Bucket.updateBucketById(bucket_id, update, filters);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/by-id").post(async (request: Request, response: Response) => {
  const { bucket_id, filters } = request.body;
  if (!bucket_id) return response.json({ ...BAD, message: "Missing required value(s): bucket_id" });

  try {
    const res = await Bucket.getBucketById(bucket_id, filters);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/by-name").post(async (request: Request, response: Response) => {
  const { bucket_name, filters } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Bucket.getBucketByName(bucket_name, filters);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/create").put(async (request: Request, response: Response) => {
  const { bucket_name, company_id, max_size_bytes, permissions } = request.body;
  if (!bucket_name || !max_size_bytes || !permissions || permissions.length === 0) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_name, max_size_bytes, permissions` });
  }

  try {
    const res = await Bucket.createBucket(bucket_name, max_size_bytes, company_id, permissions);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/exists").post(async (request: Request, response: Response) => {
  const { bucket_name } = request.body;
  if (!bucket_name) return response.json({ ...BAD, message: `Missing required value(s): bucket_name` });

  try {
    const res = await Bucket.getBucketExists(bucket_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/lifecycle").delete(async (request: Request, response: Response) => {
  const { bucket_id, identifier } = request.body;
  if (!bucket_id || !identifier) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id, identifier` });
  }

  try {
    const res = await Bucket.removeBucketLifecycle(bucket_id, identifier);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/lifecycle").patch(async (request: Request, response: Response) => {
  const { bucket_id, days, identifier, type, status, prefix } = request.body;
  if (!bucket_id || !days || !identifier || !type) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id, days, identifier, type, status, prefix` });
  }

  try {
    const res = await Bucket.addBucketLifecycle(bucket_id, identifier, type, status, days, prefix);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/lifecycle").post(async (request: Request, response: Response) => {
  const { bucket_id } = request.body;
  if (!bucket_id) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id` });
  }

  try {
    const res = await Bucket.getBucketLifecycles(bucket_id);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/tagging").delete(async (request: Request, response: Response) => {
  const { bucket_id, tag } = request.body;
  if (!bucket_id || !tag) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id, tag` });
  }

  try {
    const res = await Bucket.removeBucketTag(bucket_id, tag);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/tagging").patch(async (request: Request, response: Response) => {
  const { bucket_id, tag } = request.body;
  if (!bucket_id || !tag) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id, tag` });
  }

  try {
    const res = await Bucket.addBucketTag(bucket_id, tag);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/tagging").post(async (request: Request, response: Response) => {
  const { bucket_id } = request.body;
  if (!bucket_id) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id` });
  }

  try {
    const res = await Bucket.getBucketTags(bucket_id);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

// router.route("/object-lock-config").delete(async (request: Request, response: Response) => {
//   const { bucket_id, config } = request.body;
//   if (!bucket_id || !config) {
//     return response.json({ ...BAD, message: `Missing required value(s): bucket_id, config` });
//   }

//   try {
//     const res = await Bucket.removeBucketObjectLockConfig(bucket_id, config);
//     return response.json(res);
//   } catch (err: any) {
//     logError({ ...SERVER_ERROR, message: err.message });
//     return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
//   }
// });

router.route("/object-lock-config").patch(async (request: Request, response: Response) => {
  const { bucket_id, config } = request.body;
  if (!bucket_id || !config) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id, config` });
  }

  try {
    const res = await Bucket.addBucketObjectLockConfig(bucket_id, config);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/object-lock-config").post(async (request: Request, response: Response) => {
  const { bucket_id } = request.body;
  if (!bucket_id) {
    return response.json({ ...BAD, message: `Missing required value(s): bucket_id` });
  }

  try {
    const res = await Bucket.getBucketObjectLockConfig(bucket_id);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

// Objects
router.route("/objects").post(async (request: Request, response: Response) => {
  const { bucket_id } = request.body;
  if (!bucket_id) return response.json({ ...BAD, message: `Missing required value(s): bucket_id` });

  try {
    const res = await Bucket.listObjects(bucket_id);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/by-name").delete(async (request: Request, response: Response) => {
  const { bucket_id, object_name } = request.body;
  if (!bucket_id || !object_name) return response.json({ ...BAD, message: "Missing required value(s): bucket_id, object_name" });

  try {
    const res = await Bucket.removeObject(bucket_id, object_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/by-name").post(async (request: Request, response: Response) => {
  const { bucket_id, object_name } = request.body;
  if (!bucket_id || !object_name) return response.json({ ...BAD, message: "Missing required value(s): bucket_id, object_name" });

  try {
    const res = await Bucket.getObject(bucket_id, object_name);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

router.route("/objects/presigned-url").post(async (request: Request, response: Response): Promise<any> => {
  const { bucket_id, object_name, expiration_s, download } = request.body;
  if (!bucket_id || !object_name) {
    return response.json({ ...BAD, message: "Missing Required value(s): bucket_id, object_name." });
  }

  try {
    const res = await Bucket.getObjectPresignedUrl(bucket_id, object_name, expiration_s, download);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json(SERVER_ERROR);
  }
});

router.route("/objects/upload").put(upload.single("file"), async (request: Request, response: Response): Promise<any> => {
  const { bucket_id, object_name, from_source } = request.body;
  const file = request.file;
  if (!bucket_id || !file) {
    return response.json({ ...BAD, message: "Missing Required value(s): bucket_id, file." });
  }

  const valid_mimetype = Validation.isValidMimeType(file);
  if (valid_mimetype.error) {
    fs.unlinkSync(file.path);
    return response.json({ ...BAD, message: valid_mimetype.message });
  }

  try {
    const res = await Bucket.uploadObject(bucket_id, file, object_name, from_source);
    fs.unlinkSync(file.path);
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json(SERVER_ERROR);
  }
});

// ----------------------------------------------------------------------------
/* Admin Router */
// ----------------------------------------------------------------------------

router.route("/remove-all").delete(async (_, response: Response) => {
  try {
    const res = await Bucket.removeAllBuckets();
    return response.json(res);
  } catch (err: any) {
    logError({ ...SERVER_ERROR, message: err.message });
    return response.status(SERVER_ERROR.status).json({ ...SERVER_ERROR, data: err });
  }
});

export default router;
