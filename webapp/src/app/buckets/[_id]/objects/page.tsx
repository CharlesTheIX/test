import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { header_external } from "@/globals";
import { default_404_metadata, site_name } from "@/globals";
import PermissionsWrapper from "@/components/PermissionsWrapper";
import BucketObjectsTable from "@/components/tables/buckets/BucketObjectsTable";

type Params = Promise<{ _id: string }>;

export const revalidate = 3600; // seconds (1 hour)

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
      title: `${res.data._id} | Edit | ${site_name}`,
      description: `Some description here.`,
    };
  } catch (error: any) {
    return default_404_metadata;
  }
};

export const generateStaticParams = async (): Promise<{ _id: string }[]> => {
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
        <section>
          <div className="flex flex-row gap-2 items-center justify-between">
            <h1>{data.name}: Objects</h1>

            <div className="flex flex-row gap-2 items-center">
              <PermissionsWrapper permissions={[9]}>
                <Link href={`/buckets/${data._id}/upload`} className="hyve-button">
                  Upload
                </Link>
              </PermissionsWrapper>

              <Link href={`/buckets/${data._id}`} className="hyve-button cancel">
                Back
              </Link>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis officiis laborum quaerat, ea, soluta aliquid porro delectus labore eos ad
            distinctio commodi, dignissimos harum? Delectus ut odit nam amet dolore? Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptate iure eum amet, veritatis dicta ea natus pariatur nobis nisi ut consequuntur temporibus blanditiis vel? Nisi optio praesentium ab
            laborum deleniti. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero mollitia quos perspiciatis! Dicta officia neque
            reprehenderit illum iure eos ratione fugit non ducimus quidem! Temporibus reprehenderit autem magnam optio nisi.
          </p>
        </section>

        <section>
          <BucketObjectsTable bucket_id={data._id} />
        </section>
      </main>
    );
  } catch (err: any) {
    console.error(err);
    return notFound();
  }
};
export default Page;
