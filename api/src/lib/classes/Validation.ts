import MimeTypes from "../mimeTypes";

export default class Validation {
  // --------------------------------------------------------------------------
  // Private Static Constants
  // --------------------------------------------------------------------------
  private static default_error_response: SimpleError = { error: false, message: "" };

  // --------------------------------------------------------------------------
  // Public Static Functions
  // --------------------------------------------------------------------------
  public static isValidBucketName = (bucket_name: string): SimpleError => {
    const res: SimpleError = { ...this.default_error_response };
    const pattern = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9.-]{1,61}[a-zA-Z0-9]$/);
    if (!bucket_name || bucket_name.length < 3 || bucket_name.length > 63) res.message = `Bucket name ${bucket_name} must have a length between 3 & 63 characters long`;
    if (bucket_name.includes("..")) res.message = `Bucket name ${bucket_name} must not contain consecutive '.' characters`;
    if (!pattern.test(bucket_name)) {
      res.message = `Bucket name ${bucket_name} is not valid. It must only contain only upper & lowercase letters, numbers, '.', '-' & must start & end with a letter or number`;
    }

    if (res.message) res.error = true;
    return res;
  };

  public static isValidCompanyName = (company_name: string): SimpleError => {
    const res: SimpleError = { ...this.default_error_response };
    const pattern = new RegExp(/^[A-Za-z0-9][A-Za-z0-9.-]{1,61}[A-Za-z0-9]$/);
    if (!company_name || company_name.length < 3 || company_name.length > 63) res.message = `Company name ${company_name} must have a length between 3 & 63 characters long`;
    if (!pattern.test(company_name)) {
      res.message = `Company name ${company_name} is not valid. It must only contain only upper & lowercase letters, numbers, '.', '-' & must start & end with a letter or number`;
    }

    if (res.message) res.error = true;
    return res;
  };

  public static isValidMimeType = (file: Express.Multer.File): SimpleError => {
    const mime_type = file.mimetype;
    const res: SimpleError = { ...this.default_error_response };
    if (!mime_type || !MimeTypes.includes(mime_type)) res.message = `Mimetype for file ${file.filename} is invalid`;
    if (res.message) res.error = true;
    return res;
  };

  public static isValidName = (name: string): SimpleError => {
    const res: SimpleError = { ...this.default_error_response };
    const pattern = new RegExp(/^[A-Za-z][A-Za-z\-]{1,61}[A-Aa-z]$/);
    if (!name || name.length < 3 || name.length > 63) res.message = `Name ${name} must have a length between 3 & 63 characters long`;
    if (!pattern.test(name)) {
      res.message = `Name ${name} is not valid. It must only contain only upper & lowercase letters, '-' & must start & end with a letter`;
    }

    if (res.message) res.error = true;
    return res;
  };

  public static isValidObjectName = (object_name: string): SimpleError => {
    const res: SimpleError = { ...this.default_error_response };
    const byte_length = Buffer.byteLength(object_name, "utf8");
    const unsafe_chars_pattern = new RegExp(/[\x00-\x1F\x7F]/);
    if (!object_name || typeof object_name !== "string") res.message = "Object name must be a non-empty string";
    if (byte_length < 1 || byte_length > 1024) res.message = `Object name "${object_name}" must be between 1 & 1024 bytes`;
    if (unsafe_chars_pattern.test(object_name)) res.message = `Object name "${object_name}" contains unsafe or non-printable characters`;
    if (res.message) res.error = true;
    return res;
  };

  public static isValidUsername = (username: string): SimpleError => {
    const res: SimpleError = { ...this.default_error_response };
    const pattern = new RegExp(/^[A-Za-z0-9][A-Za-z0-9_-]{1,61}[A-Za-z0-9]$/);
    if (!username || username.length < 3 || username.length > 63) res.message = `Username ${username} must have a length between 3 & 63 characters long`;
    if (!pattern.test(username)) {
      res.message = `Username ${username} is not valid. It must only contain only upper & lowercase letters, '_', '-' & must start & end with a letter or number`;
    }

    if (res.message) res.error = true;
    return res;
  };

  public static parseJSON = (value: any): string | null => {
    try {
      return JSON.parse(value);
    } catch (err: any) {
      return null;
    }
  };

  public static stringifyJSON = (value: any): string | null => {
    try {
      return JSON.stringify(value);
    } catch (err: any) {
      return null;
    }
  };
}
