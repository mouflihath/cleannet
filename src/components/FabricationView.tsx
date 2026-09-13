import React, { useState, useEffect } from 'react';
import { Product, RawMaterial, FabricationBatch } from '../types';
import {
  Factory,
  Play,
  CheckCircle2,
  AlertTriangle,
  History,
  Beaker,
  Palette,
  Droplets,
  Box,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  Trash2
} from 'lucide-react';

interface FabricationViewProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  batches: FabricationBatch[];
  preselectedProductId?: string | null;
  preselectedBatchSize?: number;
  onExecuteBatch: (newBatch: FabricationBatch, deductions: { materialId: string; amount: number }[]) => void;
  onQuickRestock?: (materialId: string, amount: number) => void;
  onClearHistory?: () => void;
  onActionRecorded?: (subject: string, message: string) => void;
}

interface LastExecutionSummary {
  batchNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  date: string;
  deductions: {
    materialName: string;
    amount: number;
    unit: string;
    beforeStock: number;
    afterStock: number;
  }[];
}

export const FabricationView: React.FC<FabricationViewProps> = ({
  products,
  rawMaterials,
  batches,
  preselectedProductId,
  preselectedBatchSize,
  onExecuteBatch,
  onQuickRestock,
  onClearHistory,
  onActionRecorded,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProductId || products[0]?.id || ''
  );
  const [batchVolume, setBatchVolume] = useState<number>(preselectedBatchSize || 200);
  const [operatorName, setOperatorName] = useState('M. Diallo');
  const [includePackaging, setIncludePackaging] = useState<boolean>(true);
  
  // Custom selection of Colorant and Parfum
  const [selectedColorantId, setSelectedColorantId] = useState<string>('');
  const [selectedParfumId, setSelectedParfumId] = useState<string>('');
  
  // Feedback states
  const [lastExecution, setLastExecution] = useState<LastExecutionSummary | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Lists of available colorants and perfumes
  const availableColorants = rawMaterials.filter(
    (m) => m.category === 'Colorants' || m.name.toLowerCase().includes('colorant')
  );
  const availableParfums = rawMaterials.filter(
    (m) => m.category === 'Parfums & Fragrances' || m.name.toLowerCase().includes('parfum')
  );

  // Sync selected colorant and parfum when product changes
  useEffect(() => {
    if (!activeProduct) return;
    
    // Find if formula has a colorant
    const formulaColorant = activeProduct.formula.find(
      (f) => f.materialName.toLowerCase().includes('colorant') || f.materialId.includes('col')
    );
    if (formulaColorant) {
      setSelectedColorantId(formulaColorant.materialId);
    } else {
      setSelectedColorantId('');
    }

    // Find if formula has a parfum
    const formulaParfum = activeProduct.formula.find(
      (f) => f.materialName.toLowerCase().includes('parfum') || f.materialId.includes('parfum')
    );
    if (formulaParfum) {
      setSelectedParfumId(formulaParfum.materialId);
    } else {
      setSelectedParfumId('');
    }
  }, [selectedProductId, activeProduct]);

  // Determine packaging items to deduct if enabled
  const getPackagingRequirements = () => {
    if (!includePackaging) return [];
    const packagingList: { materialId: string; needed: number }[] = [];

    // Packaging containers
    const pLow = activeProduct.packaging.toLowerCase();
    let containerMat: RawMaterial | undefined;
    let unitsCount = batchVolume;

    if (pLow.includes('750ml') || pLow.includes('750 ml')) {
      containerMat = rawMaterials.find((m) => m.name.toLowerCase().includes('flacon') || m.id === 'rm-emballage');
      unitsCount = Math.ceil(batchVolume / 0.75);
    } else if (pLow.includes('500ml') || pLow.includes('500 ml')) {
      containerMat = rawMaterials.find((m) => m.name.toLowerCase().includes('flacon') || m.id === 'rm-emballage');
      unitsCount = Math.ceil(batchVolume / 0.5);
    } else if (pLow.includes('300ml') || pLow.includes('300 ml')) {
      containerMat = rawMaterials.find((m) => m.name.toLowerCase().includes('spray') || m.id === 'rm-emballage');
      unitsCount = Math.ceil(batchVolume / 0.3);
    } else if (pLow.includes('5l') || pLow.includes('5 l')) {
      containerMat = rawMaterials.find((m) => m.id === 'rm-bidon-5l');
      unitsCount = Math.ceil(batchVolume / 5);
    } else {
      // Default 1L
      containerMat = rawMaterials.find((m) => m.id === 'rm-bidon-1l' || m.name.toLowerCase().includes('bidon'));
      unitsCount = batchVolume;
    }

    if (containerMat) {
      packagingList.push({ materialId: containerMat.id, needed: unitsCount });
    }

    // Labels
    const etiquetteMat = rawMaterials.find((m) => m.id === 'rm-etiquette' || m.name.toLowerCase().includes('étiquette'));
    if (etiquetteMat) {
      packagingList.push({ materialId: etiquetteMat.id, needed: unitsCount });
    }

    return packagingList;
  };

  // Build active requirements list with chosen ingredients
  const rawRequirements = activeProduct.formula.map((f) => {
    let targetMaterialId = f.materialId;
    let targetMaterialName = f.materialName;

    // Check if colorant is customized
    const isColorant = f.materialName.toLowerCase().includes('colorant') || f.materialId.includes('col');
    if (isColorant && selectedColorantId) {
      targetMaterialId = selectedColorantId;
      const colMat = rawMaterials.find((m) => m.id === selectedColorantId);
      if (colMat) targetMaterialName = colMat.name;
    }

    // Check if parfum is customized
    const isParfum = f.materialName.toLowerCase().includes('parfum') || f.materialId.includes('parfum');
    if (isParfum && selectedParfumId) {
      targetMaterialId = selectedParfumId;
      const prfMat = rawMaterials.find((m) => m.id === selectedParfumId);
      if (prfMat) targetMaterialName = prfMat.name;
    }

    const rawMaterial = rawMaterials.find((m) => m.id === targetMaterialId);
    const referenceAmount = f.referenceQuantity ?? f.percentage;
    const neededInFormulaUnit = Number((f.referenceQuantity
      ? referenceAmount * (batchVolume / (activeProduct.formulaBaseVolume || 100))
      : (referenceAmount / 100) * batchVolume).toFixed(2));
    const needed = ['g', 'ml'].includes(f.unit) ? neededInFormulaUnit / 1000 : neededInFormulaUnit;
    const currentBaseStock = rawMaterial ? rawMaterial.currentStock : 0;
    const isSufficient = currentBaseStock >= needed;
    const remainingBaseStock = Math.max(0, Number((currentBaseStock - needed).toFixed(2)));
    const deficit = Math.max(0, Number((needed - currentBaseStock).toFixed(2)));

    return {
      materialId: targetMaterialId,
      materialName: targetMaterialName,
      unit: rawMaterial?.unit || f.unit,
      needed,
      currentBaseStock,
      remainingBaseStock,
      isSufficient,
      deficit,
      isVariable: isColorant ? 'colorant' : isParfum ? 'parfum' : null,
    };
  });

  // Append packaging requirements if active
  const packagingItems = getPackagingRequirements().map((pkg) => {
    const rawMaterial = rawMaterials.find((m) => m.id === pkg.materialId);
    const currentBaseStock = rawMaterial ? rawMaterial.currentStock : 0;
    const isSufficient = currentBaseStock >= pkg.needed;
    const remainingBaseStock = Math.max(0, currentBaseStock - pkg.needed);
    const deficit = Math.max(0, pkg.needed - currentBaseStock);

    return {
      materialId: pkg.materialId,
      materialName: rawMaterial ? rawMaterial.name : 'Conditionnement',
      unit: rawMaterial?.unit || 'unité',
      needed: pkg.needed,
      currentBaseStock,
      remainingBaseStock,
      isSufficient,
      deficit,
      isVariable: 'packaging',
    };
  });

  const requirements = [...rawRequirements, ...packagingItems];

  const canProduce = requirements.every((r) => r.isSufficient);
  const estimatedCost = activeProduct.costPerUnit * batchVolume;

  const handleLaunchProduction = () => {
    if (!canProduce) return;

    const newBatch: FabricationBatch = {
      id: `bat-${Date.now()}`,
      batchNumber: `LOT-${new Date().getFullYear()}-${String(batches.length + 43).padStart(3, '0')}`,
      productId: activeProduct.id,
      productName: activeProduct.name,
      quantity: batchVolume,
      unit: 'Litres',
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'completed',
      totalCost: estimatedCost,
      operator: operatorName,
      deductions: requirements.map((r) => ({
        materialId: r.materialId,
        materialName: r.materialName,
        amount: r.needed,
        unit: r.unit,
      })),
    };

    const deductions = requirements.map((r) => ({
      materialId: r.materialId,
      amount: r.needed,
    }));

    // Perform deduction in App state
    onExecuteBatch(newBatch, deductions);
    onActionRecorded?.('CleanNet - fabrication enregistrée', `Fabrication enregistrée : ${batchVolume} L de ${activeProduct.name}, lot ${newBatch.batchNumber}, le ${newBatch.date}.`);

    // Save detailed execution summary for transparency
    const summaryData: LastExecutionSummary = {
      batchNumber: newBatch.batchNumber,
      productName: activeProduct.name,
      quantity: batchVolume,
      unit: 'Litres',
      date: newBatch.date,
      deductions: requirements.map((r) => ({
        materialName: r.materialName,
        amount: r.needed,
        unit: r.unit,
        beforeStock: r.currentBaseStock,
        afterStock: r.remainingBaseStock,
      })),
    };

    setLastExecution(summaryData);
    setFeedbackSuccess(
      `✓ Fabrication validée ! Le lot ${newBatch.batchNumber} (${batchVolume} L de ${activeProduct.name}) a été produit. Les ${requirements.length} éléments sélectionnés ont été rigoureusement réduits de votre stock de base.`
    );

    // Auto clear alert banner after 8 seconds (retaining modal details)
    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 8000);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="pb-6 mb-8 border-b border-stone-200/80">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
          Fabrication
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Ordonnancement d’atelier, sélection des formules & déduction automatique des matières utilisées sur les stocks de base
        </p>
      </div>

      {/* Success Notification Banner */}
      {feedbackSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start space-x-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">{feedbackSuccess}</span>
            <span className="text-xs text-emerald-700">
              Vérifiez ci-dessous le bilan comparatif des stocks avant et après fabrication.
            </span>
          </div>
        </div>
      )}

      {/* Detailed Deduction Breakdown Report (after fabrication validation) */}
      {lastExecution && (
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Bilan d'exécution en temps réel
              </span>
              <h2 className="text-base font-bold text-stone-900 mt-1">
                Déduction effective sur le stock de base — Lot {lastExecution.batchNumber}
              </h2>
            </div>
            <button
              onClick={() => setLastExecution(null)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Fermer le bilan
            </button>
          </div>

          <p className="text-xs text-stone-600">
            Les matières premières ci-dessous ont été consommées pour fabriquer{' '}
            <strong>{lastExecution.quantity} {lastExecution.unit}</strong> de{' '}
            <strong>{lastExecution.productName}</strong> et réduites directement du stock physique :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lastExecution.deductions.map((d, i) => (
              <div
                key={i}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs space-y-1"
              >
                <span className="font-medium text-stone-800 block truncate" title={d.materialName}>
                  {d.materialName}
                </span>
                <div className="flex items-center justify-between text-stone-500 pt-0.5">
                  <span>Prélevé :</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    -{d.amount} {d.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200/60 pt-1 text-stone-700">
                  <span className="text-[11px] text-stone-400">
                    {d.beforeStock} {d.unit} ➔
                  </span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {d.afterStock} {d.unit} restant
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Batch Configuration & Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-stone-900 flex items-center space-x-2">
              <Factory className="w-5 h-5 text-stone-700" />
              <span>Configuration du lot de fabrication</span>
            </h2>

            {/* Product selection */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Produit CleanNet à confectionner
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-none focus:border-stone-400"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch volume */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Volume de cuve prévu (Litres)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[50, 100, 250, 500].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setBatchVolume(vol)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      batchVolume === vol
                        ? 'bg-stone-900 text-stone-50 border-stone-900'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {vol} L
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="10"
                step="10"
                value={batchVolume}
                onChange={(e) => setBatchVolume(Math.max(1, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Interactive Ingredient Customization: Colorant */}
            {selectedColorantId && (
              <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2">
                <label className="block text-xs font-medium text-stone-700 flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-stone-500" />
                  <span>Nuance du colorant à utiliser</span>
                </label>
                <select
                  value={selectedColorantId}
                  onChange={(e) => setSelectedColorantId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  {availableColorants.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} (Stock : {col.currentStock} {col.unit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Interactive Ingredient Customization: Parfum */}
            {selectedParfumId && (
              <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2">
                <label className="block text-xs font-medium text-stone-700 flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-stone-500" />
                  <span>Fragrance & senteur du parfum</span>
                </label>
                <select
                  value={selectedParfumId}
                  onChange={(e) => setSelectedParfumId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  {availableParfums.map((prf) => (
                    <option key={prf.id} value={prf.id}>
                      {prf.name} (Stock : {prf.currentStock} {prf.unit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Packaging deduction toggle */}
            <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-medium text-stone-800 flex items-center space-x-1.5">
                  <Box className="w-4 h-4 text-stone-500" />
                  <span>Déduire aussi les emballages</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  {activeProduct.packaging} + Étiquettes CleanNet
                </p>
              </div>
              <input
                type="checkbox"
                checked={includePackaging}
                onChange={(e) => setIncludePackaging(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
              />
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Opérateur d'atelier responsable
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Production Summary Card */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-2">
              <div className="flex justify-between text-stone-500">
                <span>Coût de revient estimé :</span>
                <span className="font-medium text-stone-800">{activeProduct.costPerUnit} FCFA / L</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Coût total estimé du lot :</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {estimatedCost.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-200/60">
                <span>État des stocks de base :</span>
                {canProduce ? (
                  <span className="inline-flex items-center text-emerald-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Stocks suffisants ({requirements.length} éléments)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                    Matières insuffisantes
                  </span>
                )}
              </div>
            </div>

            {/* Launch Production Button */}
            <button
              onClick={handleLaunchProduction}
              disabled={!canProduce}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm ${
                canProduce
                  ? 'bg-stone-900 hover:bg-stone-800 text-stone-50'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Valider & déduire du stock de base</span>
            </button>
          </div>
        </div>

        {/* Right: Live Stock Deduction Table & Batch History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-Time Stock Impact Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  Contrôle & Impact sur le stock de base
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Calcul en direct pour {batchVolume} L de {activeProduct.name}
                </p>
              </div>
              <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full self-start sm:self-auto font-medium">
                {requirements.length} éléments engagés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                    <th className="pb-2 font-medium">Composant</th>
                    <th className="pb-2 font-medium text-right">Stock de base</th>
                    <th className="pb-2 font-medium text-right">Prélèvement</th>
                    <th className="pb-2 font-medium text-right">Stock restant</th>
                    <th className="pb-2 font-medium text-center">Disponibilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {requirements.map((req, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 font-medium text-stone-800">
                        <div className="space-y-0.5">
                          <span className="block">{req.materialName}</span>
                          {req.isVariable === 'colorant' && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-normal">
                              Colorant sélectionné
                            </span>
                          )}
                          {req.isVariable === 'parfum' && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-normal">
                              Parfum sélectionné
                            </span>
                          )}
                          {req.isVariable === 'packaging' && (
                            <span className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded font-normal">
                              Conditionnement
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Current Base Stock */}
                      <td className="py-3 text-right font-mono text-stone-700">
                        {req.currentBaseStock} {req.unit}
                      </td>

                      {/* Required / Deduction */}
                      <td className="py-3 text-right font-mono font-semibold text-rose-600">
                        -{req.needed} {req.unit}
                      </td>

                      {/* Remaining Base Stock */}
                      <td className="py-3 text-right font-mono font-bold text-stone-900">
                        {req.remainingBaseStock} {req.unit}
                      </td>

                      {/* Status / Quick Action */}
                      <td className="py-3 text-center">
                        {req.isSufficient ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Disponible
                          </span>
                        ) : (
                          <div className="flex items-center justify-center space-x-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                              Manque {req.deficit} {req.unit}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* History of Completed Batches */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-base font-semibold text-stone-900 flex items-center space-x-2">
                <History className="w-4 h-4 text-stone-500" />
                <span>Historique des fabrications & traçabilité</span>
              </h3>
              {onClearHistory && batches.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider l’historique</span>
                </button>
              )}
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Chaque lot consigné a déduit ses matières premières correspondantes du stock d'atelier
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                    <th className="pb-2 font-medium">N° de Lot</th>
                    <th className="pb-2 font-medium">Produit</th>
                    <th className="pb-2 font-medium">Volume</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium text-right">Coût</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">Aucune fabrication enregistrée.</td>
                    </tr>
                  ) : batches.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 font-mono font-medium text-stone-800">{b.batchNumber}</td>
                      <td className="py-2.5 text-stone-700 font-medium">{b.productName}</td>
                      <td className="py-2.5 text-stone-600">{b.quantity} {b.unit}</td>
                      <td className="py-2.5 text-stone-400">{b.date}</td>
                      <td className="py-2.5 text-right font-mono text-stone-800 font-medium">
                        {b.totalCost.toLocaleString('fr-FR')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
