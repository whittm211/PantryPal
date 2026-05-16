import { useRef } from 'react';
import { Camera, X, ImageIcon } from 'lucide-react';

export function PhotoUpload({
  photo,
  onChange,
}: {
  photo?: string;
  onChange: (photo?: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="pp-h6" style={{ fontWeight: 500, color: 'var(--pp-gray-700)' }}>
        Photo (optional)
      </span>

      {photo ? (
        <div style={{ position: 'relative' }}>
          <img
            src={photo}
            alt="Food item"
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 'var(--pp-radius-lg)',
              border: '1px solid var(--pp-gray-300)',
            }}
          />
          <button
            onClick={clearPhoto}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 'var(--pp-radius-full)',
              background: 'var(--pp-gray-900)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '20px 16px',
              border: '2px dashed var(--pp-gray-300)',
              borderRadius: 'var(--pp-radius-lg)',
              background: 'var(--pp-gray-50)',
              cursor: 'pointer',
              fontFamily: 'var(--pp-font)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-white)',
                border: '1px solid var(--pp-gray-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={20} color="var(--pp-gray-600)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="pp-small" style={{ color: 'var(--pp-gray-700)', fontWeight: 500 }}>
                Choose from library
              </div>
              <div className="pp-small" style={{ color: 'var(--pp-gray-500)' }}>
                Upload a photo
              </div>
            </div>
          </label>

          <label
            htmlFor="photo-upload"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '20px 16px',
              border: '2px dashed var(--pp-gray-300)',
              borderRadius: 'var(--pp-radius-lg)',
              background: 'var(--pp-gray-50)',
              cursor: 'pointer',
              fontFamily: 'var(--pp-font)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-white)',
                border: '1px solid var(--pp-gray-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} color="var(--pp-gray-600)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="pp-small" style={{ color: 'var(--pp-gray-700)', fontWeight: 500 }}>
                Take photo
              </div>
              <div className="pp-small" style={{ color: 'var(--pp-gray-500)' }}>
                Use camera
              </div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
