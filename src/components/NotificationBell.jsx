import React, { useState, useEffect } from 'react'; // useEffect eklendi
import './NotificationBell.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);


  const [notifications, setNotifications] = useState([
    { id: 1, message: '📉 Favorilerinizdeki "Mimari Çizim Masası" fiyatı düştü!', isRead: false },
    { id: 2, message: '💬 Yeni bir mesajınız var.', isRead: false }
  ]);

  useEffect(() => {
    const handleNewNotif = (e) => {

      const newNotif = {
        id: Date.now(),
        message: `✉️ Yeni Mesaj: ${e.detail}`,
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    };


    window.addEventListener('new-notification', handleNewNotif);


    return () => window.removeEventListener('new-notification', handleNewNotif);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
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
              <div key={notif.id} className={`notif-item ${!notif.isRead ? 'unread' : ''}`}>
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