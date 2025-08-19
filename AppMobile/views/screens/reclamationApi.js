// Service d'API pour les réclzamations côté mobile
import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = "http://172.20.10.2:5000/api";

export const uploadPieceJointe = async (file) => {
  try {
    const formData = new FormData();

    // Déterminer nom et type
    const inferExt = (mime) => {
      if (!mime) return undefined;
      const map = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "application/pdf": "pdf",
        "image/heic": "heic",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      };
      return map[mime] || undefined;
    };

    const mime = file?.mimeType || file?.type || undefined;
    const ext = inferExt(mime) || (file?.name && file.name.includes('.') ? file.name.split('.').pop() : 'bin');
    const filename = (file?.name && file.name.trim()) ? file.name : `piece_jointe_${Date.now()}.${ext}`;

    if (Platform.OS === 'web') {
      // Sur le Web, il faut envoyer un Blob ou un File réel
      if (file?.file instanceof File) {
        formData.append('file', file.file, filename);
      } else if (file?.uri && file.uri.startsWith('blob:')) {
        const resp = await fetch(file.uri);
        const blob = await resp.blob();
        const typedBlob = mime ? blob.slice(0, blob.size, mime) : blob;
        formData.append('file', typedBlob, filename);
      } else if (file instanceof File) {
        formData.append('file', file, filename);
      } else {
        throw new Error('Fichier invalide pour le Web (aucun Blob/File)');
      }
    } else {
      // iOS/Android: on fournit uri/name/type
      if (!file?.uri) {
        throw new Error('Fichier invalide: uri manquante');
      }
      formData.append('file', {
        uri: file.uri,
        name: filename,
        type: mime || 'application/octet-stream',
      });
    }

    // Utiliser fetch au lieu d'axios pour les uploads de fichiers
  const response = await fetch(`${BASE_URL}/reclamations/upload`, {
      method: "POST",
      body: formData,
      // Ne pas spécifier Content-Type, laisser React Native le gérer automatiquement
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result.piece_jointe; // chemin à mettre dans la réclamation
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const createReclamation = async (reclamation) => {
  const res = await axios.post(`${BASE_URL}/reclamations`, reclamation);
  return res.data;
};

export const getReclamations = async (employeId) => {
  const res = await axios.get(`${BASE_URL}/reclamations`, {
    params: { employeId },
  });
  return res.data;
};

export const getLocations = async () => {
  const res = await axios.get(`${BASE_URL}/locations-full`);
  // Attend un tableau de { id, nom }
  return Array.isArray(res.data) ? res.data : [];
};

export const getDepartments = async (locationId) => {
  const res = await axios.get(`${BASE_URL}/departments-full`);
  const data = Array.isArray(res.data) ? res.data : [];
  // La réponse backend renvoie { id, nom } sans relation; si relation disponible, filtrer.
  if (locationId && data.length && ('locationId' in data[0] || 'location_id' in data[0] || 'siteId' in data[0] || 'site_id' in data[0])) {
    const keys = ['locationId', 'location_id', 'siteId', 'site_id'];
    return data.filter(dep => keys.some(k => dep[k] === locationId));
  }
  return data;
};

// Normalisation utilitaire
export const normalizeForPicker = (arr = []) => arr.map(x => ({ label: String(x.nom ?? x.name ?? x.label ?? ''), value: x.id ?? x.value ?? String(x.nom ?? x.name ?? '') }));

// Constantes pour les types et statuts de réclamations
export const RECLAMATION_TYPES = {
  technique: {
    label: "Technique",
    color: "#FF6B6B",
    icon: "construct-outline",
  },
  rh: {
    label: "Ressources Humaines",
    color: "#4ECDC4",
    icon: "people-outline",
  },
  administratif: {
    label: "Administratif",
    color: "#45B7D1",
    icon: "document-text-outline",
  },
  materiel: {
    label: "Matériel",
    color: "#96CEB4",
    icon: "hardware-chip-outline",
  },
  autre: { label: "Autre", color: "#FFEAA7", icon: "help-circle-outline" },
};

export const RECLAMATION_STATUS = {
  nouveau: { label: "Nouveau", color: "#3498db", icon: "add-circle-outline" },
  en_cours: { label: "En cours", color: "#f39c12", icon: "time-outline" },
  resolu: {
    label: "Résolu",
    color: "#27ae60",
    icon: "checkmark-circle-outline",
  },
  rejete: { label: "Rejeté", color: "#e74c3c", icon: "close-circle-outline" },
};

// Fonctions utilitaires pour éviter les erreurs
export const getReclamationStatuses = () => {
  return RECLAMATION_STATUS ? Object.values(RECLAMATION_STATUS) : [];
};

export const getReclamationTypes = () => {
  return RECLAMATION_TYPES ? Object.values(RECLAMATION_TYPES) : [];
};

export const getReclamationStats = async (employeId) => {
  try {
    const res = await axios.get(`${BASE_URL}/reclamations/stats/${employeId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { total: 0, nouveau: 0, en_cours: 0, resolu: 0 };
  }
};
