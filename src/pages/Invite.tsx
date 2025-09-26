import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      // Store the token for later use when posting comments
      localStorage.setItem('collab_invite_token', token);
      console.log('Stored invite token:', token);
      setLoading(false);
    } else {
      setError('Invalid invite link - missing token');
      setLoading(false);
    }
  }, [token]);

  const handleContinue = () => {
    // Navigate back to the main app
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>
              Return to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-primary">Invite Accepted!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <p className="text-muted-foreground">
            You can now collaborate on shared objectives and leave comments.
          </p>
          <p className="text-sm text-muted-foreground">
            Your invite has been saved and you're ready to participate in the collaboration.
          </p>
          <Button onClick={handleContinue} className="w-full">
            Continue to App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}