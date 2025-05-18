import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorDashboard = () => {
  const { user, doctorProfile, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (user?.role !== "doctor") {
      setLocation("/patient-dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch appointments for this doctor
  const { 
    data: appointments, 
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['/api/doctors', user?.id, 'appointments'],
    enabled: !!user?.id
  });

  // Today's date
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];

  // Filter today's appointments
  const todayAppointments = appointments?.filter(
    appointment => new Date(appointment.date).toISOString().split('T')[0] === todayFormatted
  );

  // Get the current appointment (for demo, just take the first one)
  const currentPatient = todayAppointments && todayAppointments.length > 0 
    ? todayAppointments[0].patient 
    : null;

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Hello, Dr. {user.lastName}</h1>
        <p className="text-neutral-600">You have {todayAppointments?.length || 0} appointments today</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Schedule */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Today's Schedule</h3>
              <span className="text-sm text-primary-600 cursor-pointer">View Calendar</span>
            </div>
            
            {appointmentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : todayAppointments && todayAppointments.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {todayAppointments.map((appointment, index) => (
                  <div key={appointment.id} className="py-3">
                    <div className="flex items-start">
                      <div className="bg-primary-100 rounded-lg px-2 py-1 text-center mr-3">
                        <p className="text-xs text-primary-700">
                          {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', { hour: 'numeric' })}
                        </p>
                        <p className="text-xs text-primary-700">
                          {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', { hour12: true, minute: '2-digit' }).split(' ')[1]}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
                        <p className="text-sm text-neutral-500">{appointment.reason}</p>
                        {index === 0 && (
                          <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Patient Overview */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Patient Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-neutral-600 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-neutral-800">358</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-neutral-600 text-sm">New This Month</p>
                <p className="text-2xl font-bold text-neutral-800">24</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-neutral-600 text-sm">Avg. Appointments</p>
                <p className="text-2xl font-bold text-neutral-800">12</p>
                <p className="text-xs text-neutral-500">per day</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3 text-center">
                <p className="text-neutral-600 text-sm">Satisfaction</p>
                <p className="text-2xl font-bold text-green-600">
                  {doctorProfile ? (doctorProfile.rating / 10).toFixed(1) : "4.8"}
                </p>
                <p className="text-xs text-neutral-500">out of 5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Messages */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Recent Messages</h3>
              <span className="text-sm text-primary-600 cursor-pointer">View All</span>
            </div>
            <div className="divide-y divide-neutral-200">
              <div className="py-3">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                    <span className="text-neutral-500 font-medium">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-neutral-500 truncate">Question about medication side effects...</p>
                    <p className="text-xs text-neutral-400 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                    <span className="text-neutral-500 font-medium">SM</span>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Miller</p>
                    <p className="text-sm text-neutral-500 truncate">Need to reschedule my appointment tomorrow...</p>
                    <p className="text-xs text-neutral-400 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                    <span className="text-neutral-500 font-medium">RJ</span>
                  </div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-sm text-neutral-500 truncate">Thank you for the prescription refill...</p>
                    <p className="text-xs text-neutral-400 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Current Patient */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">
                {currentPatient 
                  ? `Current Patient: ${currentPatient.firstName} ${currentPatient.lastName}`
                  : "No Current Patient"}
              </h3>
            </div>
            {currentPatient ? (
              <>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500">Age</p>
                      <p className="text-lg font-medium">42 years</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500">Blood Type</p>
                      <p className="text-lg font-medium">O+</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-500">Last Visit</p>
                      <p className="text-lg font-medium">Mar 10, 2023</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-800 mb-2">Medical History</h4>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Hypertension (diagnosed 2018)</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Type 2 Diabetes (diagnosed 2019)</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Appendectomy (2010)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-neutral-800 mb-2">Current Medications</h4>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Lisinopril 10mg daily</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Metformin 500mg twice daily</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-circle text-[4px] text-neutral-400 mt-1.5 mr-2"></i>
                          <span>Atorvastatin 20mg daily</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-neutral-800 mb-2">Recent Vitals</h4>
                    <div className="bg-neutral-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-neutral-500">Blood Pressure</p>
                          <p className="text-base font-medium">128/82 mmHg</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Heart Rate</p>
                          <p className="text-base font-medium">78 bpm</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Temperature</p>
                          <p className="text-base font-medium">98.6°F</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Weight</p>
                          <p className="text-base font-medium">182 lbs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-200">
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-notes-medical mr-2"></i>
                      Update Records
                    </Button>
                    <Button className="flex-1">
                      <i className="fas fa-prescription mr-2"></i>
                      Prescribe
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="p-5">
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-user-md text-neutral-400 text-xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-neutral-800 mb-2">No Patient Currently</h4>
                  <p className="text-neutral-600 mb-4">No active appointments at the moment</p>
                  <Button>
                    <i className="fas fa-calendar-plus mr-2"></i>
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
        
        {/* My Schedule */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">My Schedule</h3>
            </div>
            <CardContent className="p-5">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-800">{today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}</h4>
                  <div className="flex space-x-2">
                    <button type="button" className="text-neutral-500 hover:text-neutral-700">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button type="button" className="text-neutral-500 hover:text-neutral-700">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  <div className="py-1 text-neutral-500">S</div>
                  <div className="py-1 text-neutral-500">M</div>
                  <div className="py-1 text-neutral-500">T</div>
                  <div className="py-1 text-neutral-500">W</div>
                  <div className="py-1 text-neutral-500">T</div>
                  <div className="py-1 text-neutral-500">F</div>
                  <div className="py-1 text-neutral-500">S</div>
                  
                  {/* Generate calendar days */}
                  {Array.from({ length: 35 }).map((_, index) => {
                    const day = new Date(today.getFullYear(), today.getMonth(), index - today.getDay() + 1);
                    const isCurrentMonth = day.getMonth() === today.getMonth();
                    const isToday = day.toDateString() === today.toDateString();
                    
                    return (
                      <div 
                        key={index}
                        className={`py-1 ${
                          !isCurrentMonth 
                            ? 'text-neutral-400' 
                            : isToday 
                              ? 'bg-primary-100 text-primary-800 font-medium rounded' 
                              : 'bg-neutral-100 rounded'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-800 mb-3">Quick Actions</h4>
                <div className="space-y-3">
                  <button type="button" className="flex items-center w-full bg-neutral-50 hover:bg-neutral-100 p-3 rounded-lg transition text-left">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <i className="fas fa-calendar-plus text-primary-600"></i>
                    </div>
                    <span className="font-medium">Create Appointment Slot</span>
                  </button>
                  <button type="button" className="flex items-center w-full bg-neutral-50 hover:bg-neutral-100 p-3 rounded-lg transition text-left">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <i className="fas fa-file-medical text-primary-600"></i>
                    </div>
                    <span className="font-medium">Create Patient Record</span>
                  </button>
                  <button type="button" className="flex items-center w-full bg-neutral-50 hover:bg-neutral-100 p-3 rounded-lg transition text-left">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <i className="fas fa-clipboard-list text-primary-600"></i>
                    </div>
                    <span className="font-medium">View All Patients</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
