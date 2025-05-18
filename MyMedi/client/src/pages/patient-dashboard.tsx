import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const PatientDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (user?.role !== "patient") {
      setLocation("/doctor-dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch appointments
  const { 
    data: appointments, 
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['/api/patients', user?.id, 'appointments'],
    enabled: !!user?.id
  });

  // Fetch medical records (medications)
  const { 
    data: medications, 
    isLoading: medicationsLoading 
  } = useQuery({
    queryKey: ['/api/patients', user?.id, 'medical-records', 'medication'],
    enabled: !!user?.id
  });

  // Fetch lab results
  const { 
    data: labResults, 
    isLoading: labResultsLoading 
  } = useQuery({
    queryKey: ['/api/patients', user?.id, 'lab-results'],
    enabled: !!user?.id
  });

  // Fetch medical records (conditions)
  const { 
    data: conditions, 
    isLoading: conditionsLoading 
  } = useQuery({
    queryKey: ['/api/patients', user?.id, 'medical-records', 'condition'],
    enabled: !!user?.id
  });

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Welcome back, {user.firstName}</h1>
        <p className="text-neutral-600">Here's your health at a glance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Upcoming Appointments</h3>
              <Link href="/booking" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            
            {appointmentsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 2).map((appointment, index) => (
                  <div key={appointment.id} className={`${index < appointments.length - 1 ? 'border-b border-neutral-200 pb-3' : ''}`}>
                    <div className="flex items-start">
                      <div className="bg-primary-100 rounded-full p-2 mr-3">
                        <i className="fas fa-calendar-day text-primary-600"></i>
                      </div>
                      <div>
                        <p className="font-medium">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
                        <p className="text-sm text-neutral-500">{appointment.doctor?.profile?.specialty}</p>
                        <div className="flex items-center mt-1 text-sm">
                          <i className="far fa-clock text-neutral-400 mr-1"></i>
                          <span>
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 
                            {' '}{new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No upcoming appointments</p>
                <Link href="/booking">
                  <button className="mt-2 text-primary-600 hover:text-primary-700 font-medium">
                    Book an appointment
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Medications */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Recent Medications</h3>
              <Link href="/medical-records" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            
            {medicationsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : medications && medications.length > 0 ? (
              <ul className="space-y-3">
                {medications.slice(0, 3).map((medication) => (
                  <li key={medication.id} className="flex items-center">
                    <div className="bg-secondary-100 rounded-full p-2 mr-3">
                      <i className="fas fa-pills text-secondary-600"></i>
                    </div>
                    <div>
                      <p className="font-medium">{medication.name} {medication.description}</p>
                      <p className="text-sm text-neutral-500">{medication.additionalInfo}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No medications found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Lab Results */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-neutral-800">Recent Lab Results</h3>
              <Link href="/medical-records" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            
            {labResultsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : labResults && labResults.length > 0 ? (
              <ul className="space-y-3">
                {labResults.slice(0, 3).map((result) => (
                  <li key={result.id} className="flex items-center">
                    <div className="bg-neutral-100 rounded-full p-2 mr-3">
                      <i className="fas fa-flask text-neutral-600"></i>
                    </div>
                    <div>
                      <p className="font-medium">{result.testName}</p>
                      <p className={`text-sm ${
                        result.status === 'normal' ? 'text-green-600' : 
                        result.status === 'abnormal' ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {result.status === 'normal' ? 'Normal' : 
                         result.status === 'abnormal' ? 'Review Required' : 
                         'Critical'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(result.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-500">No lab results found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health Timeline */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">Health Timeline</h3>
            </div>
            <CardContent className="p-5">
              {conditionsLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-neutral-200"></div>
                  <ul className="space-y-6">
                    {appointments && appointments.length > 0 && (
                      <li className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                          <i className="fas fa-stethoscope text-xs text-primary-600"></i>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3">
                          <time className="text-xs text-neutral-500">
                            {new Date(appointments[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </time>
                          <h4 className="font-medium mt-1">Visit with Dr. {appointments[0].doctor?.firstName} {appointments[0].doctor?.lastName}</h4>
                          <p className="text-sm text-neutral-600 mt-1">{appointments[0].reason}</p>
                        </div>
                      </li>
                    )}
                    
                    {medications && medications.length > 0 && (
                      <li className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center">
                          <i className="fas fa-prescription-bottle-alt text-xs text-secondary-600"></i>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3">
                          <time className="text-xs text-neutral-500">
                            {new Date(medications[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </time>
                          <h4 className="font-medium mt-1">New Prescription</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            {medications[0].name} {medications[0].description} - {medications[0].additionalInfo}
                          </p>
                        </div>
                      </li>
                    )}
                    
                    {labResults && labResults.length > 0 && (
                      <li className="relative pl-10">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
                          <i className="fas fa-flask text-xs text-neutral-600"></i>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-3">
                          <time className="text-xs text-neutral-500">
                            {new Date(labResults[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </time>
                          <h4 className="font-medium mt-1">Lab Tests</h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            {labResults.map(r => r.testName).join(', ')}
                          </p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Find Care */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">Find Care</h3>
            </div>
            <CardContent className="p-5">
              <div className="mb-4">
                <label htmlFor="specialty" className="block text-sm font-medium text-neutral-700 mb-1">Specialty</label>
                <select id="specialty" className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select specialty</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="generalPractice">General Practice</option>
                  <option value="neurology">Neurology</option>
                  <option value="obstetrics">Obstetrics & Gynecology</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="urology">Urology</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                <input type="date" id="date" className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <Link href="/find-doctors">
                <button type="button" className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition">
                  Find Available Doctors
                </button>
              </Link>
              
              <div className="mt-8">
                <h4 className="font-medium text-neutral-800 mb-3">Quick Access</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/medical-records" className="flex flex-col items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                      <i className="fas fa-file-medical text-primary-600"></i>
                    </div>
                    <span className="text-sm text-center">Medical Records</span>
                  </Link>
                  <Link href="/medical-records" className="flex flex-col items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                      <i className="fas fa-pills text-primary-600"></i>
                    </div>
                    <span className="text-sm text-center">Prescriptions</span>
                  </Link>
                  <Link href="/booking" className="flex flex-col items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                      <i className="fas fa-calendar-alt text-primary-600"></i>
                    </div>
                    <span className="text-sm text-center">Appointments</span>
                  </Link>
                  <div className="flex flex-col items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition cursor-pointer" onClick={() => {
                    const chatbotContainer = document.getElementById('chatbot-container');
                    if (chatbotContainer) {
                      chatbotContainer.classList.toggle('hidden');
                    }
                  }}>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                      <i className="fas fa-comment-medical text-primary-600"></i>
                    </div>
                    <span className="text-sm text-center">Messages</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
