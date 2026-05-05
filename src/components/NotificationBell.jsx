import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem('token');
    if (token) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`http://localhost:5237/hubs/notification?access_token=${token}`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    }
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to NotificationHub!');
          connection.on('ReceiveNotification', (message) => {
            const newNotif = {
              id: Date.now(),
              message: message,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            setNotifications(prev => [newNotif, ...prev]);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.log('Failed to fetch notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = async (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await markAllNotificationsAsRead();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) { }
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {}
    }
    setIsOpen(false);
    if (notif.listingId) {
      navigate(`/listings/${notif.listingId}`);
    }
  };

  return (
    <div className="notification-wrapper">
      <button className="bell-btn" onClick={handleToggle}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown glass">
          <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            Bildirimler
          </h4>
          {notifications.length === 0 ? (
            <p className="notif-empty">Yeni bildirim yok.</p>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
                style={{ cursor: notif.listingId ? 'pointer' : 'default' }}
              >
                <p style={{ margin: 0 }}>{notif.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;