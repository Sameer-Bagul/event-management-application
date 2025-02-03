import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database";

const CreateEvent = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");

  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    redirect("/sign-in");
    return null;
  }

  return (
    <>
      <section className="bg-primary-50 dark:bg-gray-900 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={user._id.toString()} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;