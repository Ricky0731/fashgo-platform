import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  originalPrice: number;
  finalPrice: number;
  onNegotiationComplete: (finalPrice: number) => void;
}

const NegotiationModal = ({
  isOpen,
  onClose,
  productId,
  originalPrice,
  finalPrice,
  onNegotiationComplete
}: NegotiationModalProps) => {
  const [offerPrice, setOfferPrice] = useState(Math.round(finalPrice * 0.9).toString());
  const [stage, setStage] = useState<'input' | 'accepted' | 'rejected'>('input');
  const [counterOffer, setCounterOffer] = useState<number | null>(null);
  const [agreedPrice, setAgreedPrice] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const negotiateMutation = useMutation({
    mutationFn: async (price: number) => {
      const res = await apiRequest(
        'POST', 
        `/api/products/${productId}/negotiate`, 
        { offerPrice: price }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.accepted) {
        setStage('accepted');
        setAgreedPrice(data.finalPrice);
      } else {
        setStage('rejected');
        setCounterOffer(data.counterOffer);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to negotiate price. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmitOffer = () => {
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price.",
        variant: "destructive"
      });
      return;
    }
    
    negotiateMutation.mutate(price);
  };

  const handleAcceptCounterOffer = () => {
    if (counterOffer) {
      setStage('accepted');
      setAgreedPrice(counterOffer);
    }
  };

  const handleCompleteNegotiation = () => {
    if (agreedPrice) {
      onNegotiationComplete(agreedPrice);
      onClose();
    }
  };

  const resetAndClose = () => {
    setStage('input');
    setOfferPrice(Math.round(finalPrice * 0.9).toString());
    setCounterOffer(null);
    setAgreedPrice(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold font-poppins">Negotiate Price</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-mid-gray">Original Price</p>
            <p className="text-lg font-medium">{formatPrice(originalPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-mid-gray">Current Offer</p>
            <p className="text-lg font-medium text-primary">{formatPrice(finalPrice)}</p>
          </div>
        </div>
        
        {/* Input Stage */}
        {stage === 'input' && (
          <div>
            <p className="text-sm mb-3">Enter your offer price:</p>
            <div className="relative mb-4">
              <span className="absolute left-3 top-2.5 text-mid-gray">₹</span>
              <input 
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-mid-gray rounded-lg"
              />
            </div>
            
            <Button 
              className="w-full py-3"
              onClick={handleSubmitOffer}
              disabled={negotiateMutation.isPending}
            >
              {negotiateMutation.isPending ? "Processing..." : "Submit Offer"}
            </Button>
          </div>
        )}
        
        {/* Accepted Offer */}
        {stage === 'accepted' && (
          <div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mb-2">
                <i className="fas fa-check-circle text-success text-3xl"></i>
              </div>
              <h4 className="text-lg font-medium text-success">Offer Accepted!</h4>
              <p className="text-sm text-mid-gray text-center mt-1">
                Your offer has been accepted by the seller.
              </p>
            </div>
            
            <div className="bg-light-gray p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm">Final Price:</p>
                <p className="text-lg font-bold text-primary">{formatPrice(agreedPrice || 0)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetAndClose} className="py-3">
                Cancel
              </Button>
              <Button className="py-3" onClick={handleCompleteNegotiation}>
                Confirm
              </Button>
            </div>
          </div>
        )}
        
        {/* Rejected Offer */}
        {stage === 'rejected' && (
          <div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-error bg-opacity-10 rounded-full flex items-center justify-center mb-2">
                <i className="fas fa-times-circle text-error text-3xl"></i>
              </div>
              <h4 className="text-lg font-medium text-error">Offer Rejected</h4>
              <p className="text-sm text-mid-gray text-center mt-1">
                The seller cannot accept this price.
              </p>
            </div>
            
            <div className="bg-light-gray p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm">Seller's Counter Offer:</p>
                <p className="text-lg font-bold text-primary">{formatPrice(counterOffer || 0)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetAndClose} className="py-3">
                Decline
              </Button>
              <Button className="py-3" onClick={handleAcceptCounterOffer}>
                Accept
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationModal;
