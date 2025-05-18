import { pgTable, text, serial, integer, boolean, date, time, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (common for both patients and doctors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'patient' or 'doctor'
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor profile schema
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  languages: text("languages"),
  location: text("location"),
  acceptingNewPatients: boolean("accepting_new_patients").default(true),
  videoVisits: boolean("video_visits").default(false),
  licenseId: text("license_id").notNull(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

// Medical records schema
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  recordType: text("record_type").notNull(), // e.g., 'condition', 'allergy', 'medication', 'procedure', 'immunization'
  name: text("name").notNull(),
  description: text("description"),
  status: text("status"), // e.g., 'active', 'inactive', 'controlled'
  date: date("date"),
  provider: text("provider"),
  additionalInfo: text("additional_info"),
});

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled'
  visitType: text("visit_type").notNull(), // 'in-person', 'video'
  reason: text("reason"),
  additionalInfo: text("additional_info"),
});

// Vital signs schema
export const vitalSigns = pgTable("vital_signs", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  temperature: integer("temperature"),
  weight: integer("weight"),
  height: integer("height"),
  bmi: integer("bmi"),
  bloodGlucose: integer("blood_glucose"),
});

// Lab results schema
export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  testName: text("test_name").notNull(),
  date: date("date").notNull(),
  result: text("result").notNull(),
  unit: text("unit"),
  normalRange: text("normal_range"),
  status: text("status"), // 'normal', 'abnormal', 'critical'
  orderingProvider: text("ordering_provider"),
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isBot: boolean("is_bot").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for inserting doctor profiles
export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({ id: true });
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;

// Schema for inserting medical records
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true });
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Schema for inserting appointments
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Schema for inserting vital signs
export const insertVitalSignSchema = createInsertSchema(vitalSigns).omit({ id: true });
export type InsertVitalSign = z.infer<typeof insertVitalSignSchema>;
export type VitalSign = typeof vitalSigns.$inferSelect;

// Schema for inserting lab results
export const insertLabResultSchema = createInsertSchema(labResults).omit({ id: true });
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
export type LabResult = typeof labResults.$inferSelect;

// Schema for inserting messages
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
