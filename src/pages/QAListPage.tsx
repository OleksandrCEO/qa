import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { qaAPI, QARecord } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QAPreviewModal } from '@/components/QAPreviewModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  LogOut,
  RefreshCw,
  MessageSquareQuote
} from 'lucide-react';

const QAListPage: React.FC = () => {
  const { credentials, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<QARecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<QARecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<QARecord | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    
    const search = searchTerm.toLowerCase();
    return records.filter(record => 
      record.question.toLowerCase().includes(search) || 
      record.answer.toLowerCase().includes(search)
    );
  }, [records, searchTerm]);

  const fetchRecords = async () => {
    if (!credentials) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await qaAPI.getAll(credentials.username, credentials.password);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.status === 401) {
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Please log in again."
        });
        logout();
      } else {
        setError(err.message || 'Failed to load records');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [credentials]);

  const handleRecordClick = (record: QARecord) => {
    setSelectedRecord(record);
    setIsPreviewOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, record: QARecord) => {
    e.stopPropagation();
    navigate(`/edit/${record.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, record: QARecord) => {
    e.stopPropagation();
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete || !credentials) return;
    
    setIsDeletingRecord(true);
    
    try {
      await qaAPI.delete(recordToDelete.id, credentials.username, credentials.password);
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      toast({
        title: "Success",
        description: "Record deleted successfully."
      });
      setIsDeleteOpen(false);
      setRecordToDelete(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete record."
      });
    } finally {
      setIsDeletingRecord(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Q&A records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-admin-surface border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MessageSquareQuote className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">QA Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecords}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search questions or answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            onClick={() => navigate('/add')}
            className="sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New QA
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquareQuote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No matching records found' : 'No Q&A records yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms or clear the search to see all records.'
                    : 'Get started by creating your first Q&A record.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/add')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New QA
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card 
                key={record.id} 
                className="cursor-pointer hover:bg-admin-surface-hover transition-colors"
                onClick={() => handleRecordClick(record)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                        {record.question}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {truncateText(record.answer)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleEditClick(e, record)}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="ml-2 hidden sm:inline">Edit</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, record)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-2 hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results counter */}
        {filteredRecords.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {searchTerm ? (
              <>Showing {filteredRecords.length} of {records.length} records</>
            ) : (
              <>{records.length} total records</>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <QAPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        record={selectedRecord}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        record={recordToDelete}
        isLoading={isDeletingRecord}
      />
    </div>
  );
};

export default QAListPage;