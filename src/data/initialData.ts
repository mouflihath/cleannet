import { Product, RawMaterial, FabricationBatch, PurchaseOrder } from '../types';

import imgLaveVitre from '../assets/images/cleanN/lave-vitre.jpg';
import imgLaveVitreBrillance from '../assets/images/cleanN/lave-vitre1.jpg';
import imgLaveSol from '../assets/images/cleanN/lave-sol.jpg';
import imgLaveSolBleu from '../assets/images/cleanN/lave-sol1.jpg';
import imgLaveMain from '../assets/images/cleanN/lave-main.jpg';
import imgLaveMainBleu from '../assets/images/cleanN/lave-main1.jpg';
import imgGelWc from '../assets/images/cleanN/gel-wc.jpg';
import imgGelWc1 from '../assets/images/cleanN/gel-wc1.jpg';
import imgGelWc2 from '../assets/images/cleanN/gel-wc2.jpg';
import imgMultiTache from '../assets/images/cleanN/multi-tache.jpg';
import imgMultiTacheRouge from '../assets/images/cleanN/multi-tache1.jpg';
import imgDesodorisant from '../assets/images/cleanN/air-net.jpg';
import imgLiquideVaisselle from '../assets/images/cleanN/lave-vaisselle.jpg';
import imgLiquideVaisselleCollection from '../assets/images/cleanN/lave-vaisselle1.jpg';

export const initialProducts: Product[] = [
  {
    id: 'lave-vitre',
    name: 'BrillanceNet',
    image: imgLaveVitre,
    images: [imgLaveVitre, imgLaveVitreBrillance],
    priceFormatted: '1 200 FCFA / 750 ml',
    unitPrice: 1200,
    unit: 'flacon 750ml',
    category: 'Lave-vitres',
    description: 'Formule anti-traces à séchage ultra-rapide à base d’éthanol et vinaigre blanc purifié. Brillance sans voile ni reflet.',
    ph: '6.5 - 7.0',
    packaging: 'Flacon 750ml avec pulvérisateur + Étiquette CleanNet',
    shelfLife: '24 mois',
    costPerUnit: 420,
    formulaBaseVolume: 10,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "Eau déminéralisée", percentage: 100, referenceQuantity: 10, unit: 'L' },
      { materialId: 'rm-acide-citrique', materialName: 'Acide citrique', percentage: 0.1, referenceQuantity: 10, unit: 'g' },
      { materialId: 'rm-vinaigre-blanc', materialName: 'Vinaigre blanc', percentage: 2, referenceQuantity: 200, unit: 'ml' },
      { materialId: 'rm-ipa', materialName: 'IPA', percentage: 5, referenceQuantity: 500, unit: 'ml' },
      { materialId: 'rm-ethanol', materialName: 'Éthanol', percentage: 7.5, referenceQuantity: 750, unit: 'ml' },
      { materialId: 'rm-edta', materialName: 'EDTA', percentage: 0.1, referenceQuantity: 10, unit: 'g' },
      { materialId: 'rm-polysorbate-80', materialName: 'Polysorbate 80', percentage: 0.3, referenceQuantity: 30, unit: 'ml' },
      { materialId: 'rm-parfum-std', materialName: 'Parfum', percentage: 0.25, referenceQuantity: 25, unit: 'ml' },
      { materialId: 'rm-phenoxyethanol', materialName: 'Phenoxyéthanol', percentage: 0.15, referenceQuantity: 15, unit: 'ml' },
      { materialId: 'rm-col-bleu', materialName: 'Colorant', percentage: 0, unit: 'selon goût' }
    ]
  },
  {
    id: 'laves-sol',
    name: 'Eclat Net',
    image: imgLaveSol,
    images: [imgLaveSol, imgLaveSolBleu],
    priceFormatted: '1 500 FCFA / L',
    unitPrice: 1500,
    unit: 'bidon 1L',
    category: 'Lave-sol',
    description: 'Détergent parfumant haute rémanence pour sols carrelés et marbres. Formulé avec Texapon et parfum frais longue durée.',
    ph: '7.0 - 7.5',
    packaging: 'Bidon de 1L avec bouchon doseur + Étiquette CleanNet',
    shelfLife: '24 mois',
    costPerUnit: 580,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "L'eau déminéralisée", percentage: 76.0, unit: 'L' },
      { materialId: 'rm-texapon', materialName: 'Texapon ou salés', percentage: 12.0, unit: 'kg' },
      { materialId: 'rm-nitrosol', materialName: 'Nitrosol', percentage: 2.0, unit: 'kg' },
      { materialId: 'rm-stpp', materialName: 'Tripolyphosphate de sodium (STPP)', percentage: 2.0, unit: 'kg' },
      { materialId: 'rm-booster', materialName: 'Booster', percentage: 2.5, unit: 'kg' },
      { materialId: 'rm-binzoate', materialName: 'Binzoate', percentage: 0.5, unit: 'kg' },
      { materialId: 'rm-col-vert', materialName: 'Colorant Vert', percentage: 0.5, unit: 'g' },
      { materialId: 'rm-parfum-citronnelle', materialName: 'Parfum senteur Citronnelle', percentage: 4.5, unit: 'L' }
    ]
  },
  {
    id: 'lave-main',
    name: 'Main Net',
    image: imgLaveMain,
    images: [imgLaveMain, imgLaveMainBleu],
    priceFormatted: '1 800 FCFA / 500 ml',
    unitPrice: 1800,
    unit: 'flacon 500ml',
    category: 'Lave-mains',
    description: 'Savon liquide onctueux enrichi à la glycérine végétale adoucissante pour le respect épidermique.',
    ph: '5.5 (physiologique)',
    packaging: 'Flacon pompe ambré 500ml + Étiquette CleanNet',
    shelfLife: '18 mois',
    costPerUnit: 690,
    formulaBaseVolume: 10,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "Eau déminéralisée", percentage: 100, referenceQuantity: 10, unit: 'L' },
      { materialId: 'rm-texapon', materialName: 'Texapon', percentage: 7.5, referenceQuantity: 750, unit: 'g' },
      { materialId: 'rm-sls', materialName: 'SLS', percentage: 5, referenceQuantity: 500, unit: 'g' },
      { materialId: 'rm-booster', materialName: 'Booster', percentage: 3, referenceQuantity: 300, unit: 'ml' },
      { materialId: 'rm-labsa', materialName: 'Acide sulphonic', percentage: 1, referenceQuantity: 100, unit: 'ml' },
      { materialId: 'rm-glycerine', materialName: 'Glycérine', percentage: 1, referenceQuantity: 100, unit: 'ml' },
      { materialId: 'rm-acide-citrique', materialName: 'Acide citrique (dilué dans l’eau chaude)', percentage: 0.1, referenceQuantity: 10, unit: 'g' },
      { materialId: 'rm-sulfate-sodium', materialName: 'Sulfate de sodium', percentage: 5, referenceQuantity: 500, unit: 'g' },
      { materialId: 'rm-parfum-std', materialName: 'Parfum', percentage: 0.2, referenceQuantity: 20, unit: 'ml' },
      { materialId: 'rm-col-rose', materialName: 'Colorant', percentage: 0, unit: 'selon goût' },
      { materialId: 'rm-binzoate', materialName: 'Benzoate', percentage: 0.05, referenceQuantity: 5, unit: 'g' }
    ]
  },
  {
    id: 'gel-wc',
    name: 'WC Net',
    image: imgGelWc,
    images: [imgGelWc, imgGelWc1, imgGelWc2],
    priceFormatted: '1 400 FCFA / 750 ml',
    unitPrice: 1400,
    unit: 'flacon 750ml',
    category: 'Gel WC',
    description: 'Gel désincrustant et détartrant haute adhérence sur parois verticales. Élimine le tartre et rafraîchit à la menthe.',
    ph: '2.0 - 2.5',
    packaging: 'Flacon coudé 750ml sécurisé + Étiquette CleanNet',
    shelfLife: '24 mois',
    costPerUnit: 520,
    formulaBaseVolume: 5,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "Eau déminéralisée", percentage: 100, referenceQuantity: 5, unit: 'L' },
      { materialId: 'rm-acide-citrique', materialName: 'Acide citrique', percentage: 2, referenceQuantity: 100, unit: 'g' },
      { materialId: 'rm-acide-chlorhydrique', materialName: 'HCL', percentage: 15, referenceQuantity: 750, unit: 'ml' },
      { materialId: 'rm-edta', materialName: 'EDTA', percentage: 0.2, referenceQuantity: 10, unit: 'g' },
      { materialId: 'rm-parfum-std', materialName: 'Parfum', percentage: 0.06, referenceQuantity: 3, unit: 'ml' },
      { materialId: 'rm-acide-thikner', materialName: 'Acide thickener', percentage: 4, referenceQuantity: 200, unit: 'ml' },
      { materialId: 'rm-col-bleu', materialName: 'Colorant', percentage: 0, unit: 'selon goût' }
    ]
  },
  {
    id: 'nettoyant-multitache',
    name: 'Savon Liquide Multi-tâche',
    image: imgMultiTache,
    images: [imgMultiTache, imgMultiTacheRouge],
    priceFormatted: '1 600 FCFA / 750 ml',
    unitPrice: 1600,
    unit: 'flacon 750ml',
    category: 'Multi-tâche',
    description: 'Dégraissant polyvalent universel pour plans de travail, tables, appareils électroménagers et plastiques.',
    ph: '7.0',
    packaging: 'Flacon 750ml avec vaporisateur + Étiquette CleanNet',
    shelfLife: '24 mois',
    costPerUnit: 540,
    formulaBaseVolume: 20,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "Eau déminéralisée", percentage: 100, referenceQuantity: 20, unit: 'L' },
      { materialId: 'rm-texapon', materialName: 'Texapon', percentage: 1.25, referenceQuantity: 250, unit: 'g' },
      { materialId: 'rm-sulfate-sodium', materialName: 'Sulfate de sodium', percentage: 1.5, referenceQuantity: 300, unit: 'g' },
      { materialId: 'rm-hplc', materialName: 'HPMC', percentage: 0.45, referenceQuantity: 90, unit: 'g' },
      { materialId: 'rm-sls', materialName: 'SLS', percentage: 0.625, referenceQuantity: 125, unit: 'g' },
      { materialId: 'rm-labsa', materialName: 'Acide sulfonique', percentage: 2.5, referenceQuantity: 500, unit: 'ml' },
      { materialId: 'rm-stpp', materialName: 'Tripolyphosphate de sodium', percentage: 0.625, referenceQuantity: 125, unit: 'g' },
      { materialId: 'rm-carbonate-sodium', materialName: 'Carbonate de sodium', percentage: 0.625, referenceQuantity: 125, unit: 'g' },
      { materialId: 'rm-booster', materialName: 'Booster', percentage: 1.25, referenceQuantity: 250, unit: 'ml' },
      { materialId: 'rm-glycerine', materialName: 'Glycérine', percentage: 0.5, referenceQuantity: 100, unit: 'ml' },
      { materialId: 'rm-soude-caustique', materialName: 'Soude caustique', percentage: 0.2, referenceQuantity: 40, unit: 'g' },
      { materialId: 'rm-parfum-std', materialName: 'Parfum', percentage: 0.125, referenceQuantity: 25, unit: 'ml' },
      { materialId: 'rm-formalin', materialName: 'Formalin', percentage: 0.125, referenceQuantity: 25, unit: 'ml' },
      { materialId: 'rm-sugar', materialName: 'Sugar', percentage: 0.125, referenceQuantity: 25, unit: 'g' },
      { materialId: 'rm-col-orange', materialName: 'Colorant', percentage: 0, unit: 'selon goût' }
    ]
  },
  {
    id: 'desodorisant',
    name: 'Air Net',
    image: imgDesodorisant,
    priceFormatted: '2 000 FCFA / 300 ml',
    unitPrice: 2000,
    unit: 'spray 300ml',
    category: 'Désodorisant',
    description: 'Brumisateur d’ambiance d’intérieur neutraliseur d’odeurs avec extrait de parfum naturel fin.',
    ph: '6.0',
    packaging: 'Flacon aluminium brossé 300ml + Étiquette CleanNet',
    shelfLife: '36 mois',
    costPerUnit: 750,
    formulaBaseVolume: 1,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "Eau déminéralisée", percentage: 50, referenceQuantity: 500, unit: 'ml' },
      { materialId: 'rm-parfum-std', materialName: 'Parfum', percentage: 3, referenceQuantity: 30, unit: 'ml' },
      { materialId: 'rm-polysorbate-20', materialName: 'Polysorbate 20', percentage: 3.5, referenceQuantity: 35, unit: 'ml' },
      { materialId: 'rm-ethanol', materialName: 'Éthanol', percentage: 40, referenceQuantity: 400, unit: 'ml' },
      { materialId: 'rm-phenoxyethanol', materialName: 'Phenoxyéthanol', percentage: 0.2, referenceQuantity: 2, unit: 'ml' },
      { materialId: 'rm-dpg', materialName: 'Dipropylene Glycol (DPG)', percentage: 1, referenceQuantity: 10, unit: 'ml' }
    ]
  },
  {
    id: 'liquide-vaisselle',
    name: 'Vaisselle Net',
    image: imgLiquideVaisselle,
    images: [imgLiquideVaisselle, imgLiquideVaisselleCollection],
    priceFormatted: '1 300 FCFA / 1L',
    unitPrice: 1300,
    unit: 'bidon 1L',
    category: 'Liquide vaisselle',
    description: 'Détergent liquide ultra-dégraissant pour la vaisselle à mousse active et rinçage aisé, enrichi à la glycérine.',
    ph: '6.8 - 7.2',
    packaging: 'Bidon de 1L ou Flacon push-pull + Étiquette CleanNet',
    shelfLife: '24 mois',
    costPerUnit: 490,
    formula: [
      { materialId: 'rm-eau-demineralisee', materialName: "L'eau déminéralisée", percentage: 68.0, unit: 'L' },
      { materialId: 'rm-labsa', materialName: 'Acide sulphonic (LABSA)', percentage: 11.0, unit: 'kg' },
      { materialId: 'rm-soude-caustique', materialName: 'Soude caustique', percentage: 1.8, unit: 'kg' },
      { materialId: 'rm-texapon', materialName: 'Texapon ou salés', percentage: 9.0, unit: 'kg' },
      { materialId: 'rm-glycerine', materialName: 'Glycérine', percentage: 2.0, unit: 'kg' },
      { materialId: 'rm-sulfate-sodium', materialName: 'Sulfate de sodium', percentage: 3.5, unit: 'kg' },
      { materialId: 'rm-binzoate', materialName: 'Binzoate', percentage: 0.4, unit: 'kg' },
      { materialId: 'rm-col-jaune', materialName: 'Colorant Jaune', percentage: 0.3, unit: 'g' },
      { materialId: 'rm-parfum-citron-jaune', materialName: 'Parfum senteur Citron jaune', percentage: 4.0, unit: 'L' }
    ]
  }
];

export const initialRawMaterials: RawMaterial[] = [
  // Bases & Tensioactifs
  { id: 'rm-texapon', name: 'Texapon ou salés', code: 'MP-TEX-01', category: 'Tensioactifs & Bases', unit: 'kg', currentStock: 450, minStock: 200, unitCost: 1650, supplier: 'BioChimie Solutions' },
  { id: 'rm-sls', name: 'SLS', code: 'MP-SLS-02', category: 'Tensioactifs & Bases', unit: 'kg', currentStock: 180, minStock: 100, unitCost: 1750, supplier: 'BioChimie Solutions' },
  { id: 'rm-soude-caustique', name: 'Soude caustique', code: 'MP-SOU-03', category: 'Actifs minéraux', unit: 'kg', currentStock: 120, minStock: 80, unitCost: 950, supplier: 'AfriChimie Distri' },
  { id: 'rm-labsa', name: 'Acide sulphonic (LABSA)', code: 'MP-LAB-04', category: 'Tensioactifs & Bases', unit: 'kg', currentStock: 320, minStock: 150, unitCost: 2100, supplier: 'AfriChimie Distri' },
  { id: 'rm-acide-citrique', name: 'Acide citrique', code: 'MP-ACI-05', category: 'Régulateurs & Détartrants', unit: 'kg', currentStock: 140, minStock: 100, unitCost: 1200, supplier: 'BioChimie Solutions' },
  { id: 'rm-glycerine', name: 'Glycérine', code: 'MP-GLY-06', category: 'Adoucissants & Soin', unit: 'kg', currentStock: 210, minStock: 100, unitCost: 1600, supplier: 'OleoChimie SA' },
  { id: 'rm-stpp', name: 'Tripolyphosphate de sodium (STPP)', code: 'MP-STP-07', category: 'Sels & Séquestrants', unit: 'kg', currentStock: 160, minStock: 90, unitCost: 1400, supplier: 'AfriChimie Distri' },
  { id: 'rm-carbonate-sodium', name: 'Carbonate de sodium', code: 'MP-CAR-08', category: 'Sels & Séquestrants', unit: 'kg', currentStock: 250, minStock: 100, unitCost: 850, supplier: 'AfriChimie Distri' },
  { id: 'rm-sulfate-sodium', name: 'Sulfate de sodium', code: 'MP-SUL-09', category: 'Sels & Séquestrants', unit: 'kg', currentStock: 300, minStock: 150, unitCost: 750, supplier: 'AfriChimie Distri' },
  { id: 'rm-edta', name: 'EDTA', code: 'MP-EDT-10', category: 'Sels & Séquestrants', unit: 'kg', currentStock: 65, minStock: 50, unitCost: 3400, supplier: 'BioChimie Solutions' },
  { id: 'rm-hplc', name: 'HPMC', code: 'MP-HPL-11', category: 'Épaississants & Polymères', unit: 'kg', currentStock: 40, minStock: 40, unitCost: 4200, supplier: 'Polymères Verts' },
  { id: 'rm-nitrosol', name: 'Nitrosol', code: 'MP-NIT-12', category: 'Épaississants & Polymères', unit: 'kg', currentStock: 85, minStock: 50, unitCost: 4800, supplier: 'Polymères Verts' },
  { id: 'rm-binzoate', name: 'Binzoate', code: 'MP-BIN-13', category: 'Conservateurs', unit: 'kg', currentStock: 75, minStock: 40, unitCost: 3200, supplier: 'BioChimie Solutions' },
  { id: 'rm-booster', name: 'Booster', code: 'MP-BST-14', category: 'Agents moussants & Boosters', unit: 'kg', currentStock: 110, minStock: 70, unitCost: 2600, supplier: 'BioChimie Solutions' },

  // Colorants séparément
  { id: 'rm-col-bleu', name: 'Colorant Bleu', code: 'COL-BLU', category: 'Colorants', unit: 'kg', currentStock: 15, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-vert', name: 'Colorant Vert', code: 'COL-VRT', category: 'Colorants', unit: 'kg', currentStock: 18, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-rose', name: 'Colorant Rose', code: 'COL-ROS', category: 'Colorants', unit: 'kg', currentStock: 12, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-violet', name: 'Colorant Violet', code: 'COL-VIO', category: 'Colorants', unit: 'kg', currentStock: 8, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-orange', name: 'Colorant Orange', code: 'COL-ORG', category: 'Colorants', unit: 'kg', currentStock: 14, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-jaune', name: 'Colorant Jaune', code: 'COL-JAU', category: 'Colorants', unit: 'kg', currentStock: 22, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },
  { id: 'rm-col-rouge', name: 'Colorant Rouge', code: 'COL-RED', category: 'Colorants', unit: 'kg', currentStock: 16, minStock: 10, unitCost: 9500, supplier: 'ColorLab Afrique' },

  // Solvants & Spécifiques
  { id: 'rm-parfum-std', name: 'Parfum', code: 'MP-PRF-00', category: 'Parfums & Fragrances', unit: 'L', currentStock: 45, minStock: 30, unitCost: 8500, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-tpa', name: 'TPA', code: 'MP-TPA-15', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 35, minStock: 30, unitCost: 3100, supplier: 'AfriChimie Distri' },
  { id: 'rm-vinaigre-blanc', name: 'Vinaigre blanc', code: 'MP-VIN-16', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 420, minStock: 150, unitCost: 450, supplier: 'AgroSource Ouest' },
  { id: 'rm-phenoxyethanol', name: 'Phenoxy éthanol', code: 'MP-PHE-17', category: 'Conservateurs', unit: 'kg', currentStock: 30, minStock: 20, unitCost: 5200, supplier: 'BioChimie Solutions' },
  { id: 'rm-ethanol', name: 'Ethanol', code: 'MP-ETH-18', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 500, minStock: 200, unitCost: 1250, supplier: 'AfriChimie Distri' },
  { id: 'rm-acide-chlorhydrique', name: 'Acide chlorhydrique HCL', code: 'MP-HCL-19', category: 'Actifs minéraux', unit: 'L', currentStock: 250, minStock: 100, unitCost: 800, supplier: 'AfriChimie Distri' },
  { id: 'rm-cristaux-menthe', name: 'Cristaux de menthe', code: 'MP-MEN-20', category: 'Parfums & Fragrances', unit: 'kg', currentStock: 14, minStock: 15, unitCost: 14000, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-acide-thikner', name: 'Acide thikner', code: 'MP-THK-21', category: 'Épaississants & Polymères', unit: 'kg', currentStock: 65, minStock: 40, unitCost: 5900, supplier: 'Polymères Verts' },
  { id: 'rm-monopropyle-glycol', name: 'Monopropyle glycole', code: 'MP-MPG-22', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 110, minStock: 60, unitCost: 2800, supplier: 'OleoChimie SA' },
  { id: 'rm-eau-demineralisee', name: "L'eau déminéralisée", code: 'MP-EAU-23', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 5400, minStock: 1500, unitCost: 65, supplier: 'HydroPure Afrique' },
  { id: 'rm-formalin', name: 'Formalin', code: 'MP-FOR-24', category: 'Conservateurs', unit: 'L', currentStock: 45, minStock: 30, unitCost: 1900, supplier: 'AfriChimie Distri' },
  { id: 'rm-polysorbate-80', name: 'Polysorbate 80', code: 'MP-P80-25', category: 'Tensioactifs & Bases', unit: 'kg', currentStock: 55, minStock: 30, unitCost: 3900, supplier: 'BioChimie Solutions' },
  { id: 'rm-polysorbate-20', name: 'Polysorbate 20', code: 'MP-P20-26', category: 'Tensioactifs & Bases', unit: 'kg', currentStock: 50, minStock: 30, unitCost: 3900, supplier: 'BioChimie Solutions' },
  { id: 'rm-ipa', name: 'IPA', code: 'MP-IPA-28', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 80, minStock: 30, unitCost: 2400, supplier: 'AfriChimie Distri' },
  { id: 'rm-dpg', name: 'Dipropylene Glycol (DPG)', code: 'MP-DPG-29', category: 'Solvants & Auxiliaires', unit: 'L', currentStock: 35, minStock: 15, unitCost: 3200, supplier: 'AfriChimie Distri' },

  // Parfums séparément
  { id: 'rm-parfum-fraise', name: 'Parfum senteur fraise', code: 'PRF-FRA', category: 'Parfums & Fragrances', unit: 'L', currentStock: 25, minStock: 15, unitCost: 9200, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-ocean', name: 'Parfum senteur océan', code: 'PRF-OCE', category: 'Parfums & Fragrances', unit: 'L', currentStock: 32, minStock: 15, unitCost: 9400, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-pomme', name: 'Parfum senteur pomme', code: 'PRF-POM', category: 'Parfums & Fragrances', unit: 'L', currentStock: 20, minStock: 15, unitCost: 9200, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-lavande', name: 'Parfum senteur lavande', code: 'PRF-LAV', category: 'Parfums & Fragrances', unit: 'L', currentStock: 28, minStock: 15, unitCost: 9600, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-agrumes', name: 'Parfum senteur agrumes', code: 'PRF-AGR', category: 'Parfums & Fragrances', unit: 'L', currentStock: 34, minStock: 15, unitCost: 9500, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-cocktail', name: 'Parfum senteur cocktail', code: 'PRF-COK', category: 'Parfums & Fragrances', unit: 'L', currentStock: 18, minStock: 15, unitCost: 9800, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-citronnelle', name: 'Parfum senteur citronnelle', code: 'PRF-CTL', category: 'Parfums & Fragrances', unit: 'L', currentStock: 40, minStock: 20, unitCost: 8900, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-ananas', name: 'Parfum senteur ananas', code: 'PRF-ANA', category: 'Parfums & Fragrances', unit: 'L', currentStock: 12, minStock: 15, unitCost: 9500, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-fruits-rouges', name: 'Parfum senteur fruits rouges', code: 'PRF-FRU', category: 'Parfums & Fragrances', unit: 'L', currentStock: 16, minStock: 15, unitCost: 9700, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-citron', name: 'Parfum senteur citron', code: 'PRF-CIT', category: 'Parfums & Fragrances', unit: 'L', currentStock: 38, minStock: 20, unitCost: 9100, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-mandarine', name: 'Parfum senteur mandarine', code: 'PRF-MAN', category: 'Parfums & Fragrances', unit: 'L', currentStock: 19, minStock: 15, unitCost: 9400, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-florale', name: 'Parfum senteur florale', code: 'PRF-FLO', category: 'Parfums & Fragrances', unit: 'L', currentStock: 26, minStock: 15, unitCost: 9900, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-citron-vert', name: 'Parfum senteur citron vert', code: 'PRF-CIV', category: 'Parfums & Fragrances', unit: 'L', currentStock: 22, minStock: 15, unitCost: 9300, supplier: 'Essences Naturelles Grasse' },
  { id: 'rm-parfum-citron-jaune', name: 'Parfum senteur citron jaune', code: 'PRF-CIJ', category: 'Parfums & Fragrances', unit: 'L', currentStock: 30, minStock: 15, unitCost: 9300, supplier: 'Essences Naturelles Grasse' },

  // Additifs & Packaging
  { id: 'rm-sugar', name: 'Sugar', code: 'MP-SUG-27', category: 'Adoucissants & Soin', unit: 'kg', currentStock: 80, minStock: 40, unitCost: 650, supplier: 'AgroSource Ouest' },
  { id: 'rm-bidon-5l', name: 'Bidon de 5L', code: 'EMB-BD-5L', category: 'Conditionnement & Emballage', unit: 'unité', currentStock: 420, minStock: 200, unitCost: 480, supplier: 'PlastPack Industrie' },
  { id: 'rm-bidon-1l', name: 'Bidon de 1L', code: 'EMB-BD-1L', category: 'Conditionnement & Emballage', unit: 'unité', currentStock: 850, minStock: 400, unitCost: 220, supplier: 'PlastPack Industrie' },
  { id: 'rm-emballage', name: 'Emballage', code: 'EMB-GEN-01', category: 'Conditionnement & Emballage', unit: 'unité', currentStock: 1500, minStock: 500, unitCost: 150, supplier: 'PlastPack Industrie' },
  { id: 'rm-etiquette', name: 'Étiquette', code: 'EMB-ETIQ-02', category: 'Conditionnement & Emballage', unit: 'unité', currentStock: 3200, minStock: 1000, unitCost: 45, supplier: 'GraphiPrint Lab' },
  { id: 'rm-pipette', name: 'Pipette', code: 'ACC-PIP-03', category: 'Accessoires & Contrôle', unit: 'unité', currentStock: 150, minStock: 50, unitCost: 120, supplier: 'LaboEquip Afrique' },
  { id: 'rm-carte-utilisation', name: "Carte d'utilisation des produits", code: 'DOC-CRT-04', category: 'Accessoires & Contrôle', unit: 'unité', currentStock: 900, minStock: 300, unitCost: 60, supplier: 'GraphiPrint Lab' }
];

export const initialFabricationBatches: FabricationBatch[] = [
  {
    id: 'bat-2026-042',
    batchNumber: 'LOT-2026-042',
    productId: 'liquide-vaisselle',
    productName: 'Liquide vaisselle',
    quantity: 500,
    unit: 'Litres',
    date: '09/09/2026',
    status: 'completed',
    totalCost: 245000,
    operator: 'M. Diallo'
  },
  {
    id: 'bat-2026-041',
    batchNumber: 'LOT-2026-041',
    productId: 'laves-sol',
    productName: 'Laves Sol',
    quantity: 500,
    unit: 'Litres',
    date: '08/09/2026',
    status: 'completed',
    totalCost: 290000,
    operator: 'M. Diallo'
  },
  {
    id: 'bat-2026-040',
    batchNumber: 'LOT-2026-040',
    productId: 'lave-vitre',
    productName: 'Lave vitre',
    quantity: 350,
    unit: 'Litres',
    date: '05/09/2026',
    status: 'completed',
    totalCost: 147000,
    operator: 'S. Kouassi'
  },
  {
    id: 'bat-2026-039',
    batchNumber: 'LOT-2026-039',
    productId: 'lave-main',
    productName: 'Lave main',
    quantity: 200,
    unit: 'Litres',
    date: '02/09/2026',
    status: 'completed',
    totalCost: 138000,
    operator: 'M. Diallo'
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-2026-019',
    orderNumber: 'CMD-2026-019',
    supplier: 'BioChimie Solutions',
    date: '08/09/2026',
    status: 'pending',
    totalAmount: 345000,
    items: [
      { materialId: 'rm-texapon', materialName: 'Texapon ou salés', quantity: 150, unit: 'kg', unitCost: 1650, totalCost: 247500 },
      { materialId: 'rm-binzoate', materialName: 'Binzoate', quantity: 30, unit: 'kg', unitCost: 3200, totalCost: 96000 }
    ]
  },
  {
    id: 'po-2026-018',
    orderNumber: 'CMD-2026-018',
    supplier: 'AfriChimie Distri',
    date: '04/09/2026',
    status: 'received',
    totalAmount: 420000,
    items: [
      { materialId: 'rm-labsa', materialName: 'Acide sulphonic (LABSA)', quantity: 200, unit: 'kg', unitCost: 2100, totalCost: 420000 }
    ]
  },
  {
    id: 'po-2026-017',
    orderNumber: 'CMD-2026-017',
    supplier: 'PlastPack Industrie',
    date: '01/09/2026',
    status: 'received',
    totalAmount: 387000,
    items: [
      { materialId: 'rm-bidon-1l', materialName: 'Bidon de 1L', quantity: 900, unit: 'unité', unitCost: 220, totalCost: 198000 },
      { materialId: 'rm-bidon-5l', materialName: 'Bidon de 5L', quantity: 400, unit: 'unité', unitCost: 480, totalCost: 192000 }
    ]
  }
];
