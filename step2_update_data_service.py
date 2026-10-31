import glob, os

base_dir = glob.glob('solarflow*')[0]
ds_path = os.path.join(base_dir, 'src', 'services', 'dataService.ts')

with open(ds_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure FeasibilityReport, HardwareDispatchRecord, CommissioningData are imported
target_import = "} from '../types';"
replacement_import = """,
  FeasibilityReport,
  HardwareDispatchRecord,
  CommissioningData
} from '../types';"""
if "FeasibilityReport" not in text:
    text = text.replace(target_import, replacement_import)

# Define the state machine methods
state_machine_methods = """
  // ==========================================================================
  // STRICT 8-STAGE END-TO-END PROJECT LIFECYCLE STATE MACHINE
  // ==========================================================================

  /**
   * Stage 2: Director selects technician and clicks "Assign Technician"
   * Transitions status to 'Survey Assigned'
   */
  public static assignTechnicianToSurvey(
    projectId: string,
    technicianId: string,
    scheduledDate: string,
    notes?: string
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    const tech = TECHNICIANS.find(t => t.id === technicianId) || TECHNICIANS[0];
    if (!proj) return false;

    proj.stage = 'Survey Assigned';
    proj.progressPercent = 25;
    proj.technicianId = tech.id;
    proj.technicianName = tech.name;
    proj.surveyDate = scheduledDate;
    if (notes) {
      proj.approvalNotes = (proj.approvalNotes ? proj.approvalNotes + ' | ' : '') + `Director notes: ${notes}`;
    }

    // Sync matching customer order
    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id || o.customerId === proj.customerId);
      if (order) {
        order.status = 'Survey Assigned';
        order.progressPercent = 25;
        order.assignedTechnicianName = tech.name;
        order.assignedTechnicianPhone = tech.phone;
        order.scheduledSurveyDate = scheduledDate;
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId || (c.email && c.email.toLowerCase() === proj.customerPhone.toLowerCase()));
    if (customer) {
      customer.leadStatus = 'Site Survey';
    }

    // Log Activity
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Survey Assigned: ${proj.projectId}`,
      description: `Director assigned technician ${tech.name} for site survey on ${scheduledDate}.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Director)'
    });

    // Notify Field Technician
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Survey Assigned: ${proj.projectId}`,
      message: `Site survey assigned for ${proj.customerName} on ${scheduledDate}.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 3: Technician opens survey task on-site
   * Transitions status to 'Survey In Progress'
   */
  public static startSurvey(projectId: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Survey In Progress';
    proj.progressPercent = 35;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey In Progress';
        order.progressPercent = 35;
      }
    }

    this.save(data);
    return true;
  }

  /**
   * Stage 4: Technician completes technical feasibility form & submits report
   * Transitions status to 'Survey Submitted'
   */
  public static submitFeasibilityReport(
    projectId: string,
    report: Omit<FeasibilityReport, 'id' | 'submittedAt'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const fullReport: FeasibilityReport = {
      ...report,
      id: `FR-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    proj.feasibilityReport = fullReport;
    proj.stage = 'Survey Submitted';
    proj.progressPercent = 45;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey Submitted';
        order.progressPercent = 45;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Feasibility Report Submitted: ${proj.projectId}`,
      description: `Technician ${report.technicianName} submitted technical report (Tilt: ${report.roofTiltDeg}°, Azimuth: ${report.roofAzimuth}, Roof: ${report.roofType}).`,
      timestamp: new Date().toISOString(),
      actor: report.technicianName
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Feasibility Review Required: ${proj.projectId}`,
      message: `Feasibility report submitted by ${report.technicianName}. Awaiting Director review.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 5: Director approves completed feasibility report
   * Transitions status to 'Feasibility Approved' (Unlocks Warehouse Dispatch)
   */
  public static approveFeasibilityReport(projectId: string, directorNotes?: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Feasibility Approved';
    proj.progressPercent = 55;
    if (proj.feasibilityReport) {
      proj.feasibilityReport.status = 'Approved';
      if (directorNotes) proj.feasibilityReport.directorReviewNotes = directorNotes;
    }

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Feasibility Approved';
        order.progressPercent = 55;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Feasibility Approved: ${proj.projectId}`,
      description: `Director approved technical feasibility report for ${proj.customerName}. Warehouse hardware dispatch unlocked.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Director)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Hardware Dispatch Unlocked: ${proj.projectId}`,
      message: `Feasibility approved. Warehouse staff may now scan & dispatch hardware components.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'warehouse'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 5 (Alternative): Director requests re-survey
   * Transitions status back to 'Survey Assigned' with notes
   */
  public static requestResurvey(projectId: string, reason: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Survey Assigned';
    proj.progressPercent = 25;
    if (proj.feasibilityReport) {
      proj.feasibilityReport.status = 'Re-survey Requested';
      proj.feasibilityReport.directorReviewNotes = reason;
    }
    proj.approvalNotes = `Re-survey Requested: ${reason}`;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey Assigned';
        order.progressPercent = 25;
      }
    }

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Re-survey Requested: ${proj.projectId}`,
      message: `Director requested re-survey: "${reason}". Please re-visit site to gather updated specs.`,
      type: 'warning',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 6: Warehouse enters manual serial numbers & clicks "Dispatch Hardware"
   * Transitions status to 'Hardware Dispatched'
   */
  public static dispatchWarehouseHardware(
    projectId: string,
    dispatch: Omit<HardwareDispatchRecord, 'dispatchedAt'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const record: HardwareDispatchRecord = {
      ...dispatch,
      dispatchedAt: new Date().toISOString()
    };

    proj.hardwareDispatch = record;
    proj.stage = 'Hardware Dispatched';
    proj.progressPercent = 70;

    // Register warranties for dispatched equipment
    if (dispatch.inverterSerial) {
      data.warranties.unshift({
        id: `WAR-${Date.now()}-1`,
        serialNumber: dispatch.inverterSerial,
        productCategory: 'Inverters',
        productName: 'Solar Hybrid Inverter',
        model: 'SPF-5000-ES',
        customerId: proj.customerId,
        customerName: proj.customerName,
        customerPhone: proj.customerPhone,
        customerAddress: proj.customerAddress,
        projectId: proj.projectId,
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: 2,
        warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'Active',
        claimsCount: 0
      });
    }

    if (dispatch.batterySerial) {
      data.warranties.unshift({
        id: `WAR-${Date.now()}-2`,
        serialNumber: dispatch.batterySerial,
        productCategory: 'Batteries',
        productName: 'LiFePO4 Storage Battery',
        model: 'LFP-5120',
        customerId: proj.customerId,
        customerName: proj.customerName,
        customerPhone: proj.customerPhone,
        customerAddress: proj.customerAddress,
        projectId: proj.projectId,
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: 2,
        warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'Active',
        claimsCount: 0
      });
    }

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Hardware Dispatched';
        order.progressPercent = 70;
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId);
    if (customer) {
      customer.leadStatus = 'Installation';
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'inventory',
      title: `Hardware Dispatched: ${proj.projectId}`,
      description: `Warehouse dispatched hardware for ${proj.customerName} (Modules: ${dispatch.moduleSerialRange}, Inverter: ${dispatch.inverterSerial}).`,
      timestamp: new Date().toISOString(),
      actor: dispatch.dispatchedBy || 'Vikram Singh (Warehouse)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Hardware En Route: ${proj.projectId}`,
      message: `Hardware has been dispatched by warehouse. Field technician may begin rooftop mounting.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 7: Technician enters test power output, 2 photos, and collects Customer digital signature
   * Transitions status to 'Installation & Handover Completed' (Pending Final Commissioning)
   */
  public static submitInstallationCommissioning(
    projectId: string,
    dataInput: Omit<CommissioningData, 'completionDate'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const commData: CommissioningData = {
      ...dataInput,
      completionDate: new Date().toISOString()
    };

    proj.commissioningData = commData;
    proj.customerApproved = true;
    proj.approvalSignature = dataInput.customerSignature;
    proj.approvalDate = new Date().toISOString().split('T')[0];
    proj.stage = 'Installation & Handover Completed';
    proj.progressPercent = 85;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Installation & Handover Completed';
        order.progressPercent = 85;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Installation & Handover Completed: ${proj.projectId}`,
      description: `Technician completed physical installation and captured customer digital acceptance signature. Test output: ${dataInput.testPowerOutputKw} kW.`,
      timestamp: new Date().toISOString(),
      actor: 'Rajesh & Team (Field Tech)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Commissioning Sign-Off Required: ${proj.projectId}`,
      message: `Customer ${proj.customerName} signed on-site handover. Director review required to close project.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 8: Director approves final commissioning and closes project
   * Transitions status to 'Commissioned & Closed' (100% Complete)
   * Auto-generates Warranty & Commissioning Certificate
   */
  public static approveCommissioningAndClose(projectId: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Commissioned & Closed';
    proj.progressPercent = 100;
    proj.completionDate = new Date().toISOString().split('T')[0];

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Commissioned & Closed';
        order.progressPercent = 100;
        order.documentUrl = 'Official Handover, Net-Metering & 20-Year Warranty Certificate';
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId);
    if (customer) {
      customer.leadStatus = 'Commissioned';
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Project Commissioned & Closed: ${proj.projectId}`,
      description: `Director Dr. Singhania officially signed off final commissioning for ${proj.customerName}. Warranty certificate released.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Director)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Project Commissioned: ${proj.projectId}`,
      message: `System for ${proj.customerName} is now fully commissioned and energized. Commissioning certificate issued.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }
"""

if "assignTechnicianToSurvey" not in text:
    anchor = "  public static approveOrderAndDispatchTech("
    text = text.replace(anchor, state_machine_methods + "\n" + anchor)

with open(ds_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 2: Added state machine methods to dataService.ts successfully!")
