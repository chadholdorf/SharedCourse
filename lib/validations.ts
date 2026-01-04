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
export const rsvpStepASchema = z.object({
  partySize: z.number().int().min(1).max(2),
  budget: z.enum(['ONE', 'TWO']),
  diet: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian', 'glutenFree', 'dairyFree']),
  allergies: z.string().max(500).default(''),
  vibe: z.enum(['relaxed', 'conversational', 'mix']).nullable().optional(),
  afterDinner: z.enum(['home', 'open']).nullable().optional(),
})

export const rsvpStepBSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})

export const createRsvpSchema = rsvpStepASchema.merge(rsvpStepBSchema).extend({
  eventId: z.string().cuid('Invalid event ID'),
})

export type RsvpStepAInput = z.infer<typeof rsvpStepASchema>
export type RsvpStepBInput = z.infer<typeof rsvpStepBSchema>
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>
