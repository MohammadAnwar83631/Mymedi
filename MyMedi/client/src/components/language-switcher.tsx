import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from 'lucide-react';

// Define available languages
export type Language = 'english' | 'hindi' | 'telugu';

// Language context to manage and share the selected language across the app
interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'english';

const LanguageContext = createContext<LanguageContextProps>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

// Translations for the app
const translations: Record<Language, Record<string, string>> = {
  english: {
    // Common
    'app.name': 'Mymedi',
    'app.tagline': 'Your Personal Health Assistant',
    
    // Navigation
    'nav.home': 'Home',
    'nav.find_doctors': 'Find Doctors',
    'nav.appointments': 'Appointments',
    'nav.medical_records': 'Medical Records',
    'nav.chat': 'Chat Assistant',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Authentication
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgot_password': 'Forgot Password?',
    'auth.patient': 'Patient',
    'auth.doctor': 'Doctor',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.upcoming_appointments': 'Upcoming Appointments',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.health_summary': 'Health Summary',
    
    // Medical Records
    'records.my_records': 'My Medical Records',
    'records.health_summary': 'Health Summary',
    'records.vital_signs': 'Vital Signs',
    'records.medications': 'Medications',
    'records.test_results': 'Test Results',
    'records.visit_notes': 'Visit Notes',
    'records.immunizations': 'Immunizations',
    'records.allergies': 'Allergies',
    'records.procedures': 'Procedures',
    'records.documents': 'Documents',
    'records.secure_documents': 'Secure Medical Documents',
    
    // Documents
    'documents.upload': 'Upload Document',
    'documents.secure_storage': 'Files are encrypted and stored securely',
    'documents.select_document': 'Select Document',
    'documents.supported_formats': 'Supported formats: PDF, JPG, PNG (Max 10MB)',
    'documents.no_documents': 'No documents uploaded yet',
    'documents.upload_description': 'Upload your medical documents to keep them securely stored and easily accessible when you need them.',
    'documents.upload_first': 'Upload Your First Document',
    'documents.document_details': 'Document Details',
    'documents.category': 'Document Category',
    'documents.provider': 'Healthcare Provider',
    'documents.description': 'Description (Optional)',
    'documents.encrypted': 'Encrypted',
    'documents.security_info': 'Security Info',
    'documents.uploading': 'Uploading...',
    'documents.delete': 'Delete',
    'documents.download': 'Download',
    'documents.cancel': 'Cancel',
    
    // Find Doctors
    'doctors.find': 'Find Doctors',
    'doctors.search': 'Search doctors by name or specialty',
    'doctors.filter': 'Filter Results',
    'doctors.specialty': 'Specialty',
    'doctors.location': 'Location',
    'doctors.date': 'Available Date',
    'doctors.insurance': 'Insurance',
    'doctors.accepting': 'Accepting New Patients',
    'doctors.video_visits': 'Video Visits Available',
    'doctors.rating': 'Rating',
    'doctors.book': 'Book Appointment',
    'doctors.view_profile': 'View Profile',
    
    // Language
    'language.select': 'Select Language',
    'language.english': 'English',
    'language.hindi': 'Hindi',
    'language.telugu': 'Telugu',
  },
  
  hindi: {
    // Common
    'app.name': 'मायमेडी',
    'app.tagline': 'आपका व्यक्तिगत स्वास्थ्य सहायक',
    
    // Navigation
    'nav.home': 'होम',
    'nav.find_doctors': 'डॉक्टर खोजें',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.medical_records': 'मेडिकल रिकॉर्ड्स',
    'nav.chat': 'चैट सहायक',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'nav.logout': 'लॉगआउट',
    
    // Authentication
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.forgot_password': 'पासवर्ड भूल गए?',
    'auth.patient': 'मरीज़',
    'auth.doctor': 'डॉक्टर',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.upcoming_appointments': 'आगामी अपॉइंटमेंट',
    'dashboard.recent_activity': 'हाल की गतिविधि',
    'dashboard.health_summary': 'स्वास्थ्य सारांश',
    
    // Medical Records
    'records.my_records': 'मेरे मेडिकल रिकॉर्ड्स',
    'records.health_summary': 'स्वास्थ्य सारांश',
    'records.vital_signs': 'महत्वपूर्ण लक्षण',
    'records.medications': 'दवाइयां',
    'records.test_results': 'टेस्ट रिजल्ट',
    'records.visit_notes': 'विजिट नोट्स',
    'records.immunizations': 'टीकाकरण',
    'records.allergies': 'एलर्जी',
    'records.procedures': 'प्रक्रियाएं',
    'records.documents': 'दस्तावेज़',
    'records.secure_documents': 'सुरक्षित मेडिकल दस्तावेज़',
    
    // Documents
    'documents.upload': 'दस्तावेज़ अपलोड करें',
    'documents.secure_storage': 'फाइलें एन्क्रिप्टेड हैं और सुरक्षित रूप से स्टोर की गई हैं',
    'documents.select_document': 'दस्तावेज़ चुनें',
    'documents.supported_formats': 'समर्थित फॉर्मेट: PDF, JPG, PNG (अधिकतम 10MB)',
    'documents.no_documents': 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया',
    'documents.upload_description': 'अपने मेडिकल दस्तावेज़ अपलोड करें ताकि उन्हें सुरक्षित रूप से स्टोर किया जा सके और आवश्यकता पड़ने पर आसानी से एक्सेस किया जा सके।',
    'documents.upload_first': 'अपना पहला दस्तावेज़ अपलोड करें',
    'documents.document_details': 'दस्तावेज़ विवरण',
    'documents.category': 'दस्तावेज़ श्रेणी',
    'documents.provider': 'हेल्थकेयर प्रदाता',
    'documents.description': 'विवरण (वैकल्पिक)',
    'documents.encrypted': 'एन्क्रिप्टेड',
    'documents.security_info': 'सुरक्षा जानकारी',
    'documents.uploading': 'अपलोड हो रहा है...',
    'documents.delete': 'हटाएं',
    'documents.download': 'डाउनलोड',
    'documents.cancel': 'रद्द करें',
    
    // Find Doctors
    'doctors.find': 'डॉक्टर खोजें',
    'doctors.search': 'नाम या विशेषज्ञता से डॉक्टर खोजें',
    'doctors.filter': 'परिणाम फ़िल्टर करें',
    'doctors.specialty': 'विशेषज्ञता',
    'doctors.location': 'स्थान',
    'doctors.date': 'उपलब्ध तिथि',
    'doctors.insurance': 'बीमा',
    'doctors.accepting': 'नए मरीज़ स्वीकार कर रहे हैं',
    'doctors.video_visits': 'वीडियो विजिट उपलब्ध',
    'doctors.rating': 'रेटिंग',
    'doctors.book': 'अपॉइंटमेंट बुक करें',
    'doctors.view_profile': 'प्रोफाइल देखें',
    
    // Language
    'language.select': 'भाषा चुनें',
    'language.english': 'अंग्रेज़ी',
    'language.hindi': 'हिंदी',
    'language.telugu': 'तेलुगु',
  },
  
  telugu: {
    // Common
    'app.name': 'మైమేడి',
    'app.tagline': 'మీ వ్యక్తిగత ఆరోగ్య సహాయకుడు',
    
    // Navigation
    'nav.home': 'హోమ్',
    'nav.find_doctors': 'వైద్యులను కనుగొనండి',
    'nav.appointments': 'అపాయింట్మెంట్లు',
    'nav.medical_records': 'వైద్య రికార్డులు',
    'nav.chat': 'చాట్ సహాయకుడు',
    'nav.login': 'లాగిన్',
    'nav.register': 'రిజిస్టర్',
    'nav.logout': 'లాగౌట్',
    
    // Authentication
    'auth.email': 'ఇమెయిల్',
    'auth.password': 'పాస్వర్డ్',
    'auth.login': 'లాగిన్',
    'auth.register': 'రిజిస్టర్',
    'auth.forgot_password': 'పాస్వర్డ్ మర్చిపోయారా?',
    'auth.patient': 'రోగి',
    'auth.doctor': 'వైద్యుడు',
    
    // Dashboard
    'dashboard.welcome': 'స్వాగతం',
    'dashboard.upcoming_appointments': 'రాబోయే అపాయింట్మెంట్లు',
    'dashboard.recent_activity': 'ఇటీవలి కార్యకలాపాలు',
    'dashboard.health_summary': 'ఆరోగ్య సారాంశం',
    
    // Medical Records
    'records.my_records': 'నా వైద్య రికార్డులు',
    'records.health_summary': 'ఆరోగ్య సారాంశం',
    'records.vital_signs': 'ముఖ్యమైన లక్షణాలు',
    'records.medications': 'ఔషధాలు',
    'records.test_results': 'పరీక్ష ఫలితాలు',
    'records.visit_notes': 'సందర్శన నోట్లు',
    'records.immunizations': 'టీకాలు',
    'records.allergies': 'అలెర్జీలు',
    'records.procedures': 'ప్రక్రియలు',
    'records.documents': 'పత్రాలు',
    'records.secure_documents': 'సురక్షిత వైద్య పత్రాలు',
    
    // Documents
    'documents.upload': 'పత్రాన్ని అప్లోడ్ చేయండి',
    'documents.secure_storage': 'ఫైల్లు ఎన్క్రిప్ట్ చేయబడ్డాయి మరియు సురక్షితంగా నిల్వ చేయబడ్డాయి',
    'documents.select_document': 'పత్రాన్ని ఎంచుకోండి',
    'documents.supported_formats': 'మద్దతు ఉన్న ఫార్మాట్లు: PDF, JPG, PNG (గరిష్టంగా 10MB)',
    'documents.no_documents': 'ఇంకా ఎటువంటి పత్రాలు అప్లోడ్ చేయబడలేదు',
    'documents.upload_description': 'మీ వైద్య పత్రాలను అప్లోడ్ చేయండి, వాటిని సురక్షితంగా నిల్వ చేయడానికి మరియు అవసరమైనప్పుడు సులభంగా ప్రాప్తి చేయడానికి.',
    'documents.upload_first': 'మీ మొదటి పత్రాన్ని అప్లోడ్ చేయండి',
    'documents.document_details': 'పత్రం వివరాలు',
    'documents.category': 'పత్రం వర్గం',
    'documents.provider': 'ఆరోగ్య సంరక్షణ ప్రొవైడర్',
    'documents.description': 'వివరణ (ఐచ్ఛికం)',
    'documents.encrypted': 'ఎన్క్రిప్ట్ చేయబడింది',
    'documents.security_info': 'భద్రతా సమాచారం',
    'documents.uploading': 'అప్లోడ్ అవుతోంది...',
    'documents.delete': 'తొలగించండి',
    'documents.download': 'డౌన్లోడ్',
    'documents.cancel': 'రద్దు చేయండి',
    
    // Find Doctors
    'doctors.find': 'వైద్యులను కనుగొనండి',
    'doctors.search': 'పేరు లేదా స్పెషాలిటీ ద్వారా వైద్యులను శోధించండి',
    'doctors.filter': 'ఫలితాలను ఫిల్టర్ చేయండి',
    'doctors.specialty': 'స్పెషాలిటీ',
    'doctors.location': 'ప్రదేశం',
    'doctors.date': 'అందుబాటులో ఉన్న తేదీ',
    'doctors.insurance': 'భీమా',
    'doctors.accepting': 'కొత్త రోగులను అంగీకరిస్తున్నారు',
    'doctors.video_visits': 'వీడియో సందర్శనలు అందుబాటులో ఉన్నాయి',
    'doctors.rating': 'రేటింగ్',
    'doctors.book': 'అపాయింట్మెంట్ బుక్ చేయండి',
    'doctors.view_profile': 'ప్రొఫైల్ చూడండి',
    
    // Language
    'language.select': 'భాషను ఎంచుకోండి',
    'language.english': 'ఆంగ్లం',
    'language.hindi': 'హిందీ',
    'language.telugu': 'తెలుగు',
  },
};

// Language provider component to wrap the app
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Retrieve from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || defaultLanguage;
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language switcher component
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('english')} className={language === 'english' ? 'bg-primary/10' : ''}>
          {t('language.english')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hindi')} className={language === 'hindi' ? 'bg-primary/10' : ''}>
          {t('language.hindi')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('telugu')} className={language === 'telugu' ? 'bg-primary/10' : ''}>
          {t('language.telugu')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;