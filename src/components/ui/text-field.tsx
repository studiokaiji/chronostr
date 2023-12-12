import { Label } from "./label";
import { Input, InputProps } from "./input";

type TextFieldProps = {
  label: string;
} & InputProps;

export const TextField = (props: TextFieldProps) => {
  const id = props.id || crypto.randomUUID();
  return (
    <div
      className={`${props.className || ""} grid w-full items-center gap-1.5`}
    >
      <Label htmlFor={id}>
        {props.required && <span className="text-red-500">* </span>}
        {props.label}
      </Label>
      <Input className="" id={id} {...props} />
    </div>
  );
};
