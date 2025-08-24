import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Use your deployed backend URL directly
const API_BASE_URL = 'https://insyd-backend-1-cmg7.onrender.com/api';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState('user1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch notifications for the current user - wrapped in useCallback
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching notifications from:', `${API_BASE_URL}/notifications/${userId}`);
      const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
      setNotifications(response.data);
      console.log('Notifications fetched:', response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  }, [userId]); // Added userId as dependency

  // Simulate different types of events
  const simulateEvent = async (eventType) => {
    try {
      setError('');
      // Generate random source user (not the current user)
      const users = ['user1', 'user2', 'user3'];
      const availableUsers = users.filter(u => u !== userId);
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      
      let content = '';
      switch(eventType) {
        case 'like':
          content = `${randomUser} liked ${userId}'s post`;
          break;
        case 'comment':
          content = `${randomUser} commented on ${userId}'s post`;
          break;
        case 'follow':
          content = `${randomUser} started following ${userId}`;
          break;
        default:
          content = `${randomUser} interacted with ${userId}`;
      }
      
      console.log('Sending notification to:', `${API_BASE_URL}/notifications`);
      // FIXED: Removed unused 'response' variable
      await axios.post(`${API_BASE_URL}/notifications`, {
        userId: userId,
        type: eventType,
        sourceUserId: randomUser,
        content: content
      });
      
      alert(`${randomUser} ${eventType}ed ${userId}!`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error simulating event:', error);
      setError('Failed to create notification. Please check backend connection.');
    }
  };

  // Load notifications on component mount and when userId changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // FIXED: Added fetchNotifications as dependency

  return (
    <div className="App">
      <header className="App-header">
        <h1>Insyd Notification System</h1>
        <p className="backend-info">Connected to: {API_BASE_URL}</p>
      </header>
      
      <div className="container">
        <div className="controls">
          <div className="user-selector">
            <label>View notifications for: </label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="user1">User 1</option>
              <option value="user2">User 2</option>
              <option value="user3">User 3</option>
            </select>
          </div>
          
          <div className="event-buttons">
            <button onClick={() => simulateEvent('like')} className="event-btn like-btn">
              Simulate Like
            </button>
            <button onClick={() => simulateEvent('comment')} className="event-btn comment-btn">
              Simulate Comment
            </button>
            <button onClick={() => simulateEvent('follow')} className="event-btn follow-btn">
              Simulate Follow
            </button>
          </div>
          
          <button onClick={fetchNotifications} className="refresh-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Notifications'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        
        <div className="notifications">
          <h2>Notifications for {userId}</h2>
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <ul>
              {notifications.map(notification => (
                <li key={notification._id} className={notification.read ? 'read' : 'unread'}>
                  <div className="notification-content">
                    {notification.content}
                  </div>
                  <div className="notification-meta">
                    <span className="type">{notification.type}</span>
                    <span className="time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <span className="status">
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;