const H = 60 * 60 * 1000
const ago = (h) => new Date(Date.now() - h * H).toISOString()

export const mockConversations = [
  {
    id: 'c-1',
    participant_id: 'u-hotel-1',
    participant_name: 'Rahul Varma',
    participant_role: 'hotel',
    organization: 'Green Leaf Restaurant',
    last_message: 'We will keep the biriyani packed hot until 9:30 pm.',
    last_message_at: ago(0.4),
    unread: 2,
    messages: [
      { id: 'm-1', sender_id: 'u-ngo-1', text: 'Hello, we would like to collect the biriyani posted this evening.', created_at: ago(1.2) },
      { id: 'm-2', sender_id: 'u-hotel-1', text: 'Happy to help. 40 meals, packed in 4 trays.', created_at: ago(1.0) },
      { id: 'm-3', sender_id: 'u-ngo-1', text: 'Great. Our volunteer Nikhil will reach by 9:15 pm.', created_at: ago(0.6) },
      { id: 'm-4', sender_id: 'u-hotel-1', text: 'We will keep the biriyani packed hot until 9:30 pm.', created_at: ago(0.4) },
    ],
  },
  {
    id: 'c-2',
    participant_id: 'u-vol-1',
    participant_name: 'Nikhil Raj',
    participant_role: 'volunteer',
    organization: 'Volunteer · Mananchira',
    last_message: 'On my way, roughly 10 minutes out.',
    last_message_at: ago(1.6),
    unread: 0,
    messages: [
      { id: 'm-5', sender_id: 'u-ngo-1', text: 'Can you take the sandwich pickup from Spice Garden?', created_at: ago(2.2) },
      { id: 'm-6', sender_id: 'u-vol-1', text: 'Yes, accepted. Which entrance should I use?', created_at: ago(2.0) },
      { id: 'm-7', sender_id: 'u-ngo-1', text: 'Rear gate, ask for the duty manager.', created_at: ago(1.8) },
      { id: 'm-8', sender_id: 'u-vol-1', text: 'On my way, roughly 10 minutes out.', created_at: ago(1.6) },
    ],
  },
  {
    id: 'c-3',
    participant_id: 'u-hotel-5',
    participant_name: 'Vinod Nair',
    participant_role: 'hotel',
    organization: 'Spice Garden Hotel',
    last_message: 'Loading bay access confirmed for 8:00 pm.',
    last_message_at: ago(26),
    unread: 0,
    messages: [
      { id: 'm-9', sender_id: 'u-vol-3', text: 'Confirming collection for the banana leaf meals tonight.', created_at: ago(28) },
      { id: 'm-10', sender_id: 'u-hotel-5', text: 'Loading bay access confirmed for 8:00 pm.', created_at: ago(26) },
    ],
  },
  {
    id: 'c-4',
    participant_id: 'u-ngo-2',
    participant_name: 'Sudhakar Pillai',
    participant_role: 'ngo',
    organization: 'Anna Charitable Foundation',
    last_message: 'Thank you — the bakery items reached the shelter.',
    last_message_at: ago(48),
    unread: 0,
    messages: [
      { id: 'm-11', sender_id: 'u-hotel-1', text: 'Bakery items are ready for pickup today.', created_at: ago(52) },
      { id: 'm-12', sender_id: 'u-ngo-2', text: 'Thank you — the bakery items reached the shelter.', created_at: ago(48) },
    ],
  },
]

export const mockMessages = mockConversations.flatMap((c) => c.messages)
