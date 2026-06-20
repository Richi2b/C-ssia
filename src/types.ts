export interface Vaccine {
  name: string;
  status: 'Em Dia' | 'Em Falta' | 'Pendente';
  date?: string;
}

export interface HealthProfile {
  vaccines: Vaccine[];
  allergies: string[];
  visionCheck: {
    status: 'Normal' | 'Necessita Atenção' | 'Por Avaliar';
    lastChecked: string;
    notes?: string;
  };
  hearingCheck: {
    status: 'Normal' | 'Necessita Atenção' | 'Por Avaliar';
    lastChecked: string;
    notes?: string;
  };
  generalNotes: string;
  recommendations: string[];
}

export interface Student {
  id: string;
  name: string;
  age: number;
  gender: 'Masc' | 'Fem';
  avatarUrl?: string;
  grade: string;       // e.g., "7º Ano"
  classGroup: string;  // e.g., "Turma A"
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  gradeAverage: number; // 0-20 (or 0-100, let's use Portuguese school standard 1 to 5 or percentage. Let's use 0-20 scale or %: 0-100 is very intuitive, let's use 1-5 scale or percentage. Percentage 0-100 is great across countries, let's do 0-100)
  attendanceRate: number; // Percentage, e.g. 92
}

export interface Absence {
  id: string;
  studentId: string;
  date: string;
  reason: string;
  status: 'Não Justificada' | 'Pendente' | 'Justificada' | 'Rejeitada';
  attachmentName?: string;
  attachmentData?: string; // base64 or mockup URL string
  schoolResponse?: string;
  updatedAt?: string;
}

export interface Observation {
  id: string;
  studentId: string;
  date: string;
  authorName: string;
  type: 'Pedagógica' | 'Bem-Estar' | 'Saúde' | 'Comportamental';
  content: string;
}

export interface PreventiveAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Faltas Excessivas' | 'Visão' | 'Audição' | 'Queda Académica' | 'Saúde Geral';
  severity: 'Aviso' | 'Crítico';
  description: string;
  date: string;
  resolved: boolean;
}

export interface SystemNotice {
  id: string;
  title: string;
  content: string;
  target: 'Todos' | 'Professores' | 'Encarregados';
  date: string;
  author: string;
  category: 'Geral' | 'Saúde' | 'Pedagógico' | 'Campanha';
}

export type UserRole = 'GESTOR' | 'PROFESSOR' | 'ENCARREGADO';
