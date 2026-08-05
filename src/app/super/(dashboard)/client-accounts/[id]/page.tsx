import { ClientAccountDetailPage } from "@/components/features/onboarding/ClientAccountDetailPage";

export default async function ClientAccountDetailRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <ClientAccountDetailPage clientId={id} />;
}
