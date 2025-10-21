"use client";
import Table from "../lib/Table";
import Bin from "@/components/svgs/Bin";
import Copy from "@/components/svgs/Copy";
import Storage from "@/lib/classes/Storage";
import formatBytes from "@/lib/formatBytes";
import { JSX, useEffect, useState } from "react";
import Button from "@/components/buttons/Button";
import Download from "@/components/svgs/Download";
import { useToastContext } from "@/contexts/toastContext";
import getBucketObjects from "@/lib/buckets/getBucketObjects";
import copyContentToClipboard from "@/lib/copyContentToClipboard";
import getObjectPresignedUrl from "@/lib/buckets/getObjectPresignedUrl";
import { colors, default_null_label, default_toast_item } from "@/globals";
import { getTableHeaders, getTableMongoFilters, getTableStorageKey } from "../lib/helpers";

type Props = {
  bucket_id: string;
};

const type = "objects";
const storage_key = getTableStorageKey(type);

const BucketObjectsTable: React.FC<Props> = (props: Props) => {
  const { bucket_id } = props;
  const { setToastItems } = useToastContext();
  const [list, setList] = useState<MinioObject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [meta, setMeta] = useState<Partial<ApiResponseMeta>>({});
  const [activeData, setActiveData] = useState<Partial<MinioObject>>({});
  const [headers, setHeaders] = useState<TableHeader[]>(getTableHeaders(type));
  const [filters, setFilters] = useState<ApiRequestFilters>(getTableMongoFilters(type));

  const downloadData = async (data_key: string): Promise<void> => {
    try {
      const res = await getObjectPresignedUrl(bucket_id, data_key, undefined, true);
      if (res.error) throw new Error(res.message);
      const a = document.createElement("a");
      a.href = res.data;
      a.download = "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setToastItems((prev) => {
        const new_item: ToastItem = {
          ...default_toast_item,
          title: "File downloaded",
        };
        const new_value = [...prev, new_item];
        return new_value;
      });
    } catch (err: any) {
      setToastItems((prev) => {
        const new_item: ToastItem = {
          ...default_toast_item,
          type: "error",
          title: "Failed to download file",
        };
        const new_value = [...prev, new_item];
        return new_value;
      });
    }
  };

  const getTableBody = (td: any, h: TableHeader): JSX.Element => {
    switch (h.value) {
      case "name":
        return (
          <td>
            <div
              style={{ display: "flex" }}
              className="flex-row justify-start items-center z-2 gap-2 link-text"
              onClick={(event: any) => {
                event.preventDefault();
                event.stopPropagation();
                const copied = copyContentToClipboard(td.name || "");
                setToastItems((prev) => {
                  const item: ToastItem = {
                    ...default_toast_item,
                    content: copied.message,
                    title: copied.title || "",
                    type: copied.error ? "error" : "success",
                  };
                  const next = [...prev, item];
                  return next;
                });
              }}
            >
              <Copy size={16} primary_color={colors.green} />
              <p>{td.name}</p>
            </div>
          </td>
        );

      case "size":
        return (
          <td>
            <p>{formatBytes(td.size, "KB")}</p>
          </td>
        );

      case "etag":
        return (
          <td>
            <p>{td.etag || default_null_label}</p>
          </td>
        );

      case "lastModified":
        return (
          <td>
            <p>{td.lastModified ? new Date(td.lastModified).toLocaleDateString() : default_null_label}</p>
          </td>
        );

      case "download":
        return (
          <td>
            <div
              style={{ display: "flex" }}
              className="flex-row justify-start items-center z-2 gap-2 link-text"
              onClick={async (event: any) => {
                event.preventDefault();
                event.stopPropagation();
                await downloadData(td.name);
              }}
            >
              <Download size={16} primary_color={colors.green} />
            </div>
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

  const getTableData = async (filters?: ApiRequestFilters): Promise<void> => {
    setLoading(true);

    try {
      const res = await getBucketObjects(bucket_id);
      if (res.error) throw new Error(res.message);
      if (res.data.length > 0) setList(res.data);
      setLoading(false);
      setMeta({ collection_count: res.data.length });
    } catch (err: any) {
      setList([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved_data = Storage.getStorageValue(storage_key);
    const saved_filters = saved_data?.value.filters || filters;
    const saved_headers = saved_data?.value.headers || headers;
    setHeaders(saved_headers);
    setFilters(saved_filters);

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
      modalOpen={modalOpen}
      activeData={activeData}
      setHeaders={setHeaders}
      setFilters={setFilters}
      setModalOpen={setModalOpen}
      getTableBody={getTableBody}
      getTableData={getTableData}
      setActiveData={setActiveData}
    />
  );
};

export default BucketObjectsTable;
