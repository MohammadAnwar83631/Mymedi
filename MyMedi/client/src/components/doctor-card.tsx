import React from 'react';
import { useLocation } from 'wouter';
import Rating from "@/components/rating";

interface DoctorProfile {
  id: number;
  userId: number;
  specialty: string;
  bio?: string;
  imageUrl?: string;
  languages?: string;
  location?: string;
  acceptingNewPatients: boolean;
  videoVisits: boolean;
  licenseId: string;
  rating: number;
  reviewCount: number;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profile: DoctorProfile;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const [, setLocation] = useLocation();

  const handleBookAppointment = () => {
    setLocation(`/booking/${doctor.id}`);
  };

  // Calculate the rating display (out of 5 stars)
  const ratingValue = (doctor.profile.rating / 10);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <img 
            src={doctor.profile.imageUrl} 
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} 
            className="w-20 h-20 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-medium text-lg">Dr. {doctor.firstName} {doctor.lastName}</h3>
            <p className="text-neutral-500">{doctor.profile.specialty}</p>
            <div className="flex items-center mt-1">
              <Rating value={ratingValue} />
              <span className="text-sm text-neutral-500 ml-1">
                {ratingValue.toFixed(1)} ({doctor.profile.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-neutral-600">{doctor.profile.bio}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt text-neutral-400 mr-1"></i>
            <span>{doctor.profile.location}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-language text-neutral-400 mr-1"></i>
            <span>{doctor.profile.languages}</span>
          </div>
          {doctor.profile.videoVisits && (
            <div className="flex items-center">
              <i className="fas fa-video text-neutral-400 mr-1"></i>
              <span>Video visits</span>
            </div>
          )}
          {doctor.profile.acceptingNewPatients && (
            <div className="flex items-center">
              <i className="fas fa-user-plus text-neutral-400 mr-1"></i>
              <span>New patients</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-500">Next available</p>
            <p className="font-medium">Tomorrow, 2:00 PM</p>
          </div>
          <button 
            type="button" 
            className="book-appointment-btn bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
            onClick={handleBookAppointment}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
