import { requireTrainer } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import SettingsForm from "@/components/settings/SettingsForm";

export const metadata = { title: "Settings · FlexFlow" };

export default async function TrainerSettingsPage() {
  const sessionUser = await requireTrainer();
  await connectDB();
  const user = await User.findById(sessionUser.id).lean();

  return (
    <SettingsForm
      role="trainer"
      initial={{
        name: user?.name ?? "",
        email: user?.email ?? "",
        bio: user?.bio ?? "",
        image: user?.image ?? "",
        unitPreference: user?.unitPreference ?? "kg",
        businessName: user?.businessName ?? "",
      }}
    />
  );
}
