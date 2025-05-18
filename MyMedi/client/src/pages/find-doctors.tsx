import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DoctorCard from "@/components/doctor-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, MapPin, Star, Phone, Video, Clock, Search, Filter, Stethoscope } from "lucide-react";

interface FilterOptions {
  specialty: string;
  location: string;
  date: string;
  insurance: string;
  videoVisits: boolean;
  newPatients: boolean;
  rating: number;
  distance: number;
}

const FindDoctors = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: "",
    location: "",
    date: "",
    insurance: "",
    videoVisits: false,
    newPatients: false,
    rating: 0,
    distance: 25
  });

  // Get all doctors
  const { data: doctors, isLoading, isError } = useQuery({
    queryKey: ['/api/doctors'],
  });

  // Fallback data if API returns empty array (should be replaced with real data once API is fixed)
  const fallbackDoctors = [
    {
      id: 1,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      profile: {
        id: 1,
        userId: 1,
        specialty: "Cardiology",
        bio: "Board certified cardiologist with over 10 years of experience in treating heart conditions and performing cardiac procedures.",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
        languages: "English, Spanish",
        location: "New York, NY",
        acceptingNewPatients: true,
        videoVisits: true,
        licenseId: "MC12345",
        rating: 4.9,
        reviewCount: 253
      }
    },
    {
      id: 2,
      firstName: "David",
      lastName: "Martinez",
      email: "david.martinez@example.com",
      profile: {
        id: 2,
        userId: 2,
        specialty: "Dermatology",
        bio: "Specializing in both medical and cosmetic dermatology with particular interest in skin cancer prevention and treatment.",
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
        languages: "English, Portuguese",
        location: "Boston, MA",
        acceptingNewPatients: true,
        videoVisits: false,
        licenseId: "MD54321",
        rating: 4.7,
        reviewCount: 189
      }
    },
    {
      id: 3,
      firstName: "Emily",
      lastName: "Chen",
      email: "emily.chen@example.com",
      profile: {
        id: 3,
        userId: 3,
        specialty: "Pediatrics",
        bio: "Dedicated to providing comprehensive care for children from infancy through adolescence with a focus on preventative health.",
        imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop",
        languages: "English, Mandarin",
        location: "San Francisco, CA",
        acceptingNewPatients: true,
        videoVisits: true,
        licenseId: "MP78901",
        rating: 4.8,
        reviewCount: 312
      }
    },
    {
      id: 4,
      firstName: "Michael",
      lastName: "Williams",
      email: "michael.williams@example.com",
      profile: {
        id: 4,
        userId: 4,
        specialty: "Orthopedics",
        bio: "Orthopedic surgeon specializing in sports medicine, joint replacements, and minimally invasive surgical techniques.",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
        languages: "English",
        location: "Chicago, IL",
        acceptingNewPatients: false,
        videoVisits: true,
        licenseId: "MO65432",
        rating: 4.6,
        reviewCount: 175
      }
    },
    {
      id: 5,
      firstName: "Jessica",
      lastName: "Patel",
      email: "jessica.patel@example.com",
      profile: {
        id: 5,
        userId: 5,
        specialty: "Obstetrics & Gynecology",
        bio: "Providing comprehensive women's healthcare with a patient-centered approach to wellness and preventative care.",
        imageUrl: "https://images.unsplash.com/photo-1584516744791-ae3b5ca45a2a?q=80&w=200&auto=format&fit=crop",
        languages: "English, Hindi, Gujarati",
        location: "Houston, TX",
        acceptingNewPatients: true,
        videoVisits: true,
        licenseId: "MG98765",
        rating: 4.9,
        reviewCount: 298
      }
    },
    {
      id: 6,
      firstName: "Robert",
      lastName: "Kim",
      email: "robert.kim@example.com",
      profile: {
        id: 6,
        userId: 6,
        specialty: "Neurology",
        bio: "Neurologist specializing in movement disorders, stroke treatment and recovery, and neurodegenerative diseases.",
        imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop",
        languages: "English, Korean",
        location: "Seattle, WA",
        acceptingNewPatients: true,
        videoVisits: false,
        licenseId: "MN24680",
        rating: 4.7,
        reviewCount: 201
      }
    },
  ];

  // Update filters when inputs change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  // Filter doctors based on criteria
  const actualDoctors = doctors?.length ? doctors : fallbackDoctors;
  const filteredDoctors = actualDoctors?.filter(doctor => {
    // Filter by search term
    if (searchTerm && 
        !(`${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !(doctor.profile.specialty.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Filter by specialty if selected
    if (filters.specialty && doctor.profile.specialty !== filters.specialty) {
      return false;
    }
    
    // Filter by location if entered
    if (filters.location && !doctor.profile.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filter by video visits if checked
    if (filters.videoVisits && !doctor.profile.videoVisits) {
      return false;
    }
    
    // Filter by accepting new patients if checked
    if (filters.newPatients && !doctor.profile.acceptingNewPatients) {
      return false;
    }
    
    // Filter by rating if set
    if (filters.rating > 0 && doctor.profile.rating < filters.rating) {
      return false;
    }
    
    return true;
  });

  const specialtyOptions = [
    { value: "", label: "All Specialties" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "Endocrinology", label: "Endocrinology" },
    { value: "Gastroenterology", label: "Gastroenterology" },
    { value: "General Practice", label: "General Practice" },
    { value: "Neurology", label: "Neurology" },
    { value: "Obstetrics & Gynecology", label: "Obstetrics & Gynecology" },
    { value: "Ophthalmology", label: "Ophthalmology" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Psychiatry", label: "Psychiatry" },
    { value: "Urology", label: "Urology" },
  ];

  const insuranceOptions = [
    { value: "", label: "All Insurance" },
    { value: "Aetna", label: "Aetna" },
    { value: "Blue Cross Blue Shield", label: "Blue Cross Blue Shield" },
    { value: "Cigna", label: "Cigna" },
    { value: "Humana", label: "Humana" },
    { value: "Medicare", label: "Medicare" },
    { value: "UnitedHealthcare", label: "UnitedHealthcare" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Find Your Perfect Doctor
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Search from our network of qualified healthcare professionals to find the right specialist for your needs
          </p>
        </div>
        
        {/* Search bar with filter button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              className="pl-10 h-12 bg-white"
              placeholder="Search by doctor name, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-2 h-12 bg-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {Object.values(filters).some(v => 
              (typeof v === 'boolean' && v === true) || 
              (typeof v === 'string' && v !== '') ||
              (typeof v === 'number' && v > 0 && v !== 25)
            ) && (
              <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
          <Button className="h-12">Search</Button>
        </div>
        
        {/* Filters section */}
        {showFilters && (
          <Card className="mb-8 border-2 border-primary/10 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-primary">Advanced Filters</CardTitle>
              <CardDescription>Refine your search to find exactly what you need</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Filters</TabsTrigger>
                  <TabsTrigger value="specialty">Specialty</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Specialty */}
                    <div>
                      <Label htmlFor="doctor-specialty" className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <Stethoscope size={16} />
                        Specialty
                      </Label>
                      <Select 
                        value={filters.specialty} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}
                      >
                        <SelectTrigger id="doctor-specialty" className="bg-white">
                          <SelectValue placeholder="All Specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialtyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Location */}
                    <div>
                      <Label htmlFor="doctor-location" className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <MapPin size={16} />
                        Location
                      </Label>
                      <Input 
                        type="text" 
                        id="doctor-location" 
                        name="location"
                        placeholder="City or Zip Code"
                        value={filters.location}
                        onChange={handleInputChange}
                        className="bg-white"
                      />
                    </div>
                    
                    {/* Date */}
                    <div>
                      <Label htmlFor="doctor-date" className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <CalendarIcon size={16} />
                        Appointment Date
                      </Label>
                      <Input 
                        type="date" 
                        id="doctor-date" 
                        name="date"
                        value={filters.date}
                        onChange={handleInputChange}
                        className="bg-white"
                      />
                    </div>
                    
                    {/* Insurance */}
                    <div>
                      <Label htmlFor="doctor-insurance" className="block text-sm font-medium mb-2">Insurance</Label>
                      <Select 
                        value={filters.insurance} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, insurance: value }))}
                      >
                        <SelectTrigger id="doctor-insurance" className="bg-white">
                          <SelectValue placeholder="All Insurance" />
                        </SelectTrigger>
                        <SelectContent>
                          {insuranceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[0]}
                          max={5}
                          step={0.5}
                          value={[filters.rating]}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1 w-16 text-yellow-500">
                          {filters.rating > 0 ? (
                            <>
                              <span className="text-md font-medium">{filters.rating}</span>
                              <Star className="h-4 w-4 fill-current" />
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">Any</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="video-appointments" 
                          checked={filters.videoVisits}
                          onCheckedChange={(checked) => handleCheckboxChange('videoVisits', checked as boolean)}
                        />
                        <Label 
                          htmlFor="video-appointments" 
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          <Video className="h-4 w-4 text-primary" />
                          Video appointments
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="new-patients" 
                          checked={filters.newPatients}
                          onCheckedChange={(checked) => handleCheckboxChange('newPatients', checked as boolean)}
                        />
                        <Label 
                          htmlFor="new-patients" 
                          className="text-sm font-medium flex items-center gap-1"
                        >
                          <Clock className="h-4 w-4 text-primary" />
                          Accepting new patients
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specialty">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {specialtyOptions.filter(opt => opt.value !== "").map(specialty => (
                      <div key={specialty.value} className="relative">
                        <input
                          type="radio"
                          id={`specialty-${specialty.value}`}
                          name="specialty-tab"
                          className="sr-only peer"
                          checked={filters.specialty === specialty.value}
                          onChange={() => setFilters(prev => ({ ...prev, specialty: specialty.value }))}
                        />
                        <label
                          htmlFor={`specialty-${specialty.value}`}
                          className="flex flex-col items-center gap-2 p-4 bg-white border rounded-lg cursor-pointer hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-center"
                        >
                          <Stethoscope className="h-6 w-6 text-primary" />
                          <span>{specialty.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="availability">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Appointment Type</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="in-person" 
                            checked={!filters.videoVisits}
                            onCheckedChange={(checked) => handleCheckboxChange('videoVisits', !(checked as boolean))}
                          />
                          <Label htmlFor="in-person" className="text-sm font-medium">In-person visits</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="video-visits-tab" 
                            checked={filters.videoVisits}
                            onCheckedChange={(checked) => handleCheckboxChange('videoVisits', checked as boolean)}
                          />
                          <Label htmlFor="video-visits-tab" className="text-sm font-medium">Video visits</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Appointment Date</h3>
                      <Calendar
                        mode="single"
                        onSelect={(date) => setFilters(prev => ({ 
                          ...prev, 
                          date: date ? date.toISOString().split('T')[0] : "" 
                        }))}
                        className="rounded-md border bg-white"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="location">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="location-input" className="text-lg font-medium mb-2 block">City or Zip Code</Label>
                      <div className="flex gap-3">
                        <Input 
                          id="location-input"
                          placeholder="Enter location" 
                          value={filters.location}
                          name="location"
                          onChange={handleInputChange}
                          className="bg-white flex-1"
                        />
                        <Button>Find</Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-lg font-medium mb-2 block">Distance</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          defaultValue={[25]}
                          max={100}
                          step={5}
                          value={[filters.distance]}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                          className="flex-1"
                        />
                        <div className="w-16 text-center">
                          <span className="text-md font-medium">{filters.distance} mi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setFilters({
                    specialty: "",
                    location: "",
                    date: "",
                    insurance: "",
                    videoVisits: false,
                    newPatients: false,
                    rating: 0,
                    distance: 25
                  });
                }}>
                  Reset All
                </Button>
                <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Results section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <>
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
              </>
            )}
          </h2>
          
          <Select defaultValue="recommended">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="distance">Closest</SelectItem>
              <SelectItem value="availability">Earliest Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Doctor cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden border border-primary/10 shadow-md">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <Skeleton className="w-20 h-20 rounded-full mr-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mt-4" />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                  <div className="bg-muted px-5 py-3 border-t">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                          {doctor.profile.imageUrl ? (
                            <img 
                              src={doctor.profile.imageUrl} 
                              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                              <span className="text-xl font-bold">
                                {doctor.firstName[0]}{doctor.lastName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Dr. {doctor.firstName} {doctor.lastName}</h3>
                        <p className="text-primary mb-1">{doctor.profile.specialty}</p>
                        <div className="flex items-center text-yellow-500 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(doctor.profile.rating) ? 'fill-current' : 'stroke-current fill-none'}`} 
                            />
                          ))}
                          <span className="ml-1 text-sm font-medium text-foreground">{doctor.profile.rating}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({doctor.profile.reviewCount} reviews)</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> 
                          {doctor.profile.location}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4 line-clamp-3">
                      {doctor.profile.bio}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {doctor.profile.languages && (
                        <div className="text-xs flex items-center text-muted-foreground">
                          <span className="font-medium mr-1">Languages:</span> 
                          {doctor.profile.languages}
                        </div>
                      )}
                      {doctor.profile.acceptingNewPatients && (
                        <Badge variant="secondary" className="w-fit">
                          Accepting New Patients
                        </Badge>
                      )}
                      {doctor.profile.videoVisits && (
                        <Badge variant="outline" className="w-fit flex items-center gap-1 border-primary/20">
                          <Video className="h-3 w-3" /> Video Visits
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
                    <Badge variant="outline" className="bg-accent/10 hover:bg-accent/20 text-accent-foreground">
                      {doctor.profile.videoVisits ? 'Next Available: Today' : 'Next Available: Tomorrow'}
                    </Badge>
                    <Button 
                      onClick={() => setLocation(`/booking/${doctor.id}`)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-2 border-dashed border-primary/20">
            <CardContent>
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Stethoscope size={36} />
              </div>
              <h3 className="text-xl font-medium mb-2">No doctors found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any doctors matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    specialty: "",
                    location: "",
                    date: "",
                    insurance: "",
                    videoVisits: false,
                    newPatients: false,
                    rating: 0,
                    distance: 25
                  });
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Pagination */}
        {filteredDoctors && filteredDoctors.length > 6 && (
          <div className="mt-8 flex justify-center">
            <div className="join">
              <Button variant="outline" className="join-item rounded-l-lg px-3 py-2 border">
                Previous
              </Button>
              <Button variant="outline" className="join-item bg-primary text-white border-primary px-4 py-2">
                1
              </Button>
              <Button variant="outline" className="join-item px-4 py-2 border">
                2
              </Button>
              <Button variant="outline" className="join-item px-4 py-2 border">
                3
              </Button>
              <Button variant="outline" className="join-item rounded-r-lg px-3 py-2 border">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors;
