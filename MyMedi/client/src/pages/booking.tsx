import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const visitReasons = [
  { value: "newPatient", label: "New Patient Consultation" },
  { value: "followUp", label: "Follow-up Visit" },
  { value: "annualCheckup", label: "Annual Check-up" },
  { value: "illness", label: "Illness or Injury" },
  { value: "chronicCondition", label: "Chronic Condition Management" },
  { value: "labResults", label: "Lab Results Review" },
  { value: "prescription", label: "Prescription Refill" },
  { value: "other", label: "Other" }
];

const Booking = () => {
  const { doctorId } = useParams<{ doctorId?: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for booking form
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitType, setVisitType] = useState<"in-person" | "video">("in-person");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("english");
  const [reason, setReason] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  
  // Generate dates for the next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = generateDates();
  
  // Generate time slots from 9 AM to 5 PM, every 30 minutes
  const generateTimeSlots = () => {
    const times = [];
    const start = 9; // 9 AM
    const end = 17; // 5 PM
    
    for (let hour = start; hour < end; hour++) {
      times.push(`${hour}:00`);
      times.push(`${hour}:30`);
    }
    
    return times;
  };
  
  const timeSlots = generateTimeSlots();
  
  // If doctorId is provided, fetch doctor information
  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ['/api/doctors', doctorId],
    enabled: !!doctorId
  });
  
  // All doctors (used if doctorId is not provided)
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
    enabled: !doctorId
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment booked",
        description: "Your appointment has been successfully booked.",
      });
      
      // Invalidate relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/patients', user?.id, 'appointments'] });
      
      // Redirect to dashboard
      setLocation("/patient-dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book appointment. Please try again.",
      });
    }
  });
  
  // Format date to ISO string
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };
  
  // Format time to HH:MM:00 string
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book an appointment.",
      });
      setLocation("/");
      return;
    }
    
    if (!selectedDate || !selectedTime || !reason) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    if (!doctorId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a doctor.",
      });
      return;
    }
    
    // Create appointment data, include language preference for video visits
    const appointmentData = {
      patientId: user.id,
      doctorId: parseInt(doctorId),
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      status: "scheduled",
      visitType,
      reason,
      additionalInfo: visitType === "video" 
        ? `Preferred language: ${preferredLanguage}. ${additionalInfo}` 
        : additionalInfo
    };
    
    createAppointment.mutate(appointmentData);
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book an appointment.",
      });
      setLocation("/");
    }
  }, [isAuthenticated, toast, setLocation]);
  
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Book an Appointment</h1>
        {doctorId && !doctorLoading && doctor ? (
          <p className="text-neutral-600">Schedule a visit with Dr. {doctor.firstName} {doctor.lastName}</p>
        ) : (
          <p className="text-neutral-600">Select a doctor and schedule your visit</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit}>
                {!doctorId && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-800 mb-3">Select Doctor</h3>
                    {doctorsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : doctors ? (
                      <Select required value={doctorId} onValueChange={(value) => setLocation(`/booking/${value}`)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doc: any) => (
                            <SelectItem key={doc.id} value={doc.id.toString()}>
                              Dr. {doc.firstName} {doc.lastName} - {doc.profile.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p>No doctors available</p>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                  <div className="w-full md:w-1/2 mb-6 md:mb-0">
                    <h3 className="text-sm font-medium text-neutral-800 mb-3">Select Date</h3>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        <div className="py-1 text-neutral-500">S</div>
                        <div className="py-1 text-neutral-500">M</div>
                        <div className="py-1 text-neutral-500">T</div>
                        <div className="py-1 text-neutral-500">W</div>
                        <div className="py-1 text-neutral-500">T</div>
                        <div className="py-1 text-neutral-500">F</div>
                        <div className="py-1 text-neutral-500">S</div>
                        
                        {dates.map((date, index) => {
                          const isSelected = selectedDate === date.toISOString();
                          const dateStr = date.toISOString();
                          
                          return (
                            <div 
                              key={index}
                              className={`py-2 rounded cursor-pointer ${
                                isSelected 
                                  ? "bg-primary-600 text-white font-medium" 
                                  : "hover:bg-primary-50"
                              }`}
                              onClick={() => setSelectedDate(dateStr)}
                            >
                              {date.getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <h3 className="text-sm font-medium text-neutral-800 mb-3">
                      Available Times
                      {selectedDate && (
                        <span> - {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </h3>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time, index) => {
                          const isSelected = selectedTime === time;
                          // Format time display
                          const [hour, minute] = time.split(':');
                          const displayHour = parseInt(hour) > 12 ? parseInt(hour) - 12 : hour;
                          const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
                          const displayTime = `${displayHour}:${minute} ${ampm}`;
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              className={`py-2 rounded text-sm font-medium transition ${
                                isSelected 
                                  ? "bg-primary-100 text-primary-700 border border-primary-300" 
                                  : "bg-white hover:bg-primary-50 border border-neutral-200"
                              }`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {displayTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-800 mb-3">Visit Type</h3>
                  <RadioGroup 
                    defaultValue="in-person" 
                    value={visitType}
                    onValueChange={(value) => setVisitType(value as "in-person" | "video")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <div className={`bg-white border rounded-lg p-4 relative ${visitType === "in-person" ? "bg-primary-100 border-primary-300" : "border-neutral-200 hover:bg-neutral-50"}`}>
                      <RadioGroupItem value="in-person" id="in-person" className="absolute h-5 w-5 top-4 right-4" />
                      <Label htmlFor="in-person" className="flex flex-col cursor-pointer">
                        <span className={`font-medium ${visitType === "in-person" ? "text-primary-800" : ""}`}>In-Person Visit</span>
                        <span className={`text-sm mt-1 ${visitType === "in-person" ? "text-primary-700" : "text-neutral-500"}`}>Visit the doctor at their office</span>
                      </Label>
                    </div>
                    
                    <div className={`bg-white border rounded-lg p-4 relative ${visitType === "video" ? "bg-primary-100 border-primary-300" : "border-neutral-200 hover:bg-neutral-50"}`}>
                      <RadioGroupItem value="video" id="video-visit" className="absolute h-5 w-5 top-4 right-4" />
                      <Label htmlFor="video-visit" className="flex flex-col cursor-pointer">
                        <span className={`font-medium ${visitType === "video" ? "text-primary-800" : ""}`}>Video Visit</span>
                        <span className={`text-sm mt-1 ${visitType === "video" ? "text-primary-700" : "text-neutral-500"}`}>Consult with the doctor online</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Language preference for video visits */}
                {visitType === "video" && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-800 mb-3">Preferred Language for Video Visit</h3>
                    <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="telugu">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500 mt-2">
                      Please select your preferred language for the video consultation. 
                      The doctor will try to accommodate your language preference.
                    </p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-800 mb-3">Reason for Visit</h3>
                  <Select required value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {visitReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-800 mb-3">Additional Information</h3>
                  <Textarea 
                    placeholder="Please provide any additional information about your visit..." 
                    className="h-24" 
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!selectedDate || !selectedTime || !reason || createAppointment.isPending}
                  >
                    {createAppointment.isPending ? "Booking..." : "Confirm Appointment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">Appointment Summary</h3>
            </div>
            <CardContent className="p-5">
              {doctorId ? (
                doctorLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Skeleton className="w-12 h-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : doctor ? (
                  <>
                    <div className="flex items-center mb-4">
                      <img 
                        src={doctor.profile.imageUrl} 
                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} 
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h4 className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</h4>
                        <p className="text-sm text-neutral-500">{doctor.profile.specialty}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-200 py-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">Date</span>
                        <span className="font-medium">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">Time</span>
                        <span className="font-medium">
                          {selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">Visit Type</span>
                        <span className="font-medium">{visitType === "in-person" ? "In-Person Visit" : "Video Visit"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Location</span>
                        {visitType === "in-person" ? (
                          <span className="font-medium text-right">
                            Boston Medical Center<br/>
                            123 Main St, Suite 200<br/>
                            Boston, MA 02118
                          </span>
                        ) : (
                          <span className="font-medium text-right">
                            Virtual appointment<br/>
                            Link will be sent<br/>
                            via email
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-200 py-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600">Appointment Fee</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Insurance</span>
                        <span className="font-medium">Blue Cross Blue Shield</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">Your insurance will be billed directly. Co-pay may apply at the time of visit.</p>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-6 text-neutral-500">Select a doctor to see appointment details</p>
                )
              ) : (
                <p className="text-center py-6 text-neutral-500">Select a doctor to see appointment details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
