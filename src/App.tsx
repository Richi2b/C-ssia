import React, { useState, useEffect } from 'react';
import { 
  Heart, Shield, GraduationCap, Calendar, Clock, Accessibility, HelpCircle, 
  Sparkles, FileText, BarChart3, AlertCircle, RefreshCw, UserCheck
} from 'lucide-react';
import { 
  Student, HealthProfile, Absence, Observation, PreventiveAlert, SystemNotice, UserRole 
} from './types';
import { 
  INITIAL_STUDENTS, INITIAL_HEALTH_PROFILES, INITIAL_ABSENCES, 
  INITIAL_OBSERVATIONS, INITIAL_ALERTS, INITIAL_NOTICES 
} from './mockData';

// import modular subcomponents
import A11ySettings from './components/A11ySettings';
import RoleSelector from './components/RoleSelector';
import GestorDashboard from './components/GestorDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import EncarregadoDashboard from './components/EncarregadoDashboard';
import StudentProfileModal from './components/StudentProfileModal';

export default function App() {
  // Roles & security simulator
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('escolar_role');
    return (saved as UserRole) || 'GESTOR';
  });

  // Base persistent states
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('escolar_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [healthProfiles, setHealthProfiles] = useState<Record<string, HealthProfile>>(() => {
    const saved = localStorage.getItem('escolar_health');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_PROFILES;
  });

  const [absences, setAbsences] = useState<Absence[]>(() => {
    const saved = localStorage.getItem('escolar_absences');
    return saved ? JSON.parse(saved) : INITIAL_ABSENCES;
  });

  const [observations, setObservations] = useState<Observation[]>(() => {
    const saved = localStorage.getItem('escolar_observations');
    return saved ? JSON.parse(saved) : INITIAL_OBSERVATIONS;
  });

  const [alerts, setAlerts] = useState<PreventiveAlert[]>(() => {
    const saved = localStorage.getItem('escolar_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [notices, setNotices] = useState<SystemNotice[]>(() => {
    const saved = localStorage.getItem('escolar_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // Accessibility States
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('escolar_contrast') === 'true';
  });
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra'>(() => {
    return (localStorage.getItem('escolar_textsize') as any) || 'normal';
  });
  const [screenReaderActive, setScreenReaderActive] = useState<boolean>(() => {
    return localStorage.getItem('escolar_screenreader') === 'true';
  });

  // UI state: selected Student for the full modal profile
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Portugal Digital Clock Simulation
  const [timeStr, setTimeStr] = useState('');

  // Sync to standard local Storage on state changes
  useEffect(() => {
    localStorage.setItem('escolar_role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem('escolar_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('escolar_health', JSON.stringify(healthProfiles));
  }, [healthProfiles]);

  useEffect(() => {
    localStorage.setItem('escolar_absences', JSON.stringify(absences));
  }, [absences]);

  useEffect(() => {
    localStorage.setItem('escolar_observations', JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem('escolar_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('escolar_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('escolar_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('escolar_textsize', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('escolar_screenreader', String(screenReaderActive));
  }, [screenReaderActive]);

  // Handle Realtime Clock Formatting (Lisbon context)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
      setTimeStr(now.toLocaleDateString('pt-PT', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Screen Reader Accessibility announcer function
  const announceToScreen = (text: string) => {
    if ('speechSynthesis' in window && screenReaderActive) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-PT';
      window.speechSynthesis.speak(utterance);
    }
  };

  // State manipulation procedures
  const handleAddStudent = (newStudent: Student, initialHealth: HealthProfile) => {
    setStudents(prev => [newStudent, ...prev]);
    setHealthProfiles(prev => ({
      ...prev,
      [newStudent.id]: initialHealth
    }));
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    // also clean profile & related files
    setHealthProfiles(prev => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
    setAbsences(prev => prev.filter(a => a.studentId !== studentId));
    setObservations(prev => prev.filter(o => o.studentId !== studentId));
    setAlerts(prev => prev.filter(al => al.studentId !== studentId));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const handleUpdateHealthProfile = (studentId: string, updated: HealthProfile) => {
    setHealthProfiles(prev => ({
      ...prev,
      [studentId]: updated
    }));

    // Trigger proactive alert evaluations
    // If vision is bad, we prompt alert; if vaccine is set back in compliance, we can clear alert
    const isLateVaccine = updated.vaccines.some(v => v.status === 'Em Falta');
    const isVisionIssue = updated.visionCheck.status === 'Necessita Atenção';
    const isHearingIssue = updated.hearingCheck.status === 'Necessita Atenção';

    setAlerts(prev => {
      let filtered = [...prev];
      const stud = students.find(s => s.id === studentId);
      if (!stud) return prev;

      // evaluate vision alert
      const hasVisAlert = filtered.some(a => a.studentId === studentId && a.type === 'Visão' && !a.resolved);
      if (isVisionIssue && !hasVisAlert) {
        filtered.push({
          id: 'alert_' + Math.random().toString(36).substring(2, 9),
          studentId,
          studentName: stud.name,
          type: 'Visão',
          severity: 'Aviso',
          description: 'Acuidade visual assinalada como debilitada em prontuário de rastreio escolar recente.',
          date: new Date().toISOString().split('T')[0],
          resolved: false
        });
      } else if (!isVisionIssue) {
        filtered = filtered.map(a => a.studentId === studentId && a.type === 'Visão' ? { ...a, resolved: true } : a);
      }

      // evaluate hearing alert
      const hasHearAlert = filtered.some(a => a.studentId === studentId && a.type === 'Audição' && !a.resolved);
      if (isHearingIssue && !hasHearAlert) {
        filtered.push({
          id: 'alert_' + Math.random().toString(36).substring(2, 9),
          studentId,
          studentName: stud.name,
          type: 'Audição',
          severity: 'Aviso',
          description: 'Hipoacusia parcial ou audição sob alerta assinalada em prontuário de triagem.',
          date: new Date().toISOString().split('T')[0],
          resolved: false
        });
      } else if (!isHearingIssue) {
        filtered = filtered.map(a => a.studentId === studentId && a.type === 'Audição' ? { ...a, resolved: true } : a);
      }

      // evaluate vaccine alert
      const hasVacAlert = filtered.some(a => a.studentId === studentId && a.type === 'Saúde Geral' && !a.resolved);
      if (isLateVaccine && !hasVacAlert) {
        filtered.push({
          id: 'alert_' + Math.random().toString(36).substring(2, 9),
          studentId,
          studentName: stud.name,
          type: 'Saúde Geral',
          severity: 'Crítico',
          description: 'Inconformidade no boletim de vacinação recomendada (vacina contra o Tétano assinalada em falta).',
          date: new Date().toISOString().split('T')[0],
          resolved: false
        });
      } else if (!isLateVaccine) {
        filtered = filtered.map(a => a.studentId === studentId && a.type === 'Saúde Geral' ? { ...a, resolved: true } : a);
      }

      return filtered;
    });
  };

  const handleAddObservation = (studentId: string, obs: Omit<Observation, 'id' | 'date'>) => {
    const newObs: Observation = {
      ...obs,
      id: 'obs_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0]
    };

    setObservations(prev => [newObs, ...prev]);

    // Proactive trigger alert evaluation based on teacher observation content
    const lowerContent = obs.content.toLowerCase();
    const isVisionKeyword = lowerContent.includes('quadro') || lowerContent.includes('ver') || lowerContent.includes('olhos') || lowerContent.includes('visão');
    const isHearingKeyword = lowerContent.includes('ouvir') || lowerContent.includes('chamei') || lowerContent.includes('auditivo') || lowerContent.includes('escutar');

    if (obs.type === 'Saúde' || obs.type === 'Bem-Estar') {
      const stud = students.find(s => s.id === studentId);
      if (stud) {
        setAlerts(prev => {
          const list = [...prev];
          
          if (isVisionKeyword && !list.some(a => a.studentId === studentId && a.type === 'Visão' && !a.resolved)) {
            list.push({
              id: 'alert_' + Math.random().toString(36).substring(2, 9),
              studentId,
              studentName: stud.name,
              type: 'Visão',
              severity: 'Aviso',
              description: `Alergia/Dificuldade detetada por observação docente: "${obs.content.slice(0, 75)}..."`,
              date: new Date().toISOString().split('T')[0],
              resolved: false
            });
          }

          if (isHearingKeyword && !list.some(a => a.studentId === studentId && a.type === 'Audição' && !a.resolved)) {
            list.push({
              id: 'alert_' + Math.random().toString(36).substring(2, 9),
              studentId,
              studentName: stud.name,
              type: 'Audição',
              severity: 'Aviso',
              description: `Dificuldade auditiva suspeita pelo professor titular na sala de aula.`,
              date: new Date().toISOString().split('T')[0],
              resolved: false
            });
          }

          return list;
        });
      }
    }
  };

  const handleUpdateAbsenceStatus = (absenceId: string, status: Absence['status'], response: string) => {
    setAbsences(prev => prev.map(a => {
      if (a.id === absenceId) {
        return {
          ...a,
          status,
          schoolResponse: response,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return a;
    }));

    // If absence is approved (Justificada), improve student attendance rate!
    if (status === 'Justificada') {
      const targetedAbsence = absences.find(a => a.id === absenceId);
      if (targetedAbsence) {
        setStudents(prev => prev.map(s => {
          if (s.id === targetedAbsence.studentId) {
            const nextRate = Math.min(100, s.attendanceRate + 6); // Justified absences reward the rate back in compliance
            
            // If attendance gets back to >= 90%, we can auto-resolve Excessive Absences alert!
            if (nextRate >= 90) {
              setAlerts(al => al.map(alertItem => 
                alertItem.studentId === s.id && alertItem.type === 'Faltas Excessivas' 
                  ? { ...alertItem, resolved: true } 
                  : alertItem
              ));
            }

            return {
              ...s,
              attendanceRate: nextRate
            };
          }
          return s;
        }));
      }
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const handleAddNotice = (notice: Omit<SystemNotice, 'id' | 'date' | 'author'>) => {
    const newNotice: SystemNotice = {
      ...notice,
      id: 'not_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      author: currentUserRole === 'GESTOR' ? 'Diretoria Escolar' : 'Conselho Docente'
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const handleResetToFactoryDefaults = () => {
    if (confirm("Deseja redefinir os dados para os valores originais da simulação escolar?")) {
      setStudents(INITIAL_STUDENTS);
      setHealthProfiles(INITIAL_HEALTH_PROFILES);
      setAbsences(INITIAL_ABSENCES);
      setObservations(INITIAL_OBSERVATIONS);
      setAlerts(INITIAL_ALERTS);
      setNotices(INITIAL_NOTICES);
      localStorage.clear();
      announceToScreen("Os dados originais do portal de saúde e assiduidade foram restaurados com sucesso.");
    }
  };

  const handleSubmitAbsenceJustification = (newJustification: Omit<Absence, 'id' | 'status'>) => {
    const brandNew: Absence = {
      ...newJustification,
      id: 'abs_just_' + Math.random().toString(36).substring(2, 9),
      status: 'Pendente'
    };
    setAbsences(prev => [brandNew, ...prev]);

    // Simular que ao criar falta, a taxa cai se não justificada, mas fica pendente
    setStudents(prev => prev.map(s => {
      if (s.id === newJustification.studentId) {
        return {
          ...s,
          attendanceRate: Math.max(50, s.attendanceRate - 2) // slight transient drop
        };
      }
      return s;
    }));
  };

  // Bind key font modifications based on active scale state
  const fontSizeClass = 
    textSize === 'large' 
      ? 'text-lg prose-lg' 
      : textSize === 'extra' 
      ? 'text-xl prose-xl' 
      : 'text-sm';

  return (
    <div 
      className={`min-h-screen pb-16 flex flex-col font-sans transition-all duration-150 ${
        highContrast 
          ? 'bg-black text-white selection:bg-yellow-400 selection:text-black' 
          : 'bg-[#f0f4f8] bg-gradient-to-br from-[#f0f4f8] via-[#ebf1f6] to-[#f8fafc] text-slate-800 selection:bg-blue-100'
      } ${fontSizeClass}`}
      id="app-root-container"
    >
      
      {/* ACCESS BANNER WCAG HEADER RAIL */}
      <h1 className="sr-only">Plataforma Digital de Acompanhamento do Bem-Estar, Saúde e Desempenho Escolar dos Alunos</h1>
      <header 
        className={`px-4 sm:px-8 py-3.5 border-b shadow-xs flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-150 ${
          highContrast ? 'bg-black border-yellow-400 text-yellow-400' : 'glass-panel sticky top-0 z-50'
        }`}
        role="banner"
      >
        
        {/* Brand identity signature */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black tracking-tight text-sm text-slate-900 dark:text-yellow-400 text-slate-900">
                PORTAL GERAL DE SAÚDE ESCOLAR
              </span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-yellow-400 dark:text-black px-1.5 py-0.2 rounded">
                Escola Segura
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Acompanhamento do Bem-Estar, Sensorial & Rendimento Académico</p>
          </div>
        </div>

        {/* Real-time Clock PT and accessibility trigger control */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-300 font-sans font-medium">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{timeStr || 'Sábado, 20 de Junho'}</span>
          </div>

          <div className="flex items-center gap-2">
            <A11ySettings 
              highContrast={highContrast} 
              setHighContrast={setHighContrast}
              textSize={textSize}
              setTextSize={setTextSize}
              screenReaderActive={screenReaderActive}
              setScreenReaderActive={setScreenReaderActive}
            />
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT AREA WITH RESTRICTION TO DESKTOP & MOBILE GRIDS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" role="main">
        
        {/* SIMULATION ROLE SELECT / DEMO BAR CHANGER */}
        <RoleSelector 
          currentRole={currentUserRole} 
          onChangeRole={(roleVal) => {
            setCurrentUserRole(roleVal);
            // close any open modal on role shifting to keep state safe
            setSelectedStudent(null);
          }}
          highContrast={highContrast}
          onAnnounce={announceToScreen}
        />

        {/* PROFILE RENDER LAYER ACCORDING TO ROLES GESTOR VS TEACHER VS PARENT */}
        {currentUserRole === 'GESTOR' && (
          <section aria-label="Consola de Gestão Escolar" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Shield className="w-4.5 h-4.5 text-blue-600" />
                Painel do Administrador Geral / Gestor Escolar
              </h2>
            </div>
            
            <GestorDashboard 
              students={students}
              healthProfiles={healthProfiles}
              absences={absences}
              alerts={alerts}
              notices={notices}
              highContrast={highContrast}
              onSelectStudent={setSelectedStudent}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onUpdateAbsenceStatus={handleUpdateAbsenceStatus}
              onResolveAlert={handleResolveAlert}
              onAddNotice={handleAddNotice}
              onResetData={handleResetToFactoryDefaults}
              onAnnounce={announceToScreen}
            />
          </section>
        )}

        {currentUserRole === 'PROFESSOR' && (
          <section aria-label="Área de Trabalho Docente" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <GraduationCap className="w-4.5 h-4.5 text-emerald-600" />
                Diário Eletrónico de Turma / Professor Tutelar
              </h2>
            </div>

            <ProfessorDashboard 
              students={students}
              healthProfiles={healthProfiles}
              observations={observations}
              absences={absences}
              alerts={alerts}
              highContrast={highContrast}
              onSelectStudent={setSelectedStudent}
              onAddObservation={handleAddObservation}
              onAnnounce={announceToScreen}
            />
          </section>
        )}

        {currentUserRole === 'ENCARREGADO' && (
          <section aria-label="Consola do Encarregado de Educação" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <UserCheck className="w-4.5 h-4.5 text-violet-600" />
                Área Escolar do Encarregado de Educação (Caderneta)
              </h2>
            </div>

            <EncarregadoDashboard 
              students={students}
              healthProfiles={healthProfiles}
              absences={absences}
              alerts={alerts}
              notices={notices}
              highContrast={highContrast}
              onSelectStudent={setSelectedStudent}
              onSubmitAbsenceJustification={handleSubmitAbsenceJustification}
              onAnnounce={announceToScreen}
            />
          </section>
        )}

      </main>

      {/* STUDENT DETAILED FILE PORTFOLIO OVERLAY MODAL */}
      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent}
          healthProfile={healthProfiles[selectedStudent.id] || {
            vaccines: [], allergies: [], visionCheck: {status: 'Por Evaluat', lastChecked: ''}, hearingCheck: {status: 'Por Evaluat', lastChecked: ''}, generalNotes: '', recommendations: []
          }}
          observations={observations.filter(o => o.studentId === selectedStudent.id)}
          absences={absences.filter(a => a.studentId === selectedStudent.id)}
          alerts={alerts.filter(a => a.studentId === selectedStudent.id)}
          currentUserRole={currentUserRole}
          highContrast={highContrast}
          onClose={() => setSelectedStudent(null)}
          onUpdateHealthProfile={handleUpdateHealthProfile}
          onAddObservation={handleAddObservation}
          onAnnounce={announceToScreen}
        />
      )}

      {/* COMPLIANT SYSTEM FOOTER */}
      <footer 
        className={`mt-auto py-5 text-center text-xs border-t ${
          highContrast ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-white text-slate-400 border-slate-100'
        }`}
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Plataforma Portuguesa de Bem-Estar e Saúde Escolar. Ministério da Educação e Saúde.</span>
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 dark:bg-zinc-900 dark:text-yellow-400 px-2.5 py-0.5 rounded text-[10px] font-bold">
            Conformidade WCAG 2.1 AA & Proteção RGPD Integrada
          </span>
        </div>
      </footer>

    </div>
  );
}
