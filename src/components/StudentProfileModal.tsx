import React, { useState } from 'react';
import { X, Heart, Shield, Activity, Calendar, FileText, UserPlus, FileWarning, Eye, VolumeX, AlertOctagon, Plus, CheckCircle2, ChevronRight } from 'lucide-react';
import { Student, HealthProfile, Observation, Absence, PreventiveAlert, UserRole, Vaccine } from '../types';

interface StudentProfileModalProps {
  student: Student;
  healthProfile: HealthProfile;
  observations: Observation[];
  absences: Absence[];
  alerts: PreventiveAlert[];
  currentUserRole: UserRole;
  highContrast: boolean;
  onClose: () => void;
  onUpdateHealthProfile?: (studentId: string, updated: HealthProfile) => void;
  onAddObservation?: (studentId: string, observation: Omit<Observation, 'id' | 'date'>) => void;
  onAnnounce: (msg: string) => void;
}

export default function StudentProfileModal({
  student,
  healthProfile,
  observations,
  absences,
  alerts,
  currentUserRole,
  highContrast,
  onClose,
  onUpdateHealthProfile,
  onAddObservation,
  onAnnounce
}: StudentProfileModalProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'geral' | 'saude' | 'observacoes' | 'faltas'>('geral');
  
  // States for adding information
  const [isEditingSaude, setIsEditingSaude] = useState(false);
  const [visionStatus, setVisionStatus] = useState(healthProfile.visionCheck.status);
  const [visionNotes, setVisionNotes] = useState(healthProfile.visionCheck.notes || '');
  const [hearingStatus, setHearingStatus] = useState(healthProfile.hearingCheck.status);
  const [hearingNotes, setHearingNotes] = useState(healthProfile.hearingCheck.notes || '');
  const [allergiesText, setAllergiesText] = useState(healthProfile.allergies.join(', '));
  const [generalNotesText, setGeneralNotesText] = useState(healthProfile.generalNotes || '');
  const [newRecommendation, setNewRecommendation] = useState('');

  // Observation form
  const [isAddingObs, setIsAddingObs] = useState(false);
  const [obsType, setObsType] = useState<'Pedagógica' | 'Bem-Estar' | 'Saúde' | 'Comportamental'>('Bem-Estar');
  const [obsContent, setObsContent] = useState('');

  const activeAlerts = alerts.filter(a => !a.resolved);

  const handleSaveSaude = () => {
    if (!onUpdateHealthProfile) return;
    
    const updated: HealthProfile = {
      ...healthProfile,
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      visionCheck: {
        status: visionStatus,
        lastChecked: new Date().toISOString().split('T')[0],
        notes: visionNotes
      },
      hearingCheck: {
        status: hearingStatus,
        lastChecked: new Date().toISOString().split('T')[0],
        notes: hearingNotes
      },
      generalNotes: generalNotesText
    };

    onUpdateHealthProfile(student.id, updated);
    setIsEditingSaude(false);
    onAnnounce(`Arquivo clínico de saúde do estudante ${student.name} atualizado com sucesso.`);
  };

  const handleAddRec = () => {
    if (!newRecommendation.trim() || !onUpdateHealthProfile) return;
    
    const updated: HealthProfile = {
      ...healthProfile,
      recommendations: [...healthProfile.recommendations, newRecommendation.trim()]
    };

    onUpdateHealthProfile(student.id, updated);
    setNewRecommendation('');
    onAnnounce(`Nova recomendação adicionada para o aluno ${student.name}.`);
  };

  const handleDeleteRec = (indexToDel: number) => {
    if (!onUpdateHealthProfile) return;
    const updated: HealthProfile = {
      ...healthProfile,
      recommendations: healthProfile.recommendations.filter((_, idx) => idx !== indexToDel)
    };
    onUpdateHealthProfile(student.id, updated);
    onAnnounce("Recomendação clínica eliminada.");
  };

  const handleAddObsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsContent.trim() || !onAddObservation) return;

    onAddObservation(student.id, {
      studentId: student.id,
      authorName: currentUserRole === 'GESTOR' ? 'Diretor Escolar' : 'Professor Titular',
      type: obsType,
      content: obsContent.trim()
    });

    setObsContent('');
    setIsAddingObs(false);
    onAnnounce(`Observação pedagógica do tipo ${obsType} registado com sucesso para o diário do aluno.`);
  };

  const toggleVaccine = (vaccineName: string) => {
    if (currentUserRole !== 'GESTOR' || !onUpdateHealthProfile) return;
    const updatedVaccines = healthProfile.vaccines.map(v => {
      if (v.name === vaccineName) {
        const nextStatus = v.status === 'Em Dia' ? 'Em Falta' : 'Em Dia';
        return {
          ...v,
          status: nextStatus as any,
          date: nextStatus === 'Em Dia' ? new Date().toISOString().split('T')[0] : ''
        };
      }
      return v;
    });

    onUpdateHealthProfile(student.id, {
      ...healthProfile,
      vaccines: updatedVaccines
    });
    onAnnounce(`Situação da vacina ${vaccineName} alterada.`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs font-sans">
      <div className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative ${
        highContrast ? 'bg-black text-white border-2 border-yellow-400' : 'bg-white text-slate-800'
      }`}>
        
        {/* Header Ribbon / Student Card banner */}
        <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-gradient-to-r from-blue-50 to-emerald-50 border-slate-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold uppercase ${
              student.gender === 'Fem' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold font-sans">
                  {student.grade} - {student.classGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Encarregado: <span className="font-medium text-slate-700 dark:text-slate-300">{student.parentName}</span> ({student.parentPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Assiduidade</span>
              <span className={`text-lg font-extrabold ${student.attendanceRate < 90 ? 'text-red-600' : 'text-emerald-600'}`}>
                {student.attendanceRate}%
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Média Escolar</span>
              <span className="text-lg font-extrabold text-blue-600">
                {student.gradeAverage}/100
              </span>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full ml-4 transition-colors ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
              }`}
              aria-label="Fechar ficha do aluno"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Alerts inside profile */}
        {activeAlerts.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-800 text-xs">
              <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Atenção:</strong> {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''} preventivo{activeAlerts.length > 1 ? 's' : ''} ativo{activeAlerts.length > 1 ? 's' : ''} relacionado{activeAlerts.length > 1 ? 's' : ''} a este aluno.
              </span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wide bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              Acompanhamento Necessário
            </span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className={`flex border-b text-sm ${highContrast ? 'border-yellow-400' : 'border-slate-100 bg-slate-50/50'}`}>
          {[
            { id: 'geral' as const, label: 'Visão Geral & Cadastro', icon: FileText },
            { id: 'saude' as const, label: 'Prontuário de Saúde Escolar', icon: Heart },
            { id: 'observacoes' as const, label: 'Diário de Observações', icon: Activity },
            { id: 'faltas' as const, label: 'Histórico de Faltas', icon: Calendar }
          ].map((tab) => {
            const IsActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium border-b-2 text-xs md:text-sm transition-all focus:outline-none ${
                  IsActive
                    ? highContrast
                      ? 'border-yellow-400 bg-black text-yellow-400 font-bold'
                      : 'border-blue-600 text-blue-700 bg-white shadow-xs'
                    : highContrast
                    ? 'border-transparent text-slate-400 hover:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border ${highContrast ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50/30'}`}>
                  <h3 className="text-xs uppercase font-extrabold text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Informações Cadastrais
                  </h3>
                  <dl className="grid grid-cols-2 gap-y-3 gap-x-1 text-sm">
                    <dt className="text-slate-400">Idade / Género</dt>
                    <dd className="font-semibold text-right">{student.age} anos / {student.gender}</dd>

                    <dt className="text-slate-400">Classe / Ciclo</dt>
                    <dd className="font-semibold text-right">3º Ciclo (Escolaridade Obrigatória)</dd>

                    <dt className="text-slate-400">Nome do Pai/Mãe</dt>
                    <dd className="font-semibold text-right text-xs truncate" title={student.parentName}>{student.parentName}</dd>

                    <dt className="text-slate-400">E-mail de Contacto</dt>
                    <dd className="font-semibold text-right text-xs truncate text-blue-600" title={student.parentEmail}>{student.parentEmail}</dd>

                    <dt className="text-slate-400">Telefone</dt>
                    <dd className="font-semibold text-right text-xs">{student.parentPhone}</dd>
                  </dl>
                </div>

                <div className={`p-4 rounded-xl border ${highContrast ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50/30'}`}>
                  <h3 className="text-xs uppercase font-extrabold text-slate-400 mb-3 tracking-wider flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-500" /> Alertas Ativos Preventivos
                  </h3>
                  {activeAlerts.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400">Sem alertas ativos de momento. Desempenho e bem-estar em conformidade.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeAlerts.map(alert => (
                        <div key={alert.id} className={`p-2.5 rounded-lg border flex gap-2 text-xs ${
                          alert.severity === 'Crítico' 
                            ? 'bg-red-50 text-red-800 border-red-100' 
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}>
                          <div className={`p-1 rounded-md self-start ${alert.severity === 'Crítico' ? 'bg-red-100' : 'bg-amber-100'}`}>
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">Tema: {alert.type}</span>
                              <span className={`text-[8px] font-bold uppercase px-1 rounded ${alert.severity === 'Crítico' ? 'bg-red-200' : 'bg-amber-200'}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-normal">{alert.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status de Triagens Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  healthProfile.visionCheck.status === 'Necessita Atenção' 
                    ? 'border-red-200 bg-red-50/20' 
                    : 'border-slate-100 bg-slate-50/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`p-2.5 rounded-lg ${healthProfile.visionCheck.status === 'Necessita Atenção' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      <Eye className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">Status Visual Recente</h4>
                      <p className="text-[10px] text-slate-400">Último rastreio em {healthProfile.visionCheck.lastChecked}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      healthProfile.visionCheck.status === 'Normal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : healthProfile.visionCheck.status === 'Necessita Atenção'
                        ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {healthProfile.visionCheck.status}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  healthProfile.hearingCheck.status === 'Necessita Atenção' 
                    ? 'border-red-200 bg-red-50/20' 
                    : 'border-slate-100 bg-slate-50/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`p-2.5 rounded-lg ${healthProfile.hearingCheck.status === 'Necessita Atenção' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      <VolumeX className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">Status Auditivo Recente</h4>
                      <p className="text-[10px] text-slate-400">Último rastreio em {healthProfile.hearingCheck.lastChecked}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      healthProfile.hearingCheck.status === 'Normal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : healthProfile.hearingCheck.status === 'Necessita Atenção'
                        ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {healthProfile.hearingCheck.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAÚDE ESCOLAR */}
          {activeTab === 'saude' && (
            <div className="space-y-6">
              {/* Header inside clinical file */}
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="font-bold text-base">Boletim Escolar de Saúde Preventiva</h3>
                  <p className="text-xs text-slate-400">Para fins escolares gerais. Sigilo médico garantido legalmente.</p>
                </div>
                {currentUserRole === 'GESTOR' && onUpdateHealthProfile && (
                  <button
                    onClick={() => {
                      if (isEditingSaude) {
                        handleSaveSaude();
                      } else {
                        setIsEditingSaude(true);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${
                      isEditingSaude
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isEditingSaude ? 'Guardar Ficha Ordinária' : 'Editar Factores Médicos'}
                  </button>
                )}
              </div>

              {isEditingSaude ? (
                /* ECRÃ DE EDIÇÃO (APENAS GESTOR) */
                <div className="space-y-4 p-4 rounded-xl border border-blue-100 bg-blue-50/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Alergias Conhecidas (separadas por vírgula)</label>
                      <input
                        type="text"
                        value={allergiesText}
                        onChange={(e) => setAllergiesText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                        placeholder="Ex: Penicilina, Amendoins, Pólen"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Histórico Clínico do Aluno (Nota Geral)</label>
                      <input
                        type="text"
                        value={generalNotesText}
                        onChange={(e) => setGeneralNotesText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                        placeholder="Ex: Tem asma leve, necessita caneta adrenalina..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Status Visão</label>
                      <select
                        value={visionStatus}
                        onChange={(e) => setVisionStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Necessita Atenção">Necessita Atenção</option>
                        <option value="Por Avaliar">Por Avaliar</option>
                      </select>
                      <input
                        type="text"
                        value={visionNotes}
                        onChange={(e) => setVisionNotes(e.target.value)}
                        placeholder="Observações de acuidade visual"
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white mt-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Status Audição</label>
                      <select
                        value={hearingStatus}
                        onChange={(e) => setHearingStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Necessita Atenção">Necessita Atenção</option>
                        <option value="Por Avaliar">Por Avaliar</option>
                      </select>
                      <input
                        type="text"
                        value={hearingNotes}
                        onChange={(e) => setHearingNotes(e.target.value)}
                        placeholder="Observações de acuidade auditiva"
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={() => setIsEditingSaude(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSaude}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white"
                    >
                      Gravar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                /* ECRÃ DE CONSULTA */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Vacinas e Alergias */}
                  <div className="md:col-span-7 space-y-6">
                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-3 tracking-wider flex items-center justify-between">
                        <span>Plano de Vacinação Escolar Recomendado</span>
                        {currentUserRole === 'GESTOR' && (
                          <span className="text-[9px] font-normal text-blue-500 normal-case">Clique para inverter estado (Em Dia / Em Falta)</span>
                        )}
                      </h4>
                      <div className="divide-y divide-slate-100 rounded-xl border overflow-hidden">
                        {healthProfile.vaccines.map((v) => (
                          <div
                            key={v.name}
                            onClick={() => toggleVaccine(v.name)}
                            className={`p-3 flex justify-between items-center text-xs ${
                              currentUserRole === 'GESTOR' ? 'hover:bg-slate-50 cursor-pointer' : ''
                            }`}
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300">{v.name}</span>
                            <div className="flex items-center gap-2">
                              {v.date && <span className="text-[10px] text-slate-400">Verificado em {v.date}</span>}
                              <span className={`font-bold px-2 py-0.5 rounded-full ${
                                v.status === 'Em Dia'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : v.status === 'Em Falta'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {v.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-2 tracking-wider">Alergias Clínicas Registadas</h4>
                      {healthProfile.allergies.length === 0 ? (
                        <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">Sem registos de alergias ou intolerâncias graves.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {healthProfile.allergies.map(ale => (
                            <span
                              key={ale}
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                ale.toLowerCase().includes('amendo') || ale.toLowerCase().includes('sever')
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ale}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {healthProfile.generalNotes && (
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-1.5 tracking-wider">Notas Clínicas Gerais</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                          {healthProfile.generalNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recomendações Escolares */}
                  <div className="md:col-span-5 space-y-4">
                    <div className={`p-4 rounded-xl border ${highContrast ? 'border-yellow-400' : 'bg-emerald-50/30 border-emerald-100'}`}>
                      <h4 className="text-xs uppercase font-extrabold text-emerald-800 mb-2 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Recomendações e Plano Individualizado
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3 leading-tight font-sans">
                        Fatores e procedimentos preventivos que a equipa docente deve assegurar na sala de aula.
                      </p>

                      {healthProfile.recommendations.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 italic">Sem recomendações individualizadas vigentes de momento.</p>
                      ) : (
                        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                          {healthProfile.recommendations.map((rec, index) => (
                            <li key={index} className="flex gap-1.5 items-start">
                              <span className="text-emerald-500 font-extrabold text-sm leading-none">•</span>
                              <div className="flex-1 flex justify-between items-start">
                                <span className="leading-tight">{rec}</span>
                                {currentUserRole === 'GESTOR' && onUpdateHealthProfile && (
                                  <button
                                    onClick={() => handleDeleteRec(index)}
                                    className="text-[9px] font-bold text-red-500 hover:underline shrink-0 ml-1.5"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Add Recommendation form for administrators */}
                      {currentUserRole === 'GESTOR' && onUpdateHealthProfile && (
                        <div className="mt-4 pt-3 border-t border-emerald-200/50 flex gap-2">
                          <input
                            type="text"
                            value={newRecommendation}
                            onChange={(e) => setNewRecommendation(e.target.value)}
                            placeholder="Adicionar recomendação"
                            className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                          />
                          <button
                            onClick={handleAddRec}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded flex items-center justify-center transition-colors shadow-sm"
                            title="Gravar recomendação"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OBSERVAÇÕES / DIÁRIO DOCENTE */}
          {activeTab === 'observacoes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="font-bold text-base">Diário de Observações do Aluno</h3>
                  <p className="text-xs text-slate-400">Registo de dificuldades visuais, auditivas, foco pedagógico e mudanças de comportamento.</p>
                </div>
                {(currentUserRole === 'GESTOR' || currentUserRole === 'PROFESSOR') && onAddObservation && (
                  <button
                    onClick={() => setIsAddingObs(!isAddingObs)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registar Observação
                  </button>
                )}
              </div>

              {/* Form to Add Observation */}
              {isAddingObs && (
                <form onSubmit={handleAddObsSubmit} className="p-4 rounded-xl border border-blue-200 bg-blue-50/10 space-y-3">
                  <h4 className="font-bold text-xs">Nova Ficha de Observação Escolar</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Categoria de Observação</label>
                      <div className="flex gap-2">
                        {['Bem-Estar', 'Pedagógica', 'Saúde', 'Comportamental'].map((cat) => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setObsType(cat as any)}
                            className={`text-xs px-3 py-1 rounded border-2 transition-all font-semibold ${
                              obsType === cat
                                ? 'bg-blue-600 text-white border-blue-700'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teor da Observação (Exposição detalhada dos factos)</label>
                    <textarea
                      value={obsContent}
                      onChange={(e) => setObsContent(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 rounded border border-slate-300 bg-white"
                      placeholder="Indique as dificuldades constatadas, ex: 'Constatado que o aluno pede constantemente para sair devido a cefaleias.' ou 'Pouca concentração nas últimas semanas.'"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setIsAddingObs(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white"
                    >
                      Gravar Nota no Diário
                    </button>
                  </div>
                </form>
              )}

              {/* List of Observations */}
              {observations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">Nenhuma observação pedagógica registada para este aluno no período em curso.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {observations.map((obs) => {
                    const typeColors = {
                      'Pedagógica': 'bg-blue-50 text-blue-800 border-blue-100',
                      'Bem-Estar': 'bg-emerald-50 text-emerald-800 border-emerald-100',
                      'Saúde': 'bg-red-50 text-red-800 border-red-100',
                      'Comportamental': 'bg-violet-50 text-violet-800 border-violet-100'
                    };
                    return (
                      <div key={obs.id} className="p-4 rounded-xl border border-slate-100 shadow-xs space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{obs.authorName}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 font-sans">{obs.date}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColors[obs.type]}`}>
                            {obs.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                          {obs.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTÓRICO DE FALTAS */}
          {activeTab === 'faltas' && (
            <div className="space-y-6">
              <div className="pb-2 border-b">
                <h3 className="font-bold text-base">Controlo de Assiduidade e Faltas</h3>
                <p className="text-xs text-slate-400">Listagem de ausências injustificadas, pendentes de resposta ou validadas.</p>
              </div>

              {absences.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">Excelente! O aluno não regista faltas no presente ciclo de ensino.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {absences.map((abs) => {
                    const statusConfig = {
                      'Pendente': 'bg-amber-100 text-amber-900 border-amber-200',
                      'Justificada': 'bg-emerald-100 text-emerald-900 border-emerald-200',
                      'Não Justificada': 'bg-rose-100 text-rose-900 border-rose-200',
                      'Rejeitada': 'bg-red-100 text-red-900 border-red-200'
                    };
                    return (
                      <div key={abs.id} className="p-3.5 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Dia {abs.date}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 rounded ${statusConfig[abs.status]}`}>
                            {abs.status}
                          </span>
                        </div>

                        <div className="text-xs font-sans text-slate-600 dark:text-slate-300 leading-normal">
                          <p>
                            <span className="font-bold text-slate-400 mr-1 text-[10px] uppercase">Motivo invocado:</span>
                            {abs.reason || 'Sinalizado por ausência escolar ordinária.'}
                          </p>
                          {abs.attachmentName && (
                            <p className="mt-1 text-[11px] text-blue-600 font-medium flex items-center gap-1">
                              <span>Anexo de Justificação:</span>
                              <span className="underline italic cursor-pointer">{abs.attachmentName}</span>
                            </p>
                          )}
                        </div>

                        {abs.schoolResponse && (
                          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 text-[11px] border border-slate-100">
                            <span className="font-extrabold text-[10px] uppercase text-slate-400 block mb-0.5">Parecer e Resposta da Direção:</span>
                            <p className="text-slate-600 dark:text-slate-300">{abs.schoolResponse}</p>
                            {abs.updatedAt && <span className="text-[9px] text-slate-400 block mt-1">Sinalizado em {abs.updatedAt}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs text-slate-400 px-6">
          <span>Identificador Único: <strong className="font-mono">{student.id}</strong></span>
          <span>Acesso Privilegiado - Escola e Família Unidas</span>
        </div>
      </div>
    </div>
  );
}
