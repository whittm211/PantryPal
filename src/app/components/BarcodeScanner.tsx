import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui';
import { lookupBarcode, BarcodeLookup } from '../../lib/barcode';
import { toast } from 'sonner';

export function BarcodeScanner({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (result: BarcodeLookup) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'looking-up' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus('starting');
    setErrorMsg('');

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, async (result, _err, controls) => {
        if (cancelled) return;
        controlsRef.current = controls;
        if (!result) {
          if (status === 'starting') setStatus('scanning');
          return;
        }
        controls.stop();
        setStatus('looking-up');
        const code = result.getText();
        try {
          const lookup = await lookupBarcode(code);
          if (cancelled) return;
          onResult(lookup);
          if (!lookup.found) {
            toast(`Barcode ${code} not in database — fill in details manually`);
          }
        } catch (err: any) {
          if (cancelled) return;
          toast.error(err?.message ?? 'Lookup failed');
          onResult({ found: false, barcode: code });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err?.message ?? 'Could not access camera');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      readerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--pp-gray-900)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--pp-sp-4)',
          color: 'var(--pp-white)',
        }}
      >
        <div className="pp-card-title" style={{ color: 'var(--pp-white)' }}>Scan barcode</div>
        <button
          onClick={onClose}
          aria-label="Close scanner"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--pp-radius-full)',
            background: 'var(--pp-overlay-white-18)',
            border: 'none',
            color: 'var(--pp-white)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: 'var(--pp-gray-900)',
          }}
        />

        {/* Aim frame */}
        <div
          style={{
            position: 'absolute',
            width: '70%',
            maxWidth: 280,
            height: 160,
            border: '2px solid var(--pp-fresh-mint)',
            borderRadius: 'var(--pp-radius-md)',
            boxShadow: '0 0 0 9999px var(--pp-scrim)',
            pointerEvents: 'none',
          }}
        />

        {status === 'starting' && (
          <StatusOverlay icon={<Camera size={28} />} label="Starting camera…" />
        )}
        {status === 'looking-up' && (
          <StatusOverlay icon={<Loader2 size={28} className="pp-spin" />} label="Looking up product…" />
        )}
        {status === 'error' && (
          <div
            style={{
              position: 'absolute',
              inset: 'var(--pp-sp-6)',
              background: 'var(--pp-white)',
              borderRadius: 'var(--pp-radius-lg)',
              padding: 'var(--pp-sp-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--pp-sp-3)',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div className="pp-h3" style={{ color: 'var(--pp-tomato-red)' }}>Camera unavailable</div>
            <div className="pp-body" style={{ color: 'var(--pp-gray-700)' }}>{errorMsg}</div>
            <Button variant="primary" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>

      <div
        style={{
          padding: 'var(--pp-sp-4) var(--pp-sp-4) var(--pp-sp-6)',
          color: 'var(--pp-overlay-white-85)',
          textAlign: 'center',
        }}
      >
        <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
          Hold the barcode inside the frame.
        </div>
      </div>
    </div>
  );
}

function StatusOverlay({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'var(--pp-sp-8)',
        padding: 'var(--pp-sp-3) var(--pp-sp-5)',
        background: 'var(--pp-overlay-white-18)',
        borderRadius: 'var(--pp-radius-full)',
        color: 'var(--pp-white)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--pp-sp-2)',
        fontFamily: 'var(--pp-font)',
        fontSize: 'var(--pp-fs-small)',
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
