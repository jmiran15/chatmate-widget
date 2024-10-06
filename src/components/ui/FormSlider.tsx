import { AutoFormInputComponentProps } from "./auto-form/types";
import { FormControl, FormDescription, FormItem, FormLabel } from "./form";
import { Slider as ShadcnSlider } from "./slider";

export default function Slider({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const handleValueChange = (value: number[]) => {
    field.onChange(value[0]);
  };

  const min = fieldProps.min ?? 0;
  const max = fieldProps.max ?? 100;
  const step = fieldProps.step ?? 1;

  return (
    <FormItem className="cm-space-y-4">
      <FormLabel>
        {label}
        {isRequired && <span className="cm-text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <div className="cm-space-y-2">
          <ShadcnSlider
            min={min}
            max={max}
            step={step}
            value={[field.value ?? min]}
            onValueChange={handleValueChange}
            className="cm-w-full"
          />
          <div className="cm-flex cm-justify-between cm-text-xs cm-text-muted-foreground">
            <span>{min}</span>
            <span>{field.value ?? min}</span>
            <span>{max}</span>
          </div>
        </div>
      </FormControl>
      {fieldConfigItem.description && (
        <FormDescription>{fieldConfigItem.description}</FormDescription>
      )}
    </FormItem>
  );
}
