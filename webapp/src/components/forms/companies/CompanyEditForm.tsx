"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import getInputError from "@/lib/getInputError";
import TextInput from "@/components/inputs/TextInput";
import LoadingContainer from "@/components/LoadingIcon";
import ErrorContainer from "@/components/forms/ErrorContainer";
import getErrorResponseTitle from "@/lib/getErrorResponseTitle";
import ButtonContainer from "@/components/forms/ButtonContainer";
import { default_simple_error, header_internal } from "@/globals";
import CompletionContainer from "@/components/forms/CompletionContainer";

type Props = {
  redirect?: string;
  data: Partial<Company>;
};

const CompanyEditForm: React.FC<Props> = (props: Props) => {
  const { data, redirect = `/companies/${data._id}` } = props;
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
    const name = form_data.get("name")?.toString() || "";
    const update: Partial<Company> = { name };

    const validation_error = validateRequest(update);
    if (validation_error.error) {
      setLoading(false);
      return setError(validation_error);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/companies/by-id`, {
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

  const validateRequest = (data: Partial<Company>): SimpleError => {
    var invalid;
    const inputs_invalid: { [key: string]: boolean } = {};
    var message = "Please address the following errors:\n";
    Object.keys(data).map((key: string) => {
      switch (key) {
        case "name":
          invalid = getInputError("username", data[key], true);
          if (invalid.error) {
            inputs_invalid.name = invalid.error;
            message += `- Company name: ${invalid.message}\n`;
          }
          break;
      }
    });

    const title = "Input error";
    const error = Object.keys(inputs_invalid).length > 0;
    if (!error) message = "";
    setInputErrors(inputs_invalid);
    return { error, message, title };
  };

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
            <TextInput name="name" required={true} label="Company name" error={!!inputErrors.name} default_value={data.name} />

            <TextInput
              label="User"
              name="user-id"
              disabled={true}
              default_value={
                data.user_ids && data.user_ids.length > 0
                  ? typeof data.user_ids[0] === "string"
                    ? data.user_ids[0]
                    : data.user_ids[0].username
                  : undefined
              }
            />
          </div>
        </div>

        <ButtonContainer disabled={loading} callback={handleFormSubmission} text="Update" />
      </div>

      {loading && <LoadingContainer />}
      {error.error && error.message && <ErrorContainer error={error} />}
      {complete && <CompletionContainer title="Company updated" />}
    </form>
  );
};

export default CompanyEditForm;
