import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { qaAPI, QARecord } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Plus, Edit } from 'lucide-react';

const QAFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { credentials, logout } = useAuth();
  const { toast } = useToast();
  
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  // Load existing record for editing
  useEffect(() => {
    if (isEditing && id && credentials) {
      setIsLoading(true);
      setError('');
      
      qaAPI.getById(id, credentials.username, credentials.password)
        .then((record) => {
          setFormData({
            question: record.question,
            answer: record.answer
          });
        })
        .catch((err: any) => {
          if (err.status === 401) {
            toast({
              variant: "destructive",
              title: "Session expired",
              description: "Please log in again."
            });
            logout();
          } else if (err.status === 404) {
            toast({
              variant: "destructive",
              title: "Record not found",
              description: "The requested Q&A record could not be found."
            });
            navigate('/');
          } else {
            setError(err.message || 'Failed to load record');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditing, credentials, logout, toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials) return;
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Both question and answer are required."
      });
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (isEditing && id) {
        await qaAPI.update(
          { id, question: formData.question.trim(), answer: formData.answer.trim() },
          credentials.username,
          credentials.password
        );
        toast({
          title: "Success",
          description: "Q&A record updated successfully."
        });
      } else {
        await qaAPI.create(
          { question: formData.question.trim(), answer: formData.answer.trim() },
          credentials.username,
          credentials.password
        );
        toast({
          title: "Success",
          description: "Q&A record created successfully."
        });
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.status === 401) {
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Please log in again."
        });
        logout();
      } else {
        setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} record`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-admin-surface border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <Edit className="w-6 h-6 text-primary" />
              ) : (
                <Plus className="w-6 h-6 text-primary" />
              )}
              <h1 className="text-xl font-semibold text-foreground">
                {isEditing ? 'Edit Q&A Record' : 'Add New Q&A Record'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Q&A Record' : 'Create New Q&A Record'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question..."
                  required
                  disabled={isSaving}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.question.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter the answer..."
                  required
                  disabled={isSaving}
                  className="min-h-[200px] resize-y"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.answer.length}/5000 characters
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving || !formData.question.trim() || !formData.answer.trim()}
                  className="sm:order-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Record' : 'Create Record'}
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="sm:order-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QAFormPage;