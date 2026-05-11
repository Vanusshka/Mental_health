/**
 * PatientSessionContext
 * ─────────────────────────────────────────────────────────────────────────
 * Persists the active doctor-patient session context across navigation.
 * Stored in sessionStorage so it survives page refreshes but clears on tab close.
 *
 * Set when doctor clicks "Start Assessment" for a patient.
 * Cleared when doctor returns to portal or session ends.
 */

import { createContext, useContext, useState, useEffect } from "react";

export interface ActivePatientSession {
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  session_number: number;
}

interface PatientSessionContextType {
  activeSession: ActivePatientSession | null;
  setActiveSession: (session: ActivePatientSession | null) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "manas_patient_session";

const PatientSessionContext = createContext<PatientSessionContextType>({
  activeSession: null,
  setActiveSession: () => {},
  clearSession: () => {},
});

export function PatientSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<ActivePatientSession | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function setActiveSession(session: ActivePatientSession | null) {
    setActiveSessionState(session);
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  function clearSession() {
    setActiveSession(null);
  }

  return (
    <PatientSessionContext.Provider value={{ activeSession, setActiveSession, clearSession }}>
      {children}
    </PatientSessionContext.Provider>
  );
}

export function usePatientSession() {
  return useContext(PatientSessionContext);
}
