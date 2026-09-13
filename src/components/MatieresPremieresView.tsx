import React, { useState } from 'react';
import { RawMaterial, StockStatus } from '../types';
import {
  Search,
  Plus,
  Droplets,
  Palette,
  Check,
  X,
  AlertCircle,
  Edit3,
  Trash2,
  ArrowUpDown,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MatieresPremieresViewProps {
  rawMaterials: RawMaterial[];
  onUpdateStock: (id: string, newStock: number) => void;
  onAddMaterial: (material: RawMaterial) => void;
  onUpdateMaterial?: (material: RawMaterial) => void;
  onDeleteMaterial?: (id: string) => void;
  onGoToAchatsWithMaterial?: (materialId: string) => void;
}

export const MatieresPremieresView: React.FC<MatieresPremieresViewProps> = ({
  rawMaterials,
  onUpdateStock,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onGoToAchatsWithMaterial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'colorants' | 'parfums' | 'bases' | 'sels' | 'emballages'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock-desc' | 'stock-asc' | 'value-desc' | 'urgency'>('urgency');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [adjustingStockMaterial, setAdjustingStockMaterial] = useState<RawMaterial | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(50);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [notification, setNotification] = useState<string | null>(null);

  // Inline editing state for quick stock edits
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineStockValue, setInlineStockValue] = useState<number>(0);

  // New material form state
  const [newMatName, setNewMatName] = useState('');
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('Tensioactifs & Bases');
  const [newMatUnit, setNewMatUnit] = useState('kg');
  const [newMatStock, setNewMatStock] = useState<number>(50);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(25);
  const [newMatUnitCost, setNewMatUnitCost] = useState<number>(1500);
  const [newMatSupplier, setNewMatSupplier] = useState('BioChimie Solutions');

  // Helper to determine status dynamically
  const getStatus = (material: RawMaterial): StockStatus => {
    if (material.currentStock <= material.minStock * 0.3) {
      return 'out';
    }
    if (material.currentStock < material.minStock) {
      return 'low';
    }
    return 'available';
  };

  // Dynamic KPIs calculated in real time
  const totalReferences = rawMaterials.length;
  const totalStockValue = rawMaterials.reduce(
    (acc, m) => acc + m.currentStock * m.unitCost,
    0
  );
  const availableCount = rawMaterials.filter((m) => getStatus(m) === 'available').length;
  const lowCount = rawMaterials.filter((m) => getStatus(m) === 'low').length;
  const outCount = rawMaterials.filter((m) => getStatus(m) === 'out').length;

  // Separate lists for dynamic highlights
  const colorantsList = rawMaterials.filter(
    (m) => m.category === 'Colorants' || m.name.toLowerCase().includes('colorant')
  );
  const parfumsList = rawMaterials.filter(
    (m) => m.category === 'Parfums & Fragrances' || m.name.toLowerCase().includes('parfum')
  );

  // Trigger feedback banner
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Create Material Handler
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    const newMaterial: RawMaterial = {
      id: `rm-${Date.now()}`,
      name: newMatName.trim(),
      code: newMatCode.trim() || `MP-${Math.floor(100 + Math.random() * 900)}`,
      category: newMatCategory,
      unit: newMatUnit,
      currentStock: Number(newMatStock) || 0,
      minStock: Number(newMatMinStock) || 0,
      unitCost: Number(newMatUnitCost) || 0,
      supplier: newMatSupplier.trim() || 'Fournisseur Général',
    };

    onAddMaterial(newMaterial);
    setShowAddModal(false);
    triggerNotification(`✓ Matière première "${newMaterial.name}" créée et ajoutée à l'inventaire CleanNet.`);

    // Reset
    setNewMatName('');
    setNewMatCode('');
    setNewMatStock(50);
    setNewMatMinStock(25);
    setNewMatUnitCost(1500);
  };

  // Edit Material Handler
  const handleSaveEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !onUpdateMaterial) return;

    onUpdateMaterial(editingMaterial);
    triggerNotification(`✓ Informations de "${editingMaterial.name}" mises à jour avec succès.`);
    setEditingMaterial(null);
  };

  // Quick Stock Adjustment Handler
  const handleConfirmStockAdjustment = () => {
    if (!adjustingStockMaterial) return;
    const delta = adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount;
    const targetStock = Math.max(0, Number((adjustingStockMaterial.currentStock + delta).toFixed(2)));

    onUpdateStock(adjustingStockMaterial.id, targetStock);
    triggerNotification(
      `✓ Stock de "${adjustingStockMaterial.name}" ajusté : ${adjustingStockMaterial.currentStock} ➔ ${targetStock} ${adjustingStockMaterial.unit}`
    );
    setAdjustingStockMaterial(null);
  };

  // Inline Stock Direct Save
  const handleSaveInlineStock = (id: string) => {
    const val = Math.max(0, Number(inlineStockValue) || 0);
    onUpdateStock(id, val);
    setInlineEditId(null);
    triggerNotification(`✓ Stock mis à jour : ${val}`);
  };

  // Delete Material Handler
  const handleDelete = (material: RawMaterial) => {
    if (window.confirm(`Confirmez-vous la suppression définitive de "${material.name}" de l'inventaire ?`)) {
      if (onDeleteMaterial) {
        onDeleteMaterial(material.id);
        triggerNotification(`Matière première "${material.name}" supprimée.`);
      }
    }
  };

  // Color mapping helper for colorants
  const getColorBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bleu')) return 'bg-blue-500 text-white';
    if (lower.includes('vert')) return 'bg-emerald-500 text-white';
    if (lower.includes('rose')) return 'bg-pink-500 text-white';
    if (lower.includes('violet')) return 'bg-purple-500 text-white';
    if (lower.includes('orange')) return 'bg-amber-500 text-white';
    if (lower.includes('jaune')) return 'bg-yellow-400 text-stone-900';
    if (lower.includes('rouge')) return 'bg-rose-600 text-white';
    return 'bg-stone-500 text-white';
  };

  // Filter items based on sub-tab, status and search
  const filteredMaterials = rawMaterials.filter((m) => {
    const status = getStatus(m);
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTab = true;
    if (activeSubTab === 'colorants') {
      matchesTab = m.category === 'Colorants' || m.name.toLowerCase().includes('colorant');
    } else if (activeSubTab === 'parfums') {
      matchesTab = m.category === 'Parfums & Fragrances' || m.name.toLowerCase().includes('parfum');
    } else if (activeSubTab === 'bases') {
      matchesTab =
        m.category.includes('Tensioactifs') ||
        m.category.includes('Actifs') ||
        m.category.includes('Épaississants') ||
        m.category.includes('Conservateurs') ||
        m.category.includes('Solvants') ||
        m.category.includes('Régulateurs');
    } else if (activeSubTab === 'sels') {
      matchesTab = m.category.includes('Sels') || m.category.includes('Séquestrants');
    } else if (activeSubTab === 'emballages') {
      matchesTab = m.category.includes('Conditionnement') || m.category.includes('Accessoires');
    }

    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesTab && matchesStatus;
  });

  // Dynamic sorting
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'fr');
    }
    if (sortBy === 'stock-desc') {
      return b.currentStock - a.currentStock;
    }
    if (sortBy === 'stock-asc') {
      return a.currentStock - b.currentStock;
    }
    if (sortBy === 'value-desc') {
      return b.currentStock * b.unitCost - a.currentStock * a.unitCost;
    }
    if (sortBy === 'urgency') {
      const rank = (m: RawMaterial) => {
        const s = getStatus(m);
        if (s === 'out') return 1;
        if (s === 'low') return 2;
        return 3;
      };
      return rank(a) - rank(b);
    }
    return 0;
  });

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-stone-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Matières premières
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Inventaire dynamique et pilotage en temps réel des stocks, seuils d'alerte et valorisations d'atelier
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            id="btn-open-add-material"
            className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une matière</span>
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Feedback Banner */}
      {notification && (
        <div className="mb-6 p-4 rounded-xl bg-stone-900 text-stone-50 text-sm flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center space-x-2.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DYNAMIC REAL-TIME KPI SUMMARY BAR (Clickable Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total References */}
        <div
          onClick={() => {
            setStatusFilter('all');
            setActiveSubTab('all');
          }}
          className="p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-stone-400 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Total Références</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl font-bold text-stone-900 font-mono">
            {totalReferences} <span className="text-xs font-normal text-stone-400">matières</span>
          </div>
          <span className="text-[11px] text-stone-400">Catalogue complet CleanNet</span>
        </div>

        {/* Total Stock Value */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
            <span>Valorisation Stock</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-stone-900 font-mono">
            {totalStockValue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-stone-500">FCFA</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Calculé en direct selon le coût unitaire</span>
        </div>

        {/* Sufficient / Available */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            statusFilter === 'available'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-stone-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
            <span>En Stock Normal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-xl font-bold text-stone-900 font-mono">
            {availableCount} <span className="text-xs font-normal text-stone-400">références</span>
          </div>
          <span className="text-[11px] text-emerald-700">Disponibilité optimale</span>
        </div>

        {/* Alerts / Low or Out */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            statusFilter === 'low' || statusFilter === 'out'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-stone-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
            <span>Alertes & Ruptures</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-900 font-mono">
            {lowCount + outCount} <span className="text-xs font-normal text-stone-400">à réapprovisionner</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium">
            {outCount} critique(s) • {lowCount} sous le seuil
          </span>
        </div>
      </div>

      {/* SPECIAL HIGHLIGHT CARDS : COLORANTS & PARFUMS (Interactive filter on click) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Section Colorants séparément */}
        <div
          onClick={() => setActiveSubTab(activeSubTab === 'colorants' ? 'all' : 'colorants')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            activeSubTab === 'colorants'
              ? 'bg-stone-900 text-white border-stone-900 shadow-md'
              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-xl ${activeSubTab === 'colorants' ? 'bg-white/10' : 'bg-stone-100'}`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Colorants (7 nuances séparées)</h3>
                <span className={`text-[11px] block ${activeSubTab === 'colorants' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Cliquez pour filtrer uniquement les teintes
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                activeSubTab === 'colorants' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {colorantsList.length} teintes
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {colorantsList.map((col) => (
              <span
                key={col.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm(col.name);
                }}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${
                  activeSubTab === 'colorants' ? 'bg-white/15 text-stone-100' : 'bg-stone-100 text-stone-800'
                }`}
                title="Cliquer pour isoler ce colorant"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${getColorBadge(col.name)}`}></span>
                <span>{col.name.replace('Colorant ', '')}</span>
                <span className="font-mono font-semibold opacity-90 text-[11px]">
                  {col.currentStock} {col.unit}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Section Parfums séparément */}
        <div
          onClick={() => setActiveSubTab(activeSubTab === 'parfums' ? 'all' : 'parfums')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            activeSubTab === 'parfums'
              ? 'bg-stone-900 text-white border-stone-900 shadow-md'
              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-xl ${activeSubTab === 'parfums' ? 'bg-white/10' : 'bg-stone-100'}`}>
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Parfums & Senteurs (14 fragrances séparées)</h3>
                <span className={`text-[11px] block ${activeSubTab === 'parfums' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Cliquez pour filtrer uniquement les parfums
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                activeSubTab === 'parfums' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {parfumsList.length} fragrances
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
            {parfumsList.map((prf) => (
              <span
                key={prf.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm(prf.name);
                }}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-xs cursor-pointer transition-transform hover:scale-105 ${
                  activeSubTab === 'parfums' ? 'bg-white/15 text-stone-100' : 'bg-stone-100 text-stone-800'
                }`}
                title="Cliquer pour isoler ce parfum"
              >
                <span>{prf.name.replace('Parfum senteur ', '').replace('Parfum ', '')}</span>
                <span className="ml-1.5 font-mono font-semibold opacity-90 text-[10px]">
                  {prf.currentStock} {prf.unit}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tabs, Search & Dynamic Sort Bar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6 items-stretch lg:items-center justify-between">
        {/* Navigation Categories Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Toutes ({rawMaterials.length})
          </button>
          <button
            onClick={() => setActiveSubTab('bases')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'bases' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bases & Tensioactifs
          </button>
          <button
            onClick={() => setActiveSubTab('colorants')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'colorants' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Colorants ({colorantsList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('parfums')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'parfums' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Parfums ({parfumsList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sels')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'sels' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sels & Séquestrants
          </button>
          <button
            onClick={() => setActiveSubTab('emballages')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'emballages' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Emballages
          </button>
        </div>

        {/* Controls: Search, Status Filter, Dynamic Sort */}
        <div className="flex flex-wrap items-center gap-2 flex-1 lg:max-w-xl justify-end">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400 shadow-2xs"
          >
            <option value="all">Tous les états</option>
            <option value="available">✓ Disponible</option>
            <option value="low">⚠ Stock faible</option>
            <option value="out">⛔ Rupture / Critique</option>
          </select>

          {/* Dynamic Sort select */}
          <div className="flex items-center space-x-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs text-stone-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="urgency">Trier par : Urgences d'abord</option>
              <option value="name">Trier par : Nom (A-Z)</option>
              <option value="stock-desc">Trier par : Stock décroissant</option>
              <option value="stock-asc">Trier par : Stock croissant</option>
              <option value="value-desc">Trier par : Valeur financière</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dynamic Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 text-xs text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4 font-medium">Matière première</th>
                <th className="py-3.5 px-4 font-medium">Référence & Catégorie</th>
                <th className="py-3.5 px-4 font-medium text-right">Stock actuel dynamique</th>
                <th className="py-3.5 px-4 font-medium text-right">Seuil min.</th>
                <th className="py-3.5 px-4 font-medium text-right">Valeur stock</th>
                <th className="py-3.5 px-4 font-medium">Fournisseur</th>
                <th className="py-3.5 px-4 font-medium text-center">Actions directes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {sortedMaterials.map((material) => {
                const status = getStatus(material);
                const isColorant = material.category === 'Colorants' || material.name.toLowerCase().includes('colorant');
                const isEditing = inlineEditId === material.id;
                const stockValuation = material.currentStock * material.unitCost;

                return (
                  <tr key={material.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Material Name & Indicator */}
                    <td className="py-3.5 px-4 font-medium text-stone-900">
                      <div className="flex items-center space-x-2.5">
                        {isColorant ? (
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs ${getColorBadge(material.name)}`}
                          ></span>
                        ) : (
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              status === 'available'
                                ? 'bg-emerald-500'
                                : status === 'low'
                                ? 'bg-amber-500'
                                : 'bg-rose-500 ring-2 ring-rose-300'
                            }`}
                          />
                        )}
                        <div>
                          <span className="block">{material.name}</span>
                          <span className="text-[11px] text-stone-400 font-normal">
                            {material.unitCost.toLocaleString('fr-FR')} FCFA / {material.unit}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Code & Category */}
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      <span className="font-mono text-stone-700 block font-medium">{material.code}</span>
                      <span className="text-[11px] text-stone-400 block">{material.category}</span>
                    </td>

                    {/* Stock actuel dynamique, modifiable en cliquant sur la valeur */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="inline-flex items-center space-x-1 justify-end">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={inlineStockValue}
                            onChange={(e) => setInlineStockValue(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineStock(material.id);
                              if (e.key === 'Escape') setInlineEditId(null);
                            }}
                            autoFocus
                            className="w-20 px-1.5 py-1 text-xs border-2 border-stone-900 rounded-md font-mono text-right font-bold focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveInlineStock(material.id)}
                            className="p-1 rounded bg-stone-900 text-white hover:bg-stone-800"
                            title="Valider"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setInlineEditId(null)}
                            className="p-1 rounded bg-stone-200 text-stone-600 hover:bg-stone-300"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end">
                          <span
                            onClick={() => {
                              setInlineEditId(material.id);
                              setInlineStockValue(material.currentStock);
                            }}
                            className={`font-mono font-bold px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-stone-200/60 ${
                              status === 'out'
                                ? 'text-rose-700 bg-rose-50'
                                : status === 'low'
                                ? 'text-amber-800 bg-amber-50'
                                : 'text-stone-900'
                            }`}
                            title="Cliquer pour modifier directement le stock"
                          >
                            {material.currentStock} {material.unit}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Min Stock & Alert indicator */}
                    <td className="py-3.5 px-4 text-right text-xs">
                      <span className="font-mono text-stone-500 font-medium">
                        {material.minStock} {material.unit}
                      </span>
                      {status === 'low' && (
                        <span className="block text-[10px] text-amber-600 font-medium">Seuil bas</span>
                      )}
                      {status === 'out' && (
                        <span className="block text-[10px] text-rose-600 font-bold">Rupture !</span>
                      )}
                    </td>

                    {/* Stock Valuation */}
                    <td className="py-3.5 px-4 text-right text-xs font-mono font-semibold text-stone-800">
                      {stockValuation.toLocaleString('fr-FR')} FCFA
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 text-xs text-stone-600 max-w-[140px] truncate" title={material.supplier}>
                      {material.supplier}
                    </td>

                    {/* Actions: Ajuster, Éditer, Supprimer */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        {/* Quick Stock Adjustment */}
                        <button
                          onClick={() => {
                            setAdjustingStockMaterial(material);
                            setAdjustmentAmount(50);
                            setAdjustmentType('add');
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 transition-colors"
                          title="Ajuster le stock (+/-)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Material Details */}
                        {onUpdateMaterial && (
                          <button
                            onClick={() => setEditingMaterial(material)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 transition-colors"
                            title="Modifier les détails de la matière"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Material */}
                        {onDeleteMaterial && (
                          <button
                            onClick={() => handleDelete(material)}
                            className="p-1.5 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Supprimer la matière"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty search result */}
        {sortedMaterials.length === 0 && (
          <div className="p-12 text-center text-stone-500 text-sm">
            Aucune matière première ne correspond aux critères sélectionnés.
          </div>
        )}
      </div>

      {/* MODAL 1 : AJUSTEMENT RAPIDE DU STOCK */}
      {adjustingStockMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  Ajuster le stock en atelier
                </h3>
                <p className="text-xs text-stone-500">{adjustingStockMaterial.name}</p>
              </div>
              <button
                onClick={() => setAdjustingStockMaterial(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-600">Stock actuel disponible :</span>
              <span className="font-mono font-bold text-stone-900 text-sm">
                {adjustingStockMaterial.currentStock} {adjustingStockMaterial.unit}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Type d'opération
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                      adjustmentType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    + Entrée / Réapprovisionnement
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('remove')}
                    className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                      adjustmentType === 'remove'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    - Sortie / Perte / Ajustement
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Quantité ({adjustingStockMaterial.unit})
                </label>
                <div className="flex gap-2 mb-2">
                  {[10, 25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setAdjustmentAmount(qty)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${
                        adjustmentAmount === qty
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Math.max(0.1, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold font-mono focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* Calculated resulting stock */}
              <div className="p-3 bg-stone-100 rounded-xl text-xs flex items-center justify-between font-mono">
                <span className="text-stone-600">Nouveau stock résultant :</span>
                <span className="font-bold text-stone-900 text-sm">
                  {Math.max(
                    0,
                    Number(
                      (
                        adjustingStockMaterial.currentStock +
                        (adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount)
                      ).toFixed(2)
                    )
                  )}{' '}
                  {adjustingStockMaterial.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAdjustingStockMaterial(null)}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmStockAdjustment}
                className="px-4 py-2 bg-stone-900 text-stone-50 rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors shadow-sm"
              >
                Enregistrer l'ajustement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : ÉDITION COMPLÈTE D'UNE MATIÈRE PREMIÈRE */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-semibold text-stone-900">
                Modifier la matière première
              </h3>
              <button
                onClick={() => setEditingMaterial(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nom de la matière
                </label>
                <input
                  type="text"
                  required
                  value={editingMaterial.name}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Référence interne
                  </label>
                  <input
                    type="text"
                    value={editingMaterial.code}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, code: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editingMaterial.category}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="Tensioactifs & Bases">Tensioactifs & Bases</option>
                    <option value="Colorants">Colorants</option>
                    <option value="Parfums & Fragrances">Parfums & Fragrances</option>
                    <option value="Sels & Séquestrants">Sels & Séquestrants</option>
                    <option value="Régulateurs & Détartrants">Régulateurs & Détartrants</option>
                    <option value="Épaississants & Polymères">Épaississants & Polymères</option>
                    <option value="Solvants & Auxiliaires">Solvants & Auxiliaires</option>
                    <option value="Conservateurs">Conservateurs</option>
                    <option value="Conditionnement & Emballage">Conditionnement & Emballage</option>
                    <option value="Accessoires & Contrôle">Accessoires & Contrôle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Stock actuel ({editingMaterial.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingMaterial.currentStock}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        currentStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Seuil alerte ({editingMaterial.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingMaterial.minStock}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        minStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Unité
                  </label>
                  <select
                    value={editingMaterial.unit}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Coût unitaire (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingMaterial.unitCost}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        unitCost: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={editingMaterial.supplier}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, supplier: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : CRÉATION D'UNE MATIÈRE PREMIÈRE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-semibold text-stone-900">
                Ajouter une matière première CleanNet
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nom de la matière première *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Acide lactique 80%"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Référence interne
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: MP-LAC-01"
                    value={newMatCode}
                    onChange={(e) => setNewMatCode(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="Tensioactifs & Bases">Tensioactifs & Bases</option>
                    <option value="Colorants">Colorants</option>
                    <option value="Parfums & Fragrances">Parfums & Fragrances</option>
                    <option value="Sels & Séquestrants">Sels & Séquestrants</option>
                    <option value="Régulateurs & Détartrants">Régulateurs & Détartrants</option>
                    <option value="Épaississants & Polymères">Épaississants & Polymères</option>
                    <option value="Solvants & Auxiliaires">Solvants & Auxiliaires</option>
                    <option value="Conservateurs">Conservateurs</option>
                    <option value="Conditionnement & Emballage">Conditionnement & Emballage</option>
                    <option value="Accessoires & Contrôle">Accessoires & Contrôle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Stock initial
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Seuil alerte
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newMatMinStock}
                    onChange={(e) => setNewMatMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Unité
                  </label>
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Coût unitaire (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMatUnitCost}
                    onChange={(e) => setNewMatUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={newMatSupplier}
                    onChange={(e) => setNewMatSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-sm"
                >
                  Enregistrer la matière
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
