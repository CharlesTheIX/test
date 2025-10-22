import Link from "next/link";
import { Metadata } from "next";
import Cog from "@/components/svgs/Cog";
import { notFound } from "next/navigation";
import { colors, header_external } from "@/globals";
import { default_404_metadata, site_name } from "@/globals";
import DeleteDataButton from "@/components/buttons/DeleteDataButton";
import BucketDataCard from "@/components/cards/buckets/BucketDataCard";

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
        <div className="w-full">
          <section>
            <div className="flex flex-row gap-2 items-center justify-between">
              <h1>Bucket: {data?.name}</h1>

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

          <section className="pb-8">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis officiis laborum quaerat, ea, soluta aliquid porro delectus labore eos ad
              distinctio commodi, dignissimos harum? Delectus ut odit nam amet dolore? Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptate iure eum amet, veritatis dicta ea natus pariatur nobis nisi ut consequuntur temporibus blanditiis vel? Nisi optio praesentium
              ab laborum deleniti. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero mollitia quos perspiciatis! Dicta officia neque
              reprehenderit illum iure eos ratione fugit non ducimus quidem! Temporibus reprehenderit autem magnam optio nisi.
            </p>
          </section>

          <section>
            <div className="bucket-dashboard">
              <aside>
                <nav>
                  <ul>
                    <li>
                      <Link href={`/buckets/${_id}/objects`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Objects</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/tagging`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Tagging</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/policies`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Policies</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/encryption`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Encryption</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/lifecycles`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Lifecycles</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/versioning`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Versioning</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/notifications`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Notifications</p>
                      </Link>
                    </li>

                    <li>
                      <Link href={`/buckets/${_id}/object-lock-config`}>
                        <Cog size={16} primary_color={colors.green} />
                        <p>Object Lock Config</p>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </aside>

              <BucketDataCard data={data} />
            </div>
          </section>
        </div>
      </main>
    );
  } catch (err: any) {
    console.error(err);
    return notFound();
  }
};
export default Page;
