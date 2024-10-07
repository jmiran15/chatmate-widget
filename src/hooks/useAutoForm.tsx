import { useMemo } from "react";
import { z } from "zod";
import Slider from "../components/ui/FormSlider";
import Scale from "../components/ui/Scale";
import StarRating from "../components/ui/StarRating";

const clientTypes = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  DATE: "DATE",
  URL: "URL",
  PHONE: "PHONE",
  EMAIL: "EMAIL",
  CHECKBOX: "CHECKBOX",
  SELECT: "SELECT",
  NUMBER: "NUMBER",
  RATING: "RATING",
  SCALE: "SCALE",
  SLIDER: "SLIDER",
} as const;

type InputType = (typeof clientTypes)[keyof typeof clientTypes];

export type FormElement = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  formId: string;
  type: InputType;
  name: string;
  label: string;
  required: boolean;
  placeholder: string | null;
  description: string | null;
  options: string[];
  min: number | null;
  max: number | null;
  step: number | null;
  order: number;
  required_error: string | null;
  min_error: string | null;
  max_error: string | null;
  invalid_type_error: string | null;
};

export function useAutoForm(elements: FormElement[]) {
  const { formSchema, fieldConfig } = useMemo(() => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};
    const fieldConfigObj: Record<string, any> = {};

    elements.forEach((element: FormElement) => {
      let fieldSchema: z.ZodTypeAny;

      const requiredErrorOptions = element.required
        ? { required_error: element.required_error ?? "This field is required" }
        : {};
      const invalidTypeErrorOptions = element.invalid_type_error
        ? { invalid_type_error: element.invalid_type_error }
        : {};

      const zodOptions = {
        ...requiredErrorOptions,
        ...invalidTypeErrorOptions,
      };

      switch (element.type) {
        case clientTypes.TEXT:
          fieldSchema = z.string(zodOptions);
          break;
        case clientTypes.URL:
          fieldSchema = z.string(zodOptions).url();
          break;
        case clientTypes.PHONE:
          fieldSchema = z
            .string(zodOptions)
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/);
          break;
        case clientTypes.EMAIL:
          fieldSchema = z.string(zodOptions).email();
          break;
        case clientTypes.NUMBER:
        case clientTypes.RATING:
        case clientTypes.SCALE:
        case clientTypes.SLIDER:
          fieldSchema = z.coerce.number(zodOptions);
          break;
        case clientTypes.DATE:
          fieldSchema = z.coerce.date(zodOptions);
          break;
        case clientTypes.CHECKBOX:
          fieldSchema = z.boolean(zodOptions);
          break;
        case clientTypes.SELECT:
          const options = element.options?.filter(Boolean) || [
            "Option 1",
            "Option 2",
          ];
          fieldSchema =
            options.length === 1
              ? z.literal(options[0], zodOptions)
              : z.enum(options as [string, ...string[]], zodOptions);
          break;
        default:
          fieldSchema = z.string(zodOptions);
      }

      fieldSchema = element.required ? fieldSchema : fieldSchema.optional();
      fieldSchema = fieldSchema.describe(element.label);
      schemaObj[element.name] = fieldSchema;
      fieldConfigObj[element.name] = {
        description: element.description,
        inputProps: {
          placeholder: element.placeholder,
          min: element.min,
          max: element.max,
          step: element.step,
          required: element.required,
          label: element.label,
          name: element.name,
          id: element.id,
        },
      };

      if (element.type === clientTypes.SELECT) {
        fieldConfigObj[element.name].options = element.options || [
          "Option 1",
          "Option 2",
        ];
      }

      if (
        element.type === clientTypes.NUMBER ||
        element.type === clientTypes.RATING ||
        element.type === clientTypes.SCALE ||
        element.type === clientTypes.SLIDER
      ) {
        if (fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema
            .min(element.min ?? -Infinity, {
              message:
                element.min_error ??
                "Please enter a value greater than the minimum",
            })
            .max(element.max ?? Infinity, {
              message:
                element.max_error ??
                "Please enter a value less than the maximum",
            });

          fieldConfigObj[element.name].inputProps.min =
            element.min ?? undefined;
          fieldConfigObj[element.name].inputProps.max =
            element.max ?? undefined;
          fieldConfigObj[element.name].inputProps.step = element.step;
        }
      }

      if (element.type === clientTypes.TEXTAREA) {
        fieldConfigObj[element.name].fieldType = "textarea";
      }

      if (element.type === clientTypes.RATING) {
        fieldConfigObj[element.name].fieldType = StarRating;
      }

      if (element.type === clientTypes.SCALE) {
        fieldConfigObj[element.name].fieldType = Scale;
      }

      if (element.type === clientTypes.SLIDER) {
        fieldConfigObj[element.name].fieldType = Slider;
      }
    });

    return {
      formSchema: z.object(schemaObj),
      fieldConfig: fieldConfigObj,
    };
  }, [elements]);

  return { formSchema, fieldConfig };
}
