import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sun,
  Search,
  Plus,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  Camera,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  RotateCcw,
  Zap,
  Truck,
  Layers,
  FileText,
  AlertTriangle,
  User,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { DataService, TECHNICIANS } from '../services/dataService';
import { InstallationProject, ProjectLifecycleStage, InstallationPhoto } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';
import { UserRole } from '../types/roles';
import { TechnicianPortalView } from '../components/technician/TechnicianPortalView';

interface InstallationsPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialProjectId?: string;
  onOpenSiteSurvey?: () => void;
  currentRole?: UserRole;
}

export const InstallationsPage: React.FC<InstallationsPageProps> = ({
  onNavigateTab,
  initialProjectId,
  onOpenSiteSurvey,
  currentRole = "manager"
}) => {
  // If user role is technician, render the dedicated Field Technician Execution Workspace
  if (currentRole === 'technician') {
    return <TechnicianPortalView onNavigateTab={onNavigateTab} />;
  }

  const { showToast } = useToast();
  const [projects, setProjects] = useState<InstallationProject[]>(() => DataService.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');

  // Selected project for detailed workflow
  const [activeProject, setActiveProject] = useState<InstallationProject | null>(() => {
    if (initialProjectId) {
      return DataService.getProjects().find(p => p.id === initialProjectId || p.projectId === initialProjectId) || null;
    }
    return null;
  });

  // Manager Actions State: Assign Technician
  const [assignTechId, setAssignTechId] = useState<string>(TECHNICIANS[0]?.id || '');
  const [assignSurveyDate, setAssignSurveyDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [assignNotes, setAssignNotes] = useState<string>('Verify RCC roof anchor depth and conduit path to ground floor meter.');

  // Manager Actions State: Feasibility Approval / Re-survey
  const [directorApprovalNotes, setDirectorApprovalNotes] = useState<string>('Feasibility parameters verified. Rooftop tilt and orientation approved for installation.');
  const [resurveyReason, setResurveyReason] = useState<string>('');
  const [showResurveyInput, setShowResurveyInput] = useState<boolean>(false);
  const [showReassign, setShowReassign] = useState<boolean>(false);

  // Sync active project whenever initialProjectId prop changes (e.g., navigating from Dashboard)
  useEffect(() => {
    if (initialProjectId) {
      const match = DataService.getProjects().find(p => p.id === initialProjectId || p.projectId === initialProjectId);
      if (match) setActiveProject(match);
    }
  }, [initialProjectId]);

  const refreshList = () => {
    const list = DataService.getProjects();
    setProjects(list);
    if (activeProject) {
      const refreshed = list.find(p => p.id === activeProject.id) || null;
      setActiveProject(refreshed);
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshList();
    window.addEventListener('sunpower_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeProject?.id]);

  const stages: ('All' | ProjectLifecycleStage)[] = [
    'All',
    'Order Placed',
    'Survey Assigned',
    'Survey In Progress',
    'Survey Submitted',
    'Feasibility Approved',
    'Hardware Dispatched',
    'Installation & Handover Completed',
    'Commissioned & Closed'
  ];

  // 1. Manager Action: Assign Technician
  const handleAssignTechnicianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    if (!assignTechId) {
      showToast('Please select a field technician.', 'warning');
      return;
    }

    const success = DataService.assignTechnicianToSurvey(
      activeProject.id,
      assignTechId,
      assignSurveyDate,
      assignNotes
    );

    if (success) {
      showToast('Technician assigned! Project stage updated to "Survey Assigned" and task dispatched.', 'success');
      refreshList();
    } else {
      showToast('Failed to assign technician.', 'error');
    }
  };

  // 2. Manager Action: Approve Feasibility
  const handleApproveFeasibility = () => {
    if (!activeProject) return;

    const success = DataService.approveFeasibilityReport(
      activeProject.id,
      directorApprovalNotes
    );

    if (success) {
      showToast('Feasibility Approved! Order unlocked in Warehouse for material dispatch.', 'success');
      refreshList();
    } else {
      showToast('Failed to approve feasibility report.', 'error');
    }
  };

  // 3. Manager Action: Request Re-survey
  const handleRequestResurvey = () => {
    if (!activeProject) return;

    if (!resurveyReason.trim()) {
      showToast('Please enter the reason for requesting a re-survey.', 'warning');
      return;
    }

    const success = DataService.requestResurvey(activeProject.id, resurveyReason);
    if (success) {
      showToast('Re-survey requested! Project stage returned to "Survey Assigned" for technician review.', 'info');
      setShowResurveyInput(false);
      setResurveyReason('');
      refreshList();
    } else {
      showToast('Failed to request re-survey.', 'error');
    }
  };

  // 4. Manager Action: Approve Commissioning & Close Project
  const handleApproveCommissioning = () => {
    if (!activeProject) return;

    const success = DataService.approveCommissioningAndClose(activeProject.id);
    if (success) {
      showToast('Project commissioned and closed! 20-Year warranty certificate active and customer dashboard energized.', 'success');
      refreshList();
    } else {
      showToast('Failed to close project.', 'error');
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
    <div className="space-y-5 font-sans">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project ID (PRJ-2026-...), customer or technician..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-[#292724]/50 focus:outline-none focus:border-slate-300"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {stages.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-all whitespace-nowrap ${
                  selectedStage === st
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onNavigateTab('warehouse');
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-all shadow-xs shrink-0"
          >
            <Truck className="w-4 h-4 text-[#C66B45]" />
            <span>Warehouse Staging</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('quotations');
              showToast('Select any approved quotation to initiate a new installation project.', 'info');
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create from Quotation</span>
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 w-36">Progress</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    No installation projects match this filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#C66B45]">
                      {proj.projectId}
                      {proj.quotationNumber && (
                        <div className="text-[10px] text-slate-400 font-normal">from {proj.quotationNumber}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{proj.customerName}</div>
                      <div className="text-[11px] text-slate-500">{proj.customerAddress.split(',')[1] || proj.customerAddress}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900">
                      <strong>{proj.capacityKw} kW</strong>
                      <span className="text-[11px] text-slate-500 ml-1">({proj.systemType})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">
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
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#C66B45] h-full rounded-full transition-all"
                            style={{ width: `${proj.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 w-8 text-right">
                          {proj.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {proj.surveyDate || proj.installationDate || 'Pending Schedule'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(proj);
                        }}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-[#C66B45] hover:bg-amber-50 transition-colors"
                      >
                        Manage &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =======================================================================
          MANAGER PROJECT ORCHESTRATION & APPROVAL MODAL
          ======================================================================= */}
      {activeProject && (
        <Modal
          isOpen={!!activeProject}
          onClose={() => setActiveProject(null)}
          title={`Project Management: ${activeProject.projectId} — ${activeProject.customerName}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">System Capacity</span>
                <p className="font-mono font-bold text-sm text-slate-900 mt-0.5">
                  {activeProject.capacityKw} kW
                </p>
                <span className="text-[10px] text-slate-500">{activeProject.systemType} Tier</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Lead Crew</span>
                <p className="font-semibold text-sm text-slate-900 mt-0.5 truncate">
                  {activeProject.technicianName || 'Unassigned'}
                </p>
                <span className="text-[10px] text-slate-500">
                  {activeProject.technicianId ? 'Field Crew Dispatched' : 'Requires Assignment'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Lifecycle Stage</span>
                <div className="mt-1">
                  <StatusBadge status={activeProject.stage} type="stage" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Execution Progress</span>
                <p className="font-mono font-bold text-sm text-[#C66B45] mt-0.5">
                  {activeProject.progressPercent}% Complete
                </p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                  <div className="bg-[#C66B45] h-full" style={{ width: `${activeProject.progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Lifecycle Stages Flow Indicator */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Unified 8-Stage Lifecycle Progress:</span>
                <span className="text-[#C66B45] font-mono">{activeProject.stage}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                {[
                  { s: 'Order Placed', num: 1 },
                  { s: 'Survey Assigned', num: 2 },
                  { s: 'Survey Submitted', num: 3 },
                  { s: 'Feasibility Approved', num: 4 },
                  { s: 'Hardware Dispatched', num: 5 },
                  { s: 'Installation & Handover Completed', num: 6 },
                  { s: 'Commissioned & Closed', num: 7 }
                ].map((step) => {
                  const isCurrent = activeProject.stage === step.s;
                  return (
                    <div
                      key={step.s}
                      className={`p-2 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-[#C66B45] text-white font-bold border-[#C66B45] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className="opacity-70 text-[9px] block">Stage {step.num}</span>
                      <span className="truncate block font-semibold">{step.s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ===================================================================
                STAGE SPECIFIC WORKFLOW CONTROLS (MANAGER OVERSIGHT ONLY)
                =================================================================== */}

            {/* 1. STAGE: Order Placed -> Manager Assigns Technician with explicit Button */}
            {(activeProject.stage === 'Order Placed' || activeProject.stage === 'Survey Pending' || !activeProject.technicianId) && (
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#C66B45]" />
                  <div>
                    <h4 className="font-bold text-sm text-[#292724]">
                      Dispatch Field Feasibility Survey
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Select an available field technician to conduct on-site rooftop measurement, azimuth test, and structural inspection.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAssignTechnicianSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-900 mb-1">
                        Select Lead Field Technician:
                      </label>
                      <select
                        value={assignTechId}
                        onChange={(e) => setAssignTechId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#C66B45]"
                        required
                      >
                        {TECHNICIANS.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.activeProjects} active projects) — {t.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-900 mb-1">
                        Scheduled Survey Date:
                      </label>
                      <input
                        type="date"
                        value={assignSurveyDate}
                        onChange={(e) => setAssignSurveyDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 text-xs focus:outline-none focus:border-[#C66B45]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Manager Survey Instructions / Special Notes:
                    </label>
                    <textarea
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-[#C66B45]"
                      placeholder="Special instructions for field crew (e.g. Roof access via side staircase, check water tank shadow)..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assign Technician & Dispatch Survey</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. STAGE: Survey Assigned or Survey In Progress */}
            {(activeProject.stage === 'Survey Assigned' || activeProject.stage === 'Survey In Progress') && (
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-sky-900">
                        Survey Dispatched to {activeProject.technicianName}
                      </h4>
                      <p className="text-xs text-sky-800">
                        Scheduled Visit Date: <strong className="font-mono">{activeProject.surveyDate || 'Pending visit'}</strong>
                      </p>
                      <p className="text-[11px] text-sky-700">
                        The lead field technician is conducting on-site tilt angle, azimuth orientation, and shading obstacle analysis. Awaiting Feasibility Report submission.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReassign(!showReassign)}
                    className="px-3 py-1.5 rounded-lg border border-sky-300 bg-white hover:bg-sky-50 text-sky-900 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    {showReassign ? 'Hide Reassignment' : 'Reassign / Change Date'}
                  </button>
                </div>

                {showReassign && (
                  <form onSubmit={handleAssignTechnicianSubmit} className="pt-3 border-t border-sky-200 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-900 mb-1">
                          Select Alternate Technician:
                        </label>
                        <select
                          value={assignTechId}
                          onChange={(e) => setAssignTechId(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-[#C66B45]"
                          required
                        >
                          {TECHNICIANS.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.activeProjects} active projects) • {t.phone}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-900 mb-1">
                          Update Scheduled Date:
                        </label>
                        <input
                          type="date"
                          value={assignSurveyDate}
                          onChange={(e) => setAssignSurveyDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-900 text-xs focus:outline-none focus:border-[#C66B45]"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReassign(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Confirm Reassignment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 3. STAGE: Survey Submitted -> Manager Reviews Read-Only Report & Approves or Requests Re-survey */}
            {(activeProject.stage === 'Survey Submitted' || activeProject.stage === 'Survey Completed') && (
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#292724] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#C66B45]" />
                      <span>Technical Feasibility Report for Verification</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Submitted by: <strong className="text-slate-900">{activeProject.feasibilityReport?.surveyorName || activeProject.technicianName}</strong> on {activeProject.feasibilityReport?.surveyDate || 'Today'}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Pending Manager Approval
                  </span>
                </div>

                {/* Read-Only Technical Feasibility Measurements */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Roof Type</span>
                    <span className="font-semibold text-slate-900">{activeProject.feasibilityReport?.roofType || 'Concrete Flat'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Tilt Angle</span>
                    <span className="font-mono font-bold text-slate-900">{activeProject.feasibilityReport?.tiltAngleDeg || 22}°</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Azimuth</span>
                    <span className="font-semibold text-slate-900">{activeProject.feasibilityReport?.azimuthOrientation || 'South-Facing (Optimal)'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Earthing Pit</span>
                    <span className="font-mono font-bold text-slate-900">{activeProject.feasibilityReport?.earthingResistanceOhms || 2.4} Ω</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Shading Analysis</span>
                    <span className="font-semibold text-slate-900">
                      {activeProject.feasibilityReport?.shadingObstacles ? 'Obstacles Identified' : 'Clean Horizon (No Obstacles)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Technician Verdict</span>
                    <span className="font-bold text-emerald-700">{activeProject.feasibilityReport?.verdict || 'Feasible'}</span>
                  </div>
                </div>

                {/* Shading Notes */}
                {activeProject.feasibilityReport?.shadingNotes && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <strong className="block text-slate-900 mb-0.5">Technician Shading & Site Remarks:</strong>
                    {activeProject.feasibilityReport.shadingNotes}
                  </div>
                )}

                {/* Site Photos Submitted by Technician */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Attached Site Feasibility Photographs:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {(activeProject.feasibilityReport?.photos || [
                      '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
                      '/src/assets/images/solar_technician_survey_1793436857911.jpg'
                    ]).map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                        <img src={url} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manager Verification Controls */}
                <div className="space-y-3 pt-2 border-t border-blue-200/60">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Manager Approval Remarks:
                    </label>
                    <input
                      type="text"
                      value={directorApprovalNotes}
                      onChange={(e) => setDirectorApprovalNotes(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
                      placeholder="e.g. Feasibility parameters verified. Rooftop tilt and orientation approved for installation."
                    />
                  </div>

                  {showResurveyInput && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                      <label className="block font-bold text-xs text-amber-900">
                        Reason for Requesting Re-survey:
                      </label>
                      <textarea
                        value={resurveyReason}
                        onChange={(e) => setResurveyReason(e.target.value)}
                        rows={2}
                        placeholder="Specify what needs re-measuring (e.g. Earthing resistance too high, need alternate azimuth)..."
                        className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white text-slate-900"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowResurveyInput(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestResurvey}
                          className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                        >
                          Confirm Re-survey Request
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-1">
                    {!showResurveyInput && (
                      <button
                        type="button"
                        onClick={() => setShowResurveyInput(true)}
                        className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Request Re-survey
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleApproveFeasibility}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Feasibility & Unlock Warehouse Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. STAGE: Feasibility Approved -> Warehouse Unlocked */}
            {activeProject.stage === 'Feasibility Approved' && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">
                      Feasibility Approved - Unlocked for Warehouse Hardware Dispatch
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      The Bill of Materials (BOM) has been released to the warehouse. Warehouse personnel will assign equipment serial numbers and dispatch hardware.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveProject(null);
                    onNavigateTab('warehouse');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Go to Warehouse Queue</span>
                </button>
              </div>
            )}

            {/* Persistent Read-Only Feasibility Report Record (Visible for Approved and Subsequent Stages) */}
            {activeProject.feasibilityReport && activeProject.stage !== 'Survey Submitted' && activeProject.stage !== 'Survey Completed' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Technical Feasibility Record (Approved)</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Approved by Operations Manager
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Roof Type</span>
                    <span className="font-semibold text-slate-900">{activeProject.feasibilityReport.roofType || 'Concrete Flat'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Tilt Angle</span>
                    <span className="font-mono font-bold text-slate-900">{activeProject.feasibilityReport.tiltAngleDeg || 22}°</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Azimuth</span>
                    <span className="font-semibold text-slate-900">{activeProject.feasibilityReport.azimuthOrientation || 'South-Facing'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Earthing Pit</span>
                    <span className="font-mono font-bold text-slate-900">{activeProject.feasibilityReport.earthingResistanceOhms || 2.1} Ω</span>
                  </div>
                </div>

                {activeProject.feasibilityReport.directorReviewNotes && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <strong>Manager Sign-off Notes:</strong> {activeProject.feasibilityReport.directorReviewNotes}
                  </div>
                )}
              </div>
            )}
            {/* 5. STAGE: Hardware Dispatched */}
            {activeProject.stage === 'Hardware Dispatched' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#C66B45]" />
                    <h4 className="font-bold text-sm text-slate-900">Hardware Dispatched by Warehouse</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Field Mounting In Progress
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-sans text-slate-500 block">PV Batch:</span>
                    <strong className="text-slate-900 text-[11px]">{activeProject.hardwareDispatch?.moduleSerials || 'PV-WA-540-9901..9920'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-sans text-slate-500 block">Inverter Serial:</span>
                    <strong className="text-slate-900 text-[11px]">{activeProject.hardwareDispatch?.inverterSerial || 'INV-GW-5000-8831'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] font-sans text-slate-500 block">Battery Unit:</span>
                    <strong className="text-slate-900 text-[11px]">{activeProject.hardwareDispatch?.batterySerial || 'BAT-PY-48100-2401'}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Technician is executing on-site installation, testing output kW, and collecting customer digital acceptance signature.
                </p>
              </div>
            )}

            {/* 6. STAGE: Installation & Handover Completed -> Manager Final Commissioning Sign-off */}
            {activeProject.stage === 'Installation & Handover Completed' && (
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#292724] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#C66B45]" />
                      <span>Installation Handover Verification & Final Commissioning</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Field technician has submitted live power test and customer digital acceptance. Ready for Manager project closure.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ready to Close
                  </span>
                </div>

                {/* Handover Data Submitted by Technician */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Measured Power Output</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {activeProject.commissioningData?.testPowerOutputKw || 9.8} kW Verified
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Customer Digital Acceptance</span>
                    <span className="font-bold text-slate-900">
                      {activeProject.commissioningData?.signatoryName || activeProject.customerName} (Signed & Verified)
                    </span>
                  </div>
                </div>

                {/* 2 Post-Installation Photos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Post-Installation Photos (Array & Inverter):</span>
                  <div className="grid grid-cols-2 gap-3">
                    {(activeProject.commissioningData?.photos || [
                      '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
                      '/src/assets/images/solar_inverter_battery_setup_1793436858572.jpg'
                    ]).map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                        <img src={url} alt={`Installed setup ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manager Final Sign-off Button */}
                <div className="flex justify-end pt-2 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={handleApproveCommissioning}
                    className="px-6 py-3 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-lg shadow-[#C66B45]/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Commissioning & Close Project</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. STAGE: Commissioned & Closed */}
            {activeProject.stage === 'Commissioned & Closed' && (
              <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-sm text-emerald-900">Project Commissioned & Closed</h4>
                </div>
                <p className="text-xs text-emerald-800">
                  Turnkey installation energized on the DISCOM grid. 20-Year module warranty and 2-Year inverter/battery warranty are actively tracking.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProject(null);
                      onNavigateTab('warranties');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors"
                  >
                    View Active Warranty Certificates
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};