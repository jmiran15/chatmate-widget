import { Star } from "lucide-react";
import { useState } from "react";
import { AutoFormInputComponentProps } from "./auto-form/types";
import { FormControl, FormDescription, FormItem, FormLabel } from "./form";

export default function StarRating({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const maxRating = fieldProps.max || 5;
  const step = fieldProps.step || 1;
  const size = fieldProps.size || 24;

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
        <div className="cm-flex cm-flex-wrap cm-items-center">
          {Array.from(
            { length: maxRating / step },
            (_, i) => (i + 1) * step
          ).map((rating) => (
            <Star
              key={rating}
              size={size}
              className={`cm-cursor-pointer cm-transition-all cm-flex-shrink-0 ${
                (hoveredRating || field.value) >= rating
                  ? "cm-fill-primary cm-text-primary"
                  : "cm-text-muted-foreground"
              }`}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingChange(rating)}
            />
          ))}
        </div>
      </FormControl>
      {fieldConfigItem.description && (
        <FormDescription>{fieldConfigItem.description}</FormDescription>
      )}
    </FormItem>
  );
}
