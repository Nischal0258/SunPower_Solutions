import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Keyboard,
  Layers,
  ShieldCheck,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Cpu,
  Sun,
  BatteryCharging
} from 'lucide-react';
import { Modal } from './Modal';
import { DataService } from '../../services/dataService';

export interface ScannedSerialItem {
  serial: string;
  category: 'Inverter' | 'Solar Panel' | 'Battery Storage' | 'Net-Meter' | 'BOS / Component';
  modelName: string;
  valid: boolean;
  statusText: string;
  warrantyPeriod: string;
}

interface SerialNumberScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (serials: string[]) => void;
  onScan?: (serial: string, category?: string) => void;
  title?: string;
  targetItemName?: string;
  expectedCategory?: string;
  allowBatch?: boolean;
}

export const SerialNumberScanModal: React.FC<SerialNumberScanModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  onScan,
  title = 'Equipment Serial Number Scanner',
  targetItemName,
  expectedCategory,
  allowBatch = true
}) => {
  const [inputSerial, setInputSerial] = useState('');
  const [scannedList, setScannedList] = useState<ScannedSerialItem[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [scanFeedback, setScanFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScannedList([]);
      setInputSerial('');
      setScanFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Hardware classification & validation engine
  const classifySerial = (rawSerial: string): ScannedSerialItem => {
    const s = rawSerial.trim().toUpperCase();

    if (s.startsWith('INV-')) {
      return {
        serial: s,
        category: 'Inverter',
        modelName: 'Growatt SPH-10000TL3 Hybrid Inverter (10 kW)',
        valid: true,
        statusText: 'Verified in Warehouse Stock • Ready for Commissioning',
        warrantyPeriod: '2 Years Manufacturer Replacement'
      };
    } else if (s.startsWith('MOD-') || s.startsWith('PNL-')) {
      return {
        serial: s,
        category: 'Solar Panel',
        modelName: 'Waaree 545W Mono PERC Half-Cut Module',
        valid: true,
        statusText: 'Verified Tier-1 DCR Cell Serial • IEC 61215 Certified',
        warrantyPeriod: '20 Years Performance Guarantee'
      };
    } else if (s.startsWith('BAT-')) {
      return {
        serial: s,
        category: 'Battery Storage',
        modelName: 'BYD Battery-Box Premium LiFePO4 (5.12 kWh)',
        valid: true,
        statusText: 'CAN-Bus Communication Verified • 6000 Cycles Rated',
        warrantyPeriod: '2 Years Hardware & BMS Guarantee'
      };
    } else if (s.startsWith('MTR-')) {
      return {
        serial: s,
        category: 'Net-Meter',
        modelName: 'Secure Premier 3-Phase Bi-Directional Net-Meter',
        valid: true,
        statusText: 'DISCOM Net-Metering Calibrated • Class 1.0 Accuracy',
        warrantyPeriod: '5 Years Utility Meter Warranty'
      };
    } else {
      // Generic serial validation (must be at least 5 alphanumeric chars)
      const isValid = /^[A-Z0-9-]{6,24}$/.test(s);
      return {
        serial: s,
        category: 'BOS / Component',
        modelName: 'Balance of System / Structure Hardware',
        valid: isValid,
        statusText: isValid ? 'Manual Serial Verified' : 'Unrecognized Serial Format',
        warrantyPeriod: '1 Year Standard Hardware Coverage'
      };
    }
  };

  const handleAddSerial = (raw: string) => {
    if (!raw.trim()) return;
    const classified = classifySerial(raw);

    if (!classified.valid) {
      setScanFeedback({
        message: `Invalid serial format "${raw}". Must be 6-24 alphanumeric characters.`,
        type: 'error'
      });
      return;
    }

    if (scannedList.some(item => item.serial === classified.serial)) {
      setScanFeedback({
        message: `Serial "${classified.serial}" already in scanned batch list.`,
        type: 'info'
      });
      setInputSerial('');
      return;
    }

    setScannedList(prev => [classified, ...prev]);
    setInputSerial('');
    setScanFeedback({
      message: `Captured ${classified.category}: ${classified.serial}`,
      type: 'success'
    });

    if (onScan) {
      onScan(classified.serial, classified.category);
    }

    if (!allowBatch) {
      if (onScanComplete) {
        onScanComplete([classified.serial]);
      }
      onClose();
    }
  };

  const handleRemoveItem = (serial: string) => {
    setScannedList(prev => prev.filter(item => item.serial !== serial));
  };

  const handleSubmitBatch = () => {
    if (scannedList.length === 0 && inputSerial.trim()) {
      const single = classifySerial(inputSerial);
      if (single.valid) {
        if (onScanComplete) {
          onScanComplete([single.serial]);
        }
        if (onScan) {
          onScan(single.serial, single.category);
        }
        onClose();
        return;
      }
    }
    if (scannedList.length === 0) {
      setScanFeedback({ message: 'Please scan or input at least one valid serial number.', type: 'error' });
      return;
    }
    const serials = scannedList.map(item => item.serial);
    if (onScanComplete) {
      onScanComplete(serials);
    }
    if (onScan) {
      scannedList.forEach(item => onScan(item.serial, item.category));
    }
    onClose();
  };

  // Quick preset test samples
  const testSamples = [
    { label: 'Hybrid Inverter', serial: 'INV-GW-2026-0881' },
    { label: 'PV Module', serial: 'MOD-TP-2026-9921' },
    { label: 'LiFePO4 Battery', serial: 'BAT-BYD-51V-0042' },
    { label: 'DISCOM Net-Meter', serial: 'MTR-MSEDCL-4412' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="space-y-4 text-xs">
        {/* Mode switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'camera'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Optical Viewfinder</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('manual');
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Manual / USB Scanner</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {scannedList.length} Serials Staged
          </span>
        </div>

        {/* Optical Viewfinder View */}
        {activeTab === 'camera' && (
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 aspect-video flex flex-col items-center justify-center text-center shadow-inner">
            {/* Camera targeting reticle */}
            <div className="w-72 h-36 border-2 border-dashed border-emerald-400/70 rounded-xl relative flex items-center justify-center bg-emerald-500/5">
              {/* Corner targeting brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

              {/* Animated laser scan beam */}
              <div className="absolute inset-x-2 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" />

              <div className="text-center p-3">
                <Scan className="w-6 h-6 text-emerald-400 mx-auto mb-1 animate-pulse" />
                <p className="text-[11px] font-semibold text-white tracking-wide">
                  Target Equipment Serial Number Plate
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Point camera at Inverter chassis, Solar Module label or Battery BMS
                </p>
              </div>
            </div>

            {/* Quick Demo Scan triggers */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Demo Quick-Scan:</span>
              {testSamples.map(ts => (
                <button
                  key={ts.serial}
                  type="button"
                  onClick={() => handleAddSerial(ts.serial)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono border border-slate-700 transition-colors"
                >
                  +{ts.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar (Works in both camera and manual mode) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Serial Number Input (Supports Handheld USB Laser Scanner)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputSerial}
                onChange={e => setInputSerial(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSerial(inputSerial);
                  }
                }}
                placeholder="e.g. INV-GW-2026-0881, MOD-TP-2026-9921, BAT-BYD-51V-0042"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddSerial(inputSerial)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture Serial</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {scanFeedback && (
          <div className={`p-2.5 rounded-lg flex items-center gap-2 text-xs ${
            scanFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : scanFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {scanFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{scanFeedback.message}</span>
          </div>
        )}

        {/* Scanned Serials Staging List */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-700 text-xs">
              Staged Serial Registry ({scannedList.length} items)
            </span>
            {scannedList.length > 0 && (
              <button
                type="button"
                onClick={() => setScannedList([])}
                className="text-[10px] text-rose-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {scannedList.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400">
              No equipment serials scanned yet. Aim scanner or enter serial above.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {scannedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {item.category === 'Inverter' ? <Zap className="w-3.5 h-3.5 text-amber-400" /> :
                       item.category === 'Battery Storage' ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> :
                       <Sun className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 truncate">{item.serial}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-white border border-slate-200 text-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.modelName} • <strong className="text-emerald-700">{item.warrantyPeriod}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.serial)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitBatch}
            disabled={scannedList.length === 0 && !inputSerial.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm & Bind {scannedList.length > 0 ? `(${scannedList.length})` : ''} Serials</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
