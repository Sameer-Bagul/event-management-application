import EventForm from "@/components/shared/EventForm"
import { getEventById } from "@/lib/actions/event.actions"
import { auth } from "@clerk/nextjs/server"


type Params = Promise<{ slug: string }>

const UpdateEvent = async ({ params}:{params: Params} ) => {
  const { userId } = await auth();
  if(!userId) return { redirect: '/sign-in' }
  const { slug } = await params;
  const event = await getEventById(slug)
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Update Event</h3>
      </section>

      <div className="wrapper my-8">
        <EventForm 
          type="Update" 
          event={event} 
          eventId={event._id} 
          userId={userId} 
        />
      </div>
    </>
  )
}

export default UpdateEvent