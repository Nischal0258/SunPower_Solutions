import React, { useState, useRef } from 'react';
import {
  Sun,
  Search,
  Plus,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  Camera,
  FileCheck,
  Upload,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  PenTool,
  RotateCcw
} from 'lucide-react';
import { DataService, TECHNICIANS } from '../services/dataService';
import { InstallationProject, InstallationStage, InstalledProductItem, InstallationPhoto } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';

interface InstallationsPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialProjectId?: string;
}

export const InstallationsPage: React.FC<InstallationsPageProps> = ({
  onNavigateTab,
  initialProjectId
}) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<InstallationProject[]>(DataService.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');

  // Selected project for detailed workflow
  const [activeProject, setActiveProject] = useState<InstallationProject | null>(() => {
    if (initialProjectId) {
      return DataService.getProjects().find(p => p.id === initialProjectId || p.projectId === initialProjectId) || null;
    }
    return null;
  });

  // Photo upload simulator state
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoPhase, setNewPhotoPhase] = useState<'Survey' | 'Mounting' | 'Wiring' | 'Completion'>('Mounting');

  // Serial recording state
  const [newSerialCategory, setNewSerialCategory] = useState<'Solar Panels' | 'Inverters' | 'Batteries'>('Solar Panels');
  const [newSerialProductName, setNewSerialProductName] = useState('Waaree 545W Mono PERC Panel');
  const [newSerialValue, setNewSerialValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatoryName, setSignatoryName] = useState('');

  const refreshList = () => {
    const list = DataService.getProjects();
    setProjects(list);
    if (activeProject) {
      const refreshed = list.find(p => p.id === activeProject.id) || null;
      setActiveProject(refreshed);
    }
  };

  const stages: ('All' | InstallationStage)[] = [
    'All',
    'Survey Pending',
    'Survey Completed',
    'Material Ready',
    'Installation Scheduled',
    'Installation In Progress',
    'Completed'
  ];

  const handleStageAdvance = (targetStage: InstallationStage) => {
    if (!activeProject) return;
    const updated = DataService.updateProjectStage(activeProject.id, targetStage);
    if (updated) {
      showToast(`Project stage updated to "${targetStage}".`, 'success');
      refreshList();
    }
  };

  const handleAssignTechnician = (techId: string) => {
    if (!activeProject) return;
    const tech = TECHNICIANS.find(t => t.id === techId);
    if (!tech) return;

    const updated = DataService.saveProject({
      id: activeProject.id,
      technicianId: tech.id,
      technicianName: tech.name
    });
    if (updated) {
      showToast(`Technician ${tech.name} assigned to project.`, 'success');
      refreshList();
    }
  };

  const handleUpdateSchedule = (surveyDate: string, installDate: string) => {
    if (!activeProject) return;
    const updated = DataService.saveProject({
      id: activeProject.id,
      surveyDate,
      installationDate: installDate
    });
    if (updated) {
      showToast('Project survey & installation dates saved.', 'success');
      refreshList();
    }
  };

  // Add serial number to project & auto-register to warranty system
  const handleAddSerialNumber = () => {
    if (!activeProject) return;
    if (!newSerialValue.trim()) {
      showToast('Please enter a product serial number.', 'error');
      return;
    }

    const serial = newSerialValue.trim().toUpperCase();

    // Determine warranty years (strict rule: 20 yrs panels, 2 yrs inverter/battery)
    let warrantyYears = 1;
    if (newSerialCategory === 'Solar Panels') warrantyYears = 20;
    else if (newSerialCategory === 'Inverters' || newSerialCategory === 'Batteries') warrantyYears = 2;

    // Check if category already has an entry in installedProducts
    const existing = [...activeProject.installedProducts];
    const catIndex = existing.findIndex(e => e.productCategory === newSerialCategory);

    if (catIndex >= 0) {
      if (!existing[catIndex].serialNumbers.includes(serial)) {
        existing[catIndex].serialNumbers.push(serial);
      }
    } else {
      existing.push({
        id: `IP-${Date.now()}`,
        productCategory: newSerialCategory,
        productName: newSerialProductName,
        model: 'Standard Tier',
        serialNumbers: [serial],
        deliveryDate: deliveryDate,
        warrantyYears
      });
    }

    // Register into Warranty service automatically
    DataService.registerWarranty({
      serialNumber: serial,
      productCategory: newSerialCategory,
      productName: newSerialProductName,
      model: 'Certified OEM Unit',
      customerId: activeProject.customerId,
      customerName: activeProject.customerName,
      customerPhone: activeProject.customerPhone,
      customerAddress: activeProject.customerAddress,
      projectId: activeProject.projectId,
      deliveryDate: deliveryDate,
      warrantyYears
    });

    const updated = DataService.saveProject({
      id: activeProject.id,
      installedProducts: existing
    });

    if (updated) {
      showToast(`Serial ${serial} recorded & ${warrantyYears}-year warranty certificate registered!`, 'success');
      setNewSerialValue('');
      refreshList();
    }
  };

  // Add installation photo
  const handleAddPhoto = () => {
    if (!activeProject) return;

    // Use our high-fidelity generated images
    const sampleUrls = [
      '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
      '/src/assets/images/solar_inverter_battery_setup_1793436858572.jpg',
      '/src/assets/images/solar_technician_survey_1793436857911.jpg'
    ];
    const chosenUrl = sampleUrls[activeProject.photos.length % sampleUrls.length];

    const newPhoto: InstallationPhoto = {
      id: `PH-${Date.now()}`,
      url: chosenUrl,
      caption: newPhotoCaption.trim() || `${newPhotoPhase} photo logged by technician`,
      uploadedAt: new Date().toISOString(),
      phase: newPhotoPhase
    };

    const updated = DataService.saveProject({
      id: activeProject.id,
      photos: [...activeProject.photos, newPhoto]
    });

    if (updated) {
      showToast('Installation photograph verified & added to site file.', 'success');
      setNewPhotoCaption('');
      refreshList();
    }
  };

  // Signature canvas handlers
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveApproval = () => {
    if (!activeProject) return;
    if (!hasSignature && !signatoryName.trim()) {
      showToast('Please sign or enter customer signatory name.', 'error');
      return;
    }

    const updated = DataService.saveProject({
      id: activeProject.id,
      customerApproved: true,
      approvalSignature: signatoryName.trim() || `${activeProject.customerName} (Digital Signature Captured)`,
      approvalDate: new Date().toISOString().split('T')[0],
      stage: 'Completed',
      progressPercent: 100
    });

    if (updated) {
      showToast(`Customer handover approved & project marked Completed!`, 'success');
      refreshList();
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technicianName && p.technicianName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = selectedStage === 'All' || p.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#292724]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project ID (PRJ-2026-...), customer or technician..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[#F5F3EF] border border-[#E7E2D9] text-[#292724] placeholder-[#292724]/50 focus:outline-none focus:border-[#DBBA95]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {stages.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                  selectedStage === st
                    ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                    : 'bg-[#FFFFFF] text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            onNavigateTab('quotations');
            showToast('Select any approved quotation to initiate a new installation project.', 'info');
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create from Quotation</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E7E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F3EF] border-b border-[#E7E2D9] text-[#292724]/70 font-semibold">
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 w-36">Progress</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#292724]/60">
                    No installation projects match this filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className="hover:bg-[#F5F3EF]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#292724] group-hover:text-[#C66B45]">
                      {proj.projectId}
                      {proj.quotationNumber && (
                        <div className="text-[10px] text-[#292724]/50 font-normal">from {proj.quotationNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#292724]">{proj.customerName}</div>
                      <div className="text-[11px] text-[#292724]/60">{proj.customerAddress.split(',')[1] || proj.customerAddress}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#292724]">
                      <strong>{proj.capacityKw} kW</strong>
                      <span className="text-[11px] text-[#292724]/60 ml-1">({proj.systemType})</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#292724]">
                      {proj.technicianName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#D9A441]" />
                          <span>{proj.technicianName}</span>
                        </div>
                      ) : (
                        <span className="text-[#C66B45] italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={proj.stage} type="stage" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#E7E2D9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C66B45] rounded-full transition-all"
                            style={{ width: `${proj.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#292724]">
                          {proj.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#292724]/70">
                      <div>Survey: {proj.surveyDate || 'TBD'}</div>
                      <div>Install: {proj.installationDate || 'TBD'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(proj);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F3EF] hover:bg-[#E7E2D9] text-[#292724] rounded border border-[#E7E2D9] transition-colors"
                      >
                        Manage Project
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Execution & Management Modal */}
      {activeProject && (
        <Modal
          isOpen={!!activeProject}
          onClose={() => setActiveProject(null)}
          title={`Project Management: ${activeProject.projectId} – ${activeProject.customerName}`}
          subtitle={`${activeProject.capacityKw} kW ${activeProject.systemType} · Stage: ${activeProject.stage}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Stage Progression Bar */}
            <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#292724] text-xs">Workflow Milestones</span>
                <span className="font-mono font-bold text-xs text-[#C66B45]">{activeProject.progressPercent}% Complete</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px]">
                {[
                  'Survey Pending',
                  'Survey Completed',
                  'Material Ready',
                  'Installation Scheduled',
                  'Installation In Progress',
                  'Completed'
                ].map((st, idx) => {
                  const isCurrent = activeProject.stage === st;
                  const isPast = activeProject.progressPercent >= (idx + 1) * 16.6;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStageAdvance(st as InstallationStage)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isCurrent
                          ? 'bg-[#C66B45] text-[#FFFFFF] border-[#C66B45] font-bold shadow-xs'
                          : isPast
                          ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                          : 'bg-[#FFFFFF] text-[#292724]/60 border-[#E7E2D9] hover:border-[#DBBA95]'
                      }`}
                    >
                      <div className="font-mono text-[9px] opacity-80">Stage 0{idx + 1}</div>
                      <div className="leading-tight mt-0.5 truncate">{st}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crew & Schedule Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FFFFFF] border border-[#E7E2D9]">
              <div>
                <label className="block font-semibold text-[#292724] mb-1">
                  Assigned Lead Technician
                </label>
                <select
                  value={activeProject.technicianId || ''}
                  onChange={(e) => handleAssignTechnician(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
                >
                  <option value="">Select Technician...</option>
                  {TECHNICIANS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.activeProjects} Active Projects)
                    </option>
                  ))}
                </select>
                {activeProject.technicianName && (
                  <p className="text-[11px] text-[#292724]/60 mt-1">
                    Phone: {TECHNICIANS.find(t => t.id === activeProject.technicianId)?.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#292724] mb-1">
                  Site Feasibility Survey Date
                </label>
                <input
                  type="date"
                  value={activeProject.surveyDate || ''}
                  onChange={(e) => handleUpdateSchedule(e.target.value, activeProject.installationDate || '')}
                  className="w-full p-2 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[#292724] focus:outline-none focus:border-[#DBBA95]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#292724] mb-1">
                  Execution & Commissioning Date
                </label>
                <input
                  type="date"
                  value={activeProject.installationDate || ''}
                  onChange={(e) => handleUpdateSchedule(activeProject.surveyDate || '', e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[#292724] focus:outline-none focus:border-[#DBBA95]"
                />
              </div>
            </div>

            {/* Equipment Serials Recorder & Installed Hardware */}
            <div className="border border-[#E7E2D9] rounded-xl p-4 bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#292724] text-xs">Installed Equipment & Serial Tracking</span>
                  <p className="text-[11px] text-[#292724]/70">
                    Serial numbers registered here automatically sync with the 20-Year (Panels) and 2-Year (Inverter/Battery) Warranty Registry.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#DBBA95]/20 text-[#292724] font-semibold text-[10px]">
                  Automatic Warranty Sync
                </span>
              </div>

              {/* Serial Entry Form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-[#F5F3EF] border border-[#E7E2D9]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#292724] mb-1">Equipment Category</label>
                  <select
                    value={newSerialCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setNewSerialCategory(cat);
                      if (cat === 'Solar Panels') setNewSerialProductName('Waaree 545W Mono PERC Panel');
                      else if (cat === 'Inverters') setNewSerialProductName('Growatt / Deye Solar Inverter');
                      else setNewSerialProductName('Exide LiFePO4 Battery Bank');
                    }}
                    className="w-full p-1.5 rounded border border-[#E7E2D9] bg-[#FFFFFF] text-[11px]"
                  >
                    <option value="Solar Panels">Solar Panels (20 Yrs)</option>
                    <option value="Inverters">Inverters (2 Yrs)</option>
                    <option value="Batteries">Batteries (2 Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#292724] mb-1">Product Model / Label</label>
                  <input
                    type="text"
                    value={newSerialProductName}
                    onChange={(e) => setNewSerialProductName(e.target.value)}
                    className="w-full p-1.5 rounded border border-[#E7E2D9] bg-[#FFFFFF] text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#292724] mb-1">Serial Number Code</label>
                  <input
                    type="text"
                    value={newSerialValue}
                    onChange={(e) => setNewSerialValue(e.target.value)}
                    placeholder="e.g. SP-WAR-8841-2026"
                    className="w-full p-1.5 rounded border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddSerialNumber}
                    className="w-full py-1.5 px-3 rounded bg-[#C66B45] text-[#FFFFFF] font-semibold hover:bg-[#C66B45]/90 text-[11px]"
                  >
                    + Register Serial
                  </button>
                </div>
              </div>

              {/* Display Installed equipment */}
              <div className="space-y-2">
                {activeProject.installedProducts.length === 0 ? (
                  <p className="text-xs text-[#292724]/60 italic p-3 bg-[#F5F3EF] rounded-lg">
                    No hardware serial numbers attached yet. Record serials during material dispatch or site mounting.
                  </p>
                ) : (
                  activeProject.installedProducts.map(p => (
                    <div key={p.id} className="p-3 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#292724]">{p.productCategory}:</span>
                          <span>{p.productName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#DBBA95]/30 font-semibold">
                            {p.warrantyYears} Years Warranty
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {p.serialNumbers.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-[#F5F3EF] border border-[#E7E2D9] font-mono text-[11px] font-bold text-[#292724]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#292724]/60">
                        Delivered: {p.deliveryDate}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Site Photographs & Gallery */}
            <div className="border border-[#E7E2D9] rounded-xl p-4 bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#292724] text-xs">Site Installation Photographs ({activeProject.photos.length})</span>
                  <p className="text-[11px] text-[#292724]/70">Visual evidence of mounting structures, DC cable dressing, inverter commissioning & net meter.</p>
                </div>
              </div>

              {/* Add Photo Form */}
              <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-[#F5F3EF] border border-[#E7E2D9]">
                <select
                  value={newPhotoPhase}
                  onChange={(e) => setNewPhotoPhase(e.target.value as any)}
                  className="p-1.5 rounded border border-[#E7E2D9] bg-[#FFFFFF] text-[11px]"
                >
                  <option value="Survey">Site Survey Phase</option>
                  <option value="Mounting">Rooftop Mounting Phase</option>
                  <option value="Wiring">DC Conduit & Inverter Wiring</option>
                  <option value="Completion">Final Commissioning</option>
                </select>

                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="Enter photo description (e.g. 18x Monocrystalline Array with Lightning Arrestor)"
                  className="flex-1 p-1.5 rounded border border-[#E7E2D9] bg-[#FFFFFF] text-[11px]"
                />

                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-1.5 rounded bg-[#292724] text-[#FFFFFF] font-semibold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach Site Photo</span>
                </button>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProject.photos.map(photo => (
                  <div key={photo.id} className="rounded-xl border border-[#E7E2D9] overflow-hidden bg-[#F5F3EF]">
                    <div className="relative aspect-video bg-[#292724] overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#292724]/80 text-[#FFFFFF] backdrop-blur-xs">
                        {photo.phase} Phase
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[#292724] text-xs">{photo.caption}</p>
                      <p className="text-[10px] text-[#292724]/50 font-mono mt-0.5">
                        Logged on {new Date(photo.uploadedAt).toLocaleDateString()} by Field Crew
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Handover Approval & Signature Capture */}
            <div className="border border-[#E7E2D9] rounded-xl p-4 bg-[#FFFFFF] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#292724] text-xs">Customer Handover & Digital Acceptance</span>
                  <p className="text-[11px] text-[#292724]/70">Capture customer physical touch signature upon system live testing and generation verification.</p>
                </div>
                {activeProject.customerApproved && (
                  <span className="px-2.5 py-1 rounded-md bg-[#292724] text-[#FFFFFF] font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DBBA95]" />
                    <span>Customer Approved & Signed</span>
                  </span>
                )}
              </div>

              {activeProject.customerApproved ? (
                <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9] space-y-2">
                  <p className="font-bold text-sm text-[#292724]">
                    Handover Approved by: {activeProject.approvalSignature}
                  </p>
                  <p className="text-xs text-[#292724]/70">
                    Handover Date: {activeProject.approvalDate} · Generation tested and verified.
                  </p>
                  {activeProject.approvalNotes && (
                    <p className="text-xs text-[#292724]/80 italic">
                      Remarks: "{activeProject.approvalNotes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#292724] mb-1">
                        Signatory Name / Representative
                      </label>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        placeholder={`e.g. ${activeProject.customerName}`}
                        className="w-full p-2 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs"
                      />
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-[#292724]/60 hover:text-[#292724] flex items-center gap-1 p-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear Pad</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Signature Canvas Pad */}
                  <div className="border border-[#E7E2D9] rounded-xl bg-[#F5F3EF] p-2">
                    <canvas
                      ref={canvasRef}
                      width={650}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full bg-[#FFFFFF] rounded-lg border border-[#E7E2D9] cursor-crosshair touch-none"
                    />
                    <p className="text-[10px] text-[#292724]/50 text-center mt-1">
                      Sign above using your finger, stylus or mouse
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveApproval}
                      className="px-5 py-2.5 rounded-lg bg-[#C66B45] text-[#FFFFFF] font-bold text-xs hover:bg-[#C66B45]/90 shadow-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Handover & Mark Project Completed</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
