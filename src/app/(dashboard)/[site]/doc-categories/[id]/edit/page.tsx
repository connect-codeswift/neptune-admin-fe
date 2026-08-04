import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function EditDocCategoryPage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="Edit Document Category"
      description={`Placeholder for editing category ${id}.`}
    />
  );
}
