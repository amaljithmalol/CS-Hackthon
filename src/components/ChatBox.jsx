import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare, Paperclip, Search, Send, Smile, Users } from 'lucide-react'
import Avatar from './Avatar'
import Button from './Button'
import Badge, { VerifiedBadge } from './Badge'
import { EmptyState } from './Card'
import { useAsync } from '../hooks/useAsync'
import { getConversationMessages, getConversations, sendMessage } from '../services/messages'
import { cn } from '../utils/cn'
import { formatDateTime, timeAgo } from '../utils/formatDate'
import { EMPTY_LIST, ROLE_SHORT } from '../utils/constants'

export default function ChatBox() {
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const bodyRef = useRef(null)
  const { data, loading, error, reload } = useAsync(() => getConversations(), [])

  const conversations = (data?.conversations ?? EMPTY_LIST).filter((c) =>
    search
      ? [c.participant_name, c.organization, c.last_message]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(search.toLowerCase()))
      : true,
  )

  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id)
  }, [conversations, activeId])

  const active = conversations.find((c) => c.id === activeId) ?? null
  const thread = useAsync(
    () => (activeId ? getConversationMessages(activeId) : Promise.resolve({ messages: [] })),
    [activeId],
  )

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [thread.data?.messages?.length, activeId])

  const handleSend = async (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !active?.participant?.id) return
    setSending(true)
    setDraft('')
    thread.setData((current) => ({
      ...current,
      messages: [
        ...(current?.messages ?? []),
        { id: `tmp-${Date.now()}`, message: text, created_at: new Date().toISOString(), mine: true },
      ],
    }))
    try {
      await sendMessage({ receiverId: active.participant.id, message: text })
      await thread.reload()
      reload()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <section
        className="overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-soft"
        aria-label="Conversations"
      >
        <div className="border-b border-forest-100 p-4">
          <h2 className="text-sm font-semibold">Conversations</h2>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="input-base py-2 pl-9"
            />
          </div>
        </div>

        <div className="max-h-[28rem] overflow-y-auto lg:max-h-[34rem]">
          {loading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-forest-500">No conversations yet.</p>
          ) : (
            <ul>
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-forest-50 p-4 text-left transition',
                      activeId === conversation.id ? 'bg-brand-50/60' : 'hover:bg-forest-50',
                    )}
                  >
                    <Avatar name={conversation.participant_name} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-forest-900">
                          {conversation.participant_name}
                        </span>
                        <span className="shrink-0 text-[11px] text-forest-400">
                          {timeAgo(conversation.last_message_at)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-forest-500">
                        {conversation.last_message}
                      </span>
                      {conversation.participant_role ? (
                        <span className="mt-1.5 inline-block">
                          <Badge tone="neutral" size="sm">
                            {ROLE_SHORT[conversation.participant_role] ?? conversation.participant_role}
                          </Badge>
                        </span>
                      ) : null}
                    </span>
                    {conversation.unread ? (
                      <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        className="flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-soft lg:min-h-[34rem]"
        aria-label="Chat"
      >
        {error ? (
          <div className="p-6">
            <EmptyState icon={MessageSquare} title="Could not load messages" description={error} />
          </div>
        ) : !active ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation on the left to read and reply to messages."
            />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-forest-100 px-4 py-3.5">
              <Avatar name={active.participant_name} status="online" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{active.participant_name}</p>
                <p className="truncate text-xs text-forest-500">{active.organization ?? active.participant?.address}</p>
              </div>
              {active.participant?.verified ? (
                <VerifiedBadge status={active.participant.verification_status} label="Verified partner" />
              ) : null}
            </header>

            <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto bg-forest-50/40 p-4">
              {thread.loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-12 w-2/3" />
                  ))}
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {(thread.data?.messages ?? []).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', message.mine ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft',
                          message.mine
                            ? 'rounded-br-md bg-brand-600 text-white'
                            : 'rounded-bl-md border border-forest-100 bg-white text-forest-800',
                        )}
                      >
                        <p className="leading-relaxed">{message.message}</p>
                        <p
                          className={cn(
                            'mt-1 text-[10px]',
                            message.mine ? 'text-white/75' : 'text-forest-400',
                          )}
                        >
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-forest-100 bg-white p-3">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-forest-400 transition hover:bg-forest-50 hover:text-forest-600 sm:inline-flex"
                  aria-label="Attach a file"
                >
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                </button>
                <label htmlFor="chat-input" className="sr-only">
                  Type a message
                </label>
                <input
                  id="chat-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  className="input-base py-2.5"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" loading={sending} aria-label="Send message">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-forest-400">
                <Users className="h-3 w-3" aria-hidden="true" />
                Messages are visible to the verified members of this donation.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

export const ChatPlaceholderIcon = Smile
