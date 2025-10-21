"use client";
import { useState } from "react";
import EyeSVG from "@/components/svgs/Eye";
import EyeClosedSVG from "@/components/svgs/EyeClosed";

type Props = {
  name: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  default_value?: string;
  onInput?: (event: any) => void;
};

const PasswordInput: React.FC<Props> = (props: Props) => {
  var { name, label, error = false, required = false, placeholder = "", default_value = "", onInput = () => {} } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const [value, setValue] = useState<string>(default_value);
  const [hidePassword, setHidePassword] = useState<boolean>(true);

  return (
    <div data-cy={name} className={`hyve-input ${focused ? "focused" : ""} ${error ? "error" : ""} ${!!value ? "active" : ""}`}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <sup>*</sup>}
        </label>
      )}

      <input
        id={name}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        type={hidePassword ? "password" : "text"}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        onInput={(evt: any) => {
          const target = (evt.currentTarget || evt.target) as HTMLInputElement;
          setValue(target.value);
          onInput(evt);
        }}
      />

      <div
        className="password-icon"
        onClick={() => {
          setHidePassword(!hidePassword);
        }}
      >
        {hidePassword ? <EyeSVG primary_color="#b5b5b5" /> : <EyeClosedSVG primary_color="#b5b5b5" />}
      </div>
    </div>
  );
};

export default PasswordInput;
