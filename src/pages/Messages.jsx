import PageHeader from '../components/PageHeader'
import ChatBox from '../components/ChatBox'
import { MessageSquare } from 'lucide-react'

export default function Messages() {
  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Messages"
        description="Coordinate pickups directly with hotels, NGOs and volunteers you are working with."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Messages' }]}
      />
      <div className="container-page py-8">
        <ChatBox />
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-forest-500">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Conversations are scoped to donations you are part of, so contact details stay private.
        </p>
      </div>
    </div>
  )
}
