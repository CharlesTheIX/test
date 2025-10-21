import { header_internal, SERVER_ERROR } from "@/globals";

export default async (bucket_id: string, object_name: string): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/objects/by-id`, {
      method: "DELETE",
      headers: header_internal,
      body: JSON.stringify({ bucket_id, object_name }),
    }).then((r) => r.json());
    return res;
  } catch (err: any) {
    return { ...SERVER_ERROR, data: err };
  }
};
