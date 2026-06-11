export default function NotificationToast({ notification }) {
  return (
    <div className={`toast toast-${notification.type}`}>
      {notification.msg}
    </div>
  );
}
