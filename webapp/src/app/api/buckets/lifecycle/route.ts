import { NextRequest, NextResponse } from "next/server";
import { header_external, SERVER_ERROR } from "@/globals";

export async function DELETE(request: NextRequest) {
  try {
    const { bucket_id, identifier } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/lifecycle`, {
      method: "DELETE",
      headers: header_external,
      body: JSON.stringify({ bucket_id, identifier }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { days, lifecycle_prefix, identifier, lifecycle_type, lifecycle_status, bucket_id } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/lifecycle`, {
      method: "PATCH",
      headers: header_external,
      body: JSON.stringify({ days, identifier, type: lifecycle_type, status: lifecycle_status, prefix: lifecycle_prefix, bucket_id }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bucket_id } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/lifecycle`, {
      method: "POST",
      headers: header_external,
      body: JSON.stringify({ bucket_id }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}
