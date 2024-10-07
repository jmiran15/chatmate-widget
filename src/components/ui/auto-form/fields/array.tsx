import { Plus, Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../accordion";
import { Button } from "../../button";
import { Separator } from "../../separator";
import { beautifyObjectName } from "../utils";
import AutoFormObject from "./object";

function isZodArray(
  item: z.ZodArray<any> | z.ZodDefault<any>
): item is z.ZodArray<any> {
  return item instanceof z.ZodArray;
}

function isZodDefault(
  item: z.ZodArray<any> | z.ZodDefault<any>
): item is z.ZodDefault<any> {
  return item instanceof z.ZodDefault;
}

export default function AutoFormArray({
  name,
  item,
  form,
  path = [],
  fieldConfig,
}: {
  name: string;
  item: z.ZodArray<any> | z.ZodDefault<any>;
  form: ReturnType<typeof useForm>;
  path?: string[];
  fieldConfig?: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  const title = item._def.description ?? beautifyObjectName(name);

  const itemDefType = isZodArray(item)
    ? item._def.type
    : isZodDefault(item)
      ? item._def.innerType._def.type
      : null;

  return (
    <AccordionItem value={name} className="cm-border-none">
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {fields.map((_field, index) => {
          const key = _field.id;
          return (
            <div className="cm-mt-4 cm-flex cm-flex-col" key={`${key}`}>
              <AutoFormObject
                schema={itemDefType as z.ZodObject<any, any>}
                form={form}
                fieldConfig={fieldConfig}
                path={[...path, index.toString()]}
              />
              <div className="cm-my-4 cm-flex cm-justify-end">
                <Button
                  variant="secondary"
                  size="icon"
                  type="button"
                  className="cm-hover:bg-zinc-300 cm-hover:text-black cm-focus:ring-0 cm-focus:ring-offset-0 cm-focus-visible:ring-0 cm-focus-visible:ring-offset-0 cm-dark:bg-white cm-dark:text-black cm-dark:hover:bg-zinc-300 cm-dark:hover:text-black cm-dark:hover:ring-0 cm-dark:hover:ring-offset-0 cm-dark:focus-visible:ring-0 cm-dark:focus-visible:ring-offset-0"
                  onClick={() => remove(index)}
                >
                  <Trash className="cm-size-4" />
                </Button>
              </div>

              <Separator />
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({})}
          className="cm-mt-4 cm-flex cm-items-center"
        >
          <Plus className="cm-mr-2" size={16} />
          Add
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
