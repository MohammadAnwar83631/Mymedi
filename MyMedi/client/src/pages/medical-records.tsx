import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import DocumentUpload from "@/components/document-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  File, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  AlertCircle, 
  Lock, 
  Shield, 
  LucideIcon, 
  CheckCircle2, 
  XCircle, 
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

type RecordType = "health-summary" | "vital-signs" | "medications" | "test-results" | "visit-notes" | "immunizations" | "allergies" | "procedures" | "documents";

interface MedicalRecordTabProps {
  type: RecordType;
  patientId: number;
  isActive: boolean;
}

const HealthSummary = ({ patientId }: { patientId: number }) => {
  // Fetch medical records of type 'condition'
  const { data: conditions, isLoading: conditionsLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'medical-records', 'condition'],
    enabled: !!patientId
  });

  // Fetch medications
  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'medical-records', 'medication'],
    enabled: !!patientId
  });

  // Fetch vital signs
  const { data: vitalSigns, isLoading: vitalSignsLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'vital-signs'],
    enabled: !!patientId
  });
  
  const formatVitalValue = (value: number | undefined, decimals: number = 0, suffix: string = "") => {
    if (value === undefined) return "-";
    return `${(value / Math.pow(10, decimals)).toFixed(decimals)}${suffix}`;
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-5">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400" 
            alt="Health summary dashboard" 
            className="w-full rounded-lg mb-6"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {vitalSignsLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : vitalSigns ? (
              <>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Body Mass Index</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {vitalSigns.bmi && vitalSigns.bmi < 250 ? "Normal" : "Review"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{formatVitalValue(vitalSigns.bmi, 1)}</p>
                  <p className="text-xs text-neutral-500">
                    Last updated: {new Date(vitalSigns.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Blood Pressure</h4>
                    <span className={`text-xs ${
                      vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureSystolic > 120 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-green-100 text-green-800"
                    } px-2 py-0.5 rounded-full`}>
                      {vitalSigns.bloodPressureSystolic && vitalSigns.bloodPressureSystolic > 120 ? "Elevated" : "Normal"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    {vitalSigns.bloodPressureSystolic}/{vitalSigns.bloodPressureDiastolic}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Last updated: {new Date(vitalSigns.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Blood Glucose</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Normal</span>
                  </div>
                  <p className="text-2xl font-bold">{vitalSigns.bloodGlucose} mg/dL</p>
                  <p className="text-xs text-neutral-500">
                    Last updated: {new Date(vitalSigns.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center py-4">
                <p className="text-neutral-600">No vital signs data available</p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Active Conditions</h4>
            {conditionsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : conditions && conditions.length > 0 ? (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Condition</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Diagnosed</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {conditions.map((condition: any) => (
                    <tr key={condition.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{condition.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          condition.status === 'Active' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {condition.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {new Date(condition.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{condition.provider}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-600">No active conditions found</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Current Medications</h4>
            {medicationsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : medications && medications.length > 0 ? (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Medication</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Dosage</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Frequency</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Prescribed</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Refills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {medications.map((medication: any) => (
                    <tr key={medication.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{medication.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{medication.description}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">{medication.additionalInfo}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {new Date(medication.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">3 remaining</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-neutral-600">No medications found</p>
              </div>
            )}
            <div className="mt-4">
              <button type="button" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                <i className="fas fa-plus-circle mr-1"></i>
                Request Medication Refill
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const TestResults = ({ patientId }: { patientId: number }) => {
  // Fetch lab results
  const { data: labResults, isLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'lab-results'],
    enabled: !!patientId
  });

  return (
    <Card>
      <CardContent className="p-5">
        <img 
          src="https://pixabay.com/get/gad6c8a7daeb679912d82e1268791c04b0416c17b3ad624803f34af837809468570e0fdfc1520daff74426269251f24fd49895a86e894d19b16947f7ba520805a_1280.jpg" 
          alt="Test results interface" 
          className="w-full rounded-lg mb-6"
        />
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : labResults && labResults.length > 0 ? (
          <>
            {labResults.map((result: any, index: number) => (
              <div key={result.id} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{result.testName}</h4>
                  <p className="text-sm text-neutral-500">
                    {new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Result</p>
                    <div className="flex items-end">
                      <span className="text-lg font-medium">{result.result}</span>
                      {result.unit && <span className="text-sm text-neutral-500 ml-1">{result.unit}</span>}
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${
                          result.status === 'normal' 
                            ? 'bg-green-500' 
                            : result.status === 'abnormal' 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                        }`} style={{ width: '60%' }}></div>
                      </div>
                      <span className={`text-xs ml-2 ${
                        result.status === 'normal' 
                          ? 'text-green-700' 
                          : result.status === 'abnormal' 
                            ? 'text-amber-700' 
                            : 'text-red-700'
                      }`}>
                        {result.status === 'normal' 
                          ? 'Normal' 
                          : result.status === 'abnormal' 
                            ? 'Abnormal' 
                            : 'Critical'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Normal Range</p>
                    <p className="text-base">{result.normalRange || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Ordering Provider</p>
                    <p className="text-base">{result.orderingProvider}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0 h-auto font-medium">
                View All Test Results
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-flask text-neutral-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No test results found</h3>
            <p className="text-neutral-600 mb-4">There are no test results available in your records</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Medications = ({ patientId }: { patientId: number }) => {
  // Fetch medications
  const { data: medications, isLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'medical-records', 'medication'],
    enabled: !!patientId
  });

  return (
    <Card>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : medications && medications.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-medium text-primary-800 mb-1">Active Medications</h3>
                <p className="text-3xl font-bold text-primary-700">{medications.length}</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-medium text-neutral-800 mb-1">Last Filled</h3>
                <p className="text-xl font-medium">
                  {new Date(Math.max(...medications.map((m: any) => new Date(m.date).getTime())))
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <h3 className="font-medium text-lg mt-6 mb-3">Current Medications</h3>
            
            <div className="space-y-4">
              {medications.map((medication: any) => (
                <div key={medication.id} className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-secondary-100 rounded-full p-3 mr-4">
                      <i className="fas fa-pills text-secondary-600 text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h4 className="font-medium text-lg">{medication.name} {medication.description}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1 md:mt-0">
                          Active
                        </span>
                      </div>
                      <p className="text-neutral-600 mt-1">{medication.additionalInfo}</p>
                      
                      <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-neutral-500">Prescribed</p>
                          <p className="text-sm">
                            {new Date(medication.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Prescriber</p>
                          <p className="text-sm">{medication.provider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Refills</p>
                          <p className="text-sm">3 remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button className="mr-2">
                <i className="fas fa-download mr-2"></i>
                Download List
              </Button>
              <Button variant="outline">
                <i className="fas fa-plus-circle mr-2"></i>
                Request Refill
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-pills text-neutral-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No medications found</h3>
            <p className="text-neutral-600 mb-4">There are no medications currently prescribed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MedicalRecords = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<RecordType>("health-summary");

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to view medical records.",
      });
      setLocation("/");
    } else if (user?.role !== "patient") {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "Only patients can view medical records.",
      });
      setLocation("/doctor-dashboard");
    }
  }, [isAuthenticated, user, setLocation, toast]);

  if (!isAuthenticated || user?.role !== "patient") {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Medical Records</h1>
        <p className="text-neutral-600">View and manage your health information</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-800">Categories</h3>
            </div>
            <CardContent className="p-3">
              <nav className="space-y-1">
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "health-summary" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("health-summary");
                  }}
                >
                  <i className={`fas fa-file-medical mr-3 ${
                    activeTab === "health-summary" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Health Summary</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "vital-signs" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("vital-signs");
                  }}
                >
                  <i className={`fas fa-heart mr-3 ${
                    activeTab === "vital-signs" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Vital Signs</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "medications" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("medications");
                  }}
                >
                  <i className={`fas fa-pills mr-3 ${
                    activeTab === "medications" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Medications</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "test-results" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("test-results");
                  }}
                >
                  <i className={`fas fa-clipboard-list mr-3 ${
                    activeTab === "test-results" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Test Results</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "visit-notes" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("visit-notes");
                  }}
                >
                  <i className={`fas fa-notes-medical mr-3 ${
                    activeTab === "visit-notes" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Visit Notes</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "immunizations" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("immunizations");
                  }}
                >
                  <i className={`fas fa-syringe mr-3 ${
                    activeTab === "immunizations" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Immunizations</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "allergies" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("allergies");
                  }}
                >
                  <i className={`fas fa-allergies mr-3 ${
                    activeTab === "allergies" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Allergies</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "procedures" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("procedures");
                  }}
                >
                  <i className={`fas fa-procedures mr-3 ${
                    activeTab === "procedures" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Procedures</span>
                </a>
                <a 
                  href="#" 
                  className={`flex items-center px-3 py-2 rounded-md font-medium ${
                    activeTab === "documents" 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-neutral-700 hover:bg-neutral-50"
                  } transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("documents");
                  }}
                >
                  <i className={`fas fa-file-medical mr-3 ${
                    activeTab === "documents" ? "text-primary-600" : "text-neutral-500"
                  }`}></i>
                  <span>Documents</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center px-3 py-2 text-neutral-700 rounded-md hover:bg-neutral-50 transition"
                >
                  <i className="fas fa-file-download mr-3 text-neutral-500"></i>
                  <span>Download Records</span>
                </a>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-medium text-neutral-800">
                {activeTab === "health-summary" && "Health Summary"}
                {activeTab === "vital-signs" && "Vital Signs"}
                {activeTab === "medications" && "Medications"}
                {activeTab === "test-results" && "Test Results"}
                {activeTab === "visit-notes" && "Visit Notes"}
                {activeTab === "immunizations" && "Immunizations"}
                {activeTab === "allergies" && "Allergies"}
                {activeTab === "procedures" && "Procedures"}
                {activeTab === "documents" && "Secure Medical Documents"}
              </h3>
              <div className="flex space-x-2">
                <button type="button" className="text-neutral-500 hover:text-neutral-700 p-1">
                  <i className="fas fa-print"></i>
                </button>
                <button type="button" className="text-neutral-500 hover:text-neutral-700 p-1">
                  <i className="fas fa-download"></i>
                </button>
                <button type="button" className="text-neutral-500 hover:text-neutral-700 p-1">
                  <i className="fas fa-share"></i>
                </button>
              </div>
            </div>
            
            <div>
              {activeTab === "health-summary" && user && <HealthSummary patientId={user.id} />}
              {activeTab === "test-results" && user && <TestResults patientId={user.id} />}
              {activeTab === "medications" && user && <Medications patientId={user.id} />}
              {activeTab === "documents" && user && (
                <CardContent className="p-5">
                  <DocumentUpload patientId={user.id} />
                </CardContent>
              )}
              
              {/* Placeholder for other tabs that aren't fully implemented yet */}
              {(activeTab === "vital-signs" || activeTab === "visit-notes" || 
                activeTab === "immunizations" || activeTab === "allergies" || 
                activeTab === "procedures") && (
                <CardContent className="p-5">
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-file-medical text-neutral-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">No {activeTab.replace('-', ' ')} found</h3>
                    <p className="text-neutral-600 mb-4">Your {activeTab.replace('-', ' ')} will appear here when available</p>
                  </div>
                </CardContent>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
