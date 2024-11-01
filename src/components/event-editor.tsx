import {
  type FormEventHandler,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Calendar } from "./ui/calendar";
import { TextField } from "./ui/text-field";
import { TextareaWithLabel } from "./ui/textarea-with-label";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import { Spinner } from "./ui/spinner";
import {
  createEventCalendar,
  updateEventCalendar,
} from "@/services/event-calender";
import { useNavigate } from "react-router-dom";
import type { EventCalendar, EventDateInput } from "@/event";
import { useNDK } from "@/hooks/use-ndk";
import type { SelectSingleEventHandler } from "react-day-picker";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "./ui/dialog";
import { Card } from "./ui/card";
import { Trash2 } from "lucide-react";

type EventEditorProps = {
  currentValue?: EventCalendar;
  onEditComplete?: (calendarId: string) => void;
  onEditError?: (e: unknown) => void;
};

const dateToString = (date: Date, includeTime: boolean) => {
  const ymd = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");

  const time = includeTime
    ? "T" +
      [
        date.getHours().toString().padStart(2, "0"),
        date.getMinutes().toString().padStart(2, "0"),
      ].join(":")
    : "";

  return ymd + time;
};

export const EventEditor = memo(
  ({
    currentValue,
    onEditComplete: onSaved,
    onEditError: onFailed,
  }: EventEditorProps) => {
    const [title, setTitle] = useState(currentValue?.title || "");
    const [description, setDescription] = useState(
      currentValue?.description || ""
    );

    // Update用
    const initialDates = currentValue?.dates;
    const [removeRequestDateTagIds, setRemoveRequestDateTagIds] = useState<
      string[]
    >([]);
    const currentDates = useMemo(() => {
      if (!initialDates) {
        return [];
      }
      return initialDates.filter(
        (date) => !removeRequestDateTagIds.includes(date.event.tagId())
      );
    }, [initialDates, removeRequestDateTagIds]);
    const removeDate = useCallback(
      async (dateEventTagId: string) => {
        const newSet = new Set(removeRequestDateTagIds);
        newSet.add(dateEventTagId);
        setRemoveRequestDateTagIds([...newSet]);
      },
      [removeRequestDateTagIds]
    );

    const [dateString, setDateString] = useState("");

    const { setAlert } = useAlert();

    const selectDate: SelectSingleEventHandler = (date: Date | undefined) => {
      if (!date) {
        return;
      }
      const converted = dateToString(date, false);
      setDateString((str) => `${str ? `${str}\n` : ""}${converted}`);
    };

    const navigate = useNavigate();

    const { ndk, connectToNip07 } = useNDK();

    const [isCreating, setIsCreating] = useState(false);

    const submit: FormEventHandler<HTMLFormElement> = async (e) => {
      try {
        e.preventDefault();

        if (!ndk) {
          return;
        }

        setIsCreating(true);

        const strDates = dateString.split("\n");
        const dates: EventDateInput[] = [];

        // フィールドに何も入力されていない場合は、処理をスキップ
        if (strDates && strDates.length > 1 && strDates[0] !== "") {
          for (const strDate of strDates) {
            const parsed = safeParseISO8601String(strDate);
            if (!parsed) {
              setAlert({
                title: "An invalid date was found.",
                description: `"${strDate}" is not in accordance with ISO8601.`,
                variant: "destructive",
              });
              setIsCreating(false);
              return;
            }
            dates.push({
              date: parsed,
              includeTime: strDate.includes(":"),
            });
          }
        }

        const nd = ndk.signer ? ndk : await connectToNip07();

        console.log("currentValue", currentValue);

        const calendarId = currentValue?.id || crypto.randomUUID();

        const ev = currentValue
          ? await updateEventCalendar(
              nd,
              currentValue.id,
              dates,
              removeRequestDateTagIds
            )
          : await createEventCalendar(nd, {
              title,
              description,
              dates,
            });

        if (currentValue) {
          navigate(`/events/${currentValue.id}`);
        } else {
          const encoded = ev.tagAddress();
          navigate(`/events/${encoded}`);
        }

        onSaved?.(calendarId);

        setAlert({
          title: "Success!",
          variant: "default",
        });
      } catch (e) {
        onFailed?.(e);
        setAlert({
          title: "Error",
          description: String(e),
          variant: "destructive",
        });
      } finally {
        setIsCreating(false);
      }
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

        <div>
          <Label>
            {!initialDates && <span className="text-red-500">* </span>}📅
            Candidate dates
          </Label>
          {
            // Update時のみ表示
            // 現在の候補日を表示
            currentValue && currentDates.length > 0 && (
              <>
                <div className="mt-1">
                  <Label className="text-gray-500 block">
                    Current candidate dates
                  </Label>
                  <div className="space-y-1 max-w-72 mt-1">
                    {currentDates.map((date) => (
                      <Card
                        className="flex justify-between items-center p-1"
                        key={`initial-dates-${date.date.toString()}`}
                      >
                        <span className="px-2">
                          {dateToString(date.date, date.includeTime)}
                        </span>
                        <Button
                          variant="destructive"
                          size="icon"
                          type="button"
                          onClick={() => removeDate(date.event.tagId())}
                          className="w-9 h-9 text-red-600 hover:text-white bg-red-100"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
                <Label className="text-gray-500 block mt-1">
                  {initialDates ? "New candidate dates" : "Candidate dates"}
                </Label>
              </>
            )
          }
          <div className="border rounded-md flex flex-col-reverse items-center sm:items-stretch sm:flex-row h-[inherit] mt-1.5">
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
              required={!initialDates}
            />
          </div>
        </div>
        <Button
          className="w-full space-x-1.5"
          type="submit"
          disabled={isCreating}
        >
          {isCreating && <Spinner />}{" "}
          <span>{currentValue ? "Save" : "Create"}</span>
        </Button>
        <div className="text-gray-500 mt-2 text-sm">
          <p>1. Creating an event requires signing with NIP-07.</p>
          <p>
            2. A signature is not required to participate in the event, but if
            you do not sign, you will only be able to edit the content from the
            same PC / Smartphone and browser.
          </p>
        </div>
      </form>
    );
  }
);

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

export const EventEditorDialog = (
  props: EventEditorProps & { isLoading?: boolean }
) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={props.isLoading}>
          {props.isLoading ? <Spinner /> : "🖊️ Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen md:max-w-screen-sm md:w-full">
        <DialogHeader>
          <h2 className="text-3xl font-bold">Edit Event</h2>
        </DialogHeader>
        <EventEditor
          {...props}
          onEditComplete={(cid) => {
            props.onEditComplete?.(cid);
            close();
          }}
          onEditError={() => {
            close();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
