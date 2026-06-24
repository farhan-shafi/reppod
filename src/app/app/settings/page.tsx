import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import SettingsForm from "@/components/settings/SettingsForm";

export const metadata = { title: "Settings · FlexFlow" };

export default async function ClientSettingsPage() {
  const { user: sessionUser } = await requireClient();
  await connectDB();
  const user = await User.findById(sessionUser.id).lean();

  return (
    <SettingsForm
      role="client"
      initial={{
        name: user?.name ?? "",
        email: user?.email ?? "",
        bio: user?.bio ?? "",
        image: user?.image ?? "",
        unitPreference: user?.unitPreference ?? "kg",
        businessName: "",
      }}
    />
  );
}
