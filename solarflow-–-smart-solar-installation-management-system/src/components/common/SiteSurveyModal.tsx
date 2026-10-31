import React, { useState } from 'react';
import { Compass, ShieldCheck, AlertTriangle, CheckCircle2, Ruler, Zap } from 'lucide-react';
import { Modal } from './Modal';

export interface SiteSurveyData {
  roofTiltDeg: number;
  roofDirection: string;
  cableDistanceMeters: number;
  shadowObstruction: string;
  earthingResistanceOhms: number;
  surveyorName: string;
  approved: boolean;
  notes: string;
}

interface SiteSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (survey: SiteSurveyData) => void;
  customerName?: string;
  address?: string;
  existingSurvey?: Partial<SiteSurveyData>;
}

export const SiteSurveyModal: React.FC<SiteSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customerName = 'Assigned Site Customer',
  address = 'Jaipur, Rajasthan',
  existingSurvey
}) => {
  const [roofTiltDeg, setRoofTiltDeg] = useState(existingSurvey?.roofTiltDeg ?? 22.5);
  const [roofDirection, setRoofDirection] = useState(existingSurvey?.roofDirection ?? 'South-Facing');
  const [cableDistanceMeters, setCableDistanceMeters] = useState(existingSurvey?.cableDistanceMeters ?? 28);
  const [shadowObstruction, setShadowObstruction] = useState(existingSurvey?.shadowObstruction ?? 'None (Full Sun)');
  const [earthingResistanceOhms, setEarthingResistanceOhms] = useState(existingSurvey?.earthingResistanceOhms ?? 3.8);
  const [surveyorName, setSurveyorName] = useState(existingSurvey?.surveyorName ?? 'Manoj Kumar (Certified MNRE Surveyor)');
  const [approved, setApproved] = useState(existingSurvey?.approved ?? true);
  const [notes, setNotes] = useState(
    existingSurvey?.notes ?? 'Optimal south-facing reinforced RCC roof. Zero shading. Earthing rod location verified.'
  );

  const isEarthingSafe = earthingResistanceOhms <= 5.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      roofTiltDeg: Number(roofTiltDeg),
      roofDirection,
      cableDistanceMeters: Number(cableDistanceMeters),
      shadowObstruction,
      earthingResistanceOhms: Number(earthingResistanceOhms),
      surveyorName,
      approved,
      notes
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Technical Site Survey & Feasibility Gate"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-600">Site Survey For:</span>
            <div className="font-bold text-slate-900 text-sm">{customerName}</div>
            <div className="text-[11px] text-slate-600">{address}</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px]">
            Field Engineering Protocol
          </span>
        </div>

        {/* Technical Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Roof Tilt */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 flex items-center justify-between">
              <span>Roof Tilt Angle</span>
              <span className="font-mono font-bold text-[#C66B45]">{roofTiltDeg}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={roofTiltDeg}
              onChange={(e) => setRoofTiltDeg(parseFloat(e.target.value))}
              className="w-full accent-[#C66B45]"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0° (Flat Slab)</span>
              <span>22.5° (Optimal)</span>
              <span>45° (Steep)</span>
            </div>
          </div>

          {/* Roof Azimuth / Direction */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#C66B45]" />
              Azimuth / Orientation
            </label>
            <select
              value={roofDirection}
              onChange={(e) => setRoofDirection(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#C66B45]"
            >
              <option value="South-Facing">South-Facing (100% Maximum Solar Yield)</option>
              <option value="South-West">South-West (95% Yield)</option>
              <option value="South-East">South-East (95% Yield)</option>
              <option value="East-Facing">East-Facing (80% Yield)</option>
              <option value="West-Facing">West-Facing (80% Yield)</option>
              <option value="North-Facing">North-Facing (Unfavorable / Rejected)</option>
            </select>
          </div>

          {/* Cable Distance */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#C66B45]" />
              DC Cable Run to Inverter
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="100"
                value={cableDistanceMeters}
                onChange={(e) => setCableDistanceMeters(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-200 text-xs font-mono bg-white"
              />
              <span className="text-xs font-semibold text-slate-600">Meters</span>
            </div>
            <p className="text-[10px] text-slate-500">Voltage drop kept below 1.5% with 4mm² UV wire.</p>
          </div>

          {/* Earthing Resistance */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Chemical Earthing Resistance
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isEarthingSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isEarthingSafe ? 'PASS (<5.0 Ω)' : 'FAIL (>5.0 Ω)'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={earthingResistanceOhms}
                onChange={(e) => setEarthingResistanceOhms(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-200 text-xs font-mono bg-white"
              />
              <span className="text-xs font-semibold text-slate-600">Ohms (Ω)</span>
            </div>
            <p className="text-[10px] text-slate-500">Discom net-metering regulations mandate &lt; 5.0 Ohms.</p>
          </div>
        </div>

        {/* Shading Analysis */}
        <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
          <label className="text-xs font-semibold text-slate-900">Shadow Obstruction Analysis</label>
          <select
            value={shadowObstruction}
            onChange={(e) => setShadowObstruction(e.target.value)}
            className="w-full p-2 rounded border border-slate-200 text-xs bg-white text-slate-900"
          >
            <option value="None (Full Sun)">None (Full Sun Year-Round - 0% Shading)</option>
            <option value="Minor Chimney / Parapet (<5%)">Minor Parapet Shadow (&lt; 5% Loss)</option>
            <option value="Adjacent Tree (Seasonal)">Adjacent Tree (Requires Seasonal Trimming)</option>
            <option value="Overhead Water Tank (Heavy)">Overhead Water Tank (Requires 6ft Elevated Structure)</option>
          </select>
        </div>

        {/* Surveyor Name & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-900 block mb-1">Certified Surveyor Name</label>
            <input
              type="text"
              value={surveyorName}
              onChange={(e) => setSurveyorName(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-xs bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 block mb-1">Surveyor Observations</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded border border-slate-200 text-xs bg-white"
            />
          </div>
        </div>

        {/* The Gate Approval Switch */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          approved ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            {approved ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <div className="text-xs font-bold text-slate-900">
                {approved ? 'ROOF APPROVED FOR QUOTATION GENERATION' : 'ROOF FEASIBILITY PENDING APPROVAL'}
              </div>
              <div className="text-[11px] text-slate-600">
                {approved
                  ? 'Unlocks Auto-BOM generation and commercial contract issuance.'
                  : 'Quotation will remain locked until technical parameters are satisfied.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApproved(!approved)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              approved
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
            }`}
          >
            {approved ? '✔ Approved' : 'Pending'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-bold hover:bg-[#C66B45]/90 transition-colors shadow-sm"
          >
            Save Survey & Update Gate
          </button>
        </div>
      </form>
    </Modal>
  );
};