import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function EditRolePage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="Edit Role"
      description={`Placeholder for editing role ${id}.`}
    />
  );
}
