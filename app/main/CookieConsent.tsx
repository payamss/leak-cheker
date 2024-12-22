"use client";

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookieConsent='));
    if (!consent) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    // Detect device type and set as a cookie
    const userAgent = window.navigator.userAgent.toLowerCase();
    let deviceType = 'Unknown';
    if (userAgent.includes('windows')) {
      deviceType = 'Windows';
    } else if (userAgent.includes('mac')) {
      deviceType = 'Mac';
    } else if (userAgent.includes('android')) {
      deviceType = 'Android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      deviceType = 'iOS';
    }

    document.cookie = `deviceType=${deviceType}; path=/`;
  }, []);

  const acceptCookies = () => {
    document.cookie = "cookieConsent=accepted; max-age=31536000; path=/";
    setVisible(false);
  };

  const rejectCookies = () => {
    document.cookie = "cookieConsent=rejected; max-age=31536000; path=/";
    setVisible(false);
  };

  const toggleOptions = () => {
    setShowOptions(prev => !prev);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Your Privacy Options</h2>
        <p className="mb-4">
          Feed Fresh uses cookies and other similar technologies to enable a variety of functions and features on our website. Some are essential for the website to work properly whilst others allow us to improve our services to you, which can include personalized content and advertising with your consent.
        </p>
        <p className="mb-4">
          You can accept or reject the use of cookies. See our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a> here. You can withdraw your consent at any time by clicking on ‘Privacy settings’ at the bottom of any page. Your consent only applies to this website.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={rejectCookies}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={acceptCookies}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
        <button
          onClick={toggleOptions}
          className="mt-4 text-blue-600 underline"
        >
          {showOptions ? 'Hide Options' : 'Show Options'}
        </button>
        {showOptions && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Store and/or access information on a device</h3>
            <p className="mb-4">Cookies and other similar technologies allow us to store and/or access information on your device, such as your IP address.</p>
            <h3 className="font-semibold mb-2">Precise geolocation data, and identification through device scanning</h3>
            <p className="mb-4">Your precise geolocation data can be used to support one or more purposes. This means your location can be accurate to within several meters.</p>
            <h3 className="font-semibold mb-2">Personalized advertising and content, advertising and content measurement, audience research and development</h3>
            <p className="mb-4">Your data can be used to improve existing systems and software, and to develop new products.</p>
            <h3 className="font-semibold mb-2">Analytics storage</h3>
            <p>Your data can be used to monitor the performance and effectiveness of the services.</p>
          </div>
        )}
      </div>
    </div>
  );
}
