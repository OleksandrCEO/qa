import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QARecord } from '@/lib/api';

interface QAPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: QARecord | null;
}

export const QAPreviewModal: React.FC<QAPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Full Q&A Record</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Question</h3>
            <p className="text-foreground bg-admin-surface p-4 rounded-lg border">
              {record.question}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Answer</h3>
            <div className="text-foreground bg-admin-surface p-4 rounded-lg border whitespace-pre-wrap">
              {record.answer}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};