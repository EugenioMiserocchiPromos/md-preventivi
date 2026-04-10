import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { consumeFlashMessage } from '../lib/flash';
import { ErrorAlert } from './Feedback';

export default function FlashMessageOutlet() {
  const location = useLocation();
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    setFlash(consumeFlashMessage());
  }, [location.key]);

  if (!flash?.message) return null;

  return (
    <ErrorAlert
      title={flash.title}
      message={flash.message}
      variant={flash.variant || 'warning'}
      onDismiss={() => setFlash(null)}
    />
  );
}
