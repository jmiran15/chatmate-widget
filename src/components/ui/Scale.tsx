import { useState } from "react";
import { AutoFormInputComponentProps } from "./auto-form/types";
import { Button } from "./button";
import { FormControl, FormDescription, FormItem, FormLabel } from "./form";

export default function Scale({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const maxRating = fieldProps.max || 5;
  const step = fieldProps.step || 1;

  const handleRatingChange = (rating: number) => {
    field.onChange(rating);
  };

  return (
    <FormItem className="cm-space-y-2">
      <FormLabel>
        {label}
        {isRequired && <span className="cm-text-destructive"> *</span>}
      </FormLabel>
      <FormControl>
        <div className="cm-flex cm-flex-wrap cm-gap-2">
          {Array.from(
            { length: maxRating / step },
            (_, i) => (i + 1) * step
          ).map((rating) => (
            <Button
              type="button"
              key={rating}
              variant={field.value === rating ? "default" : "outline"}
              size="sm"
              className={`cm-w-16 cm-h-10 ${
                hoveredRating === rating ? "cm-bg-primary/10" : ""
              }`}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => handleRatingChange(rating)}
            >
              {rating}
            </Button>
          ))}
        </div>
      </FormControl>
      {fieldConfigItem.description && (
        <FormDescription>{fieldConfigItem.description}</FormDescription>
      )}
    </FormItem>
  );
}
