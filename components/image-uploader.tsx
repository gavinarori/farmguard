'use client';

import { useState, useCallback } from 'react';
import { Upload, AlertCircle, X, ImageIcon, Replace } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
  showMetaFields?: boolean;
  onMetaChange?: (meta: {
    county?: string;
    landAcres?: number;
    location?: string;
    notes?: string;
  }) => void;
}

export function ImageUploader({
  onImageSelected,
  isLoading = false,
  showMetaFields = false,
  onMetaChange,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ county: '', landAcres: '', location: '', notes: '' });

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, or WEBP).');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must be under 20 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setFileName(file.name);
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const clearImage = () => { setPreview(null); setFileName(null); setError(null); };

  const updateMeta = (key: keyof typeof meta, value: string) => {
    const next = { ...meta, [key]: value };
    setMeta(next);
    onMetaChange?.({
      county: next.county || undefined,
      landAcres: next.landAcres ? parseFloat(next.landAcres) : undefined,
      location: next.location || undefined,
      notes: next.notes || undefined,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn('drop-zone', isDragging && 'dragging', isLoading && 'pointer-events-none opacity-50')}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Selected farm image"
              style={{ width: '100%', maxHeight: '16rem', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon style={{ height: '0.85rem', width: '0.85rem', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
                  onClick={() => document.getElementById('fg-file-input')?.click()}
                  disabled={isLoading}
                >
                  Replace
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
                  onClick={clearImage}
                  disabled={isLoading}
                >
                  <X style={{ height: '0.8rem', width: '0.8rem' }} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor="fg-file-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '3rem 1.5rem',
              cursor: 'pointer',
            }}
          >
            {/* Upload icon container */}
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--r-lg)',
                background: 'var(--col-green-glow)',
                border: '1px solid rgba(92,173,110,0.3)',
              }}
            >
              <Upload style={{ height: '1.4rem', width: '1.4rem', color: 'var(--col-green)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--col-text-primary)', marginBottom: '0.25rem' }}>
                Drop your farm image here
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--col-text-muted)' }}>
                or click to browse &nbsp;·&nbsp; JPEG · PNG · WEBP · max 20 MB
              </p>
            </div>
          </label>
        )}

        <input
          id="fg-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
      </div>

      {/* Meta Fields */}
      {showMetaFields && (
        <div
          style={{
            background: 'var(--col-surface-2)',
            border: '1px solid var(--col-border)',
            borderRadius: 'var(--r-lg)',
            padding: '0.875rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.6rem',
          }}
        >
          <p className="section-label" style={{ gridColumn: '1 / -1', marginBottom: '0.1rem' }}>
            Optional context — improves AI accuracy
          </p>
          {[
            { key: 'county',    label: 'County / Region',   placeholder: 'e.g. Bomet', span: false },
            { key: 'landAcres', label: 'Plot size (acres)',  placeholder: 'e.g. 2.5',  span: false },
            { key: 'location',  label: 'Farm name / GPS',   placeholder: 'e.g. Kapkimolwa Block C', span: true },
          ].map(({ key, label, placeholder, span }) => (
            <div key={key} style={{ gridColumn: span ? '1 / -1' : undefined }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--col-text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                {label}
              </label>
              <input
                type={key === 'landAcres' ? 'number' : 'text'}
                placeholder={placeholder}
                value={meta[key as keyof typeof meta]}
                onChange={(e) => updateMeta(key as keyof typeof meta, e.target.value)}
                className="field"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--col-text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Notes for AI
            </label>
            <textarea
              placeholder="e.g. Tea plantation, recently pruned…"
              rows={2}
              value={meta.notes}
              onChange={(e) => updateMeta('notes', e.target.value)}
              className="field"
              style={{ resize: 'none', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            padding: '0.65rem 0.85rem',
            background: 'rgba(192,92,92,0.1)',
            border: '1px solid rgba(192,92,92,0.25)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <AlertCircle style={{ height: '0.9rem', width: '0.9rem', color: '#c05c5c', flexShrink: 0, marginTop: '0.1rem' }} />
          <p style={{ fontSize: '0.82rem', color: '#c05c5c' }}>{error}</p>
        </div>
      )}
    </div>
  );
}