import { header_internal, SERVER_ERROR } from "@/globals";

export default async (bucket_id: string, identifier: string): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/lifecycle`, {
      method: "DELETE",
      headers: header_internal,
      body: JSON.stringify({ bucket_id, identifier }),
    }).then((r) => r.json());
    return res;
  } catch (err: any) {
    return { ...SERVER_ERROR, data: err };
  }
};
