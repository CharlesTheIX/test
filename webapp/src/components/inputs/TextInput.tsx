"use client";
import { useState } from "react";

type Props = {
  name: string;
  label?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  default_value?: string;
  onInput?: (event: any) => void;
};

const TextInput: React.FC<Props> = (props: Props) => {
  var { name, label, error = false, required = false, placeholder = "", default_value = "", onInput = () => {}, disabled = false } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const [value, setValue] = useState<string>(default_value);

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
        type="text"
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
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
    </div>
  );
};

export default TextInput;
