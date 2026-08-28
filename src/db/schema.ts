import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull().unique(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  distance: integer('distance').notNull(),
  status: text('status').notNull(),
  photos: jsonb('photos').notNull(),
  headline: text('headline'),
  aboutMe: text('about_me'),
  height: text('height'),
  weight: text('weight'),
  bodyType: text('body_type'),
  position: text('position'),
  lookingFor: jsonb('looking_for'),
  tribes: jsonb('tribes').notNull(),
  interestTags: jsonb('interest_tags'),
  isVerified: boolean('is_verified').default(false),
  locationName: text('location_name').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  isFavorite: boolean('is_favorite').default(false),
  isTapped: boolean('is_tapped').default(false),
  isCompanionPro: boolean('is_companion_pro').default(false),
  companionServices: jsonb('companion_services'),
  companionRate: text('companion_rate'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  resourceName: text('resource_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  contacts: many(contacts),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.uid],
  }),
}));
