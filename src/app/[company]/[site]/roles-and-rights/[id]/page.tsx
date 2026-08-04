import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="Role Details"
      description={`Placeholder for role ${id}.`}
    />
  );
}
