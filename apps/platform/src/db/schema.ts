import { sql, type InferSelectModel } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, uniqueIndex, uuid, index } from 'drizzle-orm/pg-core'

export const teams = pgTable(
  'teams',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('teams_slug_unique').on(table.slug)],
)

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    characterId: integer('character_id').notNull(),
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('team_members_team_id_character_id_active_unique')
      .on(table.teamId, table.characterId)
      .where(sql`${table.deletedAt} is null`),
    index('team_members_team_id_idx').on(table.teamId),
  ],
)

export type Team = InferSelectModel<typeof teams>
export type TeamMember = InferSelectModel<typeof teamMembers>
