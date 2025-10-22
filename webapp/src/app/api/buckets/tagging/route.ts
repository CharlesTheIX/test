import { NextRequest, NextResponse } from "next/server";
import { header_external, SERVER_ERROR } from "@/globals";

export async function DELETE(request: NextRequest) {
  try {
    const { bucket_id, tag } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/tagging`, {
      method: "DELETE",
      headers: header_external,
      body: JSON.stringify({ bucket_id, tag }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tag, bucket_id } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/tagging`, {
      method: "PATCH",
      headers: header_external,
      body: JSON.stringify({ tag, bucket_id }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bucket_id } = await request.json();
    const response = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/tagging`, {
      method: "POST",
      headers: header_external,
      body: JSON.stringify({ bucket_id }),
    }).then((res) => res.json());
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ ...SERVER_ERROR, data: err });
  }
}
