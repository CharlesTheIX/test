import { header_internal, SERVER_ERROR } from "@/globals";

export default async (bucket_id: string, object_name: string, expiration_s?: number, download: boolean = false): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/objects/presigned-url`, {
      method: "POST",
      headers: header_internal,
      body: JSON.stringify({ bucket_id, object_name, expiration_s, download }),
    }).then((r) => r.json());
    return res;
  } catch (err: any) {
    return { ...SERVER_ERROR, data: err };
  }
};
