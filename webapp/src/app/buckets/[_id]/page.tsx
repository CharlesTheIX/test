import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { colors, header_external } from "@/globals";
import { default_404_metadata, site_name } from "@/globals";
import DeleteDataButton from "@/components/buttons/DeleteDataButton";
import BucketDataCard from "@/components/cards/buckets/BucketDataCard";
import Cog from "@/components/svgs/Cog";

type Params = Promise<{ _id: string }>;

export const generateMetadata = async ({ params }: { params: Promise<Params> }): Promise<Metadata> => {
  const { _id } = await params;
  try {
    const res = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/by-id`, {
      method: "POST",
      headers: header_external,
      body: JSON.stringify({ bucket_id: _id }),
    }).then((res) => res.json());
    if (res.error) return default_404_metadata;
    return {
      title: `${res.data._id} | Buckets | ${site_name}`,
      description: `Some description here.`,
    };
  } catch (error: any) {
    return default_404_metadata;
  }
};

export const generateStaticParams = async (): Promise<Params[]> => {
  try {
    const res = await fetch(`${process.env.API_ENDPOINT}/v1/buckets`, {
      method: "POST",
      headers: header_external,
    }).then((res) => res.json());
    if (res.error) return [];
    const data = res.data.map((i: Partial<Bucket>) => ({ bucket_id: i._id }));
    return data;
  } catch (err: any) {
    console.error(err);
    return [];
  }
};

const Page = async ({ params }: { params: Params }): Promise<React.JSX.Element> => {
  const populate = ["company_id"];
  const fields = ["permissions", "name", "max_size_bytes", "consumption_bytes", "createdAt", "updatedAt", "company_id", "object_count"];
  const filters = { fields, populate };
  try {
    const { _id } = await params;
    const res = await fetch(`${process.env.API_ENDPOINT}/v1/buckets/by-id`, {
      method: "POST",
      headers: header_external,
      body: JSON.stringify({ bucket_id: _id, filters }),
    }).then((res) => res.json());
    if (res.error) return notFound();

    const data: Bucket = res.data;
    return (
      <main>
        <div className="buckets-dashboard">
          <aside>
            <nav>
              <ul>
                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/objects`}>Objects</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/tagging`}>Tagging</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/policies`}>Policies</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/encryption`}>Encryption</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/lifecycles`}>Lifecycles</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/versioning`}>Versioning</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/notifications`}>Notifications</Link>
                </li>

                <li>
                  <Cog size={16} primary_color={colors.green} />
                  <Link href={`/buckets/${_id}/object-lock-config`}>Object Lock Config</Link>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="w-full">
            <section>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div className="flex flex-row gap-2 items-center">
                  <h1>{data?.name}</h1>
                </div>

                <div className="flex flex-row gap-2 items-center">
                  <Link href={`/buckets/${data._id}/edit`} className="hyve-button">
                    Edit
                  </Link>

                  <DeleteDataButton data_key={data._id || ""} type="bucket" redirect="/buckets">
                    <p>Delete</p>
                  </DeleteDataButton>
                </div>
              </div>
            </section>

            <section>
              <BucketDataCard data={data} />
            </section>
          </div>
        </div>
      </main>
    );
  } catch (err: any) {
    console.error(err);
    return notFound();
  }
};
export default Page;
