import {
  users, insertUserSchema, type User, type InsertUser,
  doctorProfiles, type DoctorProfile, type InsertDoctorProfile,
  medicalRecords, type MedicalRecord, type InsertMedicalRecord,
  appointments, type Appointment, type InsertAppointment,
  vitalSigns, type VitalSign, type InsertVitalSign,
  labResults, type LabResult, type InsertLabResult,
  messages, type Message, type InsertMessage
} from "@shared/schema";

// Storage interface definition
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllDoctors(): Promise<User[]>;

  // Doctor profile methods
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  getAllDoctorProfiles(): Promise<DoctorProfile[]>;
  
  // Medical records methods
  getMedicalRecords(patientId: number): Promise<MedicalRecord[]>;
  getMedicalRecordsByType(patientId: number, type: string): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;

  // Appointment methods
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;

  // Vital signs methods
  getLatestVitalSigns(patientId: number): Promise<VitalSign | undefined>;
  createVitalSign(vitalSign: InsertVitalSign): Promise<VitalSign>;

  // Lab results methods
  getLabResults(patientId: number): Promise<LabResult[]>;
  createLabResult(labResult: InsertLabResult): Promise<LabResult>;

  // Message methods
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private medicalRecords: Map<number, MedicalRecord>;
  private appointments: Map<number, Appointment>;
  private vitalSigns: Map<number, VitalSign>;
  private labResults: Map<number, LabResult>;
  private messages: Map<number, Message>;

  private userIdCounter: number;
  private doctorProfileIdCounter: number;
  private medicalRecordIdCounter: number;
  private appointmentIdCounter: number;
  private vitalSignIdCounter: number;
  private labResultIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.doctorProfiles = new Map();
    this.medicalRecords = new Map();
    this.appointments = new Map();
    this.vitalSigns = new Map();
    this.labResults = new Map();
    this.messages = new Map();

    this.userIdCounter = 1;
    this.doctorProfileIdCounter = 1;
    this.medicalRecordIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.vitalSignIdCounter = 1;
    this.labResultIdCounter = 1;
    this.messageIdCounter = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    // Create sample users
    const patientJohn = this.createUser({
      username: "john.doe",
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: "patient",
      phone: "123-456-7890",
      address: "123 Main St, Boston, MA"
    });

    const doctorSarah = this.createUser({
      username: "sarah.johnson",
      email: "sarah@example.com",
      password: "doctor123",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "doctor",
      phone: "987-654-3210",
      address: "456 Medical Ave, Boston, MA"
    });

    const doctorMichael = this.createUser({
      username: "michael.chen",
      email: "michael@example.com",
      password: "doctor123",
      firstName: "Michael",
      lastName: "Chen",
      role: "doctor",
      phone: "555-123-4567",
      address: "789 Health St, Boston, MA"
    });

    const doctorEmily = this.createUser({
      username: "emily.rodriguez",
      email: "emily@example.com",
      password: "doctor123",
      firstName: "Emily",
      lastName: "Rodriguez",
      role: "doctor",
      phone: "111-222-3333",
      address: "321 Pediatric Ln, Boston, MA"
    });

    const doctorDavid = this.createUser({
      username: "david.williams",
      email: "david@example.com",
      password: "doctor123",
      firstName: "David",
      lastName: "Williams",
      role: "doctor",
      phone: "444-555-6666",
      address: "654 Derma Dr, Boston, MA"
    });

    const doctorPriya = this.createUser({
      username: "priya.patel",
      email: "priya@example.com",
      password: "doctor123",
      firstName: "Priya",
      lastName: "Patel",
      role: "doctor",
      phone: "777-888-9999",
      address: "987 Neuro Cir, Boston, MA"
    });

    const doctorJames = this.createUser({
      username: "james.wilson",
      email: "james@example.com",
      password: "doctor123",
      firstName: "James",
      lastName: "Wilson",
      role: "doctor",
      phone: "111-333-5555",
      address: "246 Ortho St, Boston, MA"
    });

    // Create doctor profiles
    this.createDoctorProfile({
      userId: doctorSarah.id,
      specialty: "Cardiology",
      bio: "Board certified cardiologist with over 15 years of experience specializing in preventive cardiology and heart disease management.",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      languages: "English, Spanish",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-12345",
      rating: 45,
      reviewCount: 128
    });

    this.createDoctorProfile({
      userId: doctorMichael.id,
      specialty: "General Practice",
      bio: "Family physician focused on comprehensive primary care for patients of all ages. Special interest in chronic disease management and preventive medicine.",
      imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
      languages: "English, Mandarin",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-23456",
      rating: 50,
      reviewCount: 97
    });

    this.createDoctorProfile({
      userId: doctorEmily.id,
      specialty: "Pediatrics",
      bio: "Compassionate pediatrician dedicated to providing comprehensive care for children from birth through adolescence. Focuses on developmental milestones and preventive care.",
      imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
      languages: "English, Spanish",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-34567",
      rating: 40,
      reviewCount: 115
    });

    this.createDoctorProfile({
      userId: doctorDavid.id,
      specialty: "Dermatology",
      bio: "Board-certified dermatologist specializing in medical, surgical, and cosmetic dermatology. Experienced in treating various skin conditions including acne, eczema, and psoriasis.",
      imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
      languages: "English",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-45678",
      rating: 45,
      reviewCount: 142
    });

    this.createDoctorProfile({
      userId: doctorPriya.id,
      specialty: "Neurology",
      bio: "Neurologist with expertise in treating headaches, movement disorders, and neurodegenerative diseases. Committed to providing personalized care for complex neurological conditions.",
      imageUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f",
      languages: "English, Hindi",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-56789",
      rating: 40,
      reviewCount: 87
    });

    this.createDoctorProfile({
      userId: doctorJames.id,
      specialty: "Orthopedics",
      bio: "Orthopedic surgeon specializing in sports medicine and joint replacement. Extensive experience in minimally invasive techniques for faster recovery and better outcomes.",
      imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7",
      languages: "English",
      location: "Boston, MA",
      acceptingNewPatients: true,
      videoVisits: true,
      licenseId: "MED-67890",
      rating: 50,
      reviewCount: 103
    });

    // Create medical records for the patient
    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "condition",
      name: "Hypertension (Essential)",
      description: "Elevated blood pressure requiring medication management",
      status: "Active",
      date: new Date("2021-01-15"),
      provider: "Dr. Sarah Johnson",
      additionalInfo: "Monitor every 3 months"
    });

    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "condition",
      name: "Type 2 Diabetes Mellitus",
      description: "Blood glucose management with medication and diet",
      status: "Controlled",
      date: new Date("2020-03-10"),
      provider: "Dr. Michael Chen",
      additionalInfo: "HbA1c target < 7.0%"
    });

    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "condition",
      name: "Hyperlipidemia",
      description: "Elevated cholesterol levels",
      status: "Controlled",
      date: new Date("2021-01-15"),
      provider: "Dr. Sarah Johnson",
      additionalInfo: "Diet control and medication"
    });

    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "medication",
      name: "Amlodipine",
      description: "5mg",
      status: "Active",
      date: new Date("2023-04-15"),
      provider: "Dr. Sarah Johnson",
      additionalInfo: "Once daily"
    });

    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "medication",
      name: "Metformin",
      description: "500mg",
      status: "Active",
      date: new Date("2023-03-20"),
      provider: "Dr. Michael Chen",
      additionalInfo: "Twice daily"
    });

    this.createMedicalRecord({
      patientId: patientJohn.id,
      recordType: "medication",
      name: "Atorvastatin",
      description: "10mg",
      status: "Active",
      date: new Date("2023-03-20"),
      provider: "Dr. Sarah Johnson",
      additionalInfo: "Once daily at bedtime"
    });

    // Create appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.createAppointment({
      patientId: patientJohn.id,
      doctorId: doctorSarah.id,
      date: tomorrow,
      time: { hours: 10, minutes: 0, seconds: 0 },
      status: "scheduled",
      visitType: "in-person",
      reason: "Follow-up Appointment",
      additionalInfo: "Blood pressure check"
    });

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 15);
    
    this.createAppointment({
      patientId: patientJohn.id,
      doctorId: doctorMichael.id,
      date: nextMonth,
      time: { hours: 14, minutes: 30, seconds: 0 },
      status: "scheduled",
      visitType: "in-person",
      reason: "Regular Check-up",
      additionalInfo: "Annual physical"
    });

    // Create vital signs
    this.createVitalSign({
      patientId: patientJohn.id,
      date: new Date("2023-04-15"),
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
      heartRate: 78,
      respiratoryRate: 16,
      temperature: 986, // Stored as 98.6 * 10 to avoid floating point
      weight: 182,
      height: 70,
      bmi: 234, // Stored as 23.4 * 10
      bloodGlucose: 98
    });

    // Create lab results
    this.createLabResult({
      patientId: patientJohn.id,
      testName: "Complete Blood Count",
      date: new Date("2023-04-10"),
      result: "Normal",
      unit: "various",
      normalRange: "Reference ranges vary by component",
      status: "normal",
      orderingProvider: "Dr. Sarah Johnson"
    });

    this.createLabResult({
      patientId: patientJohn.id,
      testName: "Lipid Panel",
      date: new Date("2023-04-10"),
      result: "Borderline",
      unit: "mg/dL",
      normalRange: "LDL < 100, HDL > 40, Total < 200",
      status: "abnormal",
      orderingProvider: "Dr. Sarah Johnson"
    });

    this.createLabResult({
      patientId: patientJohn.id,
      testName: "Blood Glucose",
      date: new Date("2023-03-25"),
      result: "98 mg/dL",
      unit: "mg/dL",
      normalRange: "70-99 mg/dL",
      status: "normal",
      orderingProvider: "Dr. Michael Chen"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getAllDoctors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "doctor"
    );
  }

  // Doctor profile methods
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }

  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createDoctorProfile(insertProfile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.doctorProfileIdCounter++;
    const profile: DoctorProfile = { ...insertProfile, id };
    this.doctorProfiles.set(id, profile);
    return profile;
  }

  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return Array.from(this.doctorProfiles.values());
  }

  // Medical records methods
  async getMedicalRecords(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.patientId === patientId
    );
  }

  async getMedicalRecordsByType(patientId: number, type: string): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.patientId === patientId && record.recordType === type
    );
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.medicalRecordIdCounter++;
    const record: MedicalRecord = { ...insertRecord, id };
    this.medicalRecords.set(id, record);
    return record;
  }

  // Appointment methods
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status;
      this.appointments.set(id, appointment);
      return appointment;
    }
    return undefined;
  }

  // Vital signs methods
  async getLatestVitalSigns(patientId: number): Promise<VitalSign | undefined> {
    const vitalSigns = Array.from(this.vitalSigns.values()).filter(
      (vs) => vs.patientId === patientId
    );
    
    if (vitalSigns.length === 0) return undefined;
    
    // Sort by date (latest first) and return the first element
    return vitalSigns.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })[0];
  }

  async createVitalSign(insertVitalSign: InsertVitalSign): Promise<VitalSign> {
    const id = this.vitalSignIdCounter++;
    const vitalSign: VitalSign = { ...insertVitalSign, id };
    this.vitalSigns.set(id, vitalSign);
    return vitalSign;
  }

  // Lab results methods
  async getLabResults(patientId: number): Promise<LabResult[]> {
    return Array.from(this.labResults.values()).filter(
      (result) => result.patientId === patientId
    );
  }

  async createLabResult(insertLabResult: InsertLabResult): Promise<LabResult> {
    const id = this.labResultIdCounter++;
    const labResult: LabResult = { ...insertLabResult, id };
    this.labResults.set(id, labResult);
    return labResult;
  }

  // Message methods
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
