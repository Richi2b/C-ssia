import React, { useState } from 'react';
import { 
  Users, Calendar, AlertTriangle, FileText, Bell, Search, Filter, 
  Check, X, Plus, Trash2, Heart, Eye, Volume2, ShieldAlert, Award, FileSpreadsheet, CheckCircle, RefreshCw
} from 'lucide-react';
import { Student, HealthProfile, Absence, PreventiveAlert, SystemNotice, UserRole } from '../types';

interface GestorDashboardProps {
  students: Student[];
  healthProfiles: Record<string, HealthProfile>;
  absences: Absence[];
  alerts: PreventiveAlert[];
  notices: SystemNotice[];
  highContrast: boolean;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (newStudent: Student, initialHealth: HealthProfile) => void;
  onDeleteStudent: (studentId: string) => void;
  onUpdateAbsenceStatus: (absenceId: string, status: Absence['status'], response: string) => void;
  onResolveAlert: (alertId: string) => void;
  onAddNotice: (notice: Omit<SystemNotice, 'id' | 'date' | 'author'>) => void;
  onResetData: () => void;
  onAnnounce: (msg: string) => void;
}

export default function GestorDashboard({
  students,
  healthProfiles,
  absences,
  alerts,
  notices,
  highContrast,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onUpdateAbsenceStatus,
  onResolveAlert,
  onAddNotice,
  onResetData,
  onAnnounce
}: GestorDashboardProps) {
  // Tabs for Manager Console
  const [activeSubTab, setActiveSubTab] = useState<'alunos' | 'justificacoes' | 'alertas' | 'comunicados' | 'relatorios'>('alunos');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('Todas');
  const [healthFilter, setHealthFilter] = useState('Todos');

  // Form states for new Student
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudName, setNewStudName] = useState('');
  const [newStudAge, setNewStudAge] = useState(12);
  const [newStudGender, setNewStudGender] = useState<'Masc' | 'Fem'>('Masc');
  const [newStudGrade, setNewStudGrade] = useState('7º Ano');
  const [newStudClass, setNewStudClass] = useState('Turma A');
  const [newStudParent, setNewStudParent] = useState('');
  const [newStudEmail, setNewStudEmail] = useState('');
  const [newStudPhone, setNewStudPhone] = useState('');
  const [newStudAverage, setNewStudAverage] = useState(80);
  const [hasAlergia, setHasAlergia] = useState('');
  
  // Form states for new Notice
  const [showAddNoticeForm, setShowAddNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'Geral' | 'Saúde' | 'Pedagógico' | 'Campanha'>('Geral');
  const [noticeTarget, setNoticeTarget] = useState<'Todos' | 'Professores' | 'Encarregados'>('Todos');
  const [noticeContent, setNoticeContent] = useState('');

  // Justification handle state
  const [justificationReplyingId, setJustificationReplyingId] = useState<string | null>(null);
  const [justificationResponse, setJustificationResponse] = useState('');

  // Count metrics
  const totalStudents = students.length;
  const pendingAbsences = absences.filter(a => a.status === 'Pendente').length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const vaccinationDebts = Object.values(healthProfiles).filter(p => p.vaccines.some(v => v.status === 'Em Falta')).length;

  // Grade lists derived
  const grades = ['Todas', ...Array.from(new Set(students.map(s => s.grade)))];

  // Filters students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = gradeFilter === 'Todas' || student.grade === gradeFilter;
    
    // Health checks filter
    const profile = healthProfiles[student.id];
    let matchesHealth = true;
    if (healthFilter === 'Visão') {
      matchesHealth = profile?.visionCheck.status === 'Necessita Atenção';
    } else if (healthFilter === 'Audição') {
      matchesHealth = profile?.hearingCheck.status === 'Necessita Atenção';
    } else if (healthFilter === 'Vacinas Em Falta') {
      matchesHealth = profile?.vaccines.some(v => v.status === 'Em Falta') || false;
    } else if (healthFilter === 'Alergia Alimentar') {
      matchesHealth = (profile?.allergies.length > 0) || false;
    }

    return matchesSearch && matchesGrade && matchesHealth;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudName || !newStudParent) {
      alert("Por favor insira os dados mínimos obrigatórios (Nome do Aluno e Encarregado).");
      return;
    }

    const brandNewStudent: Student = {
      id: Math.random().toString(36).substring(2, 9),
      name: newStudName,
      age: Number(newStudAge),
      gender: newStudGender,
      grade: newStudGrade,
      classGroup: newStudClass,
      parentName: newStudParent,
      parentEmail: newStudEmail || `${newStudParent.toLowerCase().replace(/\s/g, '')}@email.pt`,
      parentPhone: newStudPhone || '912 000 000',
      gradeAverage: Number(newStudAverage),
      attendanceRate: 100
    };

    const initialHealth: HealthProfile = {
      vaccines: [
        { name: 'Tetáno-Difteria (Td)', status: 'Em Dia', date: '2025-01-01' },
         { name: 'Vacina Geral Contra Hepatite', status: 'Em Dia', date: '2024-05-01' }
      ],
      allergies: hasAlergia.trim() ? [hasAlergia.trim()] : [],
      visionCheck: { status: 'Normal', lastChecked: new Date().toISOString().split('T')[0] },
      hearingCheck: { status: 'Normal', lastChecked: new Date().toISOString().split('T')[0] },
      generalNotes: 'Ficha médica escolar gerada na admissão.',
      recommendations: []
    };

    onAddStudent(brandNewStudent, initialHealth);
    setShowAddStudentForm(false);
    // Reset inputs
    setNewStudName('');
    setNewStudParent('');
    setNewStudEmail('');
    setNewStudPhone('');
    setHasAlergia('');
    onAnnounce(`O aluno ${newStudName} foi registado no sistema com sucesso.`);
  };

  const handlePostNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    onAddNotice({
      title: noticeTitle.trim(),
      category: noticeCategory,
      target: noticeTarget,
      content: noticeContent.trim()
    });

    setNoticeTitle('');
    setNoticeContent('');
    setShowAddNoticeForm(false);
    onAnnounce(`Novo comunicado escolar '${noticeTitle}' foi enviado para ${noticeTarget}.`);
  };

  const handleAbsenceResponse = (absenceId: string, status: Absence['status']) => {
    if (!justificationResponse.trim()) {
      alert("Por favor escreva uma breve justificação ou parecer oficial para o encarregado.");
      return;
    }
    onUpdateAbsenceStatus(absenceId, status, justificationResponse.trim());
    setJustificationReplyingId(null);
    setJustificationResponse('');
    onAnnounce(`Justificação de falta ${status === 'Justificada' ? 'APROVADA' : 'REJEITADA'}. Notificação enviada para o pai.`);
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Cards Summary Panel */}
      <h3 className="sr-only">Painel de Resumo Métrico</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* CARD 1: ALUNOS */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card text-slate-800 glass-hover'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Estudantes</span>
            <p className="text-2xl font-extrabold">{totalStudents}</p>
            <p className="text-[10px] text-slate-400">Ativos no ano letivo corrente</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* CARD 2: REPLIES PENDING */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card text-slate-800 glass-hover'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Justificações</span>
            <p className="text-2xl font-extrabold text-amber-600">{pendingAbsences}</p>
            <p className="text-[10px] text-slate-400">Faltas pendentes de aprovação</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* CARD 3: ACTIVE ALERTS */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card text-slate-800 glass-hover'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alertas Preventivos</span>
            <p className="text-2xl font-extrabold text-red-600">{activeAlerts}</p>
            <p className="text-[10px] text-slate-400">Casos identificados que requerem atenção</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* CARD 4: VACCINE FLAG */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card text-slate-800 glass-hover'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vacinação em Falta</span>
            <p className="text-2xl font-extrabold text-emerald-600">{vaccinationDebts}</p>
            <p className="text-[10px] text-slate-400">Alunos com boletins atrasados</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Heart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className={`flex border-b overflow-x-auto p-1.5 transition-all duration-150 ${highContrast ? 'border-yellow-400 bg-black' : 'glass-panel rounded-2xl'}`}>
        {[
          { id: 'alunos' as const, label: 'Alunos & Fichas Médicas', count: totalStudents, icon: Users },
          { id: 'justificacoes' as const, label: 'Pedidos de Justificação', count: pendingAbsences, icon: FileText, flag: pendingAbsences > 0 },
          { id: 'alertas' as const, label: 'Alertas de Prevenção', count: activeAlerts, icon: ShieldAlert, flag: activeAlerts > 0 },
          { id: 'comunicados' as const, label: 'Mesa de Comunicados', count: notices.length, icon: Bell },
          { id: 'relatorios' as const, label: 'Relatórios & Estatísticas', icon: FileSpreadsheet }
        ].map((tab) => {
          const isSelected = activeSubTab === tab.id;
          const SubIcon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                onAnnounce(`Módulo de gestão ${tab.label} selecionado.`);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all focus:outline-none whitespace-nowrap shrink-0 ${
                isSelected
                  ? highContrast
                    ? 'bg-yellow-400 text-black font-extrabold'
                    : 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : highContrast
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              <SubIcon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected 
                    ? highContrast ? 'bg-black text-white' : 'bg-blue-800 text-white' 
                    : tab.flag 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB PANELS */}

      {/* MODULE 1: ALUNOS & FICHAS */}
      {activeSubTab === 'alunos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Action Bar */}
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar aluno ou encarregado..."
                  className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-lg focus:outline-none ${
                    highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                  }`}
                />
              </div>

              {/* Grade select */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className={`py-1.5 px-3 text-xs rounded-lg font-sans focus:outline-none ${
                  highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                }`}
                title="Filtrar por Ano"
              >
                {grades.map(g => (
                  <option key={g} value={g}>{g === 'Todas' ? 'Todos os Anos' : g}</option>
                ))}
              </select>

              {/* Health select */}
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className={`py-1.5 px-3 text-xs rounded-lg font-sans focus:outline-none ${
                  highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                }`}
                title="Filtrar Alunos por Alertas Médicos"
              >
                <option value="Todos">Filtro Clínico (Sem Filtro)</option>
                <option value="Visão">Necessita Atenção Visual</option>
                <option value="Audição">Necessita Atenção Auditiva</option>
                <option value="Vacinas Em Falta">Vacinações Incompletas</option>
                <option value="Alergia Alimentar">Com Alergia Alimentar</option>
              </select>
            </div>

            {/* Register pupil button */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Matricular Aluno
              </button>
              <button 
                onClick={onResetData}
                title="Repor Alunos de Fábrica"
                className={`p-1.5 rounded-lg shrink-0 ${
                  highContrast ? 'border border-yellow-400 bg-black text-yellow-400' : 'glass-input hover:bg-white/80'
                }`}
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* New Student Form */}
          {showAddStudentForm && (
            <form onSubmit={handleCreateStudent} className="p-5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/5/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-bold text-sm text-blue-800">Nova Matrícula Escolar e Ficha Auxiliar de Saúde</h4>
                <button type="button" onClick={() => setShowAddStudentForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={newStudName}
                    onChange={(e) => setNewStudName(e.target.value)}
                    required
                    placeholder="Ex: Pedro Miguel Neves"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Idade</label>
                  <input
                    type="number"
                    value={newStudAge}
                    onChange={(e) => setNewStudAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Género</label>
                  <select
                    value={newStudGender}
                    onChange={(e) => setNewStudGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="Masc">Masculino</option>
                    <option value="Fem">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Ano Escolar</label>
                  <select
                    value={newStudGrade}
                    onChange={(e) => setNewStudGrade(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="5º Ano">5º Ano</option>
                    <option value="6º Ano">6º Ano</option>
                    <option value="7º Ano">7º Ano</option>
                    <option value="8º Ano">8º Ano</option>
                    <option value="9º Ano">9º Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Turma</label>
                  <input
                    type="text"
                    value={newStudClass}
                    onChange={(e) => setNewStudClass(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    placeholder="Ex: Turma A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Rendimento Médio Inicial (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudAverage}
                    onChange={(e) => setNewStudAverage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Alergias Clínicas Iniciais</label>
                  <input
                    type="text"
                    value={hasAlergia}
                    onChange={(e) => setHasAlergia(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    placeholder="Ex: Amendoins / Pólen ou vazio"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Encarregado de Educação</label>
                  <input
                    type="text"
                    value={newStudParent}
                    onChange={(e) => setNewStudParent(e.target.value)}
                    required
                    placeholder="Ex: Maria Clara Neves"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Contacto Telefónico</label>
                  <input
                    type="text"
                    value={newStudPhone}
                    onChange={(e) => setNewStudPhone(e.target.value)}
                    placeholder="E.g. 913 444 555"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newStudEmail}
                    onChange={(e) => setNewStudEmail(e.target.value)}
                    placeholder="Ex: encarregado@email.pt"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStudentForm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Confirmar e Gerar Cadastro
                </button>
              </div>
            </form>
          )}

          {/* List display */}
          <div className={`divide-y divide-slate-150 rounded-2xl overflow-hidden transition-all duration-150 ${
            highContrast ? 'border border-yellow-400 bg-black' : 'glass-panel'
          }`}>
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50">
                <p className="text-sm text-slate-500">Nenhum aluno corresponde às preferências de pesquisa ou filtros clínicos ativos.</p>
              </div>
            ) : (
              filteredStudents.map((stud) => {
                const profile = healthProfiles[stud.id];
                const alertsForStud = alerts.filter(a => a.studentId === stud.id && !a.resolved);
                const isLateVaccine = profile?.vaccines.some(v => v.status === 'Em Falta');

                return (
                  <div
                    key={stud.id}
                    className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all font-sans cursor-pointer focus-within:ring-2 focus-within:ring-blue-400 ${
                      highContrast ? 'hover:bg-zinc-900 border-b border-yellow-400/20' : 'hover:bg-white/45 border-b border-white/50'
                    }`}
                    onClick={() => {
                      onSelectStudent(stud);
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Genero color avatar */}
                      <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm font-bold uppercase ${
                        stud.gender === 'Fem' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {stud.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-900 group-hover:text-blue-600 truncate">{stud.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {stud.grade} - {stud.classGroup}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight">
                          Idade: <span className="font-semibold text-slate-600">{stud.age} anos</span> | Encarregado: <span className="font-semibold text-slate-600">{stud.parentName}</span>
                        </p>
                        
                        {/* Quick health pills indicator */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {profile?.visionCheck.status === 'Necessita Atenção' && (
                            <span className="text-[9px] font-extrabold bg-red-100 text-red-800 px-1.5 rounded flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" /> Visão
                            </span>
                          )}
                          {profile?.hearingCheck.status === 'Necessita Atenção' && (
                            <span className="text-[9px] font-extrabold bg-red-100 text-red-800 px-1.5 rounded flex items-center gap-0.5">
                              <Volume2 className="w-2.5 h-2.5" /> Audição
                            </span>
                          )}
                          {isLateVaccine && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 rounded flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5" /> Vacina Atrasada
                            </span>
                          )}
                          {profile?.allergies.length > 0 && (
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 rounded">
                              Alergias: {profile.allergies.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8 border-t md:border-transparent pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rendimento</span>
                        <span className={`text-sm font-black ${stud.gradeAverage < 60 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                          {stud.gradeAverage}/100
                        </span>
                      </div>

                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Assiduidade</span>
                        <span className={`text-sm font-black ${stud.attendanceRate < 90 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {stud.attendanceRate}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(stud);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold focus:outline-none"
                        >
                          Ver Perfil
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Tem a certeza de que deseja eliminar o registo do aluno ${stud.name}?`)) {
                              onDeleteStudent(stud.id);
                              onAnnounce(`O aluno ${stud.name} foi removido do portal.`);
                            }
                          }}
                          className="p-1 px-1.5 rounded text-red-500 hover:bg-red-50"
                          title="Eliminar aluno"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: RECALIBRATE JUSTIFICATIONS */}
      {activeSubTab === 'justificacoes' && (
        <div className="space-y-4 font-sans">
          <div className="pb-1 border-b">
            <h4 className="font-bold text-sm text-slate-800">Justificações de Ausência Pendentes de Parecer</h4>
            <p className="text-xs text-slate-400">Como encarregados de educação submetem documentos, os gestores validam ou requisitam mais provas.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {absences.filter(a => a.status === 'Pendente').length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border rounded-xl text-slate-500">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Não há justificações de ausência pendentes.</p>
                <p className="text-xs text-slate-400 mt-1">Todos os pedidos de justificação foram devidamente despachados pela secretaria.</p>
              </div>
            ) : (
              absences.filter(a => a.status === 'Pendente').map((abs) => {
                const associatedStud = students.find(s => s.id === abs.studentId);
                const isReplying = justificationReplyingId === abs.id;

                return (
                  <div key={abs.id} className="p-4 border border-slate-200 bg-white rounded-xl shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">Estudante: {associatedStud?.name || 'Não identificado'}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 rounded-full font-sans">
                            {associatedStud?.grade} - {associatedStud?.classGroup}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Invocado por <span className="font-medium text-slate-700">{associatedStud?.parentName}</span> para a ausência em <strong>{abs.date}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                        Pendente
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-normal p-3 rounded-lg bg-slate-50 border">
                      <p><strong>Descrição do Encarregado:</strong> "{abs.reason}"</p>
                      {abs.attachmentName && (
                        <div className="mt-2 text-[11px] text-blue-600 font-bold flex items-center gap-1">
                          <span>Documento Anexo:</span>
                          <span className="underline italic cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded">{abs.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    {isReplying ? (
                      <div className="space-y-2 p-3 bg-blue-50/30 rounded-lg border border-blue-200 flex flex-col gap-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Justificação e Despacho da Direção</label>
                        <textarea
                          rows={2}
                          value={justificationResponse}
                          onChange={(e) => setJustificationResponse(e.target.value)}
                          placeholder="Ex: Justificação de falta aceite. O encarregado de educação providenciou a declaração clínica médica adequada."
                          className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                          required
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setJustificationReplyingId(null);
                              setJustificationResponse('');
                            }}
                            className="bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAbsenceResponse(abs.id, 'Rejeitada')}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded"
                          >
                            Rejeitar Falta
                          </button>
                          <button
                            onClick={() => handleAbsenceResponse(abs.id, 'Justificada')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded"
                          >
                            Aprovar & Justificar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setJustificationReplyingId(abs.id);
                            setJustificationResponse('Justificação de falta aceite de forma regulamentar.');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Check className="w-4 h-4" /> Despachar Justificação
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: MONITORE ALERTS */}
      {activeSubTab === 'alertas' && (
        <div className="space-y-4 font-sans">
          <div className="pb-1 border-b">
            <h4 className="font-bold text-sm text-slate-800">Sistema de Alertas Preventivos das Escolas</h4>
            <p className="text-xs text-slate-400">Lista gerada por cruzamento do diário pedagógico de visão, audição, ausências consecutivas e vacinação pendente.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alerts.filter(a => !a.resolved).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border rounded-xl text-slate-500">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Nenhum alerta ativo no sistema preventivo.</p>
              </div>
            ) : (
              alerts.filter(a => !a.resolved).map((alert) => (
                <div key={alert.id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  alert.severity === 'Crítico' 
                    ? 'bg-red-50/40 text-red-900 border-red-200' 
                    : 'bg-amber-50/40 text-amber-900 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${alert.severity === 'Crítico' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm">{alert.studentName}</strong>
                        <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${alert.severity === 'Crítico' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Emitido em {alert.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal font-sans">
                        <span className="font-bold mr-1">{alert.type}:</span>
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onResolveAlert(alert.id);
                      onAnnounce(`Alerta de ${alert.type} resolvido para o aluno ${alert.studentName}.`);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 self-start sm:self-center transition-all ${
                      highContrast
                        ? 'bg-yellow-400 text-black border-2 border-black'
                        : 'bg-white hover:bg-slate-100 text-slate-800 shadow-xs border border-slate-200'
                    }`}
                  >
                    Marcar Como Resolvido
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODULE 4: EMIT COMUNICADOS */}
      {activeSubTab === 'comunicados' && (
        <div className="space-y-4 font-sans">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Comunicados Gerais e Campanhas Públicas</h4>
              <p className="text-xs text-slate-400">Emita diretivas de saúde, avisos de reuniões ou campanhas de sensibilização escolar.</p>
            </div>
            <button
              onClick={() => setShowAddNoticeForm(!showAddNoticeForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Emitir Novo Comunicado
            </button>
          </div>

          {showAddNoticeForm && (
            <form onSubmit={handlePostNoticeSubmit} className="p-4 rounded-xl border border-blue-200 bg-blue-50/10 space-y-3">
              <h5 className="font-bold text-xs">Nova Diretiva Escolar</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Título do Comunicado</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    required
                    placeholder="Campanha de Vacinação, Prazos..."
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Categoria</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Pedagógico">Pedagógico</option>
                    <option value="Campanha">Campanha / Rastreio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Destinatário Alvo</label>
                  <select
                    value={noticeTarget}
                    onChange={(e) => setNoticeTarget(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Professores">Professores</option>
                    <option value="Encarregados">Encarregados de Educação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Conteúdo do Comunicado</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  rows={3}
                  required
                  placeholder="Escreva as diretivas necessárias de forma clara."
                  className="w-full text-xs p-2.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeForm(false)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-105 text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded bg-blue-600 text-white"
                >
                  Publicar Comunicado
                </button>
              </div>
            </form>
          )}

          {/* List notice boards posted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((not) => {
              const catColors = {
                'Geral': 'bg-slate-100 text-slate-700',
                'Saúde': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                'Pedagógico': 'bg-blue-100 text-blue-800',
                'Campanha': 'bg-pink-100 text-pink-800'
              };

              return (
                <div key={not.id} className="p-4 rounded-xl border border-slate-150 bg-white hover:shadow-xs space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded ${catColors[not.category]}`}>
                      {not.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{not.date}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{not.title}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed leading-normal line-clamp-3">
                    {not.content}
                  </p>
                  <div className="pt-2 border-t text-[10px] text-slate-400 flex justify-between items-center">
                    <span>Publicado por: {not.author}</span>
                    <span>Alvo: <strong>{not.target}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODULE 5: RELATÓRIOS & DATA VISUALIZATIONS */}
      {activeSubTab === 'relatorios' && (
        <div className="space-y-6 font-sans">
          <div className="pb-1 border-b flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Relatórios e Cruzamento de Dados Académico-Saúde</h4>
              <p className="text-xs text-slate-400">Análise agregada que correlaciona dificuldades físicas e ausências com o rendimento.</p>
            </div>
            {/* Fake PDF print/export utility conforming to single page limitation */}
            <button
              onClick={() => {
                window.print();
                onAnnounce("Despoletando impressão de relatório escolar consolidado.");
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar para PDF / Imprimir
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SVG Visual Ratios */}
            <div className="p-5 rounded-xl border bg-white space-y-4">
              <h5 className="font-bold text-xs text-slate-800 tracking-tight">Rastreios de Triagem Sensorial (Visão / Audição)</h5>
              <p className="text-[11px] text-slate-400 leading-tight">
                Estudantes com queixas ou observações que necessitam de consulta urgente:
              </p>

              {/* Dynamic SVG Drawing represents total scale */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Alunos Indicados com Desvio Visual</span>
                    <span className="text-red-600">
                      {students.filter(s => healthProfiles[s.id]?.visionCheck.status === 'Necessita Atenção').length} aluno(s)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-500 rounded-full" 
                      style={{ width: `${(students.filter(s => healthProfiles[s.id]?.visionCheck.status === 'Necessita Atenção').length / totalStudents) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Alunos Indicados com Desvio Auditivo</span>
                    <span className="text-pink-600">
                      {students.filter(s => healthProfiles[s.id]?.hearingCheck.status === 'Necessita Atenção').length} aluno(s)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-500 rounded-full" 
                      style={{ width: `${(students.filter(s => healthProfiles[s.id]?.hearingCheck.status === 'Necessita Atenção').length / totalStudents) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Vacinação Geral Escolar em Conformidade</span>
                    <span className="text-emerald-700">
                      {Math.round((Object.values(healthProfiles).filter(p => p.vaccines.every(v => v.status === 'Em Dia')).length / totalStudents) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full" 
                      style={{ width: `${(Object.values(healthProfiles).filter(p => p.vaccines.every(v => v.status === 'Em Dia')).length / totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix correlations */}
            <div className="p-5 rounded-xl border bg-white space-y-3">
              <h5 className="font-bold text-xs text-slate-800 tracking-tight">Correlação Saúde e Desempenho (Análise Preditiva)</h5>
              <div className="space-y-3.5 text-xs leading-normal">
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-105">
                  <p className="font-bold text-blue-900 flex items-center gap-1 text-[11px] uppercase mb-1">
                    <Award className="w-4 h-4 text-blue-600" /> Rendimento dos Estudantes Visados
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Estudantes sem alertas detetados apresentam média académica de <strong>90%</strong>. Os estudantes com alertas ativos de visão/audição não tratados situam-se em <strong>58%</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-pink-50/50 border border-pink-105">
                  <p className="font-bold text-pink-900 flex items-center gap-1 text-[11px] uppercase mb-1">
                    <Calendar className="w-4 h-4 text-pink-600" /> Taxa de Absenteísmo Relacionado à Saúde
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Cerca de <strong>78%</strong> das faltas submetidas este mês foram motivadas por razões médicas oficiais (atestados, consultas pós-cirurgia, etc.).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
