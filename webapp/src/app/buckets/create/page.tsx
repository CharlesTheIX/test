import Link from "next/link";
import { Metadata } from "next";
import { default_metadata, site_name } from "@/globals";
import BucketCreationForm from "@/components/forms/buckets/BucketCreationForm";

export const metadata: Metadata = {
  ...default_metadata,
  title: `Bucket Creation | ${site_name}`,
  description: "Some description here.",
};

const Page: React.FC = () => (
  <main>
    <section>
      <div className="flex flex-row gap-2 items-center justify-between">
        <h1>Bucket Creation</h1>

        <div className="flex flex-row gap-2 items-center">
          <Link href={`/buckets`} className="hyve-button cancel">
            Back
          </Link>
        </div>
      </div>
    </section>

    <section className="pb-8">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis officiis laborum quaerat, ea, soluta aliquid porro delectus labore eos ad distinctio commodi, dignissimos
        harum? Delectus ut odit nam amet dolore? Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate iure eum amet, veritatis dicta ea natus pariatur nobis nisi ut
        consequuntur temporibus blanditiis vel? Nisi optio praesentium ab laborum deleniti. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero mollitia quos
        perspiciatis! Dicta officia neque reprehenderit illum iure eos ratione fugit non ducimus quidem! Temporibus reprehenderit autem magnam optio nisi.
      </p>
    </section>

    <section>
      <BucketCreationForm />
    </section>
  </main>
);
export default Page;
