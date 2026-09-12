import React, { useState, useEffect } from 'react';
import { NavTab, Product, RawMaterial, FabricationBatch, PurchaseOrder } from './types';
import { initialProducts, initialRawMaterials, initialFabricationBatches, initialPurchaseOrders } from './data/initialData';
import { Header } from './components/Header';
import { AccueilView } from './components/AccueilView';
import { ProduitsFormulesView } from './components/ProduitsFormulesView';
import { MatieresPremieresView } from './components/MatieresPremieresView';
import { FabricationView } from './components/FabricationView';
import { AchatsView } from './components/AchatsView';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');

  // Dynamic state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cleannet_products_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return initialProducts;
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('cleannet_rawmaterials_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 35) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return initialRawMaterials;
  });

  const [batches, setBatches] = useState<FabricationBatch[]>(() => {
    const saved = localStorage.getItem('cleannet_batches_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialFabricationBatches;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('cleannet_orders_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return initialPurchaseOrders;
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [fabricationPreset, setFabricationPreset] = useState<{ productId: string; batchSize: number } | null>(null);
  const [targetPurchaseMaterialId, setTargetPurchaseMaterialId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cleannet_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cleannet_rawmaterials_v2', JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    localStorage.setItem('cleannet_batches_v2', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('cleannet_orders_v2', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // Interaction 9: Clic sur une carte produit depuis l'Accueil -> ouvre la fiche correspondante dans "Produits et formules"
  const handleProductCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab('produits');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to fabrication with preset from product formula sheet
  const handleGoToFabrication = (productId: string, batchSize: number) => {
    setFabricationPreset({ productId, batchSize });
    setActiveTab('fabrication');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to purchases from raw materials low-stock alert
  const handleGoToAchatsWithMaterial = (materialId: string) => {
    setTargetPurchaseMaterialId(materialId);
    setActiveTab('achats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic Product Management
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  // Dynamic Raw Materials Management
  const handleAddRawMaterial = (newMaterial: RawMaterial) => {
    setRawMaterials((prev) => [...prev, newMaterial]);
  };

  // Update raw material details dynamically
  const handleUpdateMaterial = (updatedMaterial: RawMaterial) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === updatedMaterial.id ? updatedMaterial : m))
    );
  };

  // Delete raw material dynamically
  const handleDeleteMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Update raw material stock directly
  const handleUpdateStock = (id: string, newStock: number) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, currentStock: Math.max(0, Number(newStock.toFixed(2))) } : m))
    );
  };

  // Execute a fabrication batch and automatically deduct raw materials
  const handleExecuteBatch = (
    newBatch: FabricationBatch,
    deductions: { materialId: string; amount: number }[]
  ) => {
    setBatches((prev) => [newBatch, ...prev]);

    setRawMaterials((prev) =>
      prev.map((mat) => {
        const deduction = deductions.find((d) => d.materialId === mat.id);
        if (deduction) {
          return {
            ...mat,
            currentStock: Math.max(0, Number((mat.currentStock - deduction.amount).toFixed(2))),
          };
        }
        return mat;
      })
    );
  };

  // Quick restock for a material (used in fabrication view if deficit occurs)
  const handleQuickRestock = (materialId: string, amount: number) => {
    setRawMaterials((prev) =>
      prev.map((mat) =>
        mat.id === materialId
          ? { ...mat, currentStock: Number((mat.currentStock + amount).toFixed(2)) }
          : mat
      )
    );
  };

  // Create a new purchase order and immediately credit stock if autoCredit is true
  const handleCreateOrder = (newOrder: PurchaseOrder, autoCredit: boolean = true) => {
    setPurchaseOrders((prev) => [newOrder, ...prev]);

    if (autoCredit || newOrder.status === 'received') {
      setRawMaterials((prev) =>
        prev.map((mat) => {
          const item = newOrder.items.find((it) => it.materialId === mat.id);
          if (item) {
            return {
              ...mat,
              currentStock: Number((mat.currentStock + item.quantity).toFixed(2)),
            };
          }
          return mat;
        })
      );
    }
  };

  // Receive a purchase order and credit the inventory
  const handleReceiveOrder = (orderId: string) => {
    const order = purchaseOrders.find((o) => o.id === orderId);
    if (!order || order.status === 'received') return;

    setPurchaseOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'received' as const } : o))
    );

    // Credit stocks
    setRawMaterials((prev) =>
      prev.map((mat) => {
        const item = order.items.find((it) => it.materialId === mat.id);
        if (item) {
          return {
            ...mat,
            currentStock: Number((mat.currentStock + item.quantity).toFixed(2)),
          };
        }
        return mat;
      })
    );
  };

  // Reset to CleanNet baseline data
  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser les données CleanNet aux valeurs par défaut ?')) {
      localStorage.removeItem('cleannet_products_v2');
      localStorage.removeItem('cleannet_rawmaterials_v2');
      localStorage.removeItem('cleannet_batches_v2');
      localStorage.removeItem('cleannet_orders_v2');
      setProducts(initialProducts);
      setRawMaterials(initialRawMaterials);
      setBatches(initialFabricationBatches);
      setPurchaseOrders(initialPurchaseOrders);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-stone-800 flex flex-col font-sans selection:bg-stone-200">
      {/* Barre de navigation institutionnelle CleanNet */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Vues de l'application */}
      <main className="flex-grow">
        {activeTab === 'accueil' && (
          <AccueilView
            products={products}
            onSelectProduct={handleProductCardClick}
          />
        )}

        {activeTab === 'produits' && (
          <ProduitsFormulesView
            products={products}
            rawMaterials={rawMaterials}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
            onGoToFabrication={handleGoToFabrication}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        )}

        {activeTab === 'matieres' && (
          <MatieresPremieresView
            rawMaterials={rawMaterials}
            onUpdateStock={handleUpdateStock}
            onAddMaterial={handleAddRawMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onGoToAchatsWithMaterial={handleGoToAchatsWithMaterial}
          />
        )}

        {activeTab === 'fabrication' && (
          <FabricationView
            products={products}
            rawMaterials={rawMaterials}
            batches={batches}
            preselectedProductId={fabricationPreset?.productId}
            preselectedBatchSize={fabricationPreset?.batchSize}
            onExecuteBatch={handleExecuteBatch}
            onQuickRestock={handleQuickRestock}
          />
        )}

        {activeTab === 'achats' && (
          <AchatsView
            purchaseOrders={purchaseOrders}
            rawMaterials={rawMaterials}
            onCreateOrder={handleCreateOrder}
            onReceiveOrder={handleReceiveOrder}
            targetMaterialId={targetPurchaseMaterialId}
          />
        )}
      </main>

      {/* Pied de page sobre et épuré avec mention CleanNet */}
      <footer className="border-t border-stone-200/80 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="CleanNet Logo"
              referrerPolicy="no-referrer"
              className="h-7 w-auto object-contain"
            />
            <span className="font-bold tracking-tight text-stone-900">
              Clean<span className="text-amber-500">Net</span>
            </span>
            <span className="text-stone-300">|</span>
            <span>Solutions de nettoyage et hygiène professionnelle</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-stone-400">Application dynamique &amp; interactive</span>
            <button
              onClick={handleResetData}
              className="inline-flex items-center space-x-1 text-stone-400 hover:text-stone-700 transition-colors"
              title="Réinitialiser les données aux valeurs d'origine"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
