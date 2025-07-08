
import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const CeoMessagesDisplay = () => {
  const { ceoMessages, markMessageAsRead } = useData();
  const { user } = useAuth();
  
  // Filter messages for current user
  const userMessages = ceoMessages.filter(msg => 
    msg.recipient === 'all' || msg.recipient === user?.role
  );

  const unreadMessages = userMessages.filter(msg => !msg.isRead);

  if (userMessages.length === 0) {
    return null;
  }

  return (
    <div className="bg-info bg-opacity-10 border border-info rounded p-3 mb-4">
      <h5 className="text-info mb-3">
        <i className="bi bi-info-circle me-2"></i>
        CEO Messages ({unreadMessages.length} unread)
      </h5>
      
      <div className="max-height-200 overflow-auto">
        {userMessages.slice(0, 5).map((message) => (
          <div
            key={message.id}
            className={`alert ${message.isRead ? 'alert-secondary' : 'alert-info'} py-2 mb-2`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <small className="text-muted">
                  {new Date(message.createdAt).toLocaleDateString()} - 
                  To: {message.recipient === 'all' ? 'Everyone' : message.recipient}
                </small>
                <p className="mb-0 mt-1">{message.message}</p>
              </div>
              {!message.isRead && (
                <button
                  onClick={() => markMessageAsRead(message.id)}
                  className="btn btn-sm btn-outline-primary ms-2"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CeoMessagesDisplay;
