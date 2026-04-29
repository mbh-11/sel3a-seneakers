/**
 * Tarifs de livraison ZR Express (Départ: Tipaza)
 * Domicile (home), Bureau (office), Retour/Annulation (cancel)
 */
export const shippingRates = {
  "01": { name: "Adrar", home: 1400, office: 970, cancel: 250 }, // Domicile: 1400-1600 -> 1500 avg, Bureau: 970-1120 -> 1045 avg
  "02": { name: "Chlef", home: 750, office: 520, cancel: 200 },
  "03": { name: "Laghouat", home: 950, office: 670, cancel: 200 },
  "04": { name: "Oum El Bouaghi", home: 800, office: 520, cancel: 200 }, // Domicile: 800-850, Bureau: 520-570
  "05": { name: "Batna", home: 800, office: 520, cancel: 200 },
  "06": { name: "Bejaia", home: 800, office: 520, cancel: 200 },
  "07": { name: "Biskra", home: 950, office: 670, cancel: 200 },
  "08": { name: "Bechar", home: 1100, office: 720, cancel: 200 }, // Domicile: 1000-1100, Bureau: 670-720-970 -> avg 780
  "09": { name: "Blida", home: 750, office: 520, cancel: 200 },
  "10": { name: "Bouira", home: 750, office: 520, cancel: 200 },
  "11": { name: "Tamanrasset", home: 1600, office: 1120, cancel: 250 },
  "12": { name: "Tebessa", home: 850, office: 520, cancel: 200 },
  "13": { name: "Tlemcen", home: 850, office: 570, cancel: 200 },
  "14": { name: "Tiaret", home: 800, office: 520, cancel: 200 },
  "15": { name: "Tizi Ouzou", home: 750, office: 520, cancel: 200 },
  "16": { name: "Alger", home: 500, office: 420, cancel: 200 },
  "17": { name: "Djelfa", home: 950, office: 670, cancel: 200 },
  "18": { name: "Jijel", home: 800, office: 520, cancel: 200 },
  "19": { name: "Setif", home: 750, office: 520, cancel: 200 },
  "20": { name: "Saida", home: 800, office: 570, cancel: 200 },
  "21": { name: "Skikda", home: 800, office: 520, cancel: 200 },
  "22": { name: "Sidi Bel Abbes", home: 800, office: 520, cancel: 200 },
  "23": { name: "Annaba", home: 800, office: 520, cancel: 200 },
  "24": { name: "Guelma", home: 800, office: 520, cancel: 200 },
  "25": { name: "Constantine", home: 800, office: 520, cancel: 200 },
  "26": { name: "Medea", home: 750, office: 520, cancel: 200 },
  "27": { name: "Mostaganem", home: 800, office: 520, cancel: 200 },
  "28": { name: "M'Sila", home: 850, office: 570, cancel: 200 },
  "29": { name: "Mascara", home: 800, office: 520, cancel: 200 },
  "30": { name: "Ouargla", home: 950, office: 670, cancel: 200 },
  "31": { name: "Oran", home: 800, office: 520, cancel: 200 },
  "32": { name: "El Bayadh", home: 1100, office: 670, cancel: 200 },
  "33": { name: "Illizi", home: null, office: null, cancel: null },
  "34": { name: "Bordj Bou Arreridj", home: 750, office: 520, cancel: 200 },
  "35": { name: "Boumerdes", home: 750, office: 520, cancel: 200 },
  "36": { name: "El Tarf", home: 800, office: 520, cancel: 200 }, // Not explicitly in provided list but added for completeness
  "37": { name: "Tindouf", home: null, office: null, cancel: null },
  "38": { name: "Tissemsilt", home: 800, office: 520, cancel: 200 }, // Estimated based on proximity
  "39": { name: "El Oued", home: 950, office: 670, cancel: 200 },
  "40": { name: "Khenchela", home: 800, office: 520, cancel: 200 }, 
  "41": { name: "Souk Ahras", home: 800, office: 520, cancel: 200 },
  "42": { name: "Tipaza", home: 500, office: 370, cancel: 200 },
  "43": { name: "Mila", home: 800, office: 520, cancel: 200 },
  "44": { name: "Ain Defla", home: 750, office: 520, cancel: 200 },
  "45": { name: "Naama", home: 1100, office: 670, cancel: 200 },
  "46": { name: "Ain Temouchent", home: 800, office: 520, cancel: 200 },
  "47": { name: "Ghardaia", home: 950, office: 670, cancel: 200 },
  "48": { name: "Relizane", home:800, office: 520, cancel: 200 },
  "49": { name: "Timimoun", home: 1400, office: null, cancel: 200 },
  "50": { name: "Bordj Badji Mokhtar", home: null, office: null, cancel: null },
  "51": { name: "Ouled Djellal", home: 950, office: 670, cancel: 200 },
  "52": { name: "Beni Abbes", home: 1000, office: 970, cancel: 200 },
  "53": { name: "In Salah", home: 1600, office: null, cancel: 250 },
  "54": { name: "In Guezzam", home: 1600, office: null, cancel: 250 },
  "55": { name: "Touggourt", home: 950, office: 670, cancel: 200 },
  "56": { name: "Djanet", home: null, office: null, cancel: null },
  "57": { name: "El M'ghair", home: 950, office: null, cancel: 200 },
  "58": { name: "El Menia", home: 1000, office: null, cancel: 200 }
};

/**
 * Récupère le coût de livraison pour une wilaya et un type
 * @param {string|number} wilayaId 
 * @param {string} type - 'home' ou 'office'
 */
export const getShippingCost = (wilayaId, type) => {
  const rates = shippingRates[wilayaId];
  if (!rates) return type === 'home' ? 800 : 500; // Fallback par défaut si non trouvé
  
  const cost = type === 'home' ? rates.home : rates.office;
  return cost || (type === 'home' ? 800 : 500); // Fallback si le type spécifique est null
};

/**
 * Vérifie si la wilaya nécessite une confirmation téléphonique (Zones reculées ou indisponibles)
 * @param {string|number} wilayaId 
 */
export const needsPhoneConfirmation = (wilayaId) => {
  const rates = shippingRates[wilayaId];
  if (!rates) return true;
  return rates.home === null; // Si home est null, c'est indisponible ou sur devis
};

/**
 * Vérifie si l'option Bureau (Stop Desk) est disponible
 */
export const hasOfficeDelivery = (wilayaId) => {
  const rates = shippingRates[wilayaId];
  return rates && rates.office !== null;
};

/**
 * Calcule le total (Produit + Port)
 */
export const calculateTotal = (productPrice, wilayaId, deliveryType) => {
  const shippingFee = getShippingCost(wilayaId, deliveryType);
  return productPrice + shippingFee;
};

/**
 * Génère le select HTML avec les noms des wilayas
 */
export const generateWilayaSelectHTML = () => {
    let html = '<select name="wilaya" class="shipping-select">\n';
    html += '  <option value="">Sélectionnez votre wilaya</option>\n';
    Object.keys(shippingRates).forEach(id => {
        const wilaya = shippingRates[id];
        html += `  <option value="${id}">${id} - ${wilaya.name}</option>\n`;
    });
    html += '</select>';
    return html;
};
