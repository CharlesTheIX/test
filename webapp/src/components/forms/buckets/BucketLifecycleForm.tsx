"use client";
import parseJSON from "@/lib/parseJSON";
import Storage from "@/lib/classes/Storage";
import { useRouter } from "next/navigation";
import validateRequest from "./validateRequest";
import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
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
const BucketLifecycleForm: React.FC<Props> = (props: Props) => {
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
    const days = form_data.get("days") || "365";
    const identifier = form_data.get("identifier")?.toString();
    const lifecycle_prefix = form_data.get("lifecycle_prefix");
    const lifecycle_type = parseJSON(form_data.get("lifecycle_type")?.toString());
    const lifecycle_status = parseJSON(form_data.get("lifecycle_status")?.toString());
    const request_data: any = {
      bucket_id,
      identifier,
      lifecycle_prefix,
      days: parseInt(days as string),
      lifecycle_type: lifecycle_type?.value,
      lifecycle_status: lifecycle_status.value === "enabled",
    };

    const validation = validateRequest(request_data);
    setInputErrors(validation.invalid_inputs);
    Storage.setStorageValue(storage_key, { ...request_data, lifecycle_type, identifier, lifecycle_status });
    if (validation.simple_error.error) {
      setLoading(false);
      return setError(validation.simple_error);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/lifecycle`, {
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
          title: "Bucket lifecycle created successfully",
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
              label="Type"
              required={true}
              name="lifecycle_type"
              error={!!inputErrors.lifecycle_type}
              default_value={storageValue?.value?.lifecycle_type}
              onChange={(evt: any) => setShowPrefix(!!(evt.value === "Expiration"))}
              options={[
                { value: "Expiration", label: "Expiration" },
                { value: "NoncurrentVersionExpiration", label: "Non-current Version Expiration" },
                { value: "AbortIncompleteMultipartUpload", label: "Abort Incomplete MultipartUpload" },
              ]}
            />

            <TextInput
              required={true}
              name="identifier"
              label="Identifier"
              error={!!inputErrors.identifier}
              default_value={storageValue?.value?.identifier}
            />
          </div>

          <div className="w-full flex flex-row gap-2 items-center justify-between">
            <SelectInput
              label="Status"
              required={true}
              name="lifecycle_status"
              error={!!inputErrors.lifecycle_status}
              default_value={storageValue?.value?.lifecycle_status || { value: "enabled", label: "Enabled" }}
              options={[
                { value: "enabled", label: "Enabled" },
                { value: "disabled", label: "Disabled" },
              ]}
            />

            <NumberInput
              min={1}
              step={1}
              max={365}
              name="days"
              required={true}
              label="Interval (days)"
              error={!!inputErrors.days}
              default_value={storageValue?.value?.days || 365}
            />
          </div>

          {showPrefix && (
            <div className="w-full">
              <TextInput
                name="lifecycle_prefix"
                required={true}
                label="Target URI"
                error={!!inputErrors.lifecycle_prefix}
                default_value={storageValue?.value?.lifecycle_prefix}
              />
            </div>
          )}
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Create" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Bucket Lifecycle Created Successfully" />}
    </form>
  );
};

export default BucketLifecycleForm;
