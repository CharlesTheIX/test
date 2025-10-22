"use client";
import parseJSON from "@/lib/parseJSON";
import Storage from "@/lib/classes/Storage";
import { useRouter } from "next/navigation";
import validateRequest from "./validateRequest";
import { useRef, useState, useEffect } from "react";
import LoadingContainer from "@/components/LoadingIcon";
import { useToastContext } from "@/contexts/toastContext";
import SelectInput from "@/components/inputs/SelectInput";
import NumberInput from "@/components/inputs/NumberInput";
import ErrorContainer from "@/components/forms/ErrorContainer";
import getErrorResponseTitle from "@/lib/getErrorResponseTitle";
import ButtonContainer from "@/components/forms/ButtonContainer";
import CompletionContainer from "@/components/forms/CompletionContainer";
import { default_simple_error, default_toast_item, header_internal } from "@/globals";

type Props = {
  bucket_id: string;
  redirect?: string;
};

const storage_key = "bucket_lifecycle_creation_form_data";
const BucketObjectLockConfigForm: React.FC<Props> = (props: Props) => {
  const { bucket_id, redirect = `/buckets/${bucket_id}/lifecycles` } = props;
  const router = useRouter();
  const { setToastItems } = useToastContext();
  const form_ref = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  const [showPrefix, setShowPrefix] = useState<boolean>(false);
  const [error, setError] = useState<SimpleError>(default_simple_error);
  const [storageValue, setStorageValue] = useState<StorageValue | null>(null);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: boolean }>({});

  const handleFormSubmission = async (): Promise<void> => {
    const form = form_ref.current;
    if (!form) return;

    setLoading(true);
    setInputErrors({});
    setError(default_simple_error);
    const form_data = new FormData(form);
    const validity = form_data.get("validity") || "365";
    const unit = parseJSON(form_data.get("mode")?.toString());
    const mode = parseJSON(form_data.get("unit")?.toString());
    const request_data: any = {
      bucket_id,
      unit: unit?.value,
      mode: mode?.value,
      validity: parseInt(validity as string),
    };

    const validation = validateRequest(request_data);
    setInputErrors(validation.invalid_inputs);
    Storage.setStorageValue(storage_key, { ...request_data, unit, mode });
    if (validation.simple_error.error) {
      setLoading(false);
      return setError(validation.simple_error);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/object-lock-config`, {
        method: "PATCH",
        headers: header_internal,
        body: JSON.stringify(request_data),
      }).then((res: any) => res.json());

      if (response.error) {
        setLoading(false);
        return setError({ error: true, message: response.message, title: getErrorResponseTitle(response.status) });
      }

      Storage.clearStorageValue(storage_key);
      setToastItems((prev) => {
        const item: ToastItem = {
          ...default_toast_item,
          title: "Bucket object lock config set successfully",
        };
        const next = [...prev, item];
        return next;
      });

      if (redirect) return router.push(redirect);
      setComplete(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      return setError({ error: true, message: "An unexpected error occurred, please try again.", title: `Unexpected Error` });
    }
  };

  useEffect(() => {
    const saved_data = Storage.getStorageValue(storage_key);
    if (!saved_data) return;
    setStorageValue(saved_data);
  }, []);

  return (
    <form
      ref={form_ref}
      className={`hyve-form ${loading ? "loading" : ""}`}
      onSubmit={(event: any) => {
        event.preventDefault();
      }}
    >
      <div className="content-container">
        <div className="inputs">
          <div className="w-full flex flex-row gap-2 items-center justify-between">
            <SelectInput
              name="mode"
              label="Mode"
              required={true}
              error={!!inputErrors.mode}
              default_value={storageValue?.value?.mode || { value: "COMPLIANCE", label: "Compliance" }}
              options={[
                { value: "COMPLIANCE", label: "Compliance" },
                { value: "GOVERNANCE", label: "Governance" },
              ]}
            />

            <SelectInput
              name="unit"
              label="Unit"
              required={true}
              error={!!inputErrors.unit}
              default_value={storageValue?.value?.unit || { value: "Days", label: "Days" }}
              options={[
                { value: "Days", label: "Days" },
                { value: "Years", label: "Years" },
              ]}
            />

            <NumberInput
              min={1}
              step={1}
              max={365}
              name="validity"
              required={true}
              label="Validity"
              error={!!inputErrors.validity}
              default_value={storageValue?.value?.validity || 365}
            />
          </div>
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Set" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Bucket Object Lock Config Set Successfully" />}
    </form>
  );
};

export default BucketObjectLockConfigForm;
