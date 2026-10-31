export type NavTab = 
  | 'dashboard'
  | 'customers'
  | 'quotations'
  | 'warehouse'
  | 'inventory'
  | 'installations'
  | 'warranties'
  | 'tickets'
  | 'reports'
  | 'settings';

export type UserRole = 
  | 'manager'       // Operations Manager (Dr. Singhania)
  | 'director'      // Managing Director / Executive
  | 'sales'         // Sales & CRM Lead (Priya)
  | 'warehouse'     // Warehouse & Logistics (Vikram Singh)
  | 'technician'    // Lead Field Technician (Rajesh & Team)
  | 'support'       // Helpdesk & RMA Support Agent (Rohan)
  | 'customer';     // Solar Homeowner (Rajesh Sharma)

export interface RoleInfo {
  id: UserRole;
  title: string;
  name: string;
  badge: string;
  avatarColor: string;
  recommendedTab: NavTab;
  description: string;
  allowedTabs: NavTab[];
}

export const USER_ROLES: Record<UserRole, RoleInfo> = {
  manager: {
    id: 'manager',
    title: 'Operations Manager',
    name: 'Dr. Singhania',
    badge: 'Manager',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Operations oversight: quotation approvals, survey approvals & company performance',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  director: {
    id: 'director',
    title: 'Managing Director & Operations',
    name: 'Dr. Singhania',
    badge: 'Executive',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Consolidated executive & operations oversight: quotation approvals, site survey sign-offs, technician dispatches, and P&L',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  sales: {
    id: 'sales',
    title: 'Sales & CRM Lead',
    name: 'Priya Sharma',
    badge: 'Sales',
    avatarColor: 'bg-amber-600',
    recommendedTab: 'customers',
    description: 'Lead intake, feasibility checks & quotation generation',
    allowedTabs: ['customers', 'quotations', 'installations', 'warranties', 'reports'],
  },
  warehouse: {
    id: 'warehouse',
    title: 'Warehouse & Logistics Staff',
    name: 'Vikram Singh',
    badge: 'Warehouse',
    avatarColor: 'bg-emerald-600',
    recommendedTab: 'warehouse',
    description: 'Core inventory tracking, stock replenishment, manual serial registration & order fulfillment only',
    allowedTabs: ['warehouse', 'inventory'],
  },
  technician: {
    id: 'technician',
    title: 'Lead Field Technician & Surveyor',
    name: 'Rajesh & Team',
    badge: 'Field Tech',
    avatarColor: 'bg-cyan-600',
    recommendedTab: 'installations',
    description: 'On-site technical surveys, rooftop mounting, physical testing, photo QA audit, and customer digital handover signature',
    allowedTabs: ['installations', 'warranties'],
  },
  support: {
    id: 'support',
    title: 'Helpdesk & RMA Agent',
    name: 'Rohan Mehra',
    badge: 'Support',
    avatarColor: 'bg-rose-600',
    recommendedTab: 'tickets',
    description: 'Inverter fault diagnostics, warranty lookups & ₹0 work orders',
    allowedTabs: ['tickets', 'warranties', 'customers', 'installations'],
  },
  customer: {
    id: 'customer',
    title: 'Solar Homeowner',
    name: 'Rajesh Sharma',
    badge: 'Customer',
    avatarColor: 'bg-teal-600',
    recommendedTab: 'installations',
    description: 'View assigned products, view order history & place new orders',
    allowedTabs: ['installations'],
  },
};
