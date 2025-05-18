import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, AlertCircle, Calendar, FileQuestion, 
  MessageCircle, PenTool, Search, ThumbsUp, 
  ThumbsDown, Plus, X, Send, Stethoscope,
  Heart, Thermometer, Headphones, FileText, Share2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';

interface Message {
  id?: number;
  userId: number;
  content: string;
  isBot: boolean;
  timestamp?: Date;
  type?: MessageType;
  options?: MessageOption[];
  metadata?: SymptomAssessmentMetadata;
}

type MessageType = 'text' | 'symptom-start' | 'symptom-question' | 'symptom-result' | 'document-upload';

interface MessageOption {
  text: string;
  value: string;
  action?: () => void;
}

interface SymptomAssessmentMetadata {
  currentStep?: number;
  totalSteps?: number;
  currentSymptom?: string;
  severity?: number;
  duration?: string;
  symptoms?: {[key: string]: { severity: number, duration: string }};
  progress?: number;
  possibleConditions?: PossibleCondition[];
}

interface PossibleCondition {
  name: string;
  probability: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

// Symptom assessment questions
const symptomQuestions = [
  {
    id: 'main-symptom',
    text: 'What is your main symptom today?',
    options: [
      { text: 'Headache', value: 'headache' },
      { text: 'Chest pain', value: 'chest-pain' },
      { text: 'Abdominal pain', value: 'abdominal-pain' },
      { text: 'Fever', value: 'fever' },
      { text: 'Cough', value: 'cough' },
      { text: 'Fatigue', value: 'fatigue' },
      { text: 'Other', value: 'other' }
    ]
  },
  {
    id: 'severity',
    text: "How would you rate the severity of your {symptom}?",
    options: [
      { text: 'Mild', value: '1' },
      { text: 'Moderate', value: '2' },
      { text: 'Severe', value: '3' }
    ]
  },
  {
    id: 'duration',
    text: "How long have you been experiencing this {symptom}?",
    options: [
      { text: 'Less than a day', value: '<1 day' },
      { text: '1-3 days', value: '1-3 days' },
      { text: '3-7 days', value: '3-7 days' },
      { text: 'More than a week', value: '>7 days' },
      { text: 'More than a month', value: '>30 days' }
    ]
  },
  {
    id: 'additional-symptoms',
    text: "Do you have any additional symptoms?",
    options: [
      { text: 'Nausea', value: 'nausea' },
      { text: 'Vomiting', value: 'vomiting' },
      { text: 'Dizziness', value: 'dizziness' },
      { text: 'Shortness of breath', value: 'shortness-of-breath' },
      { text: 'Rash', value: 'rash' },
      { text: 'None of the above', value: 'none' }
    ],
    multiple: true
  },
  {
    id: 'history',
    text: "Do you have any relevant medical history?",
    options: [
      { text: 'Hypertension', value: 'hypertension' },
      { text: 'Diabetes', value: 'diabetes' },
      { text: 'Heart disease', value: 'heart-disease' },
      { text: 'Asthma/COPD', value: 'respiratory' },
      { text: 'None of the above', value: 'none' }
    ],
    multiple: true
  }
];

// Possible condition results for different symptoms
const symptomResults: {[key: string]: PossibleCondition[]} = {
  'headache': [
    { 
      name: 'Tension Headache', 
      probability: 'high', 
      description: 'A common type of headache characterized by mild to moderate pain that feels like pressure around your head.',
      recommendation: 'Rest, over-the-counter pain relievers, and stress management techniques may help.'
    },
    { 
      name: 'Migraine', 
      probability: 'medium', 
      description: 'Intense, throbbing headaches often accompanied by nausea, vomiting, and sensitivity to light and sound.',
      recommendation: 'Consider scheduling an appointment with a neurologist for proper diagnosis and treatment options.'
    }
  ],
  'chest-pain': [
    { 
      name: 'Anxiety/Stress', 
      probability: 'medium', 
      description: 'Chest pain can sometimes be caused by anxiety or stress, especially if accompanied by rapid breathing.',
      recommendation: 'Practice relaxation techniques. If pain is severe or accompanied by shortness of breath, seek immediate medical attention.'
    },
    { 
      name: 'GERD/Acid Reflux', 
      probability: 'medium', 
      description: 'Gastroesophageal reflux disease can cause a burning sensation in the chest.',
      recommendation: 'Consult with a gastroenterologist. Avoid foods that trigger symptoms.'
    },
    { 
      name: 'Cardiac Issue', 
      probability: 'low', 
      description: 'Chest pain can potentially indicate a heart problem, especially if severe or accompanied by shortness of breath, sweating, or nausea.',
      recommendation: 'If you experience severe, crushing chest pain, especially with radiation to arm or jaw, seek emergency care immediately.'
    }
  ],
  'fever': [
    { 
      name: 'Viral Infection', 
      probability: 'high', 
      description: 'Most fevers are caused by viral infections and resolve on their own.',
      recommendation: 'Rest, stay hydrated, and take fever-reducing medication if uncomfortable. See a doctor if fever persists over 3 days.'
    },
    { 
      name: 'Bacterial Infection', 
      probability: 'medium', 
      description: 'Some bacterial infections require antibiotics to resolve.',
      recommendation: "If fever is accompanied by severe symptoms or lasts more than a few days, schedule an appointment with your doctor."
    }
  ],
  'cough': [
    { 
      name: "Common Cold/Upper Respiratory Infection", 
      probability: 'high', 
      description: "Viral infections often cause coughing that resolves within 1-2 weeks.",
      recommendation: "Rest, stay hydrated, and use over-the-counter cough medicines if needed. See a doctor if symptoms worsen or don't improve."
    },
    { 
      name: 'Allergies', 
      probability: 'medium', 
      description: 'Seasonal or environmental allergies can cause persistent coughing.',
      recommendation: "Try over-the-counter antihistamines. If symptoms persist, consider seeing an allergist."
    }
  ],
  'abdominal-pain': [
    { 
      name: 'Gastritis/Indigestion', 
      probability: 'high', 
      description: 'Inflammation of the stomach lining causing pain, often made worse by eating.',
      recommendation: 'Avoid spicy foods and alcohol. Consider over-the-counter antacids. If pain persists, see a doctor.'
    },
    { 
      name: 'Irritable Bowel Syndrome', 
      probability: 'medium', 
      description: 'A common disorder affecting the large intestine, causing cramping, abdominal pain, bloating, gas, diarrhea or constipation.',
      recommendation: 'Consider dietary changes and stress management. Schedule an appointment with a gastroenterologist for proper diagnosis.'
    }
  ],
  'fatigue': [
    { 
      name: 'Insufficient Sleep/Stress', 
      probability: 'high', 
      description: 'Not getting enough rest or experiencing high stress levels often leads to fatigue.',
      recommendation: 'Improve sleep habits and stress management techniques. If fatigue persists despite adequate rest, see a doctor.'
    },
    { 
      name: 'Anemia', 
      probability: 'medium', 
      description: 'Low red blood cell count or hemoglobin, often causing fatigue and weakness.',
      recommendation: 'Consider getting blood tests to check iron levels and other potential causes of anemia.'
    }
  ]
};

// Default for other symptoms not specifically listed
const defaultResults: PossibleCondition[] = [
  { 
    name: 'Multiple Possibilities', 
    probability: 'medium', 
    description: 'Your symptoms could be related to several different conditions.',
    recommendation: 'We recommend scheduling an appointment with a healthcare provider for a proper evaluation.'
  }
];

const Chatbot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [inSymptomAssessment, setInSymptomAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentData, setAssessmentData] = useState<SymptomAssessmentMetadata>({
    symptoms: {},
    currentStep: 0,
    totalSteps: symptomQuestions.length,
    progress: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch previous messages when user logs in
  useEffect(() => {
    if (user) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [user]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (messages.length === 0 && user) {
      const welcomeMessage: Message = {
        userId: user.id,
        content: "Hello! I'm your MyMedi assistant. How can I help you today?",
        isBot: true,
        type: 'text',
        options: [
          { text: "Check symptoms", value: "symptoms" },
          { text: "Book appointment", value: "appointment" },
          { text: "View my records", value: "records" },
          { text: "Upload document", value: "upload" }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [messages, user]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      setMessages(data);
      
      // Add welcome message if no messages exist
      if (data.length === 0) {
        const welcomeMessage: Message = {
          userId: user.id,
          content: "Hello! I'm your MyMedi assistant. How can I help you today?",
          isBot: true,
          type: 'text',
          options: [
            { text: "Check symptoms", value: "symptoms" },
            { text: "Book appointment", value: "appointment" },
            { text: "View my records", value: "records" },
            { text: "Upload document", value: "upload" }
          ]
        };
        
        await apiRequest('POST', `/api/users/${user.id}/messages`, welcomeMessage);
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat messages. Please try again.",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsVisible(!isVisible);
  };

  const startSymptomAssessment = async () => {
    if (!user) return;
    
    setInSymptomAssessment(true);
    setCurrentQuestion(0);
    
    setAssessmentData({
      symptoms: {},
      currentStep: 1,
      totalSteps: symptomQuestions.length,
      progress: 0
    });
    
    // Add starting message
    const startMessage: Message = {
      userId: user.id,
      content: "I'll help you assess your symptoms. This is not a medical diagnosis, but I can provide some general guidance. If you're experiencing a medical emergency, please call emergency services immediately.",
      isBot: true,
      type: 'symptom-start',
    };
    
    setMessages(prevMessages => [...prevMessages, startMessage]);
    
    // Add first question after a delay
    setTimeout(() => {
      const firstQuestion = {
        userId: user.id,
        content: symptomQuestions[0].text,
        isBot: true,
        type: 'symptom-question',
        options: symptomQuestions[0].options,
        metadata: {
          currentStep: 1,
          totalSteps: symptomQuestions.length,
          progress: 0
        }
      };
      
      setMessages(prevMessages => [...prevMessages, firstQuestion]);
    }, 1000);
  };

  const handleSymptomResponse = async (questionId: string, response: string | string[]) => {
    if (!user) return;
    
    // Add user's response to chat
    const userMessage: Message = {
      userId: user.id,
      content: Array.isArray(response) ? response.join(', ') : response,
      isBot: false,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Update assessment data based on question
    const updatedData = { ...assessmentData };
    
    switch (questionId) {
      case 'main-symptom':
        updatedData.currentSymptom = response as string;
        break;
      case 'severity':
        if (updatedData.currentSymptom) {
          if (!updatedData.symptoms) updatedData.symptoms = {};
          if (!updatedData.symptoms[updatedData.currentSymptom]) {
            updatedData.symptoms[updatedData.currentSymptom] = { severity: 0, duration: '' };
          }
          updatedData.symptoms[updatedData.currentSymptom].severity = parseInt(response as string);
        }
        break;
      case 'duration':
        if (updatedData.currentSymptom) {
          if (!updatedData.symptoms) updatedData.symptoms = {};
          if (!updatedData.symptoms[updatedData.currentSymptom]) {
            updatedData.symptoms[updatedData.currentSymptom] = { severity: 0, duration: '' };
          }
          updatedData.symptoms[updatedData.currentSymptom].duration = response as string;
        }
        break;
    }
    
    // Move to next question
    const nextQuestion = currentQuestion + 1;
    
    // Update progress
    updatedData.currentStep = nextQuestion + 1;
    updatedData.progress = Math.round(((nextQuestion + 1) / symptomQuestions.length) * 100);
    
    setAssessmentData(updatedData);
    
    // If we have more questions, ask the next one
    if (nextQuestion < symptomQuestions.length) {
      setCurrentQuestion(nextQuestion);
      
      setTimeout(() => {
        let questionText = symptomQuestions[nextQuestion].text;
        
        // Replace {symptom} placeholder with actual symptom
        if (updatedData.currentSymptom) {
          questionText = questionText.replace('{symptom}', updatedData.currentSymptom);
        }
        
        const nextQuestionMessage: Message = {
          userId: user.id,
          content: questionText,
          isBot: true,
          type: 'symptom-question',
          options: symptomQuestions[nextQuestion].options,
          metadata: {
            currentStep: nextQuestion + 1,
            totalSteps: symptomQuestions.length,
            progress: updatedData.progress
          }
        };
        
        setMessages(prevMessages => [...prevMessages, nextQuestionMessage]);
      }, 800);
    } else {
      // We're done with the assessment, show results
      finishSymptomAssessment(updatedData);
    }
  };

  const finishSymptomAssessment = (assessmentData: SymptomAssessmentMetadata) => {
    if (!user || !assessmentData.currentSymptom) return;
    
    setIsTyping(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Get results based on main symptom
      const results = symptomResults[assessmentData.currentSymptom!] || defaultResults;
      
      const resultMessage: Message = {
        userId: user.id,
        content: "Based on the information you've provided, here are some possible explanations for your symptoms:",
        isBot: true,
        type: 'symptom-result',
        metadata: {
          ...assessmentData,
          possibleConditions: results
        }
      };
      
      setMessages(prevMessages => [...prevMessages, resultMessage]);
      
      // Add disclaimer and follow-up options
      setTimeout(() => {
        const disclaimerMessage: Message = {
          userId: user.id,
          content: "Remember, this is not a medical diagnosis. If your symptoms are severe or persistent, please consult with a healthcare professional.",
          isBot: true,
          options: [
            { text: "Find a doctor", value: "find-doctor" },
            { text: "Book appointment", value: "book-appointment" },
            { text: "Start new assessment", value: "new-assessment" },
            { text: "Return to chat", value: "end-assessment" }
          ]
        };
        
        setMessages(prevMessages => [...prevMessages, disclaimerMessage]);
        setInSymptomAssessment(false);
        setIsTyping(false);
      }, 1000);
    }, 2000);
  };

  const handleOptionSelect = async (optionValue: string) => {
    if (!user) return;
    
    switch (optionValue) {
      case 'symptoms':
        startSymptomAssessment();
        break;
      case 'appointment':
        // User selected booking an appointment
        const userMessage: Message = {
          userId: user.id,
          content: "I'd like to book an appointment",
          isBot: false,
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
        
        setTimeout(() => {
          const botResponse: Message = {
            userId: user.id,
            content: "I can help you book an appointment. You can visit our booking page to find available slots with our doctors.",
            isBot: true,
            options: [
              { text: "Go to Booking Page", value: "goto-booking" },
              { text: "Find a Doctor First", value: "find-doctor" }
            ]
          };
          
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }, 1000);
        break;
      case 'goto-booking':
        window.location.href = '/booking';
        break;
      case 'find-doctor':
        window.location.href = '/find-doctors';
        break;
      case 'records':
        // User wants to view records
        const recordsUserMessage: Message = {
          userId: user.id,
          content: "I want to check my medical records",
          isBot: false,
        };
        
        setMessages(prevMessages => [...prevMessages, recordsUserMessage]);
        
        setTimeout(() => {
          const recordsResponse: Message = {
            userId: user.id,
            content: "You can view your complete medical history in our records section. This includes past appointments, test results, prescriptions, and more.",
            isBot: true,
            options: [
              { text: "View Medical Records", value: "goto-records" }
            ]
          };
          
          setMessages(prevMessages => [...prevMessages, recordsResponse]);
        }, 1000);
        break;
      case 'goto-records':
        window.location.href = '/medical-records';
        break;
      case 'upload':
        // Document upload selected
        const uploadUserMessage: Message = {
          userId: user.id,
          content: "I need to upload a document",
          isBot: false,
        };
        
        setMessages(prevMessages => [...prevMessages, uploadUserMessage]);
        
        setTimeout(() => {
          const uploadResponse: Message = {
            userId: user.id,
            content: "You can upload medical documents like test results, prescriptions, or doctor's notes. These will be securely stored in your medical records.",
            isBot: true,
            type: 'document-upload'
          };
          
          setMessages(prevMessages => [...prevMessages, uploadResponse]);
        }, 1000);
        break;
      case 'new-assessment':
        startSymptomAssessment();
        break;
      case 'end-assessment':
        // Just return to normal chat
        break;
      default:
        if (inSymptomAssessment) {
          handleSymptomResponse(symptomQuestions[currentQuestion].id, optionValue);
        }
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;
    
    // Add user message to chat
    const userMessage: Message = {
      userId: user.id,
      content: input,
      isBot: false,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Check for symptom related keywords to trigger symptom checker
      const symptomKeywords = ['symptom', 'sick', 'feeling', 'pain', 'hurt', 'ache', 'headache', 'fever', 'cough'];
      
      if (symptomKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
        // Suggest symptom checker
        setTimeout(() => {
          const suggestionMessage: Message = {
            userId: user.id,
            content: "It sounds like you might be experiencing some health concerns. Would you like to use our symptom assessment tool to get more information?",
            isBot: true,
            options: [
              { text: "Start Symptom Assessment", value: "symptoms" },
              { text: "No thanks", value: "no-assessment" }
            ]
          };
          
          setMessages(prevMessages => [...prevMessages, suggestionMessage]);
          setIsTyping(false);
        }, 1200);
        
        return;
      }
      
      // Send message to API
      const response = await apiRequest('POST', `/api/users/${user.id}/messages`, userMessage);
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // API returns all messages including bot response
      const updatedMessages = await response.json();
      
      // Filter to just get the last (bot) message and add options
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      
      if (lastMessage && lastMessage.isBot) {
        // Add quick reply options based on content
        const bookingKeywords = ['appointment', 'schedule', 'book', 'visit', 'see doctor'];
        const recordsKeywords = ['records', 'history', 'results', 'tests'];
        
        if (bookingKeywords.some(keyword => lastMessage.content.toLowerCase().includes(keyword))) {
          lastMessage.options = [
            { text: "Book Appointment", value: "goto-booking" },
            { text: "Find a Doctor", value: "find-doctor" }
          ];
        } else if (recordsKeywords.some(keyword => lastMessage.content.toLowerCase().includes(keyword))) {
          lastMessage.options = [
            { text: "View Medical Records", value: "goto-records" }
          ];
        }
      }
      
      setMessages(updatedMessages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Create a file upload success message (in a real app, this would upload to a server)
    const fileUploadMessage: Message = {
      userId: user.id,
      content: `Uploaded: ${file.name}`,
      isBot: false,
    };
    
    setMessages(prevMessages => [...prevMessages, fileUploadMessage]);
    
    // Simulate processing
    setIsTyping(true);
    
    setTimeout(() => {
      const confirmationMessage: Message = {
        userId: user.id,
        content: `Your document "${file.name}" has been uploaded successfully. It will be added to your medical records and reviewed if necessary.`,
        isBot: true,
        options: [
          { text: "View My Records", value: "goto-records" },
          { text: "Upload Another", value: "upload" }
        ]
      };
      
      setMessages(prevMessages => [...prevMessages, confirmationMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      {/* Floating chat button */}
      <button 
        onClick={toggleChatbot}
        className={`fixed bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg z-50 hover:bg-primary/90 transition-all ${isVisible ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      {/* Chatbot container */}
      <div 
        id="chatbot-container" 
        className={`fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-primary/20 transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Activity className="h-5 w-5" />
            MyMedi Assistant
          </h3>
          <button 
            id="close-chatbot" 
            className="text-white hover:text-white/80 transition-colors"
            onClick={toggleChatbot}
            aria-label="Close chatbot"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-1">
              <FileQuestion className="h-4 w-4" />
              Health Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="p-0">
            <div id="chat-messages" className="p-4 h-[350px] overflow-y-auto">
              {messages.map((message, index) => (
                message.isBot ? (
                  <div key={index} className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="bg-muted/50 rounded-lg py-2 px-3 max-w-[85%]">
                      {message.type === 'symptom-question' && message.metadata && (
                        <div className="mb-2">
                          <div className="w-full h-1.5 bg-muted rounded-full mb-1 overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all" 
                              style={{ width: `${message.metadata.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Question {message.metadata.currentStep} of {message.metadata.totalSteps}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      {message.type === 'symptom-result' && message.metadata?.possibleConditions && (
                        <div className="mt-3 space-y-3">
                          {message.metadata.possibleConditions.map((condition, idx) => (
                            <Card key={idx} className="text-sm bg-white overflow-hidden">
                              <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">{condition.name}</h4>
                                  <Badge 
                                    variant={
                                      condition.probability === 'high' ? 'default' : 
                                      condition.probability === 'medium' ? 'secondary' : 
                                      'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {condition.probability} match
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{condition.description}</p>
                                <div className="pt-1 flex items-start gap-1 text-xs">
                                  <AlertCircle className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{condition.recommendation}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      {message.type === 'document-upload' && (
                        <div className="mt-3">
                          <label className="flex flex-col items-center p-3 mt-1 border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
                            <FileText className="h-8 w-8 text-primary mb-2" />
                            <span className="text-sm font-medium text-center">
                              Click to upload document
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PDF, JPG, PNG (max. 10MB)
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                      )}
                      
                      {message.options && message.options.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.options.map((option, optionIdx) => (
                            <Button 
                              key={optionIdx}
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 h-auto"
                              onClick={() => handleOptionSelect(option.value)}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={index} className="flex items-start mb-4 justify-end">
                    <div className="bg-primary rounded-lg py-2 px-3 max-w-[85%] text-white">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    </div>
                  </div>
                )
              ))}
              
              {isTyping && (
                <div id="typing-indicator" className="flex items-start mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div className="bg-muted/50 rounded-lg py-2 px-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="bg-muted/20 p-3 border-t">
              <div className="flex items-center">
                <input 
                  type="text" 
                  id="chat-input" 
                  className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white" 
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  id="send-message" 
                  className="rounded-l-none"
                  onClick={handleSendMessage}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help">
            <div className="p-4 h-[350px] overflow-y-auto">
              <h3 className="text-lg font-medium mb-3">Health Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all" onClick={() => {
                  startSymptomAssessment();
                  setActiveTab('chat');
                }}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <Search className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Symptom Checker</h4>
                    <p className="text-xs text-muted-foreground">Check your symptoms and get guidance</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all" onClick={() => {
                  handleOptionSelect('appointment');
                  setActiveTab('chat');
                }}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Book Appointment</h4>
                    <p className="text-xs text-muted-foreground">Schedule a visit with a doctor</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all" onClick={() => {
                  handleOptionSelect('upload');
                  setActiveTab('chat');
                }}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Upload Documents</h4>
                    <p className="text-xs text-muted-foreground">Add documents to your records</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all" onClick={() => {
                  handleOptionSelect('records');
                  setActiveTab('chat');
                }}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Medical Records</h4>
                    <p className="text-xs text-muted-foreground">View your health history</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all" onClick={() => {
                  window.location.href = '/find-doctors';
                }}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <Search className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Find Doctors</h4>
                    <p className="text-xs text-muted-foreground">Search for specialists near you</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden hover:border-primary/50 cursor-pointer transition-all">
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 mt-1">
                      <Heart className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Health Tracking</h4>
                    <p className="text-xs text-muted-foreground">Monitor your vital signs</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-5">
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Important Note
                </h4>
                <p className="text-sm text-muted-foreground">
                  The information provided by our health tools is for informational purposes only and not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Chatbot;
