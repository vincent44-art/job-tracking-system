
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

const CeoMessagePanel = () => {
  const { addCeoMessage } = useData();
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      addCeoMessage({
        message: message.trim(),
        recipient,
        isRead: false
      });
      setMessage('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          <i className="bi bi-megaphone me-2"></i>
          CEO Message Center
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-outline-primary btn-sm"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-3">
          <div>
            <label className="form-label">Send Message To:</label>
            <select
              className="form-select"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="purchaser">Purchasers</option>
              <option value="seller">Sellers</option>
              <option value="driver">Drivers</option>
              <option value="store keeper">store keeper</option>
                    
            </select>
          </div>
          
          <div>
            <label className="form-label">Message:</label>
            <textarea
              className="form-control"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            className="btn btn-primary"
            disabled={!message.trim()}
          >
            <i className="bi bi-send me-2"></i>
            Send Message
          </button>
        </div>
      )}
    </div>
  );
};

export default CeoMessagePanel;
