"use client";
import { useEffect, useState } from "react";
import getCompanies from "@/lib/companies/getCompanies";
import MultiSelectInput from "../multi/MultiSelectInput";

type Props = {
  name: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  slice_limit?: number;
  default_value?: Option[];
  onChange?: (event: any) => void;
};

const CompanyMultiDropdown: React.FC<Props> = (props: Props) => {
  var { name, label, error = false, disabled = false, required = false, onChange = () => {}, default_value = [], slice_limit } = props;
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCompanies({ fields: ["name"] });
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

export default CompanyMultiDropdown;
