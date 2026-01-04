import { z } from 'zod'

// Event validations
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  startAt: z.string().datetime('Invalid date format'),
  rsvpCloseAt: z.string().datetime('Invalid date format'),
  groupSize: z.number().int().min(2).max(20).default(6),
})
.refine(data => new Date(data.rsvpCloseAt) < new Date(data.startAt), {
  message: 'RSVP close must be before event start',
  path: ['rsvpCloseAt'],
})

export type CreateEventInput = z.infer<typeof createEventSchema>

// RSVP validations
export const createRsvpSchema = z.object({
  eventId: z.string().cuid('Invalid event ID'),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  partySize: z.number().int().min(1).max(2, 'Party size must be 1 or 2'),
  diet: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian', 'glutenFree', 'dairyFree']),
  allergies: z.string().max(500).default(''),
  vibe: z.enum(['relaxed', 'conversational', 'mix']).nullable().optional(),
})

export type CreateRsvpInput = z.infer<typeof createRsvpSchema>
