import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Shield } from 'lucide-react';

export const BetaAccessPending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Beta Access Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your interest in our platform! Your beta access request is currently under review.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <Shield className="w-4 h-4" />
              What happens next?
            </div>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Our team will review your request</li>
              <li>• You'll receive an email when approved</li>
              <li>• Beta access is limited to ensure quality</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-3">
              Questions about beta access?
            </p>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/auth'}
              className="text-sm"
            >
              Sign out and try different account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};