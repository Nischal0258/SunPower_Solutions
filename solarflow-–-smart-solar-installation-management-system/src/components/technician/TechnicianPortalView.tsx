import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Wrench,
  CheckCircle2,
  Clock,
  Camera,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  MapPin,
  Phone,
  User,
  Calendar,
  Zap,
  Layers,
  Upload,
  Check,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import { DataService, TECHNICIANS } from '../../services/dataService';
import { InstallationProject, FeasibilityReport, CommissioningData } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';
import { NavTab } from '../layout/Sidebar';

interface TechnicianPortalViewProps {
  onNavigateTab?: (tab: NavTab, targetId?: string) => void;
}

export const TechnicianPortalView: React.FC<TechnicianPortalViewProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'surveys' | 'installations'>('surveys');
  const [projects, setProjects] = useState<InstallationProject[]>(() => DataService.getProjects());

  // Survey Form State
  const [selectedSurveyProject, setSelectedSurveyProject] = useState<InstallationProject | null>(null);
  const [roofType, setRoofType] = useState<'Concrete Flat' | 'Tin / Metal Sheet' | 'Clay Tile' | 'Asbestos Sheet'>('Concrete Flat');
  const [tiltAngleDeg, setTiltAngleDeg] = useState<number>(22);
  const [azimuthOrientation, setAzimuthOrientation] = useState<string>('South-Facing (Optimal 180°)');
  const [shadingObstacles, setShadingObstacles] = useState<boolean>(false);
  const [shadingNotes, setShadingNotes] = useState<string>('');
  const [earthingResistanceOhms, setEarthingResistanceOhms] = useState<number>(2.4);
  const [surveyNotes, setSurveyNotes] = useState<string>('');
  const [surveyVerdict, setSurveyVerdict] = useState<'Feasible / Approved for Solar' | 'Adjustments Required'>('Feasible / Approved for Solar');
  
  // Survey Photos simulation
  const [surveyPhotos, setSurveyPhotos] = useState<string[]>([
    '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
    '/src/assets/images/solar_technician_survey_1793436857911.jpg'
  ]);
  const [newSurveyPhotoUrl, setNewSurveyPhotoUrl] = useState('');

  // Handover & Commissioning Form State
  const [selectedInstallProject, setSelectedInstallProject] = useState<InstallationProject | null>(null);
  const [testPowerOutputKw, setTestPowerOutputKw] = useState<number>(9.8);
  const [gridSyncChecked, setGridSyncChecked] = useState(true);
  const [earthingCheckPassed, setEarthingCheckPassed] = useState(true);
  const [customerBriefingDone, setCustomerBriefingDone] = useState(true);
  const [handoverNotes, setHandoverNotes] = useState<string>('All PV strings tested, inverter synchronization with grid confirmed, customer orientation completed.');
  const [signatoryName, setSignatoryName] = useState<string>('');

  // 2 Post-Installation Photos
  const [installPhotos, setInstallPhotos] = useState<string[]>([
    '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
    '/src/assets/images/solar_inverter_battery_setup_1793436858572.jpg'
  ]);

  // Digital Signature Pad Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const refreshData = () => {
    const list = DataService.getProjects();
    setProjects(list);
    if (selectedSurveyProject) {
      const updated = list.find(p => p.id === selectedSurveyProject.id) || null;
      setSelectedSurveyProject(updated);
    }
    if (selectedInstallProject) {
      const updated = list.find(p => p.id === selectedInstallProject.id) || null;
      setSelectedInstallProject(updated);
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('sunpower_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedSurveyProject?.id, selectedInstallProject?.id]);

  // Tab 1 Projects: Assigned Surveys (Survey Assigned, Survey In Progress, or Survey Submitted)
  const surveyProjects = projects.filter(p =>
    p.stage === 'Survey Assigned' ||
    p.stage === 'Survey In Progress' ||
    p.stage === 'Survey Submitted'
  );

  // Tab 2 Projects: Installations (Hardware Dispatched, Installation & Handover Completed, or Commissioned & Closed)
  const installProjects = projects.filter(p =>
    p.stage === 'Hardware Dispatched' ||
    p.stage === 'Installation & Handover Completed' ||
    p.stage === 'Commissioned & Closed'
  );

  // Start Survey handler
  const handleStartSurvey = (project: InstallationProject) => {
    if (project.stage === 'Survey Assigned') {
      DataService.startSurvey(project.id);
      showToast(`Survey for ${project.customerName} marked In Progress.`, 'info');
      refreshData();
    }
    setSelectedSurveyProject(project);
    if (project.feasibilityReport) {
      setRoofType(project.feasibilityReport.roofType as any || 'Concrete Flat');
      setTiltAngleDeg(project.feasibilityReport.tiltAngleDeg || 22);
      setAzimuthOrientation(project.feasibilityReport.azimuthOrientation || 'South-Facing (Optimal 180°)');
      setShadingObstacles(project.feasibilityReport.shadingObstacles || false);
      setShadingNotes(project.feasibilityReport.shadingNotes || '');
      setEarthingResistanceOhms(project.feasibilityReport.earthingResistanceOhms || 2.4);
      setSurveyNotes(project.feasibilityReport.notes || '');
      setSurveyVerdict((project.feasibilityReport.verdict as any) || 'Feasible / Approved for Solar');
      if (project.feasibilityReport.photos?.length) {
        setSurveyPhotos(project.feasibilityReport.photos);
      }
    } else {
      // defaults
      setTiltAngleDeg(22);
      setAzimuthOrientation('South-Facing (Optimal 180°)');
      setShadingObstacles(false);
      setShadingNotes('');
      setEarthingResistanceOhms(2.4);
      setSurveyNotes('');
      setSurveyVerdict('Feasible / Approved for Solar');
    }
  };

  // Submit Feasibility Report
  const handleSubmitFeasibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurveyProject) return;

    const report: FeasibilityReport = {
      surveyorName: 'Rajesh Sharma (Lead Field Technician)',
      surveyDate: new Date().toISOString().split('T')[0],
      roofType,
      tiltAngleDeg: Number(tiltAngleDeg),
      azimuthOrientation,
      shadingObstacles,
      shadingNotes: shadingObstacles ? shadingNotes : 'No significant shading obstacles detected.',
      earthingResistanceOhms: Number(earthingResistanceOhms),
      photos: surveyPhotos,
      verdict: surveyVerdict,
      notes: surveyNotes || 'Rooftop structure sound and ready for mounting installation upon Director approval.'
    };

    const success = DataService.submitFeasibilityReport(selectedSurveyProject.id, report);
    if (success) {
      showToast('Technical Feasibility Report submitted! Transferred to Director for review.', 'success');
      refreshData();
    } else {
      showToast('Failed to submit feasibility report.', 'error');
    }
  };

  // Handover Signature Canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#292724';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Select project for installation & handover
  const handleSelectInstallProject = (project: InstallationProject) => {
    setSelectedInstallProject(project);
    setSignatoryName(project.customerName);
    setTestPowerOutputKw(Math.round(project.capacityKw * 0.95 * 10) / 10);
    clearSignature();
  };

  // Submit Commissioning & Handover
  const handleSubmitCommissioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallProject) return;

    if (!signatoryName.trim()) {
      showToast('Please enter the customer / representative signatory name.', 'warning');
      return;
    }

    if (!hasSignature) {
      showToast('Customer signature is required on the touch pad before submitting handover.', 'warning');
      return;
    }

    const data: CommissioningData = {
      commissioningDate: new Date().toISOString().split('T')[0],
      testPowerOutputKw: Number(testPowerOutputKw),
      photos: installPhotos,
      customerSignature: `${signatoryName.trim()} [Digital Touch Verified]`,
      signatoryName: signatoryName.trim(),
      handoverNotes: `${handoverNotes} (Earthing OK: ${earthingCheckPassed ? 'Yes' : 'No'}, Grid Sync: ${gridSyncChecked ? 'Yes' : 'No'})`,
      approvedByDirector: false
    };

    const success = DataService.submitInstallationCommissioning(selectedInstallProject.id, data);
    if (success) {
      showToast('Installation handover and customer signature submitted! Ready for Director final sign-off.', 'success');
      refreshData();
    } else {
      showToast('Failed to submit commissioning data.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Role Identification */}
      <div className="bg-white p-5 rounded-2xl border border-[#E7E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-[#292724]">
              Field Technician Execution Workspace
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#C66B45] border border-amber-200">
              Field Execution Unit
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1">
            Dedicated mobile-friendly hub for On-Site Feasibility Surveys and Turnkey Installation Handovers.
          </p>
        </div>

        {/* Tab Switcher: Tab 1 (Surveys) vs Tab 2 (Installations) */}
        <div className="flex items-center p-1 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('surveys');
              setSelectedInstallProject(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'surveys'
                ? 'bg-[#C66B45] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Assigned Surveys</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'surveys' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {surveyProjects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('installations');
              setSelectedSurveyProject(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'installations'
                ? 'bg-[#C66B45] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. Installations & Handover</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'installations' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {installProjects.length}
            </span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: ASSIGNED SURVEYS & TECHNICAL FEASIBILITY
          ======================================================================= */}
      {activeTab === 'surveys' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assigned Surveys List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E2D9]">
              <div>
                <h3 className="font-bold text-sm text-[#292724]">Assigned Site Surveys</h3>
                <p className="text-[11px] text-slate-500">Rooftop feasibility assessments dispatched to you</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {surveyProjects.length} orders
              </span>
            </div>

            {surveyProjects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E7E2D9] text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-xs text-slate-700">No active surveys pending</p>
                <p className="text-[11px] text-slate-500">All assigned site assessments have been completed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {surveyProjects.map((proj) => {
                  const isSelected = selectedSurveyProject?.id === proj.id;
                  const isSubmitted = proj.stage === 'Survey Submitted';
                  return (
                    <div
                      key={proj.id}
                      onClick={() => handleStartSurvey(proj)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/50 border-[#C66B45] ring-1 ring-[#C66B45] shadow-sm'
                          : 'bg-white border-[#E7E2D9] hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#C66B45]">{proj.id}</span>
                            <span className="text-[11px] text-slate-400">• {proj.capacityKw} kW</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">{proj.customerName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{proj.customerAddress}</span>
                          </p>
                        </div>
                        <StatusBadge status={proj.stage} type="stage" />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{proj.customerPhone || '+91 98230 11982'}</span>
                        </span>

                        <span className="font-semibold text-[#C66B45] hover:underline flex items-center gap-1">
                          {isSubmitted ? 'View Submitted Report' : 'Open Feasibility Form'} &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Technical Feasibility Form / Viewer */}
          <div className="lg:col-span-7">
            {selectedSurveyProject ? (
              <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-6">
                {/* Form Header */}
                <div className="pb-4 border-b border-[#E7E2D9] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#C66B45]" />
                      <h3 className="font-bold text-base text-[#292724]">
                        Technical Feasibility Assessment
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Project: <strong className="text-slate-900">{selectedSurveyProject.id}</strong> — Customer: <strong className="text-slate-900">{selectedSurveyProject.customerName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Site: {selectedSurveyProject.customerAddress}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                    selectedSurveyProject.stage === 'Survey Submitted'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedSurveyProject.stage}
                  </span>
                </div>

                {selectedSurveyProject.stage === 'Survey Submitted' ? (
                  /* Read-Only Submitted Report View */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        This Feasibility Report was submitted on {selectedSurveyProject.feasibilityReport?.surveyDate || 'today'} and is awaiting Director review.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Roof Type:</span>
                        <span className="font-semibold text-slate-900">{selectedSurveyProject.feasibilityReport?.roofType || roofType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Tilt Angle:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedSurveyProject.feasibilityReport?.tiltAngleDeg || tiltAngleDeg}°</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Azimuth:</span>
                        <span className="font-semibold text-slate-900">{selectedSurveyProject.feasibilityReport?.azimuthOrientation || azimuthOrientation}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Earthing:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedSurveyProject.feasibilityReport?.earthingResistanceOhms || earthingResistanceOhms} Ω</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Shading Obstacles:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedSurveyProject.feasibilityReport?.shadingObstacles ? 'Yes (Obstacles Noted)' : 'None (Clear Sky)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Verdict:</span>
                        <span className="font-bold text-emerald-700">{selectedSurveyProject.feasibilityReport?.verdict || surveyVerdict}</span>
                      </div>
                    </div>

                    {selectedSurveyProject.feasibilityReport?.shadingObstacles && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                        <strong className="block text-slate-900 mb-0.5">Shading Notes:</strong>
                        {selectedSurveyProject.feasibilityReport?.shadingNotes}
                      </div>
                    )}

                    {/* Photos Preview */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 block">Uploaded Site Photos:</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(selectedSurveyProject.feasibilityReport?.photos || surveyPhotos).map((photoUrl, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                            <img src={photoUrl} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Editable Feasibility Submission Form */
                  <form onSubmit={handleSubmitFeasibility} className="space-y-5">
                    {/* Roof Type & Tilt Angle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Roof Structure Type:
                        </label>
                        <select
                          value={roofType}
                          onChange={(e) => setRoofType(e.target.value as any)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                        >
                          <option value="Concrete Flat">Concrete Flat RCC Roof</option>
                          <option value="Tin / Metal Sheet">Industrial Tin / Metal Trapezoidal Sheet</option>
                          <option value="Clay Tile">Slanted Clay Tile Roof</option>
                          <option value="Asbestos Sheet">Asbestos / Corrugated Sheet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Measured Roof Tilt Angle (°):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={tiltAngleDeg}
                            onChange={(e) => setTiltAngleDeg(Number(e.target.value))}
                            className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                            required
                          />
                          <span className="text-xs text-slate-500 font-bold shrink-0">deg</span>
                        </div>
                      </div>
                    </div>

                    {/* Roof Orientation / Azimuth & Earthing Resistance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Roof Orientation / Azimuth:
                        </label>
                        <select
                          value={azimuthOrientation}
                          onChange={(e) => setAzimuthOrientation(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                        >
                          <option value="South-Facing (Optimal 180°)">True South (Optimal 180°)</option>
                          <option value="South-East (135°)">South-East (135°)</option>
                          <option value="South-West (225°)">South-West (225°)</option>
                          <option value="East-Facing (90°)">East-Facing (90°)</option>
                          <option value="West-Facing (270°)">West-Facing (270°)</option>
                          <option value="North-Facing (Sub-optimal 0°)">North-Facing (Sub-optimal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Earthing Pit Resistance:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="10"
                            value={earthingResistanceOhms}
                            onChange={(e) => setEarthingResistanceOhms(Number(e.target.value))}
                            className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                            required
                          />
                          <span className="text-xs text-slate-500 font-bold shrink-0">Ohms (Ω)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Standard requirement &lt; 5.0 Ω</span>
                      </div>
                    </div>

                    {/* Shading Obstacles Toggle & Notes */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-bold text-xs text-slate-900 block">
                            Shading Obstacles Present?
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Trees, parapet walls, water overhead tanks, or high-rise chimneys
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shadingObstacles}
                            onChange={(e) => setShadingObstacles(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C66B45]"></div>
                        </label>
                      </div>

                      {shadingObstacles && (
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Describe Shading Obstacles & Mitigation:
                          </label>
                          <textarea
                            value={shadingNotes}
                            onChange={(e) => setShadingNotes(e.target.value)}
                            placeholder="e.g. 1000L Overhead Sintex water tank creates shadow on NW corner after 4:30 PM. Elevate front legs by 300mm."
                            rows={2}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#C66B45]"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Site Photos Upload / Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Rooftop & Electrical DB Panel Photographs:
                        </label>
                        <span className="text-[10px] text-slate-400">Attached: {surveyPhotos.length} Photos</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {surveyPhotos.map((photoUrl, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 group">
                            <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white">
                              {idx === 0 ? 'Roof Surface' : 'DB & Inverter Area'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Feasibility Verdict */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Technician Verdict & Feasibility Status:
                      </label>
                      <select
                        value={surveyVerdict}
                        onChange={(e) => setSurveyVerdict(e.target.value as any)}
                        className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                      >
                        <option value="Feasible / Approved for Solar">Feasible / Recommended for Solar Installation</option>
                        <option value="Adjustments Required">Adjustments Required / Height Elevation Needed</option>
                      </select>
                    </div>

                    {/* Field Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Additional Field Engineering Notes:
                      </label>
                      <textarea
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        placeholder="Note concrete anchor depth, cable conduit routing distance to ground floor meter, etc."
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Submit Feasibility Report (Advance to Director Approval)</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center space-y-3">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-[#292724]">Select an Assigned Survey</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click any project on the left to record roof tilt, orientation, shading clearance, and site photos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: INSTALLATIONS & HANDOVER (HARDWARE DISPATCHED)
          ======================================================================= */}
      {activeTab === 'installations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispatched Orders List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E2D9]">
              <div>
                <h3 className="font-bold text-sm text-[#292724]">Active Field Installations</h3>
                <p className="text-[11px] text-slate-500">Hardware dispatched from warehouse & ready for commissioning</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {installProjects.length} orders
              </span>
            </div>

            {installProjects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#E7E2D9] text-center space-y-2">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-xs text-slate-700">No dispatched orders pending installation</p>
                <p className="text-[11px] text-slate-500">Warehouse has not dispatched hardware for any active project.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {installProjects.map((proj) => {
                  const isSelected = selectedInstallProject?.id === proj.id;
                  const isCompleted = proj.stage === 'Installation & Handover Completed' || proj.stage === 'Commissioned & Closed';

                  return (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectInstallProject(proj)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/50 border-[#C66B45] ring-1 ring-[#C66B45] shadow-sm'
                          : 'bg-white border-[#E7E2D9] hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#C66B45]">{proj.id}</span>
                            <span className="text-[11px] text-slate-400">• {proj.capacityKw} kW {proj.systemType}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">{proj.customerName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{proj.customerAddress}</span>
                          </p>
                        </div>
                        <StatusBadge status={proj.stage} type="stage" />
                      </div>

                      {/* Dispatched Hardware Preview */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-mono text-[10px]">
                          Inv: {proj.hardwareDispatch?.inverterSerial || 'GW-5000-8831'}
                        </span>
                        <span className="font-semibold text-[#C66B45] hover:underline flex items-center gap-1">
                          {isCompleted ? 'View Commissioning Details' : 'Execute Handover'} &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Handover & Commissioning Execution Form */}
          <div className="lg:col-span-7">
            {selectedInstallProject ? (
              <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-[#E7E2D9] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[#C66B45]" />
                      <h3 className="font-bold text-base text-[#292724]">
                        Installation Handover & Digital Commissioning
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Project: <strong className="text-slate-900">{selectedInstallProject.id}</strong> — Customer: <strong className="text-slate-900">{selectedInstallProject.customerName}</strong>
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                    selectedInstallProject.stage === 'Commissioned & Closed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedInstallProject.stage === 'Installation & Handover Completed'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedInstallProject.stage}
                  </span>
                </div>

                {/* Hardware Dispatched Info Box (Read from Warehouse) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Dispatched Hardware (Verified by Warehouse):
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedInstallProject.hardwareDispatch?.dispatchDate || 'Dispatched Today'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-sans text-slate-500 block">PV Modules Batch:</span>
                      <strong className="text-slate-900 text-[11px]">
                        {selectedInstallProject.hardwareDispatch?.moduleSerials || 'PV-WA-540-9901..9920'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-sans text-slate-500 block">Solar Inverter:</span>
                      <strong className="text-slate-900 text-[11px]">
                        {selectedInstallProject.hardwareDispatch?.inverterSerial || 'INV-GW-5000-8831'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-sans text-slate-500 block">Battery Unit:</span>
                      <strong className="text-slate-900 text-[11px]">
                        {selectedInstallProject.hardwareDispatch?.batterySerial || 'BAT-PY-48100-2401'}
                      </strong>
                    </div>
                  </div>
                </div>

                {selectedInstallProject.stage === 'Installation & Handover Completed' || selectedInstallProject.stage === 'Commissioned & Closed' ? (
                  /* Completed Handover Read-Only View */
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Handover completed! Customer acceptance signature collected. Pending Director final sign-off & project closure.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Tested Generation Output:</span>
                        <span className="font-mono font-bold text-base text-slate-900">
                          {selectedInstallProject.commissioningData?.testPowerOutputKw || testPowerOutputKw} kW
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Customer Signatory:</span>
                        <span className="font-bold text-slate-900">
                          {selectedInstallProject.commissioningData?.signatoryName || selectedInstallProject.customerName}
                        </span>
                      </div>
                    </div>

                    {/* Installed Photos Preview */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 block">Post-Installation Verification Photos:</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(selectedInstallProject.commissioningData?.photos || installPhotos).map((photoUrl, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                            <img src={photoUrl} alt={`Install photo ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Execution & Handover Form */
                  <form onSubmit={handleSubmitCommissioning} className="space-y-5">
                    {/* Live Test Power Output (kW) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Live System Test Power Output (kW):
                      </label>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#C66B45]" />
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={testPowerOutputKw}
                          onChange={(e) => setTestPowerOutputKw(Number(e.target.value))}
                          className="w-full p-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                          required
                        />
                        <span className="text-xs font-bold text-slate-600 shrink-0">kW Measured</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Verify instantaneous AC generation with solar irradiation meter before handover.
                      </p>
                    </div>

                    {/* Commissioning Checklist */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <label className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Commissioning Safety Checklist:
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={gridSyncChecked}
                          onChange={(e) => setGridSyncChecked(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#C66B45] focus:ring-[#C66B45]"
                        />
                        <span>Inverter phase synchronized with DISCOM grid & anti-islanding tested</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={earthingCheckPassed}
                          onChange={(e) => setEarthingCheckPassed(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#C66B45] focus:ring-[#C66B45]"
                        />
                        <span>Lightning arrestor and DC/AC earthing electrode continuity verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={customerBriefingDone}
                          onChange={(e) => setCustomerBriefingDone(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#C66B45] focus:ring-[#C66B45]"
                        />
                        <span>Customer briefed on emergency DC isolator switch and mobile app telemetry</span>
                      </label>
                    </div>

                    {/* 2 Post-Installation Photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Post-Installation Verification Photos (2 Required):
                        </label>
                        <span className="text-[10px] text-slate-400">Mounted Array & Inverter Panel</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {installPhotos.map((photoUrl, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                            <img src={photoUrl} alt={`Installation photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white">
                              {idx === 0 ? '1. Rooftop Array' : '2. Inverter & DB Panel'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Digital Customer Acceptance Screen with Signature Pad */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-bold text-xs text-slate-900 block">
                            Customer Digital Acceptance Signature
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Customer sign-off on turnkey commissioning and handover.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear Pad</span>
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Customer / Authorized Representative Name:
                        </label>
                        <input
                          type="text"
                          value={signatoryName}
                          onChange={(e) => setSignatoryName(e.target.value)}
                          placeholder="e.g. Aarav Mehta"
                          className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#C66B45]"
                          required
                        />
                      </div>

                      {/* Interactive Touch/Mouse Canvas Pad */}
                      <div className="border border-slate-200 rounded-xl bg-white p-2">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full bg-slate-50 rounded-lg border border-dashed border-slate-300 cursor-crosshair touch-none"
                        />
                        <p className="text-[10px] text-slate-400 text-center mt-1">
                          {hasSignature ? '✓ Signature recorded on touch pad' : 'Sign above using touch, stylus, or mouse'}
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit for Commissioning (Advance to Final Director Closure)</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-[#E7E2D9] text-center space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-[#292724]">Select an Installation Project</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click any dispatched order on the left to verify equipment serials, enter tested kW output, and capture customer acceptance signature.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};