/* A */
type ApiFilters = {
  skip: number;
  limit: number;
  fields: string[];
  populate: string[];
  sort: { order: "asc" | "desc"; field: string };
};

type ApiMeta = {
  collection_count: number;
};

type ApiResponse = {
  data: any;
  error: boolean;
  status: number;
  message: string;
  meta?: Partial<ApiMeta>;
};

/* B */
type BucketData = MongoDoc & {
  name: string;
  company_id: string;
  object_count: number;
  max_size_bytes: number;
  consumption_bytes: number;
  permissions: BucketPermission[];
};

type BucketPermission = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/* C */
type CompanyData = MongoDoc & {
  name: string;
  user_ids: string[];
  bucket_ids: string[];
};

/* E */
type ErrorLog = {
  message: string;
  status_code: number;
};

/* M */
type MongoDoc = {
  _id: string;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};

type MongoProjection = {
  [key: string]: 1 | 0;
};

/* S */
type SimpleError = { error: boolean; message: string };

/* U */
type UserData = MongoDoc & {
  surname: string;
  username: string;
  first_name: string;
  company_id: string;
  permissions: BucketPermission[];
};
