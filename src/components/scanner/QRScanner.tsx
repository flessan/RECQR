"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, Link as LinkIcon, Wifi, User, Calendar, MapPin, 
  Mail, Phone, MessageSquare, FileText, Share2, Copy, ExternalLink, 
  RefreshCw, Check, QrCode, Download, Navigation
} from "lucide-react";
import jsQR from "jsqr";
import { useScanHistory } from "@/lib/store/scanHistory";
import { detectQRType, parseWiFi, parseVCard, parseCalendar } from "@/lib/utils/qrParser";
import type { QRCodeType } from "@/lib/types";

interface ScanResult {
  text: string;
  type: QRCodeType;
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [autoOpen, setAutoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const { addScan } = useScanHistory();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        scanFrame();
      }
    } catch (err) {
      setError("Camera access denied or not available. Please check permissions.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanFrame = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      handleScannedData(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning, autoOpen]);

  const handleScannedData = (data: string) => {
    const type = detectQRType(data);
    setScanResult({ text: data, type });
    addScan({ text: data, type });
    stopScanning();
    
    if (autoOpen && type === "url") {
      window.open(data, "_blank", "noopener,noreferrer");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            handleScannedData(code.data);
          } else {
            setError("No QR code found in the image. Please try another image.");
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAction = async (action: string, payload?: string) => {
    if (!scanResult) return;
    const targetText = payload || scanResult.text;

    switch (action) {
      case "open":
        if (scanResult.type === "url") {
          window.open(targetText, "_blank", "noopener,noreferrer");
        } else if (scanResult.type === "email") {
          window.location.href = targetText;
        } else if (scanResult.type === "phone") {
          window.location.href = targetText;
        } else if (scanResult.type === "sms") {
          window.location.href = targetText;
        } else if (scanResult.type === "geo") {
          const coords = targetText.replace("geo:", "");
          window.open(`https://maps.google.com/?q=${coords}`, "_blank");
        } else {
          window.open(targetText, "_blank", "noopener,noreferrer");
        }
        break;
      case "copy":
        await navigator.clipboard.writeText(targetText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "share":
        if ("share" in navigator && typeof navigator.share === "function") {
          await navigator.share({ url: targetText, text: "Check out this QR Code data" });
        }
        break;
      case "download":
        const blob = new Blob([targetText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recqr_${scanResult.type}.txt`;
        if (scanResult.type === 'vcard') a.download = 'contact.vcf';
        if (scanResult.type === 'calendar') a.download = 'event.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
    }
  };

  const toggleCamera = () => {
    stopScanning();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const getTypeIcon = (type: QRCodeType) => {
    switch (type) {
      case "url": return <LinkIcon className="w-5 h-5" />;
      case "wifi": return <Wifi className="w-5 h-5" />;
      case "email": return <Mail className="w-5 h-5" />;
      case "phone": return <Phone className="w-5 h-5" />;
      case "sms": return <MessageSquare className="w-5 h-5" />;
      case "whatsapp": return <MessageSquare className="w-5 h-5" />;
      case "geo": return <MapPin className="w-5 h-5" />;
      case "calendar": return <Calendar className="w-5 h-5" />;
      case "vcard": return <User className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const renderRichContent = () => {
    if (!scanResult) return null;

    if (scanResult.type === "wifi") {
      const wifi = parseWiFi(scanResult.text);
      if (wifi) {
        return (
          <div className="bg-[var(--color-surface-container)] rounded-2xl p-5 mb-6 space-y-4">
            <div className="flex items-center space-x-3 text-[var(--color-on-surface)]">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{wifi.ssid || "Hidden Network"}</h4>
                <p className="text-sm text-[var(--color-on-surface-variant)]">Wi-Fi Network</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm bg-[var(--color-surface-container-high)] p-4 rounded-xl">
              <div>
                <span className="text-[var(--color-on-surface-variant)] block mb-1">Password</span>
                <span className="font-mono text-[var(--color-on-surface)] font-medium break-all">
                  {wifi.password || "None"}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-on-surface-variant)] block mb-1">Security</span>
                <span className="font-medium text-[var(--color-on-surface)]">{wifi.encryption || "Open"}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    if (scanResult.type === "vcard") {
      const vcard = parseVCard(scanResult.text);
      if (vcard) {
        return (
          <div className="bg-[var(--color-surface-container)] rounded-2xl p-5 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-[var(--color-on-surface)]">{vcard.name || "Contact"}</h4>
                {vcard.organization && <p className="text-sm text-[var(--color-on-surface-variant)]">{vcard.organization}</p>}
              </div>
            </div>
            <div className="space-y-3 bg-[var(--color-surface-container-high)] p-4 rounded-xl text-sm">
              {vcard.phone && (
                <div className="flex items-center space-x-3 text-[var(--color-on-surface)]">
                  <Phone className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                  <span>{vcard.phone}</span>
                </div>
              )}
              {vcard.email && (
                <div className="flex items-center space-x-3 text-[var(--color-on-surface)]">
                  <Mail className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                  <span>{vcard.email}</span>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (scanResult.type === "calendar") {
      const event = parseCalendar(scanResult.text);
      if (event) {
        return (
          <div className="bg-[var(--color-surface-container)] rounded-2xl p-5 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-[var(--color-on-surface)] line-clamp-1">{event.title || "Event"}</h4>
                <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-1">Event Invitation</p>
              </div>
            </div>
            <div className="space-y-3 bg-[var(--color-surface-container-high)] p-4 rounded-xl text-sm">
              {event.start && (
                <div className="text-[var(--color-on-surface)]">
                  <span className="text-[var(--color-on-surface-variant)] text-xs block mb-1">Starts</span>
                  <span className="font-medium">{event.start.replace(/T/, ' ').replace(/Z/, ' UTC')}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center space-x-2 text-[var(--color-on-surface)] mt-2 pt-2 border-t border-[var(--color-outline-variant)]/30">
                  <MapPin className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (scanResult.type === "geo") {
      const coords = scanResult.text.replace("geo:", "");
      return (
        <div className="bg-[var(--color-surface-container)] rounded-2xl p-5 mb-6 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-3">
            <MapPin className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg text-[var(--color-on-surface)] mb-1">Location Coordinates</h4>
          <p className="font-mono text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-high)] py-2 px-4 rounded-lg inline-block">
            {coords}
          </p>
        </div>
      );
    }

    // Default rich block for URLs & Text
    return (
      <div className="p-4 rounded-xl bg-[var(--color-surface-container)] mb-6 border border-[var(--color-outline-variant)]">
        <p className="text-[var(--color-on-surface)] break-all font-mono text-sm leading-relaxed">
          {scanResult.text}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-2">
            QR Scanner
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            Scan anywhere, decode instantly.
          </p>
        </motion.div>

        <div className="md-card p-4 sm:p-6 mb-6 shadow-sm border border-[var(--color-outline-variant)]/50">
          {/* Video Preview */}
          <div className="relative aspect-[4/3] sm:aspect-video bg-black rounded-[var(--radius-lg)] overflow-hidden mb-6 group">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${isScanning ? "block" : "hidden"}`}
            />
            
            {!isScanning && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-container-low)]">
                <div className="text-center p-6">
                  <QrCode className="w-20 h-20 text-[var(--color-on-surface-variant)] mb-4 mx-auto opacity-50" />
                  <p className="text-[var(--color-on-surface-variant)] font-medium">
                    Camera preview inactive
                  </p>
                </div>
              </div>
            )}

            {/* Scanning Frame Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/20 rounded-3xl relative overflow-hidden backdrop-blur-[1px]">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-3xl" />
                  
                  {/* Scanning Line Animation */}
                  <motion.div
                    animate={{ y: [0, 256, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent shadow-[0_0_8px_var(--color-primary)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-6">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="md-filled-button inline-flex items-center justify-center space-x-2 w-full sm:w-auto py-3 px-6 shadow-md"
              >
                <QrCode className="w-5 h-5" />
                <span>Start Camera</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="md-filled-tonal-button inline-flex items-center justify-center space-x-2 w-full sm:w-auto py-3 px-6"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Stop Scanning</span>
              </button>
            )}

            <label className="md-outlined-button inline-flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto py-3 px-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {isScanning && (
              <button
                onClick={toggleCamera}
                className="md-outlined-button inline-flex items-center justify-center space-x-2 w-full sm:w-auto py-3 px-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Switch Camera</span>
              </button>
            )}
          </div>
          
          <div className="flex justify-center mb-2">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container-lowest)]/80 border border-[var(--color-outline-variant)]/60 transition-colors w-full sm:w-auto">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={autoOpen}
                  onChange={(e) => setAutoOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--color-surface-variant)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              </div>
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-on-surface)]">Auto-open URLs</span>
              </div>
            </label>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-error-container)] text-[var(--color-on-error-container)] flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-error)]" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 border-t border-[var(--color-outline-variant)] pt-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center">
                    <span className="bg-[var(--color-primary)] w-1.5 h-6 rounded-full mr-3 inline-block"></span>
                    Detected {scanResult.type.toUpperCase()}
                  </h3>
                  <div className="px-3 py-1.5 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-sm font-bold flex items-center space-x-1.5">
                    {getTypeIcon(scanResult.type)}
                    <span className="hidden sm:inline-block capitalize">{scanResult.type}</span>
                  </div>
                </div>
                
                {renderRichContent()}
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(scanResult.type === 'url' || scanResult.type === 'geo' || scanResult.type === 'email' || scanResult.type === 'phone' || scanResult.type === 'sms') && (
                    <button
                      onClick={() => handleAction("open")}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
                    >
                      {scanResult.type === 'geo' ? <Navigation className="w-5 h-5 mb-1" /> : <ExternalLink className="w-5 h-5 mb-1" />}
                      <span className="text-xs font-semibold">{scanResult.type === 'geo' ? 'Maps' : 'Open'}</span>
                    </button>
                  )}
                  
                  {(scanResult.type === 'vcard' || scanResult.type === 'calendar') && (
                    <button
                      onClick={() => handleAction("download")}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
                    >
                      <Download className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Save</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (scanResult.type === 'wifi') {
                        const wifi = parseWiFi(scanResult.text);
                        handleAction("copy", wifi?.password);
                      } else {
                        handleAction("copy");
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors border ${copied ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800' : 'bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'}`}
                  >
                    {copied ? <Check className="w-5 h-5 mb-1" /> : <Copy className="w-5 h-5 mb-1" />}
                    <span className="text-xs font-semibold">{scanResult.type === 'wifi' ? 'Copy Pass' : (copied ? 'Copied!' : 'Copy')}</span>
                  </button>

                  {"share" in navigator && typeof navigator.share === "function" && (
                    <button
                      onClick={() => handleAction("share")}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                    >
                      <Share2 className="w-5 h-5 mb-1" />
                      <span className="text-xs font-semibold">Share</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setScanResult(null);
                      setError(null);
                      startScanning();
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors col-span-2 sm:col-span-1"
                  >
                    <RefreshCw className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Scan Next</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips Card */}
        <div className="md-card p-5 sm:p-6 bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/50">
          <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-4 flex items-center space-x-2">
            <span className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
              <Lightbulb className="w-5 h-5" />
            </span>
            <span>Pro Scanning Tips</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[var(--color-on-surface-variant)]">
            <li className="flex flex-col space-y-2 bg-[var(--color-surface-container-lowest)] p-3 rounded-xl border border-[var(--color-outline-variant)]/30">
              <span className="font-semibold text-[var(--color-on-surface)]">Lighting</span>
              <span>Ensure good lighting and avoid harsh glare on the code.</span>
            </li>
            <li className="flex flex-col space-y-2 bg-[var(--color-surface-container-lowest)] p-3 rounded-xl border border-[var(--color-outline-variant)]/30">
              <span className="font-semibold text-[var(--color-on-surface)]">Distance</span>
              <span>Keep your camera steady and around 6-10 inches away.</span>
            </li>
            <li className="flex flex-col space-y-2 bg-[var(--color-surface-container-lowest)] p-3 rounded-xl border border-[var(--color-outline-variant)]/30">
              <span className="font-semibold text-[var(--color-on-surface)]">Alternatives</span>
              <span>Upload an image if the camera can't detect the code.</span>
            </li>
          </ul>
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
