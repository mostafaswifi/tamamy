'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner() {
  const scannerRef = useRef(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    // Check camera availability
    navigator.mediaDevices?.enumerateDevices()
      .then(devices => {
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasCamera);
        if (!hasCamera) {
          setError('No camera found on this device');
        }
      });

    if (!hasCamera) return;

    const scanner = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        qrbox: 250,
        fps: 10,
        rememberLastUsedCamera: true,
        supportedScanTypes: [1] // SCAN_TYPE_CAMERA
      },
      false
    );

    const successCallback = (decodedText) => {
      setResult(decodedText);
      setError('');
      scanner.clear();
    };

    const errorCallback = (err) => {
      if (!err.includes('NotFoundException')) {
        setError(err || 'Failed to scan QR code');
      }
    };

    scanner.render(successCallback, errorCallback);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [hasCamera]);

  const resetScanner = () => {
    setResult('');
    setError('');
    setHasCamera(true);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>QR Code Scanner</h1>
      
      {!result && hasCamera && (
        <div id="qr-scanner-container" ref={scannerRef} style={{ width: '100%' }} />
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Scanned Content:</h3>
          <p style={{ wordBreak: 'break-all' }}>{result}</p>
          <button 
            onClick={resetScanner}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Scan Again
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>
          <p>{error}</p>
          <button 
            onClick={resetScanner}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}