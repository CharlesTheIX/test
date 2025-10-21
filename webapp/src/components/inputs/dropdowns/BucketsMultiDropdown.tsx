"use client";
import { useEffect, useState } from "react";
import getBuckets from "@/lib/buckets/getBuckets";
import MultiSelectInput from "../multi/MultiSelectInput";
import getBucketsByCompanyId from "@/lib/buckets/getBucketsByCompanyId";

type Props = {
  name: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  company_id?: string;
  slice_limit?: number;
  default_value?: Option[];
  onChange?: (event: any) => void;
};

const BucketMultiDropdown: React.FC<Props> = (props: Props) => {
  var {
    name,
    label,
    company_id,
    error = false,
    slice_limit = 4,
    disabled = false,
    required = false,
    default_value = [],
    onChange = () => {},
  } = props;
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      try {
        var res;
        if (company_id) res = await getBucketsByCompanyId(company_id, { fields: ["name"] });
        else res = await getBuckets({ fields: ["name"] });
        if (res.error) return;
        if (res.data.length > 0) setOptions(res.data.map((i: Partial<Company>) => ({ value: i._id, label: i.name })));
      } catch (err: any) {
        return;
      }
    })();
  }, []);

  return (
    <MultiSelectInput
      name={name}
      label={label}
      error={error}
      options={options}
      required={required}
      disabled={disabled}
      onChange={onChange}
      slice_limit={slice_limit}
      default_value={default_value}
    />
  );
};

export default BucketMultiDropdown;
