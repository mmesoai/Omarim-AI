export type Mail = {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
}

export const mails: Mail[] = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "william.smith@example.com",
    subject: "Re: Your Quote",
    text: "Hi Omarim AI Team,\n\nThanks for the quote. It looks good. One question: does this include long-term support?\n\nBest,\nWilliam",
    date: "2023-10-22T10:00:00",
    read: true,
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    subject: "Urgent: Issue with my account",
    text: "I can't seem to log in to my dashboard. It keeps saying 'Invalid Credentials' but I'm sure I'm using the right password. Can you help me out? This is urgent as I need to process new leads.\n\nThanks,\nOlivia",
    date: "2023-10-22T09:30:00",
    read: false,
  },
  {
    id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
    name: "James Johnson",
    email: "james.johnson@example.com",
    subject: "Feedback on the new feature",
    text: "Hey team,\n\nJust wanted to say the new speech-to-text feature is amazing! It's saving me a ton of time. Great work!\n\nCheers,\nJames",
    date: "2023-10-21T15:45:00",
    read: false,
  },
  {
    id: "f4a9d3f0-b6e1-4a2b-8c7d-9e0f1a2b3c4d",
    name: "Sophia Williams",
    email: "sophia.williams@example.com",
    subject: "Billing question",
    text: "Hello,\n\nI was looking at my last invoice and I see a charge I don't recognize. Can someone from the billing department get in touch with me?\n\nThank you,\nSophia",
    date: "2023-10-21T11:20:00",
    read: true,
  },
  {
    id: "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
    name: "Benjamin Miller",
    email: "ben.miller@example.com",
    subject: "Partnership opportunity",
    text: "Good morning,\n\nMy name is Benjamin Miller and I work for a marketing agency. We're very impressed with your platform and see a lot of potential for a partnership. Are you open to a discussion?\n\nRegards,\nBenjamin",
    date: "2023-10-20T18:05:00",
    read: true,
  },
  {
    id: "e9e8f7a6-b5c4-d3e2-f1a0-9b8c7d6e5f4g",
    name: "Ava Jones",
    email: "ava.jones@example.com",
    subject: "Suggestion for improvement",
    text: "Hi there,\n\nI love using Omarim AI. One thing that I think could be improved is the dashboard loading speed. Sometimes it feels a bit sluggish. Just a thought!\n\nBest,\nAva",
    date: "2023-10-20T14:30:00",
    read: false,
  },
  {
    id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Noah Garcia",
    email: "noah.g@example.com",
    subject: "How do I integrate with WooCommerce?",
    text: "Hello support,\n\nI'm trying to connect my WooCommerce store but I'm running into some issues. Can you provide a step-by-step guide or some documentation?\n\nThanks,\nNoah",
    date: "2023-10-19T09:00:00",
    read: true,
  },
]
