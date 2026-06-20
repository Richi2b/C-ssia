import React, { useState } from 'react';
import { 
  Users, Eye, VolumeX, AlertOctagon, Plus, FileText, Search, Activity, 
  Settings, Check, ChevronRight, HelpCircle, Heart, NotebookPen, Info
} from 'lucide-react';
import { Student, HealthProfile, Observation, Absence, PreventiveAlert } from '../types';

interface ProfessorDashboardProps {
  students: Student[];
  healthProfiles: Record<string, HealthProfile>;
  observations: Observation[];
  absences: Absence[];
  alerts: PreventiveAlert[];
  highContrast: boolean;
  onSelectStudent: (student: Student) => void;
  onAddObservation: (studentId: string, obs: Omit<Observation, 'id' | 'date'>) => void;
  onAnnounce: (msg: string) => void;
}

export default function ProfessorDashboard({
  students,
  healthProfiles,
  observations,
  absences,
  alerts,
  highContrast,
  onSelectStudent,
  onAddObservation,
  onAnnounce
}: ProfessorDashboardProps) {
  // Active class filter for the teacher
  const [selectedClass, setSelectedClass] = useState<string>('7º Ano - Turma A');
  const [searchQuery, setSearchQuery] = useState('');

  // Form block
  const [selectedStudentForObs, setSelectedStudentForObs] = useState<string>('');
  const [newObsType, setNewObsType] = useState<'Pedagógica' | 'Bem-Estar' | 'Saúde' | 'Comportamental'>('Bem-Estar');
  const [newObsText, setNewObsText] = useState('');

  // Class list options from mock
  const classOptions = [
    '7º Ano - Turma A',
    '8º Ano - Turma B',
    '6º Ano - Turma C'
  ];

  // Filters students of active class
  const classStudents = students.filter(s => {
    const classGroupStr = `${s.grade} - ${s.classGroup}`;
    const matchesClass = classGroupStr === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleQuickObsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForObs || !newObsText.trim()) {
      alert("Por favor escolha um estudante e escreva a observação.");
      return;
    }

    const targetStud = students.find(s => s.id === selectedStudentForObs);
    onAddObservation(selectedStudentForObs, {
      studentId: selectedStudentForObs,
      authorName: 'Prof. Rui Barbosa (Matemática)', // Simulated login name
      type: newObsType,
      content: newObsText.trim()
    });

    setNewObsText('');
    setSelectedStudentForObs('');
    onAnnounce(`Observação registada com sucesso no diário eletrónico de ${targetStud?.name}.`);
  };

  // Recent observations made by teachers
  const recentTeacherLogs = observations.filter(o => o.authorName.includes('Rui') || o.authorName.includes('Maria'));

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-150 ${
        highContrast ? 'bg-black text-white border-yellow-400' : 'glass-panel shadow-2xs'
      }`}>
        <div className="space-y-1">
          <label htmlFor="class-selector" className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">Turma Sob Custódia Pedagógica</label>
          <h3 className="text-lg font-bold text-slate-800">Conselho de Turma Operacional</h3>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <select
            id="class-selector"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              onAnnounce(`Turma alterada para ${e.target.value}. Mostrando lista de alunos correspondente.`);
            }}
            className={`py-1.5 px-3.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
            }`}
          >
            {classOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Student Lists and general details */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex justify-between items-center gap-2">
            <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Pauta da Turma ({classStudents.length} Alunos Inscritos)</h4>
            
            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar estudante..."
                className={`pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                }`}
              />
            </div>
          </div>

          <div className={`divide-y divide-slate-100 overflow-hidden rounded-2xl transition-all duration-150 ${
            highContrast ? 'border border-yellow-400 bg-black' : 'glass-panel'
          }`}>
            {classStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 text-slate-400">
                Sem alunos matriculados nesta turma que correspondam ao critério de pesquisa.
              </div>
            ) : (
              classStudents.map((stud) => {
                const profile = healthProfiles[stud.id];
                const activeAlerts = alerts.filter(a => a.studentId === stud.id && !a.resolved);
                const isLateVaccine = profile?.vaccines.some(v => v.status === 'Em Falta');

                return (
                  <div
                    key={stud.id}
                    onClick={() => onSelectStudent(stud)}
                    className={`p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 cursor-pointer transition-all duration-150 ${
                      highContrast ? 'border-b border-yellow-400/20 hover:bg-zinc-900' : 'border-b border-white/50 hover:bg-white/45'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Standard Avatar representation */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        stud.gender === 'Fem' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {stud.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>

                      <div>
                        <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 truncate">{stud.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assiduidade: <span className={`font-semibold ${stud.attendanceRate < 90 ? 'text-red-500' : 'text-slate-600'}`}>{stud.attendanceRate}%</span> | Média: <span className="font-semibold text-slate-600">{stud.gradeAverage}/100</span>
                        </p>
                        
                        {/* Rapid Status indicators inside Teacher Class row */}
                        <div className="flex gap-1.5 mt-1">
                          {profile?.visionCheck.status === 'Necessita Atenção' && (
                            <span className="text-[9px] font-black bg-red-50 text-red-700 px-1.5 rounded border border-red-100 flex items-center gap-0.5" title={profile.visionCheck.notes}>
                              <Eye className="w-2.5 h-2.5" /> Visão sob Alerta
                            </span>
                          )}
                          {profile?.hearingCheck.status === 'Necessita Atenção' && (
                            <span className="text-[9px] font-black bg-red-100 text-red-800 px-1.5 rounded flex items-center gap-0.5" title={profile.hearingCheck.notes}>
                              <VolumeX className="w-2.5 h-2.5" /> Audição sob Alerta
                            </span>
                          )}
                          {activeAlerts.length > 0 && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 rounded font-medium">
                              {activeAlerts.length} alerta(s) ativo(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForObs(stud.id);
                        }}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded text-[11px] font-bold"
                      >
                        Registar Diário
                      </button>
                      <button
                        onClick={() => onSelectStudent(stud)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-bold"
                      >
                        Ficha Completa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick observation tool & logs review */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick-add observation form */}
          <div className={`p-5 rounded-2xl border transition-all duration-150 ${highContrast ? 'border-yellow-400 bg-black text-white' : 'glass-panel shadow-xs'}`}>
            <h4 className="font-extrabold text-xs uppercase text-slate-400 mb-2.5 tracking-wider flex items-center gap-1.5">
              <NotebookPen className="w-4 h-4 text-blue-600" />
              Diário Crítico de Bem-Estar
            </h4>
            <p className="text-[11px] text-slate-500 mb-3 leading-tight">
              Registe rapidamente cansaço, dificuldade para visualizar o quadro, ou distração no comportamento.
            </p>

            <form onSubmit={handleQuickObsSubmit} className="space-y-3 font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">ALUNO ALVO</label>
                <select
                  value={selectedStudentForObs}
                  onChange={(e) => setSelectedStudentForObs(e.target.value)}
                  className={`w-full text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                  }`}
                  required
                >
                  <option value="">-- Selecione o Aluno --</option>
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">CATEGORIA DO FACTO</label>
                <select
                  value={newObsType}
                  onChange={(e) => setNewObsType(e.target.value as any)}
                  className={`w-full text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                  }`}
                >
                  <option value="Bem-Estar">Bem-Estar / Comportamento</option>
                  <option value="Pedagógica">Pedagógica / Notas</option>
                  <option value="Saúde">Dificuldade Biológica / Física</option>
                  <option value="Comportamental">Atitude / Foco</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">RECORRÊNCIA / NOTAS</label>
                <textarea
                  value={newObsText}
                  onChange={(e) => setNewObsText(e.target.value)}
                  rows={2.5}
                  placeholder="Ex: Aluno senta-se no fundo e estreita muito os olhos, queixando-se de dores ao copiar as fórmulas."
                  className={`w-full text-xs p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg font-bold transition-all shadow-sm"
              >
                Submeter de Forma Oficial
              </button>
            </form>
          </div>

          {/* Teacher written observation logs */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">As Suas Notas Recentes</h4>
            
            {recentTeacherLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Ainda não registou observações para este conselho de turma.</p>
            ) : (
              <div className="space-y-2.5">
                {recentTeacherLogs.slice(0, 3).map((obs) => {
                  const associatedStud = students.find(s => s.id === obs.studentId);
                  return (
                    <div key={obs.id} className={`p-3.5 border text-xs space-y-1 transition-all ${
                      highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card hover:bg-white/80'
                    }`}>
                      <div className="flex justify-between font-bold">
                        <span className="text-blue-900">{associatedStud?.name}</span>
                        <span className="text-slate-400 font-sans">{obs.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-tight">
                        "{obs.content.slice(0, 100)}{obs.content.length > 100 ? '...' : ''}"
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
