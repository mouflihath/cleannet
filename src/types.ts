export type NavTab = 'accueil' | 'produits' | 'matieres' | 'fabrication' | 'achats';

export type StockStatus = 'available' | 'low' | 'out';

export interface FormulaItem {
  materialId: string;
  materialName: string;
  percentage: number; // e.g. 5%
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  priceFormatted: string;
  unitPrice: number;
  unit: string;
  category: string;
  description: string;
  ph: string;
  packaging: string;
  formula: FormulaItem[];
  costPerUnit: number;
  shelfLife: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  supplier: string;
}

export interface FabricationBatchDeduction {
  materialId: string;
  materialName: string;
  amount: number;
  unit: string;
}

export interface FabricationBatch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  date: string;
  status: 'completed' | 'in_progress';
  totalCost: number;
  operator: string;
  deductions?: FabricationBatchDeduction[];
}

export interface PurchaseOrderItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  date: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'received' | 'pending';
}
