import { NewPpeItemRoutePage } from "@/components/features/ppe-catalog/NewPpeItemRoutePage";

/**
 * `/ppe-catalog/new` — a route that exists but is not where PPE items are
 * added; the real flow is a modal on the catalog page itself.
 *
 * It used to render `PlaceholderPage` ("this screen is being built"), which was
 * simply untrue and left anyone who followed the URL at a dead end. This points
 * them back to the working flow instead.
 */
export default function NewPpeCatalogPage() {
  return <NewPpeItemRoutePage />;
}
