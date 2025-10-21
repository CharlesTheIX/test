import { NextRequest, NextResponse } from "next/server";
import { header_external, SERVER_ERROR } from "@/globals";

export async function POST(request: NextRequest) {
  try {
    const { bucket_id, object_name, expiration_s, download } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/objects/presigned-url`, {
      method: "POST",
      headers: header_external,
      body: JSON.stringify({ bucket_id, object_name, expiration_s, download }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}
