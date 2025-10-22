import getInputError from "@/lib/getInputError";

export default (data: any): { invalid_inputs: { [key: string]: boolean }; simple_error: SimpleError } => {
  var invalid;
  const inputs_invalid: { [key: string]: boolean } = {};
  var message = "Please address the following errors:\n";
  Object.keys(data).map((key: string) => {
    switch (key) {
      case "name":
        invalid = getInputError("name", data[key], true);
        if (invalid.error) {
          inputs_invalid.name = invalid.error;
          message += `- Company name: ${invalid.message}\n`;
        }
        break;

      case "max_size_bytes":
        invalid = getInputError("number", data[key], true);
        if (invalid.error) {
          inputs_invalid.max_size_bytes = invalid.error;
          message += `- Max size: ${invalid.message}\n`;
        }
        break;

      case "permissions":
        var err: boolean = data[key]?.length === 0;
        if (err) {
          inputs_invalid.permissions = true;
          message += `- Permissions: At least one value is required.\n`;
        }

        data[key]?.forEach((p: any) => {
          if (err) return;
          invalid = getInputError("number", p, true);
          if (invalid.error) {
            inputs_invalid.permissions = invalid.error;
            message += `- Permissions: ${invalid.message}\n`;
          }
        });
        break;

      case "tag":
        var err: boolean = false;
        invalid = getInputError("bucket_name", data[key], false);
        if (invalid.error) {
          inputs_invalid.lifecycle_type = invalid.error;
          message += `- Tag: ${invalid.message}\n`;
        }
        break;

      case "company_id":
        invalid = getInputError("mongo_id", data[key], false);
        if (invalid.error) {
          inputs_invalid.company_id = invalid.error;
          message += `- Company: ${invalid.message}\n`;
        }
        break;

      case "lifecycle_type":
        var err: boolean = false;
        invalid = getInputError("name", data[key], false);
        if (invalid.error) {
          inputs_invalid.lifecycle_type = invalid.error;
          message += `- Type: ${invalid.message}\n`;
        }
        break;

      case "lifecycle_prefix":
        invalid = getInputError("text", data[key], data.lifecycle_type === "Expiration");
        if (invalid.error) {
          inputs_invalid.lifecycle_prefix = invalid.error;
          message += `- Target URI: ${invalid.message}\n`;
        }
        break;

      case "days":
        invalid = getInputError("number", data[key], true);
        if (invalid.error) {
          inputs_invalid.days = invalid.error;
          message += `- Interval (days): ${invalid.message}\n`;
        }
        break;

      case "identifier":
        invalid = getInputError("name", data[key], true);
        if (invalid.error) {
          inputs_invalid.identifier = invalid.error;
          message += `- Identifier: ${invalid.message}\n`;
        }
        break;
    }
  });

  const title = "Input error";
  const error = Object.keys(inputs_invalid).length > 0;
  if (!error) message = "";
  return { invalid_inputs: inputs_invalid, simple_error: { error, message, title } };
};
