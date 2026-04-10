import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 50);
    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 350);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, [duration, onDismiss]);

  function dismiss() {
    setLeaving(true);
    setTimeout(onDismiss, 350);
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        maxWidth: '360px',
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          flexShrink: 0,
          marginTop: '5px',
        }}
      />
      <p
        style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: 500,
          color: '#09090B',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {message}
      </p>
      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#A1A1AA',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
