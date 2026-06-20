import React, { useState } from 'react';
import { 
  Users, Heart, Calendar, Plus, FileText, CheckCircle, Upload, Eye, 
  HelpCircle, Sparkles, MessageSquare, ShieldAlert, FileImage, Volume2, Info
} from 'lucide-react';
import { Student, HealthProfile, Absence, SystemNotice, PreventiveAlert } from '../types';

interface EncarregadoDashboardProps {
  students: Student[];
  healthProfiles: Record<string, HealthProfile>;
  absences: Absence[];
  alerts: PreventiveAlert[];
  notices: SystemNotice[];
  highContrast: boolean;
  onSelectStudent: (student: Student) => void;
  onSubmitAbsenceJustification: (justification: Omit<Absence, 'id' | 'status'>) => void;
  onAnnounce: (msg: string) => void;
}

export default function EncarregadoDashboard({
  students,
  healthProfiles,
  absences,
  alerts,
  notices,
  highContrast,
  onSelectStudent,
  onSubmitAbsenceJustification,
  onAnnounce
}: EncarregadoDashboardProps) {
  // Option to simulate different Parent ID in the portal
  const [selectedParentId, setSelectedParentId] = useState<string>('2'); // Beatriz Santos' parent Ana Santos by default

  // Form states for new justification
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceReason, setAbsenceReason] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // List of parents we can simulate
  const listSimulativeParents = [
    { studentId: '1', parentName: 'Carlos Silva', studentName: 'João Pedro Silva (7º Ano)' },
    { studentId: '2', parentName: 'Ana Maria Santos', studentName: 'Beatriz Maria Santos (8º Ano)' },
    { studentId: '3', parentName: 'Mariana Correia', studentName: 'Lucas Henriques Correia (6º Ano)' },
    { studentId: '5', parentName: 'Sílvia Ferreira', studentName: 'Duarte Martins Ferreira (8º Ano)' }
  ];

  // Derive child student
  const childStudent = students.find(s => s.id === selectedParentId) || students[0];
  const childHealth = healthProfiles[childStudent.id];
  const childAbsences = absences.filter(a => a.studentId === childStudent.id);
  const childAlerts = alerts.filter(a => a.studentId === childStudent.id && !a.resolved);

  // Filter notices for parents
  const parentNotices = notices.filter(n => n.target === 'Todos' || n.target === 'Encarregados');

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachedFileName(file.name);
      onAnnounce(`Ficheiro '${file.name}' detetado e anexado à justificação.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFileName(file.name);
      onAnnounce(`Ficheiro '${file.name}' selecionado por via manual.`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceReason.trim()) {
      alert("Por favor escreva o motivo legal ou descrição médica da justificação.");
      return;
    }

    onSubmitAbsenceJustification({
      studentId: childStudent.id,
      date: absenceDate,
      reason: absenceReason.trim(),
      attachmentName: attachedFileName || undefined
    });

    setAbsenceReason('');
    setAttachedFileName('');
    onAnnounce("Justificação de falta submetida à direção da escola. Aguarda validação da secretaria.");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Profile switcher for demo */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-150 ${
        highContrast ? 'bg-black text-white border-yellow-400' : 'glass-panel shadow-2xs'
      }`}>
        <div className="space-y-1">
          <label htmlFor="parent-identity-select" className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block">Identidade Simulada do Encarregado</label>
          <p className="text-xs text-slate-500 leading-tight">Escolha qual encarregado de educação simular para visualizar os dados de saúde do respetivo educando.</p>
        </div>

        <select
          id="parent-identity-select"
          value={selectedParentId}
          onChange={(e) => {
            setSelectedParentId(e.target.value);
            onAnnounce(`Simulando Encarregado de Educação: ${listSimulativeParents.find(p => p.studentId === e.target.value)?.parentName}.`);
          }}
          className={`py-1.5 px-3.5 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
          }`}
        >
          {listSimulativeParents.map(p => (
            <option key={p.studentId} value={p.studentId}>
              {p.parentName} (Encarregado de {p.studentName})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Educando's Overview & health summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Child Identity */}
          <div className={`p-5 rounded-2xl border transition-all duration-150 ${highContrast ? 'bg-black border-yellow-400 text-white' : 'glass-card shadow-xs space-y-4'}`}>
            <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">O Seu Educando</h4>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm uppercase ${
                childStudent.gender === 'Fem' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {childStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-sm text-slate-900 truncate">{childStudent.name}</h5>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-sans">
                  {childStudent.grade} - {childStudent.classGroup}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs text-slate-500 dark:text-slate-400 pt-1 font-sans">
              <div className="py-2 flex justify-between">
                <span>Rendimento Geral</span>
                <strong className="text-slate-800 dark:text-slate-200">{childStudent.gradeAverage}/100</strong>
              </div>
              <div className="py-2 flex justify-between">
                <span>Assiduidade Letiva</span>
                <strong className={`font-black ${childStudent.attendanceRate < 90 ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`}>
                  {childStudent.attendanceRate}%
                </strong>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span>Alertas Preventivos Ativos</span>
                <span className={`text-[10px] font-bold px-2 rounded-full ${childAlerts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                  {childAlerts.length} ativo(s)
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectStudent(childStudent)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-lg font-bold transition-all text-center focus:outline-none"
            >
              Consultar Boletim Clínico Completo
            </button>
          </div>

          {/* Card: Child Health Bulletins summary */}
          <div className={`p-5 rounded-2xl border transition-all duration-150 ${highContrast ? 'bg-black border-yellow-400 text-white' : 'glass-card shadow-xs space-y-4'}`}>
            <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider">Estado Clínico e de Vacinas</h4>
            
            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center">
                <span>Status de Acuidade Visual</span>
                <span className={`px-2 py-0.5 rounded font-extrabold ${childHealth?.visionCheck.status === 'Normal' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                  {childHealth?.visionCheck.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Status de Acuidade Auditiva</span>
                <span className={`px-2 py-0.5 rounded font-extrabold ${childHealth?.hearingCheck.status === 'Normal' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                  {childHealth?.hearingCheck.status}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Alergias Alimentares / Restrições</span>
                {childHealth?.allergies.length === 0 ? (
                  <span className="text-slate-500">Nenhuma restrição declarada.</span>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {childHealth?.allergies.map(ale => (
                      <span key={ale} className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 rounded-full border border-amber-100">
                        {ale}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Send and examine justifications & notices */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Submitting a new absolute justification */}
          <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-150 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'glass-panel shadow-2xs'
          }`}>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Justificar Falta de Forma Digital</h4>
              <p className="text-xs text-slate-400 mt-0.5">Indique o motivo e submeta os atestados médicos exigidos de forma segura e imediata.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Data da Ausência</label>
                  <input
                    type="date"
                    value={absenceDate}
                    onChange={(e) => setAbsenceDate(e.target.value)}
                    className={`w-full text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Justificação Escrita / Diagnóstico</label>
                  <input
                    type="text"
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    placeholder="Consulta de Estomatologia, etc."
                    className={`w-full text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      highContrast ? 'bg-black text-white border border-yellow-400' : 'glass-input'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Drag and drop file select block */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Anexar Ficheiro de Comprovativo (Atestado Médico / Declaração)</label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50'
                      : attachedFileName
                      ? 'border-emerald-400 bg-emerald-50/5/20'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${attachedFileName ? 'text-emerald-500' : 'text-slate-400'}`} />
                  
                  {attachedFileName ? (
                    <div className="text-xs">
                      <p className="font-bold text-emerald-800">Ficheiro anexado com sucesso:</p>
                      <p className="italic text-slate-500 mt-0.5">{attachedFileName}</p>
                      <button
                        type="button"
                        onClick={() => setAttachedFileName('')}
                        className="text-[10px] text-red-500 underline font-bold mt-1"
                      >
                        Substituir ficheiro
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-sans">
                      <p className="font-semibold">Arraste e solte o comprovativo aqui, ou</p>
                      <label className="mt-1 inline-block text-blue-600 hover:underline font-bold cursor-pointer">
                        procure no dispositivo
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">Formatos aceites: PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-transform hover:scale-[1.01] shadow-sm"
                >
                  Submeter Justificação Escolar
                </button>
              </div>
            </form>
          </div>

          {/* Section: Historical Absences requested and dynamic school feedback responses */}
          <div className={`p-5 rounded-2xl border transition-all duration-150 ${highContrast ? 'bg-black border-yellow-400 text-white' : 'glass-card shadow-xs space-y-4'}`}>
            <h4 className="font-bold text-sm text-slate-800">Histórico Recente de Presenças e Ausências</h4>

            {childAbsences.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 border border-slate-100 rounded-lg">
                Seu educando não regista qualquer falta injustificada ou registo de ausência de momento.
              </p>
            ) : (
              <div className="space-y-3 font-sans">
                {childAbsences.map(abs => {
                  const statusColors = {
                    'Pendente': 'bg-amber-100 text-amber-900 border-amber-200',
                    'Justificada': 'bg-emerald-100 text-emerald-900 border-emerald-200',
                    'Não Justificada': 'bg-rose-100 text-rose-900 border-rose-200',
                    'Rejeitada': 'bg-red-100 text-red-900 border-red-200'
                  };

                  return (
                    <div key={abs.id} className={`p-3.5 border text-xs space-y-2 transition-all duration-150 ${
                      highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white/50 border-white/50 hover:bg-white/80 rounded-xl'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">Dia ausente: {abs.date}</span>
                        <span className={`text-[10px] font-bold px-2 rounded-xs ${statusColors[abs.status]}`}>
                          {abs.status}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-400 text-[10px] block mb-0.5 uppercase">A sua justificação:</strong>
                        "{abs.reason}"
                      </p>

                      {abs.schoolResponse && (
                        <div className="p-2.5 rounded bg-blue-50/50 border border-blue-50/10 text-[11px] leading-tight text-blue-900">
                          <strong className="text-[9px] uppercase tracking-wide block mb-0.5 opacity-80">Parecer Oficial da Escola:</strong>
                          <p>{abs.schoolResponse}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Notice boards relevant to Parent */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Notícias e Diretivas de Saúde Escolares
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parentNotices.map(no => (
                <div key={no.id} className={`p-4 border space-y-1.5 transition-all duration-150 ${
                  highContrast ? 'bg-black text-white border-yellow-400' : 'glass-card hover:bg-white/85 rounded-xl'
                }`}>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold uppercase">{no.category}</span>
                    <span className="text-slate-400">{no.date}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{no.title}</h5>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-3">
                    {no.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
