import { EventEditor } from "@/components/event-editor";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet";

export const IndexPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>chronostr</title>
      </Helmet>
      <div className="flex flex-col items-center space-y-6 md:space-y-12">
        <div className="text-center">
          <h1 className="font-bold text-7xl">chronostr</h1>
          <p className="text-gray-500 text-lg">
            A scheduling adjustment and RSVP tool working on the Nostr.
          </p>
        </div>
        <Card className="p-6 w-full mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold">Create New Event</h2>
          <EventEditor />
        </Card>
      </div>
    </Layout>
  );
};
