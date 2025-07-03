'use client';

import { useState } from 'react';

type TechnicalDetailsValue = string | number | boolean | string[] | Record<string, unknown> | null | undefined;

interface PrivacyScoreCardProps {
  title: string;
  icon: string;
  score: number;
  maxScore: number;
  reason: string;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo';
  technicalDetails: Record<string, TechnicalDetailsValue>;
  className?: string;
}

const colorSchemes = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600',
    progress: 'bg-blue-600',
    progressBg: 'bg-blue-200',
    button: 'text-blue-600 hover:text-blue-800'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-600',
    progress: 'bg-green-600',
    progressBg: 'bg-green-200',
    button: 'text-green-600 hover:text-green-800'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-600',
    progress: 'bg-purple-600',
    progressBg: 'bg-purple-200',
    button: 'text-purple-600 hover:text-purple-800'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-600',
    progress: 'bg-orange-600',
    progressBg: 'bg-orange-200',
    button: 'text-orange-600 hover:text-orange-800'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-600',
    progress: 'bg-red-600',
    progressBg: 'bg-red-200',
    button: 'text-red-600 hover:text-red-800'
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    progress: 'bg-yellow-600',
    progressBg: 'bg-yellow-200',
    button: 'text-yellow-600 hover:text-yellow-800'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    progress: 'bg-indigo-600',
    progressBg: 'bg-indigo-200',
    button: 'text-indigo-600 hover:text-indigo-800'
  }
};

export default function PrivacyScoreCard({
  title,
  icon,
  score,
  maxScore,
  reason,
  colorScheme,
  technicalDetails,
  className = ''
}: PrivacyScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = colorSchemes[colorScheme];
  const percentage = Math.round((score / maxScore) * 100);

  const formatTechnicalValue = (key: string, value: TechnicalDetailsValue): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      if (value.length <= 3) return value.join(', ');
      return `${value.slice(0, 3).join(', ')} (+${value.length - 3} more)`;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatTechnicalKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  return (
    <div className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{score}/{maxScore} points</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${colors.text}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full ${colors.progressBg} rounded-full h-2 mb-2`}>
        <div 
          className={`${colors.progress} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Basic Reason */}
      <p className="text-sm text-gray-700 mb-3">{reason}</p>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-sm font-medium ${colors.button} transition-colors duration-200 flex items-center`}
      >
        {isExpanded ? '▼' : '▶'} 
        <span className="ml-1">
          {isExpanded ? 'Hide Technical Details' : 'Show Technical Details'}
        </span>
      </button>

      {/* Expanded Technical Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Technical Details</h5>
          <div className="space-y-2">
            {Object.entries(technicalDetails).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">
                  {formatTechnicalKey(key)}:
                </span>
                <span className="text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded border">
                  {formatTechnicalValue(key, value)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Additional Context */}
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border">
            <h6 className="font-medium text-gray-900 mb-2">What This Means</h6>
            <p className="text-sm text-gray-700">
              {getContextualExplanation(title)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getContextualExplanation(title: string): string {
  switch (title.toLowerCase()) {
    case 'browser':
      return `Your browser type and version affect privacy features available. Privacy-focused browsers like Tor Browser provide network-level anonymity, while others may have different tracking protection capabilities.`;
    
    case 'cookies':
      return `This tests your browser's ability to block third-party tracking cookies. Blocked cookies prevent cross-site tracking, while allowed cookies enable advertisers to follow you across websites.`;
    
    case 'fingerprinting':
      return `Browser fingerprinting creates a unique identifier from your system characteristics. Blocked or randomized fingerprinting makes you less trackable, while exposed fingerprinting allows for precise identification.`;
    
    case 'hardware':
      return `Hardware information like CPU cores and memory can be used for fingerprinting. Spoofed values indicate privacy protection, while exposed values make you more identifiable.`;
    
    case 'webrtc leaks':
      return `WebRTC can leak your real IP address even when using VPN/proxy services. Blocked WebRTC prevents IP leaks, while enabled WebRTC may expose your location.`;
    
    case 'active tracking':
      return `This detects tracking scripts currently running on the page. Fewer trackers indicate better privacy protection, while many trackers suggest extensive data collection.`;
    
    case 'do not track':
      return `Do Not Track (DNT) is a browser setting that requests websites not to track you. While not legally binding, it signals your privacy preference to websites.`;
    
    default:
      return `This component measures a specific aspect of your browser's privacy protection capabilities.`;
  }
} 