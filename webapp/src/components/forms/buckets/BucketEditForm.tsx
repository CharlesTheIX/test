"use client";
import parseJSON from "@/lib/parseJSON";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import validateRequest from "./validateRequest";
import Permissions from "@/lib/classes/Permissions";
import TextInput from "@/components/inputs/TextInput";
import LoadingContainer from "@/components/LoadingIcon";
import NumberInput from "@/components/inputs/NumberInput";
import ErrorContainer from "@/components/forms/ErrorContainer";
import getErrorResponseTitle from "@/lib/getErrorResponseTitle";
import ButtonContainer from "@/components/forms/ButtonContainer";
import { default_simple_error, header_internal } from "@/globals";
import CompletionContainer from "@/components/forms/CompletionContainer";
import BucketSizeDropdown from "@/components/inputs/dropdowns/BucketSizeDropdown";
import PermissionsMultiDropdown from "@/components/inputs/dropdowns/PermissionsMultiDropdown";
import BucketSizes from "@/lib/classes/BucketSizes";

type Props = {
  redirect?: string;
  data: Partial<Bucket>;
};

const BucketEditForm: React.FC<Props> = (props: Props) => {
  const { data, redirect = `/buckets/${data._id}` } = props;
  const router = useRouter();
  const form_ref = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  const [error, setError] = useState<SimpleError>(default_simple_error);
  const [inputErrors, setInputErrors] = useState<{ [key: string]: boolean }>({});

  const handleFormSubmission = async (): Promise<void> => {
    const form = form_ref.current;
    if (!form) return;

    setLoading(true);
    setInputErrors({});
    setComplete(false);
    setError(default_simple_error);
    const form_data = new FormData(form);
    const max_size_bytes = parseJSON(form_data.get("max_size_bytes")?.toString());
    const permissions = parseJSON(form_data.get("permissions")?.toString()) ?? [];
    const update: Partial<Bucket> = {
      max_size_bytes: parseInt(max_size_bytes?.value),
      permissions: permissions.map((p: Option) => p.value),
    };

    const validation = validateRequest(update);
    setInputErrors(validation.invalid_inputs);
    if (validation.simple_error.error) {
      setLoading(false);
      return setError(validation.simple_error);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/buckets/by-id`, {
        method: "PATCH",
        headers: header_internal,
        body: JSON.stringify({ _id: data._id, update }),
      }).then((res: any) => res.json());

      if (response.error) {
        setLoading(false);
        return setError({ error: true, message: response.message, title: getErrorResponseTitle(response.status) });
      }

      if (redirect) return router.push(redirect);
      setComplete(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      return setError({ error: true, message: "An unexpected error occurred, please try again.", title: `Unexpected Error` });
    }
  };

  return (
    <form ref={form_ref} className={`hyve-form ${loading ? "loading" : ""}`} onSubmit={(event: any) => event.preventDefault()}>
      <div className="content-container">
        <div className="inputs">
          <div className="w-full flex flex-row gap-2 items-center justify-between">
            <TextInput name="name" disabled={true} label="Name" default_value={data.name} />

            <TextInput
              label="Company"
              disabled={true}
              name="company_id"
              default_value={data.company_id ? (typeof data.company_id === "string" ? data.company_id : data.company_id.name) : undefined}
            />
          </div>

          <div className="w-full flex flex-row gap-2 items-center justify-between">
            {/* <NumberInput
              min={1}
              required={true}
              label="Max size"
              name="max_size_bytes"
              max={1000000000000000}
              default_value={data.max_size_bytes}
              error={!!inputErrors.max_size_bytes}
            /> */}

            <BucketSizeDropdown
              required={true}
              label="Bucket Size"
              name="max_size_bytes"
              error={!!inputErrors.max_size_bytes}
              default_value={BucketSizes.getBucketSizeOptions([data.max_size_bytes])[0]}
            />

            <PermissionsMultiDropdown
              required={true}
              name="permissions"
              label="Permissions"
              error={!!inputErrors.permissions}
              default_value={Permissions.getBucketPermissionOptions(data.permissions)}
            />
          </div>
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Update" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Bucket updated" />}
    </form>
  );
};

export default BucketEditForm;
