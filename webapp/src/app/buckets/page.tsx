import Link from "next/link";
import { Metadata } from "next";
import { default_metadata, site_name } from "@/globals";
import PermissionsWrapper from "@/components/PermissionsWrapper";
import BucketsTable from "@/components/tables/buckets/BucketsTable";

export const metadata: Metadata = {
  ...default_metadata,
  title: `Buckets | ${site_name}`,
  description: "Some description here.",
};

const Page: React.FC = () => (
  <main>
    <section>
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <h1>Buckets</h1>
        </div>

        <PermissionsWrapper permissions={[9]}>
          <Link href="/buckets/create" className="hyve-button">
            Create New
          </Link>
        </PermissionsWrapper>
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
      <BucketsTable />
    </section>
  </main>
);
export default Page;
