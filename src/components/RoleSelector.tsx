import React from 'react';
import { ShieldCheck, UserCheck, HeartHandshake, Info } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  highContrast: boolean;
  onAnnounce: (msg: string) => void;
}

export default function RoleSelector({ currentRole, onChangeRole, highContrast, onAnnounce }: RoleSelectorProps) {
  const roles = [
    {
      id: 'GESTOR' as UserRole,
      label: 'Gestor Escolar',
      desc: 'Administração geral, relatórios globais, justificações e boletim de saúde.',
      icon: ShieldCheck,
      color: 'bg-blue-500 text-white',
      ringColor: 'focus:ring-blue-400',
      outlineColor: 'border-blue-500'
    },
    {
      id: 'PROFESSOR' as UserRole,
      label: 'Professor Titular',
      desc: 'Consulta de Alunos, diário de observações pedagógicas e bem-estar.',
      icon: UserCheck,
      color: 'bg-emerald-500 text-white',
      ringColor: 'focus:ring-emerald-400',
      outlineColor: 'border-emerald-500'
    },
    {
      id: 'ENCARREGADO' as UserRole,
      label: 'Encarregado de Educação',
      desc: 'Histórico de saúde escolar do educando, justificar faltas e ver respostas.',
      icon: HeartHandshake,
      color: 'bg-violet-500 text-white',
      ringColor: 'focus:ring-violet-400',
      outlineColor: 'border-violet-500'
    }
  ];

  const handleRoleChange = (roleID: UserRole, roleLabel: string) => {
    onChangeRole(roleID);
    onAnnounce(`Perfil alterado para ${roleLabel}. O menu de navegação e as permissões foram reconfigurados.`);
  };

  return (
    <div className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-all duration-150 ${
      highContrast 
        ? 'bg-black text-white border-yellow-400' 
        : 'glass-panel'
    }`}>
      <div className="space-y-1 max-w-md">
        <label htmlFor="role-selection-group" className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Perfil Ativo (Ambiente de Demonstração Integrado)
        </label>
        <h2 className="text-base font-bold tracking-tight text-slate-800">Consolidação em Tempo Real (Event-Driven Simulation)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
          Altere o perfil operacional para visualizar e interagir com os módulos específicos de cada tipo de utilizador.
        </p>
      </div>

      <div id="role-selection-group" role="radiogroup" aria-label="Perfil do Utilizador" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
        {roles.map((r) => {
          const isActive = currentRole === r.id;
          const IconComponent = r.icon;

          return (
            <button
              key={r.id}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => handleRoleChange(r.id, r.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoleChange(r.id, r.label);
                }
              }}
              className={`text-left p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 ${r.ringColor} ${
                isActive
                  ? highContrast
                    ? 'border-yellow-400 bg-yellow-400 text-black'
                    : `${r.outlineColor} bg-white/95 border-2 shadow-md hover:scale-[1.01]`
                  : highContrast
                  ? 'border-slate-800 bg-slate-900 text-white hover:border-slate-700'
                  : 'border-slate-200/40 bg-white/40 glass-pill text-slate-700 hover:border-slate-300 hover:bg-white/80 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`p-1.5 rounded-lg text-xs ${isActive ? r.color : 'bg-slate-100 text-slate-600'}`}>
                  <IconComponent className="w-4 h-4" />
                </span>
                <span className="font-bold text-xs tracking-tight">{r.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                {r.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
