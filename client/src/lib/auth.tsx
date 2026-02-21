import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'student' | 'organizer' | null;

interface AuthContextType {
  role: Role;
  studentId: string | null;
  organizerId: string | null;
  setRole: (role: Role) => void;
  setStudentId: (id: string | null) => void;
  setOrganizerId: (id: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [studentId, setStudentIdState] = useState<string | null>(null);
  const [organizerId, setOrganizerIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const savedRole = localStorage.getItem('userRole') as Role;
    const savedStudentId = localStorage.getItem('studentId');
    const savedOrganizerId = localStorage.getItem('organizerId');
    if (savedRole) setRoleState(savedRole);
    if (savedStudentId) setStudentIdState(savedStudentId);
    if (savedOrganizerId) setOrganizerIdState(savedOrganizerId);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('userRole', newRole);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  const setStudentId = (id: string | null) => {
    setStudentIdState(id);
    if (id) {
      localStorage.setItem('studentId', id);
    } else {
      localStorage.removeItem('studentId');
    }
  };

  const setOrganizerId = (id: string | null) => {
    setOrganizerIdState(id);
    if (id) {
      localStorage.setItem('organizerId', id);
    } else {
      localStorage.removeItem('organizerId');
    }
  };

  const logout = () => {
    setRoleState(null);
    setStudentIdState(null);
    setOrganizerIdState(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentId');
    localStorage.removeItem('organizerId');
  };

  return (
    <AuthContext.Provider value={{ role, studentId, organizerId, setRole, setStudentId, setOrganizerId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
