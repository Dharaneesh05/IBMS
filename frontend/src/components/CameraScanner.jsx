import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { HiX, HiCamera } from 'react-icons/hi';

/**
 * CameraScanner Component
 * 
 * Allows scanning QR codes and barcodes using device camera (phone/webcam)
 * Supports both 1D barcodes (Code128, EAN, UPC) and 2D QR codes
 */
const CameraScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const onScanSuccess = useCallback((decodedText) => {
    console.log("Scan result:", decodedText);
    
    // Stop scanner temporarily to prevent multiple scans
    setIsScanning(false);
    
    // Extract SKU from the scanned code
    let sku = decodedText;
    
    // If it's a QR code with JSON data, parse it
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.sku) {
        sku = parsed.sku;
      }
    } catch {
      // Not JSON, use as-is (likely a barcode with SKU directly)
    }
    
    // Pass SKU to parent component
    onScan(sku);
    
    // Close modal after successful scan
    setTimeout(() => {
      onClose();
    }, 500);
  }, [onClose, onScan]);

  const onScanFailure = useCallback((scanError) => {
    // Scanning failed, but this is normal - it happens every frame until a code is found
    // Only log actual errors, not "No QR code found"
    if (scanError && !scanError.includes("NotFoundError") && !scanError.includes("NotFoundException")) {
      console.warn("Scan error:", scanError);
    }
  }, []);

  useEffect(() => {
    let html5QrCodeScanner = null;

    // Initialize scanner when component mounts
    const initScanner = () => {
      try {
        html5QrCodeScanner = new Html5QrcodeScanner(
          "camera-scanner-container",
          {
            fps: 10, // Frames per second for scanning
            qrbox: { width: 250, height: 250 }, // Scanning box size
            aspectRatio: 1.0,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.CODE_93,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E
            ]
          },
          false // verbose logging
        );

        html5QrCodeScanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = html5QrCodeScanner;
        setIsScanning(true);
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setError("Failed to initialize camera scanner. Please check camera permissions.");
      }
    };

    initScanner();

    // Cleanup on unmount
    return () => {
      if (html5QrCodeScanner) {
        html5QrCodeScanner.clear().catch(error => {
          console.error("Failed to clear scanner:", error);
        });
      }
    };
  }, [onScanFailure, onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <HiCamera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Camera Scanner
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How to use:</strong>
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 ml-4">
            <li>• Allow camera access when prompted</li>
            <li>• Point camera at the barcode or QR code</li>
            <li>• Hold steady until it scans (1-2 seconds)</li>
            <li>• Product will auto-add to invoice</li>
          </ul>
        </div>

        {/* Scanner Container */}
        <div className="p-4">
          <div 
            id="camera-scanner-container" 
            className="rounded-lg overflow-hidden bg-gray-900 min-h-[400px] flex items-center justify-center"
            style={{
              border: '2px solid #3b82f6'
            }}
          />
        </div>

        {/* Status Messages */}
        {isScanning && (
          <div className="px-4 pb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                <strong>Ready to scan!</strong> Position barcode/QR code in the frame
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 pb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Tips:</strong>
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-1">
            <li>• Ensure good lighting for best results</li>
            <li>• Keep barcode/QR code flat and clear</li>
            <li>• Try different distances if not scanning</li>
            <li>• Works with both QR codes and barcodes</li>
          </ul>
        </div>
      </div>

      {/* CSS for html5-qrcode styling */}
      <style>{`
        #camera-scanner-container {
          position: relative;
          background: #000;
          min-height: 400px;
        }

        #camera-scanner-container video {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          display: block !important;
          object-fit: contain !important;
        }

        /* Hide duplicate video elements - only show the first one */
        #camera-scanner-container video:not(:first-of-type) {
          display: none !important;
        }

        #camera-scanner-container canvas {
          display: none !important;
        }

        /* Ensure only one video container */
        #camera-scanner-container #html5qr-code-full-region {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Style the scan region */
        #camera-scanner-container #qr-shaded-region {
          border: 3px solid #3b82f6 !important;
          border-radius: 8px !important;
        }

        /* Hide file upload option since we only want camera */
        #camera-scanner-container input[type="file"],
        #camera-scanner-container #html5-qrcode-anchor-scan-type-change {
          display: none !important;
        }

        /* Style the html5-qrcode UI */
        #camera-scanner-container > div {
          width: 100% !important;
        }

        /* Style select dropdown for camera selection */
        #camera-scanner-container select {
          padding: 8px 12px !important;
          border-radius: 6px !important;
          border: 1px solid #d1d5db !important;
          background: white !important;
          margin: 10px 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Style start/stop button */
        #camera-scanner-container button {
          background: #3b82f6 !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 10px 20px !important;
          font-size: 14px !important;
          cursor: pointer !important;
          margin: 10px 5px !important;
        }

        #camera-scanner-container button:hover {
          background: #2563eb !important;
        }

        /* Ensure the reader div is visible */
        #camera-scanner-container #html5qr-code-full-region {
          width: 100% !important;
          background: #000 !important;
          padding: 10px !important;
        }

        /* Hide the scanning region overlay to prevent duplication */
        #camera-scanner-container #qr-shaded-region {
          display: none !important;
        }

        /* Clean container layout */
        #camera-scanner-container > div {
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
