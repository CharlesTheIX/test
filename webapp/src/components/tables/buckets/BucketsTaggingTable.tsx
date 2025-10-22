"use client";
import Bin from "@/components/svgs/Bin";
import Button from "@/components/buttons/Button";
import { JSX, useEffect, useState } from "react";
import Table from "@/components/tables/lib/Table";
import { colors, default_null_label } from "@/globals";
import getBucketTags from "@/lib/buckets/getBucketTags";
import { getTableHeaders, getTableMongoFilters } from "@/components/tables/lib/helpers";

type Props = {
  bucket_id: string;
};

const type = "bucket_tagging";

const BucketsTaggingTable: React.FC<Props> = (props: Props) => {
  const { bucket_id } = props;
  const [list, setList] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [meta, setMeta] = useState<Partial<ApiResponseMeta>>({});
  const [headers, setHeaders] = useState<TableHeader[]>(getTableHeaders(type));
  const [filters, setFilters] = useState<ApiRequestFilters>(getTableMongoFilters(type));

  const getTableBody = (td: any, h: TableHeader): JSX.Element => {
    switch (h.value) {
      case "Key":
        return (
          <td>
            <p>{td.Key ? td.Key : default_null_label}</p>
          </td>
        );

      case "Value":
        return (
          <td>
            <p>{td.Value ? td.Value : default_null_label}</p>
          </td>
        );

      case "delete":
        return (
          <td>
            <div className="z-2 delete-button">
              <Button
                type="remove"
                callback={() => {
                  setActiveData({ ID: `${td.Key}` });
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
      const res = await getBucketTags(bucket_id);
      if (res.error) throw new Error(res.message);

      if (!res.data) {
        setList([]);
        setMeta({ collection_count: 0 });
      } else {
        setList(res.data);
        setMeta({ collection_count: res.data.length });
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

export default BucketsTaggingTable;
