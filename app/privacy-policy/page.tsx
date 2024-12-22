"use client";

import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = 'payam';
    const domain = 'shariat.de';
    setEmail(`${user}@${domain}`);
  }, []);

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Inquiry about Security Risk Checker Privacy Policy");
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex flex-col items-center w-full flex-1 px-6 py-5 text-center">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-5">Privacy Policy</h1>
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl">
          <div className=" text-gray-800 leading-relaxed text-justify">
            <p className="mb-4"><strong>Effective Date:</strong> May 23, 2024</p>
            <p className="mb-10">Welcome to <strong>Feed Fresh</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share information when you use our app.</p>
            <p className="mb-10"><strong>Information We Collect:</strong> We do not collect any personal information that can directly identify you, such as your name, address, or email. We also do not collect any non-personal information about your device and usage.</p>
            <p className="mb-10"><strong>Content from Third-Party Sources:</strong> Our app aggregates content from various RSS feeds, which may include text, images, and other content. We do not control or create this content and it may include material that is violent, sexual, or offensive in nature. Users are advised to exercise discretion when accessing such content. We are not responsible for the content of third-party websites or services.</p>
            <p className="mb-10"><strong>Cookies:</strong> Our website uses cookies to enhance your experience. Cookies are small text files stored on your device that help us understand how you use our site and improve our services. However, <strong>we do not use cookies in our app</strong>. You can control the use of cookies through your browser settings when using our website.</p>
            <p className="mb-10"><strong>Changes to This Privacy Policy:</strong> We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
            <p className="mb-10">
              <strong>Contact Us:</strong> If you have any questions or concerns about this Privacy Policy, please
              <button onClick={handleEmailClick} className="text-blue-600 underline ml-1">
                contact us
              </button>
              .
            </p>
            <p className="mb-10"><strong>Disclaimer:</strong> This Privacy Policy does not cover the practices of third-party services or websites that may be linked to or integrated with our app. We encourage you to read the privacy policies of these third-party services or websites.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
