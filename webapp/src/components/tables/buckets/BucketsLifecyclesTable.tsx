"use client";
import Bin from "@/components/svgs/Bin";
import Button from "@/components/buttons/Button";
import { JSX, useEffect, useState } from "react";
import Table from "@/components/tables/lib/Table";
import { colors, default_null_label } from "@/globals";
import { useToastContext } from "@/contexts/toastContext";
import getBucketLifecycles from "@/lib/buckets/getBucketLifecycles";
import { getTableHeaders, getTableMongoFilters } from "@/components/tables/lib/helpers";

type Props = {
  bucket_id: string;
};

const type = "bucket_lifecycle";

const BucketsLifecyclesTable: React.FC<Props> = (props: Props) => {
  const { bucket_id } = props;
  const { setToastItems } = useToastContext();
  const [list, setList] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [meta, setMeta] = useState<Partial<ApiResponseMeta>>({});
  const [headers, setHeaders] = useState<TableHeader[]>(getTableHeaders(type));
  const [filters, setFilters] = useState<ApiRequestFilters>(getTableMongoFilters(type));

  const getTableBody = (td: any, h: TableHeader): JSX.Element => {
    switch (h.value) {
      case "ID":
        return (
          <td>
            <p>{td.ID ? td.ID : default_null_label}</p>
          </td>
        );

      case "Status":
        return (
          <td>
            <p>{td.Status ? td.Status : default_null_label}</p>
          </td>
        );

      case "Filter":
        return (
          <td>
            <p>{td.Filter ? td.Filter.Prefix : default_null_label}</p>
          </td>
        );

      case "Expiration":
        return (
          <td>
            {td.Expiration && <p>{td.Expiration.Days}</p>}
            {td.NoncurrentVersionExpiration && <p>{td.NoncurrentVersionExpiration.NoncurrentDays}</p>}
            {td.AbortIncompleteMultipartUpload && <p>{td.AbortIncompleteMultipartUpload.DaysAfterInitiation}</p>}
          </td>
        );

      case "delete":
        return (
          <td>
            <div className="z-2 delete-button">
              <Button
                type="remove"
                callback={() => {
                  setActiveData(td);
                  setModalOpen(true);
                }}
              >
                <Bin primary_color={colors.red} size={16} />
              </Button>
            </div>
          </td>
        );

      default:
        return <p>-</p>;
    }
  };

  const getTableData = async (): Promise<void> => {
    setLoading(true);

    try {
      const res = await getBucketLifecycles(bucket_id);
      if (res.error) throw new Error(res.message);

      if (!res.data) {
        setList([]);
        setMeta({ collection_count: 0 });
      } else if (Array.isArray(res.data.Rule)) {
        setList(res.data.Rule);
        setMeta({ collection_count: res.data.Rule.length });
      } else {
        setList([res.data.Rule]);
        setMeta({ collection_count: 1 });
      }

      setLoading(false);
    } catch (err: any) {
      setList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => await getTableData())();
  }, []);

  return (
    <Table
      type={type}
      list={list}
      meta={meta}
      _id={bucket_id}
      filters={filters}
      loading={loading}
      headers={headers}
      show_filters={false}
      modalOpen={modalOpen}
      activeData={activeData}
      setHeaders={setHeaders}
      setFilters={setFilters}
      show_pagination={false}
      setModalOpen={setModalOpen}
      getTableBody={getTableBody}
      getTableData={getTableData}
      setActiveData={setActiveData}
    />
  );
};

export default BucketsLifecyclesTable;
