"use client";
import { gqlClient } from "@/lib/graphql/client";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ApolloProvider } from "@apollo/client/react";
import Announcer from "@/components/Announcer";
import InstallPrompt from "./InstallPrompt";
import { useSocket } from "@/stores/useSocket";

export default function ClientWrappers({
  children,
}: {
  children: React.ReactNode;
}) {
  const { inRoom } = useSocket();
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
      libraries={["places", "routes"]}
    >
      <ApolloProvider client={gqlClient}>
        <InstallPrompt />
        {inRoom && <Announcer />}
        {children}
      </ApolloProvider>
    </APIProvider>
  );
}
