import { null_option } from "@/globals";
import SelectInput from "../SelectInput";
import BucketSizes from "@/lib/classes/BucketSizes";

type Props = {
  name: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  default_value?: Option;
  onChange?: (event: any) => void;
};

const BucketSizeDropdown: React.FC<Props> = (props: Props) => {
  var { name, label, error = false, disabled = false, required = false, onChange = () => {}, default_value = null_option } = props;
  const options = BucketSizes.getBucketSizeOptions();

  return <SelectInput name={name} label={label} error={error} options={options} required={required} disabled={disabled} onChange={onChange} default_value={default_value} />;
};

export default BucketSizeDropdown;
