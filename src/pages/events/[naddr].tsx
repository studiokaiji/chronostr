import { CircleIcon } from "@/components/icons/circle-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAlert } from "@/hooks/use-alert";
import { getEventCalendar } from "@/services/event-calender";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShareIcon } from "@/components/icons/share-icon";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const EventCalendarPage = () => {
  const { naddr } = useParams();
  if (!naddr) {
    throw Error();
  }

  const { setAlert } = useAlert();

  // Queries
  const { data, error } = useSuspenseQuery({
    queryKey: [naddr],
    queryFn: ({ queryKey }) => getEventCalendar(queryKey[0]),
  });

  useEffect(() => {
    if (error) {
      setAlert({
        title: error.name,
        description: error.message,
      });
    }
  }, [error, setAlert]);

  const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  return (
    <Layout>
      <div className="space-y-4">
        <Card className="p-6 grow flex items-stretch justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data?.title}</h1>
            <p className="text-gray-500">{data?.description}</p>
            <div className="mt-4 text-gray-500 font-medium">
              <p>👤 20</p>
              <p>
                🗓️ {dateTimeFormat.format(data?.dates[0].date)} ~{" "}
                {dateTimeFormat.format(data?.dates.slice(-1)[0].date)}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <Button size="icon" variant="secondary">
              <ShareIcon className="w-[18px] h-[18px] fill-gray-700" />
            </Button>
            <Button className="text-base">✋ Join</Button>
          </div>
        </Card>
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="rounded-t-md">
                <TableHead>Name</TableHead>
                {data?.dates.map(({ id, date, includeTime }) => (
                  <TableHead id={id}>
                    <div>{dateTimeFormat.format(date)}</div>
                    {includeTime && (
                      <div>
                        {date.getHours()}:{("0" + date.getMinutes()).slice(-2)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-semibold">Alice</div>
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
                <TableCell>
                  <CloseIcon className="fill-gray-400 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-semibold">Bob</div>
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-semibold">Carlos</div>
                </TableCell>
                <TableCell>
                  <CloseIcon className="fill-gray-400 w-5" />
                </TableCell>
                <TableCell>
                  <CloseIcon className="fill-gray-400 w-5" />
                </TableCell>
                <TableCell>
                  <CloseIcon className="fill-gray-400 w-5" />
                </TableCell>
                <TableCell>
                  <CircleIcon className="fill-lime-600 w-5" />
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>2</TableCell>
                <TableCell>2</TableCell>
                <TableCell>1</TableCell>
                <TableCell>3</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};
