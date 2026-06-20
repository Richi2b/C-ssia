import { Student, HealthProfile, Absence, Observation, PreventiveAlert, SystemNotice } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'João Pedro Silva',
    age: 12,
    gender: 'Masc',
    grade: '7º Ano',
    classGroup: 'Turma A',
    parentName: 'Carlos Silva',
    parentEmail: 'carlos.silva@email.pt',
    parentPhone: '912 345 678',
    gradeAverage: 62, // drop from typical 85
    attendanceRate: 94
  },
  {
    id: '2',
    name: 'Beatriz Maria Santos',
    age: 13,
    gender: 'Fem',
    grade: '8º Ano',
    classGroup: 'Turma B',
    parentName: 'Ana Maria Santos',
    parentEmail: 'ana.santos@email.pt',
    parentPhone: '934 567 890',
    gradeAverage: 78,
    attendanceRate: 74 // triggers Excessive Absences alert
  },
  {
    id: '3',
    name: 'Lucas Henriques Correia',
    age: 11,
    gender: 'Masc',
    grade: '6º Ano',
    classGroup: 'Turma C',
    parentName: 'Mariana Correia',
    parentEmail: 'mariana.c@email.pt',
    parentPhone: '925 111 222',
    gradeAverage: 88,
    attendanceRate: 98
  },
  {
    id: '4',
    name: 'Mariana Sofia Costa',
    age: 12,
    gender: 'Fem',
    grade: '7º Ano',
    classGroup: 'Turma A',
    parentName: 'Rui Costa',
    parentEmail: 'rui.costa@email.pt',
    parentPhone: '967 888 999',
    gradeAverage: 92,
    attendanceRate: 100
  },
  {
    id: '5',
    name: 'Duarte Martins Ferreira',
    age: 14,
    gender: 'Masc',
    grade: '8º Ano',
    classGroup: 'Turma B',
    parentName: 'Sílvia Ferreira',
    parentEmail: 'silvia.f@email.pt',
    parentPhone: '919 444 333',
    gradeAverage: 55,
    attendanceRate: 85
  }
];

export const INITIAL_HEALTH_PROFILES: Record<string, HealthProfile> = {
  '1': {
    vaccines: [
      { name: 'Tetáno-Difteria (Td)', status: 'Em Dia', date: '2023-10-12' },
      { name: 'Vítimas Meningococo C', status: 'Em Dia', date: '2022-05-15' },
      { name: 'Sarampo-Parotidite-Rubéola (VASPR)', status: 'Em Dia', date: '2020-04-18' }
    ],
    allergies: ['Ácaros do pó', 'Pólen (Sazonal)'],
    visionCheck: {
      status: 'Necessita Atenção',
      lastChecked: '2025-11-03',
      notes: 'O aluno estreita os olhos frequentemente ao olhar para distâncias maiores. Recomendado exame oftalmológico urgente.'
    },
    hearingCheck: {
      status: 'Normal',
      lastChecked: '2025-11-03'
    },
    generalNotes: 'Aluno costumava sentar-se nas filas traseiras, o que parece agravar a sua distração devido a dificuldades visuais.',
    recommendations: [
      'Sentar o aluno nas primeiras filas da sala de aula.',
      'Aconselhamento à encarregada para consulta de oftalmologia.',
      'Limitar exposição prolongada ao ecrã se queixar-se de cefaleias.'
    ]
  },
  '2': {
    vaccines: [
      { name: 'Tetáno-Difteria (Td)', status: 'Em Dia', date: '2024-02-10' },
      { name: 'HPV (Papilomavírus Humano)', status: 'Pendente', date: '' }
    ],
    allergies: ['Penicilina'],
    visionCheck: {
      status: 'Normal',
      lastChecked: '2025-09-14'
    },
    hearingCheck: {
      status: 'Normal',
      lastChecked: '2025-09-14'
    },
    generalNotes: 'Recuperando de cirurgia recente que originou faltas sistemáticas no último período escolar.',
    recommendations: [
      'Apoio escolar personalizado para colmatar matéria em atraso.',
      'Evitar esforços físicos pesados na aula de Educação Física nas próximas 3 semanas.'
    ]
  },
  '3': {
    vaccines: [
      { name: 'Tetáno-Difteria (Td)', status: 'Em Dia', date: '2024-05-20' },
      { name: 'Sarampo-Parotidite-Rubéola (VASPR)', status: 'Em Dia', date: '2021-11-09' }
    ],
    allergies: ['Amendoins (Choque Anafilático)', 'Picadas de Abelha'],
    visionCheck: {
      status: 'Normal',
      lastChecked: '2025-10-18'
    },
    hearingCheck: {
      status: 'Normal',
      lastChecked: '2025-10-18'
    },
    generalNotes: 'Tem caneta autoinjetável de adrenalina (Anapen) no gabinete médico da escola. Os auxiliares e professores de educação física estão cientes do protocolo.',
    recommendations: [
      'Vigilância máxima em almoços e lanches compartilhados.',
      'Em caso de contacto acidental com amendoim, administrar caneta e acionar 112 imediatamente.'
    ]
  },
  '4': {
    vaccines: [
      { name: 'Tetáno-Difteria (Td)', status: 'Em Dia', date: '2024-01-15' }
    ],
    allergies: [],
    visionCheck: {
      status: 'Normal',
      lastChecked: '2025-12-05'
    },
    hearingCheck: {
      status: 'Normal',
      lastChecked: '2025-12-05'
    },
    generalNotes: 'Estudante muito ativa, representa a escola no torneio de xadrez e natação.',
    recommendations: []
  },
  '5': {
    vaccines: [
      { name: 'Tetáno-Difteria (Td)', status: 'Em Falta', date: '' },
      { name: 'Hepatite B', status: 'Em Dia', date: '2020-03-24' }
    ],
    allergies: [],
    visionCheck: {
      status: 'Normal',
      lastChecked: '2025-10-02'
    },
    hearingCheck: {
      status: 'Necessita Atenção',
      lastChecked: '2025-10-02',
      notes: 'Solicita constantemente repetição de orientações verbais. Distração elevada ao falar sussurrado.'
    },
    generalNotes: 'O encarregado de educação foi notificado sobre a necessidade de avaliação por otorrinolaringologia e de atualizar o boletim de vacinas.',
    recommendations: [
      'Utilizar tom de voz firme e claro nas instruções dirigidas ao aluno.',
      'Reforçar lembrete de atualização da vacina contra o Tétano.'
    ]
  }
};

export const INITIAL_ABSENCES: Absence[] = [
  {
    id: 'f1',
    studentId: '2',
    date: '2026-06-15',
    reason: 'Consulta médica pós-operatória de otorrinolaringologia.',
    status: 'Pendente',
    attachmentName: 'atestado_medico_beatriz_santos.pdf'
  },
  {
    id: 'f2',
    studentId: '2',
    date: '2026-06-16',
    reason: 'Doença súbita com sintomas gripais e cefaleia intensa.',
    status: 'Pendente'
  },
  {
    id: 'f3',
    studentId: '1',
    date: '2026-06-08',
    reason: 'Ausência devido a consulta de rotina em medicina familiar.',
    status: 'Justificada',
    attachmentName: 'justificacao_silva.png',
    schoolResponse: 'Justificação aceite. Professor titular de turma já atualizou o registo de sumário.',
    updatedAt: '2026-06-09'
  },
  {
    id: 'f4',
    studentId: '5',
    date: '2026-06-12',
    reason: 'Esquecimento de transporte escolar.',
    status: 'Não Justificada',
    schoolResponse: 'Justificação não aceite de acordo com o regulamento interno da escola (transporte particular em atraso).',
    updatedAt: '2026-06-13'
  }
];

export const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: 'o1',
    studentId: '1',
    date: '2026-06-10',
    authorName: 'Profª. Maria Antunes (Língua Portuguesa)',
    type: 'Bem-Estar',
    content: 'Reparei que o João tem imensa dificuldade a ler o que escrevo no quadro, mesmo quando está sentado na 3ª fila. Esfrega muito os olhos e copia as notas do colega do lado.'
  },
  {
    id: 'o2',
    studentId: '1',
    date: '2026-06-14',
    authorName: 'Prof. Rui Barbosa (Matemática)',
    type: 'Pedagógica',
    content: 'Queda acentuada na última avaliação intermédia. O aluno parece ansioso e atrasa-se na conclusão dos exercícios que copiou incorretamente do quadro.'
  },
  {
    id: 'o3',
    studentId: '5',
    date: '2026-06-05',
    authorName: 'Profª. Isabel Santos (Inglês)',
    type: 'Saúde',
    content: 'O Duarte não respondeu quando o chamei de costas enquanto fazia o trabalho em grupo. Só notou quando mudei de campo visual. É necessário verificar audição.'
  },
  {
    id: 'o4',
    studentId: '3',
    date: '2026-06-18',
    authorName: 'Profª. Maria Antunes (Língua Portuguesa)',
    type: 'Comportamental',
    content: 'Excelente comportamento. Concentrado, prestativo e zeloso ao assegurar que o seu lanche não contém vestígios de amendoim.'
  }
];

export const INITIAL_ALERTS: PreventiveAlert[] = [
  {
    id: 'a1',
    studentId: '1',
    studentName: 'João Pedro Silva',
    type: 'Visão',
    severity: 'Aviso',
    description: 'Possível problema de acuidade visual detetado em observações de dois professores e registo de saúde sem óculos.',
    date: '2026-06-14',
    resolved: false
  },
  {
    id: 'a2',
    studentId: '2',
    studentName: 'Beatriz Maria Santos',
    type: 'Faltas Excessivas',
    severity: 'Crítico',
    description: 'Taxa de assiduidade caiu para 74% (limite mínimo regulamentar é 90%). Requer acompanhamento da direção.',
    date: '2026-06-16',
    resolved: false
  },
  {
    id: 'a3',
    studentId: '5',
    studentName: 'Duarte Martins Ferreira',
    type: 'Audição',
    severity: 'Aviso',
    description: 'Sinais de dificuldades de audição observados no diário escolar combinados com triagem de saúde anterior.',
    date: '2026-06-05',
    resolved: false
  },
  {
    id: 'a4',
    studentId: '5',
    studentName: 'Duarte Martins Ferreira',
    type: 'Saúde Geral',
    severity: 'Crítico',
    description: 'Boletim de vacinas assinalado com vacina do Tétano em atraso. Alerta emitido para sensibilização escolar imediata.',
    date: '2026-06-12',
    resolved: false
  }
];

export const INITIAL_NOTICES: SystemNotice[] = [
  {
    id: 'n1',
    title: 'Campanha de Rastreio Visual Escolar Gratuito',
    content: 'No próximo dia 25 de Junho, a escola receberá uma equipa de oftalmologistas voluntários para realizar rastreios visuais gratuitos a todos os alunos do 2º e 3º ciclo. Pedimos aos encarregados de educação que assinem a autorização enviada na caderneta escolar.',
    target: 'Todos',
    date: '2026-06-18',
    author: 'Direção Geral',
    category: 'Campanha'
  },
  {
    id: 'n2',
    title: 'Alergias Alimentares na Cantina Escolar - Protocolos',
    content: 'Relembramos todos os professores e funcionários que a nossa escola possui alunos com alergias severas com risco de anafilaxia (como amendoins). Solicitamos atenção redobrada durante as refeições, e que verifiquem sempre a sinalética individual nas mesas.',
    target: 'Professores',
    date: '2026-06-15',
    author: 'Gabinete de Saúde',
    category: 'Saúde'
  },
  {
    id: 'n3',
    title: 'Prazos para Justificação das Faltas do 3º Período',
    content: 'Informamos todos os encarregados de educação que, de acordo com o regulamento nacional português, o prazo limite para a submissão de justificações e anexação de atestados médicos é de 3 dias úteis após a cessação do impedimento do aluno.',
    target: 'Encarregados',
    date: '2026-06-17',
    author: 'Gestão Escolar',
    category: 'Pedagógico'
  }
];
