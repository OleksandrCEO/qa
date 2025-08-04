import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { QARecord } from '@/lib/api';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: QARecord | null;
  isLoading: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isLoading,
}) => {
  if (!record) return null;

  const truncatedQuestion = record.question.length > 100 
    ? `${record.question.substring(0, 100)}...` 
    : record.question;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Видалити запис</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>Ви впевнені, що хочете видалити цей запис? Цю дію неможливо скасувати.</span>
            <div className="mt-3 p-3 bg-muted rounded border">
              <strong>Запитання:</strong> {truncatedQuestion}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Скасувати</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Видалення...' : 'Видалити'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};