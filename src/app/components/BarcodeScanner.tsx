import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, Loader2, Keyboard } from 'lucide-react';
import { Button } from './ui';
import { lookupBarcode, BarcodeLookup } from '../../lib/barcode';
import { toast } from 'sonner';

type ScannerControls = { stop: () => void };

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
  const controlsRef = useRef<ScannerControls | null>(null);
  const cancelledRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'looking-up' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [manualCode, setManualCode] = useState('');

  async function submitCode(code: string) {
    const clean = code.trim();
    if (!clean || cancelledRef.current) return;

    controlsRef.current?.stop();
    setStatus('looking-up');

    try {
      const lookup = await lookupBarcode(clean);
      if (cancelledRef.current) return;
      onResult(lookup);
      if (!lookup.found) {
        toast(`Barcode ${clean} not in database - fill in details manually`);
      }
    } catch (err: any) {
      if (cancelledRef.current) return;
      toast.error(err?.message ?? 'Lookup failed');
      onResult({ found: false, barcode: clean });
    }
  }

  useEffect(() => {
    if (!open) return;

    cancelledRef.current = false;
    setStatus('starting');
    setErrorMsg('');
    setManualCode('');

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    reader
      .decodeFromConstraints(constraints, videoRef.current!, async (result, _err, controls) => {
        if (cancelledRef.current) return;
        controlsRef.current = controls;

        if (!result) {
          setStatus((current) => current === 'starting' ? 'scanning' : current);
          return;
        }

        controls.stop();
        await submitCode(result.getText());
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        setStatus('error');
        setErrorMsg(err?.message ?? 'Could not access camera');
      });

    return () => {
      cancelledRef.current = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      readerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--pp-gray-900)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(var(--pp-sp-4) + env(safe-area-inset-top)) var(--pp-sp-4) var(--pp-sp-4)',
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
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: 'var(--pp-gray-900)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '78%',
            maxWidth: 340,
            height: 170,
            border: '2px solid var(--pp-fresh-mint)',
            borderRadius: 'var(--pp-radius-md)',
            boxShadow: '0 0 0 9999px var(--pp-scrim)',
            pointerEvents: 'none',
          }}
        />

        {status === 'starting' && (
          <StatusOverlay icon={<Camera size={28} />} label="Starting camera..." />
        )}
        {status === 'looking-up' && (
          <StatusOverlay icon={<Loader2 size={28} className="pp-spin" />} label="Looking up product..." />
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
          padding: 'var(--pp-sp-4) var(--pp-sp-4) calc(var(--pp-sp-6) + env(safe-area-inset-bottom))',
          color: 'var(--pp-overlay-white-85)',
          textAlign: 'center',
        }}
      >
        <div className="pp-small" style={{ color: 'var(--pp-overlay-white-85)' }}>
          Hold the barcode inside the frame.
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitCode(manualCode);
          }}
          style={{
            marginTop: 'var(--pp-sp-3)',
            display: 'flex',
            gap: 'var(--pp-sp-2)',
          }}
        >
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter barcode manually"
            aria-label="Manual barcode"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '12px 14px',
              borderRadius: 'var(--pp-radius-md)',
              border: '1px solid var(--pp-overlay-white-18)',
              background: 'var(--pp-overlay-white-15)',
              color: 'var(--pp-white)',
              fontFamily: 'var(--pp-font)',
              fontSize: 16,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            aria-label="Use manual barcode"
            disabled={!manualCode.trim() || status === 'looking-up'}
            style={{
              width: 48,
              border: 'none',
              borderRadius: 'var(--pp-radius-md)',
              background: manualCode.trim() ? 'var(--pp-fresh-mint)' : 'var(--pp-overlay-white-18)',
              color: 'var(--pp-gray-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: manualCode.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Keyboard size={18} />
          </button>
        </form>
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
