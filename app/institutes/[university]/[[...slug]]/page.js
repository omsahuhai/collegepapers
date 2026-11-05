import { redirect } from 'next/navigation';

export default async function LegacyInstitutionRoute({ params }) {
  const { university } = await params;
  redirect(`/institutions/${encodeURIComponent(university.toLowerCase())}`);
}
