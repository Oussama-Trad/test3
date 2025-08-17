import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext';
import { getDocumentRequests } from '../services/api/documentApi';
import { getReclamations } from '../views/screens/reclamationApi';

const API_URL = 'http://localhost:5000/api';

export const NotificationsContext = createContext({
  notifications: [],
  unseenCount: 0,
  markAllSeen: () => {},
  refreshNow: () => {},
});

function parseDate(d) {
  try {
    if (!d) return 0;
    if (typeof d === 'number') return d;
    if (d.$date) return new Date(d.$date).getTime(); // Mongo style
    return new Date(d).getTime();
  } catch {
    return 0;
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const NotificationsProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);

  // State caches to detect deltas
  const lastMessageAtRef = useRef({}); // key: adminId, value: ts
  const docStatusRef = useRef({}); // key: requestId, value: status
  const leaveStatusRef = useRef({}); // key: leaveId, value: status
  const reclamStatusRef = useRef({}); // key: reclId, value: statut
  const pollingRef = useRef(null);

  const addNotification = (notif) => {
    setNotifications((prev) => {
      const next = [notif, ...prev].slice(0, 100);
      return next;
    });
    setUnseenCount((c) => c + 1);
  };

  const markAllSeen = () => setUnseenCount(0);

  const buildNotif = (type, title, body, meta = {}) => ({
    id: `${type}-${meta.entityId || Math.random().toString(36).slice(2)}-${Date.now()}`,
    type,
    title,
    body,
    meta,
    timestamp: Date.now(),
    seen: false,
  });

  const poll = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');

      // 1) Conversations snapshot for new messages
      try {
        const convs = await fetchJSON(`${API_URL}/conversations?employeeId=${encodeURIComponent(user.id)}`);
        if (Array.isArray(convs)) {
          convs.forEach((c) => {
            const admin = c.admin || {};
            const adminId = admin._id || '';
            const lastDate = parseDate(c.lastDate || c.updatedAt);
            const prev = lastMessageAtRef.current[adminId] || 0;
            if (lastDate && lastDate > prev) {
              lastMessageAtRef.current[adminId] = lastDate;
              if (prev !== 0) {
                addNotification(
                  buildNotif(
                    'message',
                    `Nouveau message`,
                    `Vous avez un nouveau message de ${[admin.nom, admin.prenom].filter(Boolean).join(' ') || "l'administration"}.`,
                    { entityId: adminId, route: 'ChatConversation', params: { adminId, admin } }
                  )
                );
              }
            }
          });
        }
      } catch {}

      // 2) Document requests status changes
      try {
        const res = await getDocumentRequests(token);
        const list = Array.isArray(res?.requests) ? res.requests : [];
        list.forEach((r) => {
          const id = r.id || r._id;
          const newStatus = r.status;
          const prev = docStatusRef.current[id];
          if (prev === undefined) {
            docStatusRef.current[id] = newStatus;
          } else if (prev !== newStatus) {
            docStatusRef.current[id] = newStatus;
            addNotification(
              buildNotif(
                'document',
                'Demande de document mise à jour',
                `Statut: ${newStatus}`,
                { entityId: id, route: 'Documents' }
              )
            );
          }
        });
      } catch {}

      // 3) Leave requests status changes
      try {
        const leaves = await fetchJSON(`${API_URL}/leave-requests?employeeId=${encodeURIComponent(user.id)}`);
        if (Array.isArray(leaves)) {
          leaves.forEach((l) => {
            const id = l._id || l.id;
            const newStatus = l.status;
            const prev = leaveStatusRef.current[id];
            if (prev === undefined) {
              leaveStatusRef.current[id] = newStatus;
            } else if (prev !== newStatus) {
              leaveStatusRef.current[id] = newStatus;
              addNotification(
                buildNotif(
                  'leave',
                  'Demande de congé mise à jour',
                  `Statut: ${newStatus}`,
                  { entityId: id, route: 'Congés' }
                )
              );
            }
          });
        }
      } catch {}

      // 4) Réclamations status changes
      try {
        const reclas = await getReclamations(user.id);
        if (Array.isArray(reclas)) {
          reclas.forEach((r) => {
            const id = r._id || r.id;
            const newStatus = r.statut || r.status;
            const prev = reclamStatusRef.current[id];
            if (prev === undefined) {
              reclamStatusRef.current[id] = newStatus;
            } else if (prev !== newStatus) {
              reclamStatusRef.current[id] = newStatus;
              addNotification(
                buildNotif(
                  'reclamation',
                  'Réclamation mise à jour',
                  `Statut: ${newStatus}`,
                  { entityId: id, route: 'Réclamations' }
                )
              );
            }
          });
        }
      } catch {}
    } catch (e) {
      // Silent
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    poll();
    pollingRef.current = setInterval(poll, 20000); // 20s
  };
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    if (user?.id) startPolling();
    else {
      stopPolling();
      setNotifications([]);
      setUnseenCount(0);
      lastMessageAtRef.current = {};
      docStatusRef.current = {};
      leaveStatusRef.current = {};
      reclamStatusRef.current = {};
    }
    return () => stopPolling();
  }, [user?.id]);

  const value = useMemo(() => ({
    notifications,
    unseenCount,
    markAllSeen,
    refreshNow: poll,
  }), [notifications, unseenCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationsContext);
}
