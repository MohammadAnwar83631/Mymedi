import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertDoctorProfileSchema, insertAppointmentSchema, insertMedicalRecordSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
        role: z.enum(["patient", "doctor"])
      });

      const data = schema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);

      if (!user || user.password !== data.password || user.role !== data.role) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't send the password in the response
      const { password, ...userWithoutPassword } = user;
      
      // If user is a doctor, also return their profile
      if (user.role === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(user.id);
        return res.json({ user: userWithoutPassword, doctorProfile });
      }
      
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send the password in the response
      const { password, ...userWithoutPassword } = user;
      
      // If registering as a doctor, also create a doctor profile if provided
      if (userData.role === "doctor" && req.body.doctorProfile) {
        const doctorProfileData = {
          ...req.body.doctorProfile,
          userId: user.id
        };
        
        const validatedDoctorProfile = insertDoctorProfileSchema.parse(doctorProfileData);
        const doctorProfile = await storage.createDoctorProfile(validatedDoctorProfile);
        
        return res.status(201).json({ user: userWithoutPassword, doctorProfile });
      }
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctorProfiles = await storage.getAllDoctorProfiles();
      
      // Get full user information for each doctor
      const doctors = await Promise.all(
        doctorProfiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            profile
          };
        })
      );
      
      // Filter out any null values (in case a user wasn't found)
      const filteredDoctors = doctors.filter(Boolean);
      
      return res.json(filteredDoctors);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const user = await storage.getUser(doctorId);
      if (!user || user.role !== "doctor") {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      const doctorProfile = await storage.getDoctorProfileByUserId(doctorId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        ...userWithoutPassword,
        profile: doctorProfile
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Patient medical records routes
  app.get("/api/patients/:id/medical-records", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const records = await storage.getMedicalRecords(patientId);
      return res.json(records);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/patients/:id/medical-records/:type", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const recordType = req.params.type;
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const records = await storage.getMedicalRecordsByType(patientId, recordType);
      return res.json(records);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/patients/:id/medical-records", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const recordData = {
        ...req.body,
        patientId
      };
      
      const validatedRecord = insertMedicalRecordSchema.parse(recordData);
      const record = await storage.createMedicalRecord(validatedRecord);
      
      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Appointment routes
  app.get("/api/patients/:id/appointments", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const appointments = await storage.getAppointmentsByPatient(patientId);
      
      // Enrich with doctor information
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const doctor = await storage.getUser(appointment.doctorId);
          const doctorProfile = doctor ? await storage.getDoctorProfileByUserId(doctor.id) : null;
          
          return {
            ...appointment,
            doctor: doctor ? {
              id: doctor.id,
              firstName: doctor.firstName,
              lastName: doctor.lastName,
              email: doctor.email,
              profile: doctorProfile
            } : null
          };
        })
      );
      
      return res.json(enrichedAppointments);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/doctors/:id/appointments", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      
      // Enrich with patient information
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getUser(appointment.patientId);
          
          return {
            ...appointment,
            patient: patient ? {
              id: patient.id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              email: patient.email
            } : null
          };
        })
      );
      
      return res.json(enrichedAppointments);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const schema = z.object({
        status: z.enum(["scheduled", "completed", "cancelled"])
      });
      
      const { status } = schema.parse(req.body);
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      return res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Vital signs routes
  app.get("/api/patients/:id/vital-signs", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const vitalSigns = await storage.getLatestVitalSigns(patientId);
      if (!vitalSigns) {
        return res.status(404).json({ message: "Vital signs not found" });
      }
      
      return res.json(vitalSigns);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Lab results routes
  app.get("/api/patients/:id/lab-results", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const labResults = await storage.getLabResults(patientId);
      return res.json(labResults);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Chatbot routes
  app.get("/api/users/:id/messages", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messages = await storage.getMessagesByUser(userId);
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/users/:id/messages", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messageData = {
        ...req.body,
        userId
      };
      
      const validatedMessage = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedMessage);
      
      // Generate bot response if this is a user message (not a bot message)
      if (!message.isBot) {
        const botResponse = generateBotResponse(message.content);
        await storage.createMessage({
          userId,
          content: botResponse,
          isBot: true
        });
      }
      
      // Return all messages for this user
      const allMessages = await storage.getMessagesByUser(userId);
      return res.json(allMessages);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  return httpServer;
}

// Helper function to generate bot responses
function generateBotResponse(message: string): string {
  message = message.toLowerCase();
  
  if (message.includes("appointment") || message.includes("book") || message.includes("schedule")) {
    return "I'd be happy to help you book an appointment. Would you like to schedule with a specific doctor or by specialty? You can also go to the 'Find Doctors' page to browse available doctors.";
  } else if (message.includes("record") || message.includes("history") || message.includes("document")) {
    return "Your medical records are accessible from your patient dashboard. There you can view your history, prescriptions, and lab results. Would you like me to guide you there?";
  } else if (message.includes("doctor") || message.includes("specialist")) {
    return "We have many great doctors in our system. You can view them in the 'Find Doctors' section where you can filter by specialty, rating, and availability. Would you like to see our top-rated doctors?";
  } else if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! How can I assist you with your healthcare needs today?";
  } else if (message.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with?";
  } else {
    return "I'm not sure I understand. Could you rephrase that? I can help with appointment booking, accessing medical records, or finding doctors.";
  }
}
