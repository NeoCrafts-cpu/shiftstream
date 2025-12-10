'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from './Button';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  logoUrl?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  title,
  subtitle,
  showDownload = true,
  showCopy = true,
  logoUrl,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      if (ctx) {
        ctx.fillStyle = '#0F0F23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'shiftstream-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      )}
      {subtitle && (
        <p className="text-sm text-white/60 mb-4">{subtitle}</p>
      )}

      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-lg shadow-violet-500/20"
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#FFFFFF"
          fgColor="#0F0F23"
          imageSettings={
            logoUrl
              ? {
                  src: logoUrl,
                  height: size * 0.2,
                  width: size * 0.2,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>

      <div className="flex gap-2 mt-4">
        {showCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        )}
        {showDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
        )}
      </div>
    </motion.div>
  );
}
