import { z } from 'zod';

/**
 * Valid participation categories for PUBG Mobile Community Assembly Ethiopia.
 */
export const PARTICIPATION_CATEGORIES = [
  'attendee',
  'tournament_player',
  'team_rep',
  'content_creator',
  'volunteer',
] as const;

export type ParticipationCategory = (typeof PARTICIPATION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ParticipationCategory, string> = {
  attendee: 'General Attendee',
  tournament_player: 'Tournament Competitor',
  team_rep: 'Esports Team Representative',
  content_creator: 'Content Creator / Streamer',
  volunteer: 'Event Crew / Volunteer',
};

/**
 * Player Identity Schema
 * Validates personal and in-game credentials.
 */
export const playerIdentitySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  inGameName: z
    .string()
    .trim()
    .min(2, 'In-Game Name (IGN) must be at least 2 characters')
    .max(50, 'In-Game Name cannot exceed 50 characters'),
  pubgUid: z
    .string()
    .trim()
    .min(5, 'PUBG UID must be at least 5 digits')
    .max(15, 'PUBG UID cannot exceed 15 digits')
    .regex(/^\d+$/, 'PUBG UID must contain only numeric digits'),
  phoneNumber: z
    .string()
    .trim()
    .min(9, 'Phone number must be at least 9 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(
      /^[0-9+\s()-]{9,20}$/,
      'Phone number must contain only numbers and standard formatting characters'
    ),
  countryCode: z
    .string()
    .trim()
    .regex(/^\+[0-9]{1,4}$/, 'Country code must be in +XXX format')
    .default('+251'),
  cityRegion: z
    .string()
    .trim()
    .min(2, 'City or Region must be at least 2 characters')
    .max(100, 'City or Region cannot exceed 100 characters'),
});

/**
 * Participation Schema
 * Validates category, esports team, squad details, and tournament intent.
 */
export const participationSchema = z.object({
  category: z.enum(PARTICIPATION_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid participation category' }),
  }),
  teamName: z
    .string()
    .trim()
    .max(100, 'Team name cannot exceed 100 characters')
    .optional()
    .nullable()
    .transform((val) => val || null),
  tournamentInterest: z
    .boolean()
    .default(false),
  squadDetails: z
    .string()
    .trim()
    .max(500, 'Squad details cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Full Registration Schema
 * Merges Player Identity and Participation schemas for the registration flow.
 */
export const registrationSchema = playerIdentitySchema.merge(participationSchema);

/**
 * Admin Login Schema
 * Validates admin authentication requests.
 */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// Inferred TypeScript Types
export type PlayerIdentityInput = z.infer<typeof playerIdentitySchema>;
export type ParticipationInput = z.infer<typeof participationSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
