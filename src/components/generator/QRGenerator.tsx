"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function QRGenerator() {
  const [text, setText] = useState("https://example.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  
  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-2">
            QR Generator
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            Create custom QR codes instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md-card p-6 flex flex-col space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Content (URL, Text, etc.)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface-container-low)] border-none text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
                rows={4}
                placeholder="Enter text or URL here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Foreground Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-[var(--color-on-surface-variant)] text-sm">{fgColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <span className="text-[var(--color-on-surface-variant)] text-sm">{bgColor}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md-card p-6 flex flex-col items-center justify-center space-y-6"
          >
            <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">
              Preview
            </h3>
            
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <QRCodeSVG
                id="qr-code-svg"
                value={text || " "}
                size={256}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={true}
              />
            </div>

            <button
              onClick={handleDownload}
              disabled={!text}
              className="md-filled-button w-full flex justify-center items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>Download PNG</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
