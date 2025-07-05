//app/auth/form_signup/edit/[id]/page.tsx
import EditProfileForm from "@/app/components/auth/EditProfileForm";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {

  const resolvedParams = await params;
  return <EditProfileForm userId={resolvedParams.id} />;
}