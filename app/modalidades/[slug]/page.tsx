import { ModalityView } from "@/components/modality-view";
import { MODALITY_BY_SLUG } from "@/constants/modalities";
import { notFound } from "next/navigation";

export default async function ModalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modality = MODALITY_BY_SLUG[slug];
  if (!modality) notFound();
  return <ModalityView modality={modality} />;
}
