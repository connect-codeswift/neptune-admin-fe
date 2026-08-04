import { PlaceholderPage } from "@/components/layouts";

type Props = { params: Promise<{ id: string }> };

export default async function DocCategoryDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <PlaceholderPage
      title="Document Category"
      description={`Placeholder for category ${id}.`}
    />
  );
}
