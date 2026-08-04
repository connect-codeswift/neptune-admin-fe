import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="Edit User"
      description={`Placeholder for editing user ${id}.`}
    />
  );
}
