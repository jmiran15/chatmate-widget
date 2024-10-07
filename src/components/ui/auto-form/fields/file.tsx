import { Trash2 } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { FormControl, FormItem, FormMessage } from "../../form";
import { Input } from "../../input";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";
export default function AutoFormFile({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
  field,
}: AutoFormInputComponentProps) {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
        setFileName(file.name);
        field.onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveClick = () => {
    setFile(null);
  };

  return (
    <FormItem>
      {showLabel && (
        <AutoFormLabel
          label={fieldConfigItem?.label || label}
          isRequired={isRequired}
        />
      )}
      {!file && (
        <FormControl>
          <Input
            type="file"
            {...fieldPropsWithoutShowLabel}
            onChange={handleFileChange}
            value={""}
          />
        </FormControl>
      )}
      {file && (
        <div className="cm-flex cm-h-[40px] cm-w-full cm-flex-row cm-items-center cm-justify-between cm-space-x-2 cm-rounded-sm cm-border cm-p-2 cm-text-black cm-focus-visible:ring-0 cm-focus-visible:ring-offset-0 cm-dark:bg-white cm-dark:text-black cm-dark:focus-visible:ring-0 cm-dark:focus-visible:ring-offset-0">
          <p>{fileName}</p>
          <button onClick={handleRemoveClick} aria-label="Remove image">
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}
