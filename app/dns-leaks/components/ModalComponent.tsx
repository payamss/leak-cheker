'use client';

import React, { useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';

interface ModalProps {
  title?: string; // Title of the modal
  server: string; // URL to load inside the modal
}

const Modal: React.FC<ModalProps> = ({ title = 'DNS Server', server }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle modal visibility
  const toggleModal = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative z-60">
      {/* Button to open modal */}
      <button
        onClick={toggleModal}
        className={`p-2 rounded-full text-blue-700  hover:text-blue-800
          transition-transform duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open Modal"
      >
        <FiInfo size={24} />
      </button>

      {/* Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 
          transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
      >
        <div className="relative bg-gray-800 rounded-lg shadow-lg w-3/4 h-3/4 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={toggleModal}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 transition"
            aria-label="Close Modal"
          >
            <FiX size={24} />
          </button>

          {/* Modal Title */}
          <h2 className="text-lg font-bold text-white p-4">{title}</h2>

          {/* Iframe for Loading Server Link */}
          <iframe
            src={server}
            title={title}
            className="w-full h-full border-none"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;
