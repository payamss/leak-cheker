"use client";

import { useEffect, useState } from 'react';
import { FiShield, FiLock, FiEye, FiDatabase, FiGlobe, FiMail } from 'react-icons/fi';

export default function PrivacyPolicy() {
  const [email, setEmail] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const user = 'payam';
    const domain = 'shariat.de';
    setEmail(`${user}@${domain}`);
    setLastUpdated(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Inquiry about Security Suite Privacy Policy");
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  const sections = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      icon: FiShield,
      content: `Security Suite is designed with privacy as a core principle. We provide comprehensive security testing tools to help you evaluate and improve your digital privacy and security posture. This Privacy Policy explains how we handle information when you use our security testing platform.`
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: FiDatabase,
      content: `We are committed to minimal data collection:

• **No Personal Information**: We do not collect names, email addresses, phone numbers, or other personally identifiable information unless voluntarily provided for support purposes.

• **Test Results**: Security test results are processed locally in your browser and are not transmitted to our servers unless you explicitly choose to save or share them.

• **Technical Data**: We may collect anonymous technical information such as browser type, operating system, and general location (country level) for analytics and service improvement.

• **Cookies**: We use essential cookies for website functionality and analytics cookies (with your consent) to understand how our service is used.`
    },
    {
      id: 'how-we-use',
      title: 'How We Use Information',
      icon: FiEye,
      content: `The limited information we collect is used to:

• **Provide Security Testing**: Enable DNS leak tests, IP leak detection, WebRTC testing, and other security assessments.

• **Improve Our Service**: Analyze usage patterns to enhance our testing tools and add new security features.

• **Ensure Security**: Monitor for malicious activity and protect the integrity of our testing platform.

• **Support Users**: Respond to inquiries and provide technical assistance when requested.`
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      icon: FiGlobe,
      content: `Our security tests may interact with third-party services:

• **DNS Leak Tests**: May query external DNS servers to detect leaks.

• **IP Detection**: Uses public IP detection services to identify your current IP address.

• **WebRTC Testing**: Utilizes STUN servers to detect potential IP leaks through WebRTC.

• **Dark Web Monitoring**: Checks threat intelligence databases for exposed information.

We carefully select trusted third-party services and do not share personal information with them beyond what's necessary for testing functionality.`
    },
    {
      id: 'data-security',
      title: 'Data Security & Privacy',
      icon: FiLock,
      content: `We implement strong security measures:

• **Local Processing**: Most security tests are performed locally in your browser.

• **Encryption**: All data transmission uses HTTPS encryption.

• **No Storage**: Test results are not permanently stored on our servers unless you explicitly save them.

• **Anonymization**: Any data we do collect is anonymized and aggregated.

• **Regular Audits**: We regularly review our security practices and update our systems.`
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: FiShield,
      content: `You have control over your privacy:

• **Data Access**: Request information about any data we may have collected.

• **Data Deletion**: Request deletion of any personal information we may have.

• **Opt-Out**: Disable analytics cookies through your browser settings.

• **Transparency**: We will clearly inform you before collecting any personal information.

• **Portability**: Export any data you have saved with our service.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full shadow-lg">
              <FiShield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 mb-2">Security Suite</p>
          <p className="text-sm text-gray-500">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-4 py-6 mb-4">
          <div className="flex items-start mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <FiLock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Commitment to Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                At Security Suite, we believe that privacy is a fundamental right. Our security testing platform 
                is built with privacy-by-design principles, ensuring that your personal information remains 
                protected while you evaluate your digital security posture. We are committed to transparency 
                about our data practices and give you control over your information.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  {section.content.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="mb-4">
                      {paragraph.includes('•') ? (
                        <div className="space-y-2">
                          {paragraph.split('\n').map((line, lineIndex) => {
                            if (line.trim().startsWith('•')) {
                              const [, ...rest] = line.split('**');
                              const boldText = rest[0];
                              const normalText = rest.slice(1).join('**');
                              return (
                                <div key={lineIndex} className="flex items-start">
                                  <span className="text-blue-600 mr-3 mt-1">•</span>
                                  <p className="text-gray-700">
                                    {boldText && <strong>{boldText}</strong>}
                                    {normalText}
                                  </p>
                                </div>
                              );
                            } else if (line.trim()) {
                              return (
                                <p key={lineIndex} className="text-gray-700 mb-3">
                                  {line.split('**').map((part, partIndex) => 
                                    partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                                  )}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {paragraph.split('**').map((part, partIndex) => 
                            partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* GDPR & Legal Compliance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 py-6 sm:p-6 mt-4">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Legal Compliance</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">GDPR Compliance</h3>
              <p className="text-blue-700 text-sm">
                We comply with the General Data Protection Regulation (GDPR) and provide 
                EU residents with full rights over their personal data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">CCPA Compliance</h3>
              <p className="text-blue-700 text-sm">
                California residents have additional rights under the California Consumer 
                Privacy Act (CCPA) regarding their personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-4 py-6 sm:p-6 mt-4">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FiMail className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              If you have any questions, concerns, or requests regarding this Privacy Policy 
              or our data practices, please don&apos;t hesitate to contact us:
            </p>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleEmailClick}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Send Email
              </button>
              <span className="text-gray-600">or</span>
              <span className="text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded">
                {email}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              We typically respond to privacy inquiries within 48 hours.
            </p>
          </div>
        </div>

        {/* Updates Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 py-6 sm:p-6 mt-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Policy Updates</h3>
          <p className="text-yellow-700 text-sm">
            We may update this Privacy Policy from time to time to reflect changes in our 
            practices or legal requirements. We will notify users of any material changes 
                         by posting the updated policy on this page and updating the &quot;Last Updated&quot; date. 
            We encourage you to review this policy periodically.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2024 Security Suite. All rights reserved. | 
            <span className="ml-1">Protecting your digital privacy and security.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
