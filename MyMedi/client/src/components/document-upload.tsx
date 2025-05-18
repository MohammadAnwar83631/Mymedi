import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Upload, 
  X, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Lock, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  File
} from "lucide-react";

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  category: string;
  provider?: string;
  description?: string;
  isEncrypted: boolean;
}

interface DocumentUploadProps {
  patientId: number;
}

export default function DocumentUpload({ patientId }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Blood Test Results.pdf",
      type: "application/pdf",
      size: "1.2 MB",
      uploadDate: new Date(2023, 3, 15),
      category: "lab-report",
      provider: "City Central Lab",
      description: "Complete blood count and cholesterol panel",
      isEncrypted: true
    },
    {
      id: 2,
      name: "Chest X-Ray Image.jpg",
      type: "image/jpeg",
      size: "4.5 MB",
      uploadDate: new Date(2023, 2, 10),
      category: "imaging",
      provider: "Memorial Hospital Radiology",
      description: "Annual chest x-ray",
      isEncrypted: true
    },
    {
      id: 3,
      name: "Vaccination Record.pdf",
      type: "application/pdf",
      size: "0.9 MB",
      uploadDate: new Date(2023, 5, 22),
      category: "immunization",
      provider: "Dr. Smith Family Practice",
      description: "COVID-19 vaccination certificate",
      isEncrypted: true
    }
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [category, setCategory] = useState("medical-report");
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 10MB"
      });
      return;
    }
    
    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file"
      });
      return;
    }
    
    setShowUploadDialog(true);
  };

  const handleUploadSubmit = () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    const file = fileInputRef.current.files[0];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload process
    const intervalId = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(intervalId);
      setUploadProgress(100);
      
      // Add the new document to the list
      const newDocument: Document = {
        id: documents.length + 1,
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date(),
        category,
        provider,
        description,
        isEncrypted: true
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      setIsUploading(false);
      setShowUploadDialog(false);
      setCategory("medical-report");
      setDescription("");
      setProvider("");
      
      toast({
        title: "Upload Complete",
        description: "Your document has been securely uploaded and encrypted.",
        variant: "default"
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 3000);
  };

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!documentToDelete) return;
    
    // Remove the document from the list
    setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
    
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
    
    toast({
      title: "Document Deleted",
      description: "The document has been permanently removed.",
    });
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) return FileText;
    if (type.includes("image")) return File;
    return FileText;
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case "medical-report": return "Medical Report";
      case "lab-report": return "Lab Report";
      case "imaging": return "Imaging";
      case "prescription": return "Prescription";
      case "immunization": return "Immunization";
      case "discharge": return "Discharge Summary";
      case "referral": return "Referral";
      case "insurance": return "Insurance";
      case "other": return "Other";
      default: return category;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "medical-report": return "bg-blue-100 text-blue-800";
      case "lab-report": return "bg-green-100 text-green-800";
      case "imaging": return "bg-purple-100 text-purple-800";
      case "prescription": return "bg-amber-100 text-amber-800";
      case "immunization": return "bg-teal-100 text-teal-800";
      case "discharge": return "bg-indigo-100 text-indigo-800";
      case "referral": return "bg-pink-100 text-pink-800";
      case "insurance": return "bg-gray-100 text-gray-800";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <>
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Secure Documents
              </CardTitle>
              <CardDescription>
                Upload and manage your medical documents securely
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Upload size={16} />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Files are encrypted and stored securely. Only you and your authorized healthcare providers can access them.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="document-upload">Select Document</Label>
                    <Input
                      id="document-upload"
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-md">
              <FileText className="h-12 w-12 mx-auto text-primary/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Upload your medical documents to keep them securely stored and easily accessible when you need them.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Upload size={16} />
                    Upload Your First Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Files are encrypted and stored securely. Only you and your authorized healthcare providers can access them.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="document-upload-empty">Select Document</Label>
                      <Input
                        id="document-upload-empty"
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-primary/10">
                  <CardContent className="p-0">
                    <div className="flex items-start p-4">
                      <div className="mr-4 mt-1">
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-primary/10 text-primary">
                          {React.createElement(getDocumentIcon(doc.type), { size: 24 })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate pr-4">{doc.name}</h3>
                          <div className="flex">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600"
                            >
                              <Download size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleDelete(doc)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                            {getCategoryLabel(doc.category)}
                          </span>
                          {doc.isEncrypted && (
                            <Badge variant="outline" className="ml-2 font-normal text-xs flex items-center gap-1">
                              <Lock size={10} /> Encrypted
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {doc.uploadDate.toLocaleDateString()}
                          </span>
                          <span>{doc.size}</span>
                        </div>
                        {doc.provider && (
                          <p className="mt-1 text-sm text-muted-foreground">{doc.provider}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        
        {documents.length > 0 && (
          <CardFooter className="px-6 py-4 border-t bg-muted/10">
            <div className="w-full flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? 's' : ''} • All encrypted
              </p>
              <Button variant="outline" size="sm" className="gap-1">
                <Shield size={14} /> Security Info
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Document upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Add details about the document you're uploading.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fileInputRef.current?.files?.[0] && (
              <div className="flex items-center gap-3 bg-muted p-3 rounded-md">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{fileInputRef.current.files[0].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileInputRef.current.files[0].size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setShowUploadDialog(false);
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="category">Document Category</Label>
              <select 
                id="category" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="medical-report">Medical Report</option>
                <option value="lab-report">Lab Report</option>
                <option value="imaging">Imaging</option>
                <option value="prescription">Prescription</option>
                <option value="immunization">Immunization</option>
                <option value="discharge">Discharge Summary</option>
                <option value="referral">Referral</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="provider">Healthcare Provider</Label>
              <Input
                id="provider"
                placeholder="e.g., Dr. Smith, Memorial Hospital"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this document"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Your document will be encrypted and stored securely.
              </p>
            </div>
          </div>
          
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                {uploadProgress < 50 ? "Encrypting document..." : 
                 uploadProgress < 90 ? "Uploading to secure storage..." : 
                 "Finalizing..."}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUploadDialog(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadSubmit} 
              disabled={isUploading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload size={16} /> Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document details dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate max-w-md">{selectedDocument.name}</DialogTitle>
                <DialogDescription>
                  Document details and security information
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded flex items-center justify-center bg-primary/10 text-primary">
                    {React.createElement(getDocumentIcon(selectedDocument.type), { size: 36 })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{getCategoryLabel(selectedDocument.category)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Upload Date</p>
                    <p className="font-medium">{selectedDocument.uploadDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium">{selectedDocument.size}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Type</p>
                    <p className="font-medium">
                      {selectedDocument.type === "application/pdf" ? "PDF Document" : 
                       selectedDocument.type.includes("image") ? "Image" : "Document"}
                    </p>
                  </div>
                  {selectedDocument.provider && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-medium">{selectedDocument.provider}</p>
                    </div>
                  )}
                  {selectedDocument.description && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Description</p>
                      <p className="font-medium">{selectedDocument.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted rounded-md p-3 mt-4 flex items-start gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-1">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Security Information</p>
                    <p className="text-xs text-muted-foreground">
                      This document is encrypted using AES-256 encryption and stored in a HIPAA-compliant secure storage system. Only you and healthcare providers you authorize can access this document.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="gap-2 text-red-600" 
                  onClick={() => {
                    setSelectedDocument(null);
                    handleDelete(selectedDocument);
                  }}
                >
                  <Trash2 size={16} /> Delete
                </Button>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Download size={16} /> Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this document?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {documentToDelete && (
              <div className="flex items-center gap-3 bg-muted p-3 rounded-md">
                {React.createElement(getDocumentIcon(documentToDelete.type), { className: "h-8 w-8 text-muted-foreground" })}
                <div>
                  <p className="font-medium text-sm">{documentToDelete.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {documentToDelete.size} • {getCategoryLabel(documentToDelete.category)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-4 p-3 border border-red-200 bg-red-50 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">
                This will permanently delete the document and revoke all access to it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="gap-2">
              <Trash2 size={16} /> Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}