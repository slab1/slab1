
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X } from 'lucide-react';
import { securityUtils } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className = ''
}) => {
  const { score, feedback } = securityUtils.checkPasswordStrength(password);
  
  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains number', met: /\d/.test(password) },
    { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={`font-medium ${score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
            {getStrengthText(score)}
          </span>
        </div>
        <Progress 
          value={(score / 5) * 100} 
          className="h-2"
        />
      </div>
      
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-sm">
            {req.met ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
