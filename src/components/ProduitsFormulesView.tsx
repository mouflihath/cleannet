import React, { useState } from 'react';
import { Product, RawMaterial, FormulaItem } from '../types';
import { Calculator, Beaker, ShieldCheck, Layers, Plus, Edit2, Check, X, Trash2, ArrowRight } from 'lucide-react';
import { ProductCarousel } from './ProductCarousel';

interface ProduitsFormulesViewProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string | null) => void;
  onGoToFabrication: (productId: string, batchSize: number) => void;
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
}

export const ProduitsFormulesView: React.FC<ProduitsFormulesViewProps> = ({
  products,
  rawMaterials,
  selectedProductId,
  onSelectProduct,
  onGoToFabrication,
  onAddProduct,
  onUpdateProduct,
}) => {
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0] || null;
  const [calcVolume, setCalcVolume] = useState<number>(100);

  // Modal State for adding/editing product
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(1500);
  const [formUnit, setFormUnit] = useState('bidon 1L');
  const [formPriceFormatted, setFormPriceFormatted] = useState('1 500 FCFA / L');
  const [formDescription, setFormDescription] = useState('');
  const [formPh, setFormPh] = useState('7.0');
  const [formPackaging, setFormPackaging] = useState('Bidon 1L CleanNet');
  const [formShelfLife, setFormShelfLife] = useState('24 mois');
  const [formCostPerUnit, setFormCostPerUnit] = useState<number>(500);
  const [formFormula, setFormFormula] = useState<FormulaItem[]>([]);
  const [formImages, setFormImages] = useState('');

  // Open modal for new product
  const handleOpenNewModal = () => {
    setIsEditing(false);
    setFormName('');
    setFormCategory('Entretien ménager');
    setFormUnitPrice(1500);
    setFormUnit('bidon 1L');
    setFormPriceFormatted('1 500 FCFA / 1L');
    setFormDescription('Formule nettoyante active haute performance CleanNet.');
    setFormPh('7.0');
    setFormPackaging('Bidon de 1L avec bouchon verseur + Étiquette CleanNet');
    setFormShelfLife('24 mois');
    setFormCostPerUnit(550);
    setFormImages('');
    // Initial formula template
    const defaultWater = rawMaterials.find(m => m.id === 'rm-eau-demineralisee');
    setFormFormula([
      {
        materialId: defaultWater?.id || rawMaterials[0]?.id || '',
        materialName: defaultWater?.name || rawMaterials[0]?.name || '',
        percentage: 80,
        unit: 'L',
      },
    ]);
    setShowProductModal(true);
  };

  // Open modal for editing active product
  const handleOpenEditModal = () => {
    if (!activeProduct) return;
    setIsEditing(true);
    setFormName(activeProduct.name);
    setFormCategory(activeProduct.category);
    setFormUnitPrice(activeProduct.unitPrice);
    setFormUnit(activeProduct.unit);
    setFormPriceFormatted(activeProduct.priceFormatted);
    setFormDescription(activeProduct.description);
    setFormPh(activeProduct.ph);
    setFormPackaging(activeProduct.packaging);
    setFormShelfLife(activeProduct.shelfLife);
    setFormCostPerUnit(activeProduct.costPerUnit);
    setFormFormula([...activeProduct.formula]);
    setFormImages((activeProduct.images || [activeProduct.image]).join('\n'));
    setShowProductModal(true);
  };

  const handleAddFormulaRow = () => {
    if (rawMaterials.length === 0) return;
    const firstMat = rawMaterials[0];
    setFormFormula([
      ...formFormula,
      {
        materialId: firstMat.id,
        materialName: firstMat.name,
        percentage: 5,
        unit: firstMat.unit,
      },
    ]);
  };

  const handleRemoveFormulaRow = (index: number) => {
    setFormFormula(formFormula.filter((_, i) => i !== index));
  };

  const handleFormulaChange = (index: number, field: 'materialId' | 'percentage', value: any) => {
    const updated = [...formFormula];
    if (field === 'materialId') {
      const selectedMat = rawMaterials.find((m) => m.id === value);
      if (selectedMat) {
        updated[index].materialId = selectedMat.id;
        updated[index].materialName = selectedMat.name;
        updated[index].unit = selectedMat.unit;
      }
    } else if (field === 'percentage') {
      updated[index].percentage = Number(value) || 0;
    }
    setFormFormula(updated);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isEditing && activeProduct) {
      const updated: Product = {
        ...activeProduct,
        name: formName.trim(),
        category: formCategory.trim(),
        unitPrice: Number(formUnitPrice) || 0,
        unit: formUnit.trim(),
        priceFormatted: formPriceFormatted.trim() || `${formUnitPrice} FCFA`,
        description: formDescription.trim(),
        ph: formPh.trim(),
        packaging: formPackaging.trim(),
        shelfLife: formShelfLife.trim(),
        costPerUnit: Number(formCostPerUnit) || 0,
        formula: formFormula,
        images: formImages.split('\n').map((url) => url.trim()).filter(Boolean),
      };
      onUpdateProduct(updated);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        image: activeProduct?.image || '',
        images: formImages.split('\n').map((url) => url.trim()).filter(Boolean),
        unitPrice: Number(formUnitPrice) || 0,
        unit: formUnit.trim(),
        priceFormatted: formPriceFormatted.trim() || `${formUnitPrice} FCFA`,
        category: formCategory.trim(),
        description: formDescription.trim(),
        ph: formPh.trim(),
        packaging: formPackaging.trim(),
        shelfLife: formShelfLife.trim(),
        costPerUnit: Number(formCostPerUnit) || 0,
        formula: formFormula,
      };
      onAddProduct(newProduct);
      onSelectProduct(newProduct.id);
    }

    setShowProductModal(false);
  };

  if (!activeProduct) {
    return (
      <div className="py-12 max-w-4xl mx-auto text-center">
        <p className="text-stone-500">Aucun produit configuré.</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section with product selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-stone-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Produits et formules
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Fiches techniques, composition galénique et calcul de dosage de fabrication ({products.length} produits)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewModal}
            id="btn-open-add-product"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      {/* Product selector buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {products.map((p) => {
          const isSelected = p.id === activeProduct.id;
          return (
            <button
              key={p.id}
              id={`btn-select-product-${p.id}`}
              onClick={() => onSelectProduct(p.id)}
              className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl transition-all ${
                isSelected
                  ? 'bg-stone-900 text-stone-50 font-medium shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Main product technical sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column: Product Visual & Key Specs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <div className="aspect-[3/4] w-full rounded-xl bg-[#F6F6F4] overflow-hidden mb-6 flex items-center justify-center">
              {activeProduct.image ? (
                <ProductCarousel
                  name={activeProduct.name}
                  image={activeProduct.image}
                  images={activeProduct.images}
                />
              ) : (
                <div className="text-center p-6 text-stone-400">
                  <Beaker className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Produit personnalisé CleanNet</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  {activeProduct.category}
                </span>
                <span className="text-base font-semibold text-stone-900">
                  {activeProduct.priceFormatted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-stone-900">
                  {activeProduct.name}
                </h2>
                <button
                  onClick={handleOpenEditModal}
                  className="text-stone-400 hover:text-stone-800 p-1.5 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors"
                  title="Modifier la formule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-50/80 p-3 rounded-xl">
                <span className="text-stone-400 block mb-1">Coût de revient estimé</span>
                <span className="text-stone-900 font-semibold text-sm">
                  {activeProduct.costPerUnit} FCFA / {activeProduct.unit}
                </span>
              </div>
              <div className="bg-stone-50/80 p-3 rounded-xl">
                <span className="text-stone-400 block mb-1">Marge brute indicative</span>
                <span className="text-stone-900 font-semibold text-sm">
                  {Math.round(((activeProduct.unitPrice - activeProduct.costPerUnit) / (activeProduct.unitPrice || 1)) * 100)} %
                </span>
              </div>
            </div>

            <button
              onClick={() => onGoToFabrication(activeProduct.id, calcVolume)}
              className="mt-6 w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <Beaker className="w-4 h-4 text-stone-300" />
              <span>Lancer la fabrication ({calcVolume} L)</span>
            </button>
          </div>

          {/* Technical Specs Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-medium text-stone-900 tracking-tight flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span>Spécifications techniques</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">pH direct</span>
                <span className="font-medium text-stone-800">{activeProduct.ph}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Conditionnement</span>
                <span className="font-medium text-stone-800 text-right max-w-[200px]">{activeProduct.packaging}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">DLUO / Conservation</span>
                <span className="font-medium text-stone-800">{activeProduct.shelfLife}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-stone-500">Label de qualité</span>
                <span className="font-medium text-stone-800">CleanNet Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Formula & Interactive Batch Simulation */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Formula Table Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-2">
              <div>
                <h3 className="text-lg font-medium text-stone-900 tracking-tight flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-stone-500" />
                  <span>Formule de composition standard (Base 100%)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Quantités de référence pour {activeProduct.name}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                  {activeProduct.formula.length} matières
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2"
                >
                  Modifier
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-stone-500 uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="pb-3 font-medium">Matière première</th>
                    <th className="pb-3 font-medium text-right">Quantité de référence</th>
                    <th className="pb-3 font-medium text-right">Unité</th>
                    <th className="pb-3 font-medium text-right">Stock actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeProduct.formula.map((item, idx) => {
                    const material = rawMaterials.find((m) => m.id === item.materialId);
                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-3 font-medium text-stone-800">
                          {item.materialName}
                        </td>
                        <td className="py-3 text-right font-mono text-stone-900 font-semibold">
                          {item.referenceQuantity ?? `${item.percentage} %`}
                        </td>
                        <td className="py-3 text-right text-stone-500 text-xs">
                          {item.unit}
                        </td>
                        <td className="py-3 text-right text-xs">
                          {material ? (
                            <span className={material.currentStock <= material.minStock ? 'text-amber-600 font-medium' : 'text-stone-600'}>
                              {material.currentStock} {material.unit}
                            </span>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Batch Simulator */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
              <div>
                <h3 className="text-lg font-medium text-stone-900 tracking-tight flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-stone-500" />
                  <span>Calculateur de dosage dynamique</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ajustez le volume souhaité pour obtenir en temps réel les quantités requises
                </p>
              </div>

              {/* Volume selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-stone-600">Volume :</span>
                {[50, 100, 250, 500, 1000].map((vol) => (
                  <button
                    key={vol}
                    onClick={() => setCalcVolume(vol)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      calcVolume === vol
                        ? 'bg-stone-900 text-stone-50 font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {vol}L
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-center font-medium focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>

            {/* Calculated recipe requirements */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-stone-500 uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="pb-3 font-medium">Matière à peser</th>
                    <th className="pb-3 font-medium text-right">Dosage pour {calcVolume} L</th>
                    <th className="pb-3 font-medium text-right">Stock disponible</th>
                    <th className="pb-3 font-medium text-right">Faisabilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeProduct.formula.map((item, idx) => {
                    const requiredAmount = (item.referenceQuantity
                      ? item.referenceQuantity * (calcVolume / (activeProduct.formulaBaseVolume || 100))
                      : (item.percentage / 100) * calcVolume).toFixed(2);
                    const material = rawMaterials.find((m) => m.id === item.materialId);
                    const stockAmount = ['g', 'ml'].includes(item.unit)
                      ? Number(requiredAmount) / 1000
                      : Number(requiredAmount);
                    const isAvailable = material ? material.currentStock >= stockAmount : false;

                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-3 font-medium text-stone-800">
                          {item.materialName}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold text-stone-900">
                          {requiredAmount} {item.unit}
                        </td>
                        <td className="py-3 text-right text-stone-500 text-xs">
                          {material ? `${material.currentStock} ${material.unit}` : 'N/A'}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isAvailable ? 'Suffisant' : 'Rupture'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-stone-500">
                Coût matières estimé du lot : <strong className="text-stone-900 font-semibold">{(activeProduct.costPerUnit * calcVolume).toLocaleString()} FCFA</strong>
              </div>
              <button
                onClick={() => onGoToFabrication(activeProduct.id, calcVolume)}
                className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Transférer vers l'atelier de fabrication</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL : NOUVEAU PRODUIT / MODIFIER PRODUIT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-semibold text-stone-900">
                {isEditing ? `Modifier : ${activeProduct.name}` : 'Créer un nouveau produit CleanNet'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Nettoyant vitres & miroirs"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Entretien ménager"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Prix de vente (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formUnitPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormUnitPrice(val);
                      setFormPriceFormatted(`${val.toLocaleString()} FCFA / ${formUnit}`);
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Conditionnement (Unité)
                  </label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="bidon 1L, flacon 750ml"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Coût de revient estimé
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPerUnit}
                    onChange={(e) => setFormCostPerUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description commerciale
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Images du produit
                </label>
                <textarea
                  rows={3}
                  value={formImages}
                  onChange={(e) => setFormImages(e.target.value)}
                  placeholder="Une URL ou un chemin d'image par ligne"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Ajoutez plusieurs images en les séparant par un retour à la ligne.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    pH direct
                  </label>
                  <input
                    type="text"
                    value={formPh}
                    onChange={(e) => setFormPh(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    DLUO / Durée de conservation
                  </label>
                  <input
                    type="text"
                    value={formShelfLife}
                    onChange={(e) => setFormShelfLife(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Formulation Ingredients Builder */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-stone-800">
                    Composition de la formule (%)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFormulaRow}
                    className="text-xs font-medium text-stone-900 hover:text-stone-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un ingrédient</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formFormula.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <select
                        value={item.materialId}
                        onChange={(e) => handleFormulaChange(idx, 'materialId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      >
                        {rawMaterials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={item.percentage}
                        onChange={(e) => handleFormulaChange(idx, 'percentage', e.target.value)}
                        className="w-20 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-right font-mono"
                        placeholder="%"
                      />
                      <span className="text-xs text-stone-500 w-6">%</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFormulaRow(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-stone-50 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  {isEditing ? 'Enregistrer les modifications' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
