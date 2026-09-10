import React, { useState } from 'react';
import { RawMaterial, PurchaseOrder, PurchaseOrderItem } from '../types';
import { ShoppingCart, Plus, Check, Clock, Building2, PackageCheck } from 'lucide-react';

interface AchatsViewProps {
  purchaseOrders: PurchaseOrder[];
  rawMaterials: RawMaterial[];
  onCreateOrder: (order: PurchaseOrder, autoCredit?: boolean) => void;
  onReceiveOrder: (orderId: string) => void;
  targetMaterialId?: string | null;
}

export const AchatsView: React.FC<AchatsViewProps> = ({
  purchaseOrders,
  rawMaterials,
  onCreateOrder,
  onReceiveOrder,
  targetMaterialId,
}) => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(Boolean(targetMaterialId));
  const [selectedSupplier, setSelectedSupplier] = useState('BioChimie Solutions');
  const [selectedMaterialId, setSelectedMaterialId] = useState(targetMaterialId || rawMaterials[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [autoCredit, setAutoCredit] = useState<boolean>(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const suppliers = Array.from(new Set(rawMaterials.map((m) => m.supplier)));
  const selectedMaterial = rawMaterials.find((m) => m.id === selectedMaterialId) || rawMaterials[0];

  const currentStock = selectedMaterial ? selectedMaterial.currentStock : 0;
  const newStockPreview = currentStock + (Number(quantity) || 0);
  const unitCost = selectedMaterial ? selectedMaterial.unitCost : 0;
  const totalCost = unitCost * (Number(quantity) || 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    const newItem: PurchaseOrderItem = {
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      quantity,
      unit: selectedMaterial.unit,
      unitCost,
      totalCost,
    };

    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNumber: `CMD-2026-${String(purchaseOrders.length + 19).padStart(3, '0')}`,
      supplier: selectedSupplier,
      date: new Date().toLocaleDateString('fr-FR'),
      items: [newItem],
      totalAmount: totalCost,
      status: autoCredit ? 'received' : 'pending',
    };

    onCreateOrder(newOrder, autoCredit);
    setShowNewOrderModal(false);

    if (autoCredit) {
      setFeedbackSuccess(
        `✓ Achat validé et réceptionné ! +${quantity} ${selectedMaterial.unit} ont été directement ajoutés au stock de "${selectedMaterial.name}". Le stock passe de ${currentStock} à ${newStockPreview} ${selectedMaterial.unit}.`
      );
    } else {
      setFeedbackSuccess(
        `✓ Bon de commande ${newOrder.orderNumber} créé en attente de livraison pour ${selectedMaterial.name}.`
      );
    }
    setTimeout(() => setFeedbackSuccess(null), 6000);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-stone-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            Achats et approvisionnements
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Gestion des commandes de matières premières chimiques, contenants et solvants
          </p>
        </div>

        <button
          onClick={() => setShowNewOrderModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un bon de commande</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center space-x-3 shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{feedbackSuccess}</span>
        </div>
      )}

      {/* Modal / Quick Creation Form */}
      {showNewOrderModal && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-stone-200 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Nouveau bon de commande fournisseur
              </h2>
              <p className="text-xs text-stone-500">
                Les quantités achetées sont automatiquement créditées à votre stock de base dès validation.
              </p>
            </div>
            <button
              onClick={() => setShowNewOrderModal(false)}
              className="text-stone-400 hover:text-stone-700 text-sm"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Fournisseur agréé
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  {suppliers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Matière première / Emballage
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400 font-medium"
                >
                  {rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — Stock actuel : {m.currentStock} {m.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Quantité à acheter ({selectedMaterial?.unit || 'unités'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-stone-400 font-medium"
                />
              </div>
            </div>

            {/* Live Stock & Cost Calculation Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-stone-500">Stock de base avant achat :</span>
                <span className="font-semibold text-stone-800 font-mono">
                  {currentStock} {selectedMaterial?.unit}
                </span>
                <span className="text-stone-400">➔</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  +{quantity} {selectedMaterial?.unit}
                </span>
                <span className="text-stone-400">=</span>
                <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono">
                  Nouveau stock : {newStockPreview} {selectedMaterial?.unit}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-right self-end md:self-auto">
                <span className="text-stone-500">Montant :</span>
                <span className="font-semibold text-stone-900 font-mono text-sm">
                  {totalCost.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Auto credit checkbox & submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCredit}
                  onChange={(e) => setAutoCredit(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <span className="font-medium">
                  Ajouter et créditer immédiatement au stock disponible à la validation
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shadow-sm"
              >
                Valider l'achat & créditer le stock (+{quantity} {selectedMaterial?.unit})
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {purchaseOrders.map((order) => {
          const isReceived = order.status === 'received';
          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-medium text-stone-900 text-sm">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-stone-400">• {order.date}</span>
                  {isReceived ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <Check className="w-3 h-3 mr-1" />
                      Réceptionné en stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Clock className="w-3 h-3 mr-1" />
                      En attente de livraison
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-600 flex items-center space-x-2 pt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-medium text-stone-800">{order.supplier}</span>
                </div>

                <div className="text-xs text-stone-500 pt-1">
                  {order.items.map((it, idx) => (
                    <span key={idx}>
                      {it.quantity} {it.unit} de <strong>{it.materialName}</strong> ({it.totalCost.toLocaleString('fr-FR')} FCFA)
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Total commande</span>
                  <span className="font-mono font-medium text-stone-900 text-sm">
                    {order.totalAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                {!isReceived && (
                  <button
                    onClick={() => {
                      onReceiveOrder(order.id);
                      setFeedbackSuccess(`✓ Commande ${order.orderNumber} réceptionnée et stocks crédités avec succès !`);
                      setTimeout(() => setFeedbackSuccess(null), 5000);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-300 text-stone-800 hover:bg-stone-900 hover:text-white transition-colors flex items-center space-x-1.5 shadow-2xs"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Réceptionner (+créditer stock)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
