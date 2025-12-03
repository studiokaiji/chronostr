import { EventEditor } from "@/components/event-editor";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { Helmet } from "react-helmet";

export const IndexPage = () => {
  const { t } = useI18n();

  return (
    <Layout>
      <Helmet>
        <title>{t.common.chronostr}</title>
      </Helmet>
      <div className="flex flex-col items-center space-y-6 md:space-y-12">
        <div className="text-center">
          <h1 className="font-bold text-7xl">{t.common.chronostr}</h1>
          <p className="text-gray-500 text-lg">{t.common.tagline}</p>
        </div>
        <Card className="p-6 w-full mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold">{t.index.createNewEvent}</h2>
          <EventEditor />
        </Card>
      </div>
    </Layout>
  );
};
