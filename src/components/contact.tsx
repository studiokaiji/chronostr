import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { GetRSVPResponse } from "@/event";
import { FormEvent, memo, useEffect, useState } from "react";
import { ConnectNIP07Button } from "./connect-nip07-button";
import { useI18n } from "@/hooks/use-i18n";
import { useNDK } from "@/hooks/use-ndk";
import { Spinner } from "./ui/spinner";
import { TextareaWithLabel } from "./ui/textarea-with-label";
import { contactEvent } from "@/services/contact";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { getName } from "@/lib/user";

type ContactProps = {
  title: string;
  rsvp?: GetRSVPResponse;
  onContactComplete?: (event: NDKEvent) => void;
  onContactCancel?: () => void;
  onContactError?: (e: unknown) => void;
};

const defaultBody = (title: string) => () =>
  `chronostr - ${title}\n${location.href}`;

export const Contact = memo(
  ({
    title,
    rsvp,
    onContactComplete,
    onContactCancel,
    onContactError,
  }: ContactProps) => {
    const { t } = useI18n();
    const { ndk } = useNDK();

    const [displayAuthConfirm, setDisplayAuthConfirm] = useState(
      !ndk?.signer && window.nostr
    );
    const contactList = Object.values(rsvp?.rsvpPerUsers ?? {}).map(
      (e) => e.user
    );

    useEffect(() => {
      setDisplayAuthConfirm(!ndk?.signer && window.nostr);
    }, [ndk]);

    const [body, setBody] = useState(defaultBody(title));
    const [isLoading, setIsLoading] = useState(false);

    if (contactList.length <= 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="font-semibold text-lg">{t.contact.noParticipants}</p>
          <p className="text-gray-500">
            {t.contact.noParticipantsDescription}
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={onContactCancel}>
              {t.common.gotIt}
            </Button>
          </div>
        </div>
      );
    }
    if (displayAuthConfirm) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="font-semibold text-lg">{t.joinEvent.connectToNostr}</p>
          <p className="text-gray-500">{t.joinEvent.connectDescription}</p>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={onContactCancel}>
              {t.common.noThanks}
            </Button>
            <ConnectNIP07Button
              onConnect={() => setDisplayAuthConfirm(false)}
            />
          </div>
        </div>
      );
    }

    const replyingTo = () => {
      const names = contactList.map(getName);

      if (names.length === 1) {
        const name = names[0];

        return t.contact.replyingTo(name);
      } else {
        const former = names.slice(0, -1);
        const last = names[names.length - 1];

        return t.contact.replyingToMultiple(former, last);
      }
    };

    const submit = async (e: FormEvent) => {
      e.preventDefault();
      if (!ndk) {
        return;
      }

      try {
        setIsLoading(true);

        const event = await contactEvent(ndk, body, contactList);

        if (onContactComplete) {
          onContactComplete(event);
        }
      } catch (e) {
        if (onContactError) {
          onContactError(e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form className="space-y-4" onSubmit={submit}>
        <p className="font-semibold">{t.contact.title}</p>
        <TextareaWithLabel
          label={replyingTo()}
          placeholder={t.eventEditor.descriptionPlaceholder}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <Button className="w-full space-x-1 flex items-center" type="submit">
          {isLoading && <Spinner />} <span>{t.common.submit}</span>
        </Button>
      </form>
    );
  }
);

export const ContactDialog = (
  props: ContactProps & { isLoading?: boolean }
) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={props.isLoading}>
          {props.isLoading ? <Spinner /> : `✉ ${t.contact.title}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-screen">
        <Contact
          {...props}
          onContactComplete={(events) => {
            if (props.onContactComplete) {
              props.onContactComplete(events);
            }
            setOpen(false);
          }}
          onContactCancel={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
