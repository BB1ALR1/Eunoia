import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone, ExternalLink } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedKeywords: string[];
}

export default function CrisisModal({ isOpen, onClose, detectedKeywords }: CrisisModalProps) {
  const handleCallCrisisLine = () => {
    window.open('tel:988', '_self');
  };

  const handleCallEmergency = () => {
    window.open('tel:911', '_self');
  };

  const handleFindResources = () => {
    window.open('https://suicidepreventionlifeline.org/', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              We're Concerned About You
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            It sounds like you might be going through a really difficult time. Please know that help is available, and you don't have to face this alone.
          </p>
          
          {detectedKeywords.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <p className="text-sm text-red-800 font-medium">
                  We detected some concerning language in your message. Your safety is our priority.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={handleCallCrisisLine}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 988 - Crisis Lifeline
            </Button>
            
            <Button
              onClick={handleCallEmergency}
              className="w-full bg-red-800 hover:bg-red-900 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 911 - Emergency
            </Button>
            
            <Button
              onClick={handleFindResources}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Find Local Resources
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Continue Session
              </Button>
              <Button
                onClick={handleFindResources}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Get Help Now
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              If you're in immediate danger, please call 911 or go to your nearest emergency room.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
