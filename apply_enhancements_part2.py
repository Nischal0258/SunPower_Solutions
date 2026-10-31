import os
import glob
import re

frontend_matches = glob.glob('*solarflow*')
if not frontend_matches:
    raise FileNotFoundError("Could not find frontend directory matching *solarflow*")
FRONTEND_DIR = frontend_matches[0]
print(f"Target frontend directory: {FRONTEND_DIR}")

# =====================================================================
# 1. Update CustomersPage.tsx:
#    - Fix duplicate "+ Add Customer" -> "Add Customer"
#    - Add onOpenSiteSurvey prop
#    - Add "Conduct Site Survey" action buttons in header and customer details
# =====================================================================
cust_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'CustomersPage.tsx')
with open(cust_path, 'r', encoding='utf-8') as f:
    cust_text = f.read()

# Fix interface
if 'onOpenSiteSurvey?: () => void;' not in cust_text:
    cust_text = cust_text.replace(
        'interface CustomersPageProps {\\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\\n  initialCustomerId?: string;\\n}',
        'interface CustomersPageProps {\\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\\n  initialCustomerId?: string;\\n  onOpenSiteSurvey?: () => void;\\n}'
    )

# Fix component signature
if 'onOpenSiteSurvey' not in cust_text.split('const CustomersPage: React.FC')[1].split('{')[0]:
    cust_text = cust_text.replace(
        'export const CustomersPage: React.FC<CustomersPageProps> = ({\\n  onNavigateTab,\\n  initialCustomerId\\n}) => {',
        'export const CustomersPage: React.FC<CustomersPageProps> = ({\\n  onNavigateTab,\\n  initialCustomerId,\\n  onOpenSiteSurvey\\n}) => {'
    )

# Import ClipboardCheck if missing
if 'ClipboardCheck' not in cust_text:
    cust_text = cust_text.replace(
        "import {\\n  Users,",
        "import {\\n  Users,\\n  ClipboardCheck,"
    )

# Fix duplicate "+ Add Customer" in button and add Survey button next to it
old_btn_block = '''        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>'''

new_btn_block = '''        <div className="flex items-center gap-2 shrink-0">
          {onOpenSiteSurvey && (
            <button
              onClick={onOpenSiteSurvey}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DBBA95] bg-[#DBBA95]/20 text-[#292724] text-xs font-semibold hover:bg-[#DBBA95]/40 transition-all shadow-xs shrink-0"
              title="Launch technical rooftop feasibility survey form"
            >
              <ClipboardCheck className="w-4 h-4 text-[#C66B45]" />
              <span>Conduct Site Survey</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>'''

if old_btn_block in cust_text:
    cust_text = cust_text.replace(old_btn_block, new_btn_block)
else:
    # Fallback regex replace for + Add Customer
    cust_text = re.sub(r'<span>\s*\+\s*Add Customer</span>', '<span>Add Customer</span>', cust_text)

# Also in viewCustomer drawer, add Conduct Site Survey in quick actions if present
survey_action_btn = '''                {onOpenSiteSurvey && (
                  <button
                    onClick={onOpenSiteSurvey}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#DBBA95] bg-[#DBBA95]/15 hover:bg-[#DBBA95]/30 text-xs font-semibold text-[#292724] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-[#C66B45]" />
                      <span>Conduct Feasibility Site Survey</span>
                    </div>
                    <span className="text-[10px] text-[#C66B45] font-mono">Launch Form →</span>
                  </button>
                )}'''

if 'Conduct Feasibility Site Survey' not in cust_text:
    cust_text = cust_text.replace(
        '<div className="space-y-2">\\n                <h4 className="text-xs font-bold text-[#292724] uppercase tracking-wider">Quick Actions</h4>',
        '<div className="space-y-2">\\n                <h4 className="text-xs font-bold text-[#292724] uppercase tracking-wider">Quick Actions</h4>\\n' + survey_action_btn
    )

with open(cust_path, 'w', encoding='utf-8') as f:
    f.write(cust_text)
print("Updated CustomersPage.tsx with single Add Customer button and Site Survey entry points.")

# =====================================================================
# 2. Update InstallationsPage.tsx:
#    - Add onOpenSiteSurvey to InstallationsPageProps
#    - Fix "+ Create from Quotation" -> "Create from Quotation"
#    - Add "Conduct Site Survey" header button
#    - Add Technical Feasibility Survey Callout Banner in project modal
# =====================================================================
inst_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'InstallationsPage.tsx')
with open(inst_path, 'r', encoding='utf-8') as f:
    inst_text = f.read()

# Fix interface
if 'onOpenSiteSurvey?: () => void;' not in inst_text:
    inst_text = inst_text.replace(
        'interface InstallationsPageProps {\\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\\n  initialProjectId?: string;\\n}',
        'interface InstallationsPageProps {\\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\\n  initialProjectId?: string;\\n  onOpenSiteSurvey?: () => void;\\n}'
    )

if 'onOpenSiteSurvey' not in inst_text.split('const InstallationsPage: React.FC')[1].split('{')[0]:
    inst_text = inst_text.replace(
        'export const InstallationsPage: React.FC<InstallationsPageProps> = ({\\n  onNavigateTab,\\n  initialProjectId\\n}) => {',
        'export const InstallationsPage: React.FC<InstallationsPageProps> = ({\\n  onNavigateTab,\\n  initialProjectId,\\n  onOpenSiteSurvey\\n}) => {'
    )

# Replace duplicate "+ Create from Quotation" and add Survey button
old_inst_btn = '''        <button
          onClick={() => {
            onNavigateTab('quotations');
            showToast('Select any approved quotation to initiate a new installation project.', 'info');
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create from Quotation</span>
        </button>'''

new_inst_btn = '''        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (onOpenSiteSurvey) {
                onOpenSiteSurvey();
              } else {
                setIsSurveyModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DBBA95] bg-[#DBBA95]/20 text-[#292724] text-xs font-semibold hover:bg-[#DBBA95]/40 transition-all shadow-xs shrink-0"
            title="Record rooftop azimuth, tilt, shading, and earthing test"
          >
            <Compass className="w-4 h-4 text-[#C66B45]" />
            <span>Conduct Site Survey</span>
          </button>

          <button
            onClick={() => {
              onNavigateTab('quotations');
              showToast('Select any approved quotation to initiate a new installation project.', 'info');
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create from Quotation</span>
          </button>
        </div>'''

if old_inst_btn in inst_text:
    inst_text = inst_text.replace(old_inst_btn, new_inst_btn)
else:
    inst_text = re.sub(r'<span>\s*\+\s*Create from Quotation</span>', '<span>Create from Quotation</span>', inst_text)

# Add Survey Banner inside activeProject workflow modal
survey_banner = '''            {/* Technical Feasibility Survey Callout Banner */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C66B45] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#292724] text-xs">Technical Feasibility Site Survey</h4>
                  <p className="text-[11px] text-[#292724]/75">
                    {activeProject.stage === 'Survey Completed'
                      ? `Feasibility survey verified: ${activeProject.approvalNotes || 'Azimuth & Tilt cleared.'}`
                      : 'Record rooftop azimuth, tilt angle, shadow analysis and earthing Ohms test.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSurveyModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 shrink-0 transition-colors shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{activeProject.stage === 'Survey Completed' ? 'Review Survey Details' : 'Launch Site Survey'}</span>
              </button>
            </div>'''

if 'Technical Feasibility Site Survey Callout Banner' not in inst_text:
    inst_text = inst_text.replace(
        '{/* Stage Progression Bar */}',
        survey_banner + '\\n\\n            {/* Stage Progression Bar */}'
    )

with open(inst_path, 'w', encoding='utf-8') as f:
    f.write(inst_text)
print("Updated InstallationsPage.tsx with Site Survey entry points and deduped button.")

# =====================================================================
# 3. Update ServiceTicketsPage.tsx:
#    - Fix "+ Create Service Ticket" -> "Create Service Ticket"
# =====================================================================
tick_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'ServiceTicketsPage.tsx')
with open(tick_path, 'r', encoding='utf-8') as f:
    tick_text = f.read()

tick_text = re.sub(r'<span>\s*\+\s*Create Service Ticket</span>', '<span>Create Service Ticket</span>', tick_text)
with open(tick_path, 'w', encoding='utf-8') as f:
    f.write(tick_text)
print("Updated ServiceTicketsPage.tsx with single Create Service Ticket button.")

# =====================================================================
# 4. Deduplicate remaining "+ " in buttons across all pages
# =====================================================================
for root, _, files in os.walk(os.path.join(FRONTEND_DIR, 'src', 'pages')):
    for fname in files:
        if fname.endswith('.tsx'):
            fpath = os.path.join(root, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                c = f.read()
            # replace <span>+ New Project</span> -> <span>New Project</span>
            c_new = re.sub(r'<span>\s*\+\s*([A-Za-z])', r'<span>\1', c)
            if c != c_new:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(c_new)
                print(f"Deduplicated plus signs in {fname}")

print("Completed button deduplication across pages.")
