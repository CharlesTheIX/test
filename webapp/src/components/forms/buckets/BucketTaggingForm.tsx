"use client";
import parseJSON from "@/lib/parseJSON";
import Storage from "@/lib/classes/Storage";
import { useRouter } from "next/navigation";
import validateRequest from "./validateRequest";
import { useRef, useState, useEffect } from "react";
import LoadingContainer from "@/components/LoadingIcon";
import { useToastContext } from "@/contexts/toastContext";
import SelectInput from "@/components/inputs/SelectInput";
import ErrorContainer from "@/components/forms/ErrorContainer";
import getErrorResponseTitle from "@/lib/getErrorResponseTitle";
import ButtonContainer from "@/components/forms/ButtonContainer";
import CompletionContainer from "@/components/forms/CompletionContainer";
import { default_simple_error, default_toast_item, header_internal } from "@/globals";

type Props = {
  bucket_id: string;
  redirect?: string;
};

const storage_key = "bucket_tagging_creation_form_data";
const BucketTaggingForm: React.FC<Props> = (props: Props) => {
  const { bucket_id, redirect = `/buckets/${bucket_id}/tagging` } = props;
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
    const tag = parseJSON(form_data.get("tag")?.toString());
    const request_data: any = {
      bucket_id,
      tag: `${tag.value}`,
    };

    const validation = validateRequest(request_data);
    setInputErrors(validation.invalid_inputs);
    Storage.setStorageValue(storage_key, { ...request_data, tag });
    if (validation.simple_error.error) {
      setLoading(false);
      return setError(validation.simple_error);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/tagging`, {
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
          title: "Bucket tag created successfully",
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
            <SelectInput
              label="Tag"
              name="tag"
              required={true}
              error={!!inputErrors.tags}
              default_value={storageValue?.value?.tags}
              options={[
                { value: "tag-a", label: "Tag A" },
                { value: "tag-b", label: "Tag B" },
                { value: "tag-c", label: "Tag C" },
              ]}
            />
          </div>
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Add" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Bucket tag Created Successfully" />}
    </form>
  );
};

export default BucketTaggingForm;
