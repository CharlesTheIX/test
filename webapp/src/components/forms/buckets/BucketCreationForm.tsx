"use client";
import parseJSON from "@/lib/parseJSON";
import Storage from "@/lib/classes/Storage";
import { useRouter } from "next/navigation";
import validateRequest from "./validateRequest";
import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import LoadingContainer from "@/components/LoadingIcon";
import { useToastContext } from "@/contexts/toastContext";
import ErrorContainer from "@/components/forms/ErrorContainer";
import getErrorResponseTitle from "@/lib/getErrorResponseTitle";
import ButtonContainer from "@/components/forms/ButtonContainer";
import CompletionContainer from "@/components/forms/CompletionContainer";
import CompanyDropdown from "@/components/inputs/dropdowns/CompanyDropdown";
import BucketSizeDropdown from "@/components/inputs/dropdowns/BucketSizeDropdown";
import { default_simple_error, default_toast_item, header_internal } from "@/globals";
import PermissionsMultiDropdown from "@/components/inputs/dropdowns/PermissionsMultiDropdown";

type Props = {
  redirect?: string;
};

const storage_key = "bucket_creation_form_data";
const BucketCreationForm: React.FC<Props> = (props: Props) => {
  const { redirect = `/buckets` } = props;
  const router = useRouter();
  const { setToastItems } = useToastContext();
  const form_ref = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
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
    const name = form_data.get("name")?.toString() || "";
    const company_id = parseJSON(form_data.get("company_id")?.toString());
    const permissions = parseJSON(form_data.get("permissions")?.toString()) ?? [];
    const max_size_bytes = parseJSON(form_data.get("max_size_bytes")?.toString());
    const request_data: Partial<Bucket> = {
      name,
      company_id: company_id?.value || undefined,
      max_size_bytes: parseInt(max_size_bytes?.value),
      permissions: permissions.map((p: Option) => p.value),
    };

    const validation = validateRequest(request_data);
    setInputErrors(validation.invalid_inputs);
    Storage.setStorageValue(storage_key, { ...request_data, max_size_bytes, company_id, permissions });
    if (validation.simple_error.error) {
      setLoading(false);
      return setError(validation.simple_error);
    }
    console.log(company_id?.value);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/create`, {
        method: "PUT",
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
          title: "Bucket created successfully",
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
          <div className="w-full">
            <TextInput name="name" required={true} label="Bucket name" error={!!inputErrors.name} default_value={storageValue?.value?.name} />
          </div>

          <div className="w-full flex flex-row gap-2 items-center justify-between">
            <CompanyDropdown label="Company" required={false} name="company_id" error={!!inputErrors.company_id} default_value={storageValue?.value?.company_id} />

            <BucketSizeDropdown
              required={true}
              label="Bucket Size"
              name="max_size_bytes"
              error={!!inputErrors.max_size_bytes}
              default_value={storageValue?.value?.max_size_bytes}
            />

            <PermissionsMultiDropdown required={true} name="permissions" label="Permissions" error={!!inputErrors.permissions} default_value={storageValue?.value?.permissions} />
          </div>
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Create" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Bucket Created Successfully" />}
    </form>
  );
};

export default BucketCreationForm;
