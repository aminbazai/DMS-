import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useIdleTimer() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const timeoutRef = useRef(0);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timeoutRef.current > 0) {
      timerRef.current = setTimeout(() => {
        window.location.hash = '#/login';
        window.location.reload();
      }, timeoutRef.current * 60 * 1000);
    }
  };

  useEffect(() => {
    window.electronAPI.getGeneralInfo().then((info) => {
      timeoutRef.current = parseInt(info?.idle_timeout) || 0;
      if (timeoutRef.current > 0) resetTimer();
    });

    const events = ['mousedown', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetTimer();

    events.forEach((ev) => document.addEventListener(ev, handler));
    resetTimer();

    return () => {
      events.forEach((ev) => document.removeEventListener(ev, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
