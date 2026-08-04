import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="User Details"
      description={`Placeholder for user ${id}.`}
    />
  );
}
