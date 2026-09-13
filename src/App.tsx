import React, { useRef, useState, useEffect } from 'react';
import { NavTab, Product, RawMaterial, FabricationBatch, PurchaseOrder } from './types';
import { initialProducts, initialRawMaterials, initialFabricationBatches, initialPurchaseOrders } from './data/initialData';
import { Header } from './components/Header';
import { AccueilView } from './components/AccueilView';
import { ProduitsFormulesView } from './components/ProduitsFormulesView';
import { MatieresPremieresView } from './components/MatieresPremieresView';
import { FabricationView } from './components/FabricationView';
import { AchatsView } from './components/AchatsView';
import { RotateCcw } from 'lucide-react';

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

const GOOGLE_CLIENT_ID = '362664635286-sfa3cescvt9nu6tltel783rmd4ilht4u.apps.googleusercontent.com';

const accountStorageKey = (name: string, email: string) => `${name}_${encodeURIComponent(email.toLowerCase())}`;

const classifyProduct = (product: Product): Product => {
  const name = product.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  let category = product.category;
  if (name.includes('brillancenet') || name.includes('lave vitre') || name.includes('lave-vitres')) {
    category = 'Lave-vitres';
  } else if (name.includes('eclat net') || name.includes('lave sol') || name.includes('lave-sol')) {
    category = 'Lave-sol';
  } else if (name.includes('main net') || name.includes('lave main') || name.includes('lave-mains')) {
    category = 'Lave-mains';
  } else if (name.includes('wc net') || name.includes('gel wc')) {
    category = 'Gel WC';
  } else if (name.includes('multi') || name.includes('multitache') || name.includes('multi-tache')) {
    category = 'Multi-tâche';
  } else if (name.includes('air net') || name.includes('desodorisant')) {
    category = 'Désodorisant';
  } else if (name.includes('vaisselle net') || name.includes('vaisselle')) {
    category = 'Liquide vaisselle';
  }

  return { ...product, category };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('accueil');
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('cleannet_google_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => (
    localStorage.getItem('cleannet_notifications_enabled') !== 'false'
  ));
  const googleLoginPanelRef = useRef<HTMLDivElement>(null);
  const gmailTokenClient = useRef<{ requestAccessToken: (options?: { prompt?: string }) => void } | null>(null);
  const gmailAccessToken = useRef<string | null>(null);
  const gmailRequestPending = useRef(false);
  const gmailAuthorizationRequested = useRef(false);
  const pendingGmailAction = useRef<{ subject: string; message: string } | null>(null);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const handleGoogleLogin = (credential: string) => {
    try {
      const payload = JSON.parse(atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const user = { name: payload.name || payload.email, email: payload.email, picture: payload.picture };
      setGoogleUser(user);
      localStorage.setItem('cleannet_google_user', JSON.stringify(user));
    } catch {
      setGoogleUser(null);
    }
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    localStorage.removeItem('cleannet_google_user');
    gmailAccessToken.current = null;
    gmailTokenClient.current = null;
    gmailAuthorizationRequested.current = false;
    pendingGmailAction.current = null;
    window.google?.accounts.id.disableAutoSelect();
  };

  useEffect(() => {
    if (!googleUser || !notificationsEnabled || !window.google?.accounts.oauth2 || gmailAuthorizationRequested.current) return;
    gmailAuthorizationRequested.current = true;
    gmailTokenClient.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.send',
      callback: (response) => {
        gmailRequestPending.current = false;
        if (response.access_token) {
          gmailAccessToken.current = response.access_token;
          setActionNotification('Gmail est prêt : vos actions seront enregistrées automatiquement.');
          const pendingAction = pendingGmailAction.current;
          pendingGmailAction.current = null;
          if (pendingAction) void sendGmailMessage(response.access_token, pendingAction);
          window.setTimeout(() => setActionNotification(null), 5000);
        }
      },
    });
  }, [googleUser, notificationsEnabled]);

  const sendGmailMessage = async (accessToken: string, action: { subject: string; message: string }) => {
    if (!googleUser) return;
    const rawMessage = [`To: ${googleUser.email}`, 'Content-Type: text/plain; charset="UTF-8"', `Subject: ${action.subject}`, '', action.message].join('\r\n');
    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    setActionNotification('Enregistrement de l’action dans votre Gmail...');
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encodedMessage }),
      });
      setActionNotification(response.ok ? 'Action ajoutée dans votre Gmail.' : 'Gmail n’a pas accepté l’action.');
    } catch {
      setActionNotification('Gmail est momentanément indisponible.');
    }
    window.setTimeout(() => setActionNotification(null), 5000);
  };

  const notifyByGmail = (subject: string, message: string) => {
    pendingGmailAction.current = { subject, message };
    if (!googleUser || !notificationsEnabled || !gmailTokenClient.current) {
      setActionNotification('Connectez-vous à Google et autorisez Gmail une seule fois pour activer la sauvegarde automatique.');
      return;
    }
    pendingGmailAction.current = { subject, message };
    if (gmailRequestPending.current) return;
    gmailAccessToken.current = null;
    gmailRequestPending.current = true;
    gmailTokenClient.current.requestAccessToken({ prompt: 'consent' });
    setActionNotification('Autorisez Gmail pour enregistrer cette action.');
  };

  // Dynamic state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cleannet_products_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 7) return parsed.map(classifyProduct);
      } catch (e) {
        // ignore
      }
    }
    return initialProducts;
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('cleannet_rawmaterials_v3');
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

  useEffect(() => {
    if (!googleUser) return;
    const readAccountData = <T,>(name: string, fallback: T): T => {
      const saved = localStorage.getItem(accountStorageKey(name, googleUser.email));
      if (!saved) return fallback;
      try {
        return JSON.parse(saved) as T;
      } catch {
        return fallback;
      }
    };

    setProducts(readAccountData<Product[]>('cleannet_products', initialProducts).map(classifyProduct));
    setRawMaterials(readAccountData('cleannet_rawmaterials', initialRawMaterials));
    setBatches(readAccountData('cleannet_batches', [] as FabricationBatch[]));
    setPurchaseOrders(readAccountData('cleannet_orders', [] as PurchaseOrder[]));
  }, [googleUser?.email]);

  // Sync to localStorage
  useEffect(() => {
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_products', googleUser.email), JSON.stringify(products));
  }, [products, googleUser]);

  useEffect(() => {
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_rawmaterials', googleUser.email), JSON.stringify(rawMaterials));
  }, [rawMaterials, googleUser]);

  useEffect(() => {
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_batches', googleUser.email), JSON.stringify(batches));
  }, [batches, googleUser]);

  useEffect(() => {
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_orders', googleUser.email), JSON.stringify(purchaseOrders));
  }, [purchaseOrders, googleUser]);

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
    setProducts((prev) => [...prev, classifyProduct(newProduct)]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? classifyProduct(updatedProduct) : p)));
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
  const handleCreateOrder = (newOrder: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newOrder, ...prev]);

    if (newOrder.status === 'received') {
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
      localStorage.removeItem('cleannet_products_v3');
      localStorage.removeItem('cleannet_products_v4');
      localStorage.removeItem('cleannet_products_v5');
      localStorage.removeItem('cleannet_products_v6');
      localStorage.removeItem('cleannet_products_v7');
      localStorage.removeItem('cleannet_rawmaterials_v2');
      localStorage.removeItem('cleannet_rawmaterials_v3');
      localStorage.removeItem('cleannet_batches_v2');
      localStorage.removeItem('cleannet_orders_v2');
      setProducts(initialProducts);
      setRawMaterials(initialRawMaterials);
      setBatches(initialFabricationBatches);
      setPurchaseOrders(initialPurchaseOrders);
    }
  };

  const handleClearHistories = () => {
    if (!window.confirm('Voulez-vous vider tous les historiques de fabrication et d’achats ?')) return;
    setBatches([]);
    setPurchaseOrders([]);
    localStorage.setItem('cleannet_batches_v2', JSON.stringify([]));
    localStorage.setItem('cleannet_orders_v2', JSON.stringify([]));
  };

  const handleClearFabricationHistory = () => {
    if (!window.confirm('Voulez-vous vider l’historique des fabrications ?')) return;
    setBatches([]);
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_batches', googleUser.email), JSON.stringify([]));
  };

  const handleClearPurchaseHistory = () => {
    if (!window.confirm('Voulez-vous vider l’historique des achats ?')) return;
    setPurchaseOrders([]);
    if (googleUser) localStorage.setItem(accountStorageKey('cleannet_orders', googleUser.email), JSON.stringify([]));
  };

  if (!googleUser) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] text-stone-800">
        <Header
          activeTab={activeTab}
          googleUser={googleUser}
          onGoogleLogin={handleGoogleLogin}
          onGoogleLogout={handleGoogleLogout}
          authButtonTargetRef={googleLoginPanelRef}
        />
        <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center overflow-hidden px-6 py-16">
          <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="relative w-full max-w-md text-center">
            <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-[0_18px_50px_rgba(27,77,62,0.12)]">
              <img src="/logo.png" alt="Logo CleanNet" className="h-full w-full object-contain" />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Espace professionnel</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Veuillez vous connecter</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">
              Connectez-vous avec votre compte Google pour accéder à vos produits, vos stocks, vos achats et vos fabrications CleanNet.
            </p>
            <div ref={googleLoginPanelRef} className="mx-auto mt-8 flex min-h-11 justify-center" />
            <p className="mt-5 text-xs text-stone-400">Accès réservé aux utilisateurs autorisés.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-stone-800 flex flex-col font-sans selection:bg-stone-200">
      {/* Barre de navigation institutionnelle CleanNet */}
      <Header
        activeTab={activeTab}
        googleUser={googleUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        authButtonTargetRef={googleLoginPanelRef}
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
        {actionNotification && (
          <div className="fixed right-4 top-24 z-50 max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-lg">
            {actionNotification}
          </div>
        )}
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
            onActionRecorded={notifyByGmail}
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
            onClearHistory={handleClearFabricationHistory}
            onActionRecorded={notifyByGmail}
          />
        )}

        {activeTab === 'achats' && (
          <AchatsView
            purchaseOrders={purchaseOrders}
            rawMaterials={rawMaterials}
            onCreateOrder={handleCreateOrder}
            onReceiveOrder={handleReceiveOrder}
            targetMaterialId={targetPurchaseMaterialId}
            onClearHistory={handleClearPurchaseHistory}
            onActionRecorded={notifyByGmail}
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
              onClick={handleClearHistories}
              className="text-stone-400 hover:text-rose-700 transition-colors"
              title="Vider les historiques de fabrication et d’achats"
            >
              Vider les historiques
            </button>
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
