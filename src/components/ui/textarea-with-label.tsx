import { Label } from "@/components/ui/label";
import { Textarea, TextareaProps } from "@/components/ui/textarea";

type TextareaWithLabelProps = {
  label: string;
} & TextareaProps;

export const TextareaWithLabel = (props: TextareaWithLabelProps) => {
  const id = props.id || crypto.randomUUID();
  return (
    <div
      className={`${props.className || ""} grid w-full items-center gap-1.5`}
    >
      <Label htmlFor={id}>
        {props.required && <span className="text-red-500">* </span>}
        {props.label}
      </Label>
      <Textarea className="" id={id} {...props} />
    </div>
  );
};
