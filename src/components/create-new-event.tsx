import { FormEventHandler, useState } from "react";
import { Calendar } from "./ui/calendar";
import { TextField } from "./ui/text-field";
import { TextareaWithLabel } from "./ui/textarea-with-label";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { useAlert } from "@/hooks/useAlert";
import { Spinner } from "./ui/spinner";

export const CreateNewEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [dateString, setDateString] = useState("");

  const { setAlert } = useAlert();

  const selectDate = (date: Date) => {
    const converted = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ].join("-");
    setDateString((str) => `${str ? `${str}\n` : ""}${converted}`);
  };

  const [isCreating, setIsCreating] = useState(false);

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    setIsCreating(true);

    const strDates = dateString.split("\n");
    const dates: EventDate[] = [];

    for (const strDate of strDates) {
      const parsed = safeParseISO8601String(strDate);
      if (!parsed) {
        setAlert({
          title: "An invalid date was found.",
          description: `"${strDate}" is not in accordance with ISO8601.`,
          variant: "destructive",
        });
        setIsCreating(false);
        break;
      }
      dates.push({
        date: parsed,
        includeTime: strDate.includes("T"),
      });
    }

    setIsCreating(false);
  };

  return (
    <form className="space-y-4 w-full" onSubmit={submit}>
      <TextField
        label="🎉 Event title"
        placeholder="Ostrich sashimi party"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextareaWithLabel
        label="📕 Description"
        placeholder="Let's all go eat some delicious ostrich!"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="space-y-1.5">
        <Label>
          {<span className="text-red-500">* </span>}📅 Candidate dates
        </Label>
        <div className="border rounded-md flex flex-col-reverse items-center sm:items-stretch sm:flex-row h-[inherit]">
          <Calendar
            mode="single"
            fromDate={new Date()}
            onSelect={selectDate}
            modifiersClassNames={{
              today: "bg-none",
            }}
          />
          <Separator
            orientation="vertical"
            className="h-[inherit] hidden sm:block"
          />
          <Separator
            orientation="horizontal"
            className="block sm:hidden w-full"
          />
          <Textarea
            className="w-full h-[inherit] min-h-[204px] resize-none border-none outline-none focus-visible:ring-offset-0 focus-visible:ring-0 p-3"
            placeholder={`Enter candidate dates / times for events. 
Candidates are separated by line breaks.

Examples:
2023-12-13
2023-12-13T16:00

You can also enter the date from the calendar.
`}
            value={dateString}
            onChange={(e) => setDateString(e.target.value)}
            required
          />
        </div>
      </div>
      <Button
        className="w-full space-x-1.5"
        type="submit"
        disabled={isCreating}
      >
        {isCreating && <Spinner />} <span>Create</span>
      </Button>
      <div className="text-gray-500 mt-2 text-sm">
        <p>1. Creating an event requires signing with NIP-07.</p>
        <p>
          2. A signature is not required to participate in the event, but if you
          do not sign, you will only be able to edit the content from the same
          PC / Smartphone and browser.
        </p>
      </div>
    </form>
  );
};

const safeParseISO8601String = (strDate: string) => {
  try {
    const date = new Date(strDate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
};
