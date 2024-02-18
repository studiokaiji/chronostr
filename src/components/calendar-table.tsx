import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CircleIcon } from "@/components/icons/circle-icon";
import { CloseIcon } from "@/components/icons/close-icon";
import { TriangleIcon } from "@/components/icons/triangle-icon";
import type { EventCalendar, GetRSVPResponse } from "@/event";
import { formatDate } from "@/lib/formatDate";
import { memo } from "react";
import { getName } from "@/lib/user";

type CalendarProps = {
  calendar: EventCalendar;
  rsvp?: GetRSVPResponse;
};

export const CalendarTable = memo(({ calendar, rsvp }: CalendarProps) => {
  const rsvpPerUsers = rsvp?.rsvpPerUsers;
  return (
    <Table>
      <TableHeader>
        <TableRow className="rounded-t-md">
          <TableHead>Name</TableHead>
          {calendar?.dates.map(({ id, date, includeTime }) => (
            <TableHead key={id}>
              <div>{formatDate(date)}</div>
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
        {Object.values(rsvpPerUsers || {}).map((rsvp) => {
          return (
            <TableRow key={rsvp.user.profile?.name}>
              <TableCell>
                <div className="max-w-[140px] overflow-hidden text-ellipsis">
                  {getName(rsvp.user)}
                </div>
              </TableCell>
              {calendar.dates.map((date) => {
                const statusAndEvent = rsvp.rsvp?.[date.id];
                const status = statusAndEvent?.status;
                return (
                  <TableCell key={`${rsvp.user.pubkey}.${date.id}`}>
                    {status === "accepted" ? (
                      <CircleIcon className="fill-lime-600 w-5" />
                    ) : status === "tentative" ? (
                      <TriangleIcon className="fill-yellow-500 w-5" />
                    ) : (
                      <CloseIcon className="fill-gray-300 w-5" />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          {calendar.dates.map((_, i) => {
            const total = rsvp?.totals?.[i];
            return (
              <TableCell key={`total-${i}`}>
                <div className="flex items-center space-x-1">
                  <CircleIcon className="fill-lime-600 w-3.5" />
                  <div>{total?.accepted || 0}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <TriangleIcon className="fill-yellow-500 w-3.5" />
                  <div>{total?.tentative || 0}</div>
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      </TableFooter>
    </Table>
  );
});
