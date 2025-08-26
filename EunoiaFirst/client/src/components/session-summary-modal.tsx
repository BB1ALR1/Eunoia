import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Target, 
  Lightbulb, 
  CheckSquare, 
  Heart,
  Download,
  Mail,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@shared/schema";

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  therapistName: string;
  duration: number;
  onViewAllSummaries?: () => void;
  onReturnHome?: () => void;
}

export default function SessionSummaryModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  therapistName, 
  duration,
  onViewAllSummaries,
  onReturnHome 
}: SessionSummaryModalProps) {
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: isOpen && !!sessionId,
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes${remainingSeconds > 0 ? ` ${remainingSeconds} seconds` : ''}`;
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Feature Coming Soon",
      description: "PDF download functionality will be available in the next update.",
    });
  };

  const handleEmailSummary = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Email summary functionality will be available in the next update.",
    });
  };

  const handleFinish = () => {
    toast({
      title: "Session Complete",
      description: "Thank you for your session today. Take care of yourself.",
    });
    
    // Return to home page instead of just closing
    if (onReturnHome) {
      onReturnHome();
    }
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold text-foreground mb-2">
              Session Summary
            </DialogTitle>
            <p className="text-muted-foreground">
              Here's what we covered in your session with {therapistName}
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Duration */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Session Duration</h4>
                  <p className="text-blue-800">{formatDuration(duration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Key Topics */}
          {session?.keyTopics && Array.isArray(session.keyTopics) && session.keyTopics.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Key Topics Discussed</h4>
                    <ul className="text-green-800 space-y-1">
                      {session.keyTopics.map((topic: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* CBT Techniques */}
          {session?.cbtTechniques && Array.isArray(session.cbtTechniques) && session.cbtTechniques.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-2">CBT Techniques Used</h4>
                    <ul className="text-purple-800 space-y-1">
                      {session.cbtTechniques.map((technique: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                          <span>{technique}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Homework & Next Steps */}
          {session?.homework && Array.isArray(session.homework) && session.homework.length > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <CheckSquare className="w-5 h-5 text-orange-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">Homework & Next Steps</h4>
                    <ul className="text-orange-800 space-y-1">
                      {session.homework.map((task: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Therapist Notes */}
          {session?.therapistNotes && (
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-teal-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-teal-900 mb-2">
                      {therapistName}'s Notes
                    </h4>
                    <p className="text-teal-800 italic">
                      "{session.therapistNotes}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Default content when no session data */}
          {(!session?.keyTopics || !Array.isArray(session?.keyTopics) || session?.keyTopics.length === 0) && 
           (!session?.cbtTechniques || !Array.isArray(session?.cbtTechniques) || session?.cbtTechniques.length === 0) && 
           (!session?.homework || !Array.isArray(session?.homework) || session?.homework.length === 0) && (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Session summary is being generated. This may take a moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEmailSummary}
            className="flex-1"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Summary
          </Button>
          
          {onViewAllSummaries && (
            <Button
              variant="outline"
              onClick={onViewAllSummaries}
              className="flex-1"
            >
              View All Sessions
            </Button>
          )}
          
          <Button
            onClick={handleFinish}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
