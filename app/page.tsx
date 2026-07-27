"use client";
import { useEffect, useMemo, useState } from "react";
type Module = {
    id: string;
    icon: string;
    title: string;
    description: string;
    price: number;
    fields?: string[];
};
type SavedProject = {
    id: string;
    name: string;
    clientName: string;
    status: string;
    estimatedValue: number;
    updatedAt: string;
};
type SavedDocument = {
    id: string;
    version: number;
    kind: string;
    content: string;
    createdAt: string;
};
const modules: Module[] = [
  { id: "clients", icon: "C", title: "Clientes", description: "Cadastro, histórico e relacionamento.", price: 250, fields: ["Cadastro completo", "Histórico de atendimentos", "Segmentação", "Portal do cliente"] },
  { id: "finance", icon: "$", title: "Financeiro", description: "Contas, fluxo de caixa e cobranças.", price: 500, fields: ["Contas a pagar e receber", "Fluxo de caixa", "Orçamentos", "Comissões", "Boletos e Pix", "Conciliação bancária"] },
  { id: "sales", icon: "V", title: "Vendas e CRM", description: "Leads, funil comercial e propostas.", price: 500, fields: ["Captação de leads", "Funil de vendas", "Propostas comerciais", "Follow-up automático", "Metas de vendas"] },
  { id: "agenda", icon: "A", title: "Agenda", description: "Agendamentos, reservas e lembretes.", price: 300, fields: ["Agenda por profissional", "Confirmação via WhatsApp", "Reservas online", "Lembretes automáticos"] },
  { id: "team", icon: "P", title: "Funcionários", description: "Usuários, permissões e operação.", price: 400, fields: ["Perfis e permissões", "Escalas", "Comissões", "Registro de atividades", "Metas por equipe"] },
  { id: "service", icon: "O", title: "Operação", description: "Ordens de serviço e acompanhamento.", price: 600, fields: ["Ordens de serviço", "Status da demanda", "Anexos", "Checklists", "Assinatura digital", "Geolocalização"] },
  { id: "inventory", icon: "E", title: "Estoque", description: "Produtos, entradas, saídas e alertas.", price: 400, fields: ["Controle de estoque", "Entrada e saída", "Alerta de estoque baixo", "Inventário", "Fornecedores"] },
  { id: "reports", icon: "R", title: "Relatórios", description: "Indicadores para tomada de decisão.", price: 300, fields: ["Dashboard executivo", "Relatórios exportáveis", "Metas e indicadores", "Filtros por período"] },
  { id: "automations", icon: "Z", title: "Automações", description: "Tarefas e mensagens acionadas por regras.", price: 600, fields: ["Automações de status", "Notificações", "Tarefas recorrentes", "Regras condicionais"] },
  { id: "integrations", icon: "I", title: "Integrações", description: "WhatsApp, ERP, pagamentos e mais.", price: 400, fields: ["WhatsApp", "Gateway de pagamento", "ERP", "Google Calendar", "API externa"] },
  { id: "portal", icon: "W", title: "Portal / Site", description: "Área pública para clientes e vendas.", price: 600, fields: ["Landing page", "Portal do cliente", "Formulários", "Blog ou conteúdo", "SEO básico"] },
  { id: "security", icon: "S", title: "Segurança", description: "Acesso, auditoria e proteção de dados.", price: 300, fields: ["Login e recuperação", "Dois fatores", "Log de auditoria", "LGPD e consentimento"] },
];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const packageRules = {
    essential: { base: 1200, includedModules: 2, maxModules: 3, label: "Essencial" },
    professional: { base: 3000, includedModules: 4, maxModules: 6, label: "Profissional" },
    premium: { base: 5000, includedModules: 8, maxModules: Infinity, label: "Premium" },
} as const;
const packages = [
    { id: "essential", name: "Essencial", description: "Para sites e apps simples", price: "R$ 1.200", features: ["Até 3 telas ou fluxos", "2 módulos incluídos", "Visual profissional baseado no design system", "Módulos extras cobrados à parte"] },
    { id: "professional", name: "Profissional", description: "Para operações conectadas", price: "R$ 3.000", features: ["Até 8 telas ou fluxos", "4 módulos incluídos", "Dashboard e relatórios essenciais", "Módulos extras cobrados à parte"] },
    { id: "premium", name: "Premium", description: "Para sistemas completos", price: "R$ 5.000", features: ["Até 15 telas ou fluxos", "8 módulos incluídos", "Experiência visual refinada", "Módulos extras cobrados à parte"] },
] as const;
type Discovery = { objective: string; users: string; pain: string; integrations: string; successMetric: string };
const emptyDiscovery: Discovery = { objective: "", users: "", pain: "", integrations: "", successMetric: "" };
function readMeetingNotes(value: string): { notes: string; discovery: Discovery } {
    try {
        const parsed = JSON.parse(value);
        if (parsed?.format === "sdd-studio-meeting")
            return { notes: typeof parsed.notes === "string" ? parsed.notes : "", discovery: { ...emptyDiscovery, ...(parsed.discovery || {}) } };
    } catch { /* Mantém compatibilidade com reuniões antigas. */ }
    return { notes: value || "", discovery: emptyDiscovery };
}
export default function Home() {
    const [screen, setScreen] = useState<"meeting" | "projects" | "catalog">("catalog");
    const [selected, setSelected] = useState<string[]>(["clients", "finance", "service"]);
    const [details, setDetails] = useState<Record<string, string[]>>({ finance: ["Contas a pagar e receber", "Orçamentos"], service: ["Ordens de serviço"] });
    const [clientName, setClientName] = useState("Almeida Assistência");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [projectName, setProjectName] = useState("App de gestão operacional");
    const [platform, setPlatform] = useState("web_tablet");
    const [packageType, setPackageType] = useState("professional");
    const [projectStatus, setProjectStatus] = useState("draft");
    const [estimatedWeeks, setEstimatedWeeks] = useState("6");
    const [notes, setNotes] = useState("O cliente precisa usar o sistema no tablet durante atendimentos externos. A equipe administrativa acompanha tudo pelo painel de gestão.");
    const [discovery, setDiscovery] = useState<Discovery>(emptyDiscovery);
    const [showSdd, setShowSdd] = useState(false);
    const [showProposal, setShowProposal] = useState(false);
    const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [documents, setDocuments] = useState<SavedDocument[]>([]);
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);
    const selectedModules = selected.map((id) => modules.find((item) => item.id === id)).filter((item): item is Module => Boolean(item));
    const activePackage = packageRules[packageType as keyof typeof packageRules] ?? packageRules.professional;
    const basePrice = activePackage.base;
    const includedModules = selectedModules.slice(0, activePackage.includedModules);
    const additionalModules = selectedModules.slice(activePackage.includedModules);
    const moduleLimitLabel = Number.isFinite(activePackage.maxModules) ? `${activePackage.maxModules} módulos` : "módulos sem limite";
    const packageOffer = `${activePackage.includedModules} módulos incluídos; ${moduleLimitLabel} neste pacote. Itens extras são cobrados à parte.`;
    const total = useMemo(() => basePrice + additionalModules.reduce((sum, item) => sum + item.price, 0), [additionalModules, basePrice]);
    const platformLabel = platform === "web" ? "Web" : platform === "mobile" ? "Aplicativo mobile" : "Web + Tablet (PWA)";
    const statusLabel = ({ draft: "Em descoberta", proposal: "Proposta enviada", approved: "Aprovado", development: "Em desenvolvimento", completed: "Concluído" } as Record<string, string>)[projectStatus] ?? "Em descoberta";
    const sddText = `# SDD — ${clientName}\n\n## Visão do projeto\n${projectName}. Sistema de gestão com experiência otimizada para ${platformLabel.toLowerCase()}.\n\n## Dados do cliente\n- Empresa: ${clientName}\n- Contato: ${contactName || "A definir"}\n- E-mail: ${email || "A definir"}\n- Telefone: ${phone || "A definir"}\n\n## Diagnóstico da descoberta\n- Objetivo principal: ${discovery.objective || "A definir"}\n- Usuários e perfis: ${discovery.users || "A definir"}\n- Dor atual: ${discovery.pain || "A definir"}\n- Integrações necessárias: ${discovery.integrations || "Nenhuma definida"}\n- Critério de sucesso: ${discovery.successMetric || "A definir"}\n\n## Contexto da reunião\n${notes}\n\n## Escopo\n- Pacote: ${packageType === "essential" ? "Essencial" : packageType === "premium" ? "Premium" : "Profissional"}\n- Plataforma: ${platformLabel}\n- Prazo estimado: ${estimatedWeeks} semanas\n\n## Módulos aprovados\n${selectedModules.map((item) => `- ${item.title}: ${item.description}${details[item.id]?.length ? ` (${details[item.id].join(", ")})` : ""}`).join("\n")}\n\n## Investimento estimado\n${money.format(total)}\n\n## Stack recomendada\n- Next.js + TypeScript\n- PostgreSQL / Supabase\n- PWA responsivo para tablet\n- Design system definido pelo cliente\n\n## Próximas etapas\n1. Validar fluxos e regras de negócio\n2. Criar protótipo das telas principais\n3. Implementar por módulos e validar com o cliente`;
    const proposalText = `# Proposta comercial — ${projectName}\n\nOlá, ${contactName || clientName}!\n\nPreparamos uma proposta para ${clientName} com foco em ${projectName}.\n\n## Solução\n${platformLabel} com experiência visual profissional, desenvolvimento responsivo e foco nos fluxos que mais importam para a operação.\n\n## Escopo incluído\n${selectedModules.map((item, index) => `- ${item.title}${index < activePackage.includedModules ? " (incluído no pacote)" : ` (adicional: ${money.format(item.price)})`}`).join("\n")}\n\n## Investimento\n- Pacote ${activePackage.label}: ${money.format(basePrice)}\n${additionalModules.length ? `- Adicionais: ${money.format(additionalModules.reduce((sum, item) => sum + item.price, 0))}\n` : ""}- Investimento total: ${money.format(total)}\n\n## Prazo\nEstimativa de ${estimatedWeeks} semanas, após validação e início do projeto.\n\n## Próximos passos\n1. Aprovação do escopo e investimento.\n2. Definição do cronograma de início.\n3. Início da etapa de design e desenvolvimento.\n\nEsta proposta é válida por 7 dias.`;
    useEffect(() => {
        const draft = window.localStorage.getItem("sdd-studio-draft");
        if (!draft)
            return;
        try {
            const value = JSON.parse(draft);
            if (Array.isArray(value.selected))
                setSelected(value.selected);
            if (value.details)
                setDetails(value.details);
            if (value.clientName)
                setClientName(value.clientName);
            if (value.contactName)
                setContactName(value.contactName);
            if (value.email)
                setEmail(value.email);
            if (value.phone)
                setPhone(value.phone);
            if (value.projectName)
                setProjectName(value.projectName);
            if (value.platform)
                setPlatform(value.platform);
            if (value.packageType)
                setPackageType(value.packageType);
            if (value.projectStatus)
                setProjectStatus(value.projectStatus);
            if (value.estimatedWeeks)
                setEstimatedWeeks(value.estimatedWeeks);
            if (value.notes)
                setNotes(value.notes);
            if (value.discovery)
                setDiscovery({ ...emptyDiscovery, ...value.discovery });
        }
        catch { /* a new draft is safer than broken data */ }
    }, []);
    useEffect(() => {
        window.localStorage.setItem("sdd-studio-draft", JSON.stringify({ selected, details, clientName, contactName, email, phone, projectName, platform, packageType, projectStatus, estimatedWeeks, notes, discovery }));
    }, [selected, details, clientName, contactName, email, phone, projectName, platform, packageType, projectStatus, estimatedWeeks, notes, discovery]);
    useEffect(() => {
        setSelected((current) => current.length > activePackage.maxModules ? current.slice(0, activePackage.maxModules) : current);
    }, [activePackage.maxModules]);
    async function loadProjects() {
        try {
            const response = await fetch("/api/projects", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Não foi possível carregar os projetos.");
            setProjects(data.projects);
        }
        catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível carregar os projetos.");
        }
    }
    async function loadDocuments(projectId: string) {
        const response = await fetch(`/api/projects/${projectId}/documents`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar o histórico de SDDs.");
        setDocuments(data.documents);
    }
    async function openProject(projectId: string) {
        try {
            setNotice("");
            const response = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Não foi possível abrir o projeto.");
            const project = data.project;
            setClientName(project.clientName || "");
            setContactName(project.contactName || "");
            setEmail(project.email || "");
            setPhone(project.phone || "");
            setProjectName(project.name || "");
            setPackageType(project.packageType || "professional");
            setProjectStatus(project.status || "draft");
            setPlatform(project.platform || "web_tablet");
            setEstimatedWeeks(String(project.estimatedWeeks || 6));
            const savedMeeting = readMeetingNotes(project.meetingNotes || "");
            setNotes(savedMeeting.notes);
            setDiscovery(savedMeeting.discovery);
            setSelected(project.modules.map((module: { key: string }) => module.key));
            setDetails(Object.fromEntries(project.modules.map((module: { key: string; options: string[] }) => [module.key, module.options])));
            setSavedProjectId(projectId);
            await loadDocuments(projectId);
            setScreen("meeting");
        }
        catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível abrir o projeto.");
        }
    }
    async function deleteProject() {
        if (!savedProjectId)
            return;
        if (!window.confirm("Excluir este projeto e todos os SDDs vinculados? Esta ação não pode ser desfeita."))
            return;
        setSaving(true);
        try {
            const response = await fetch(`/api/projects/${savedProjectId}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Não foi possível excluir o projeto.");
            setSavedProjectId(null);
            setNotice("Projeto excluído com sucesso.");
            setScreen("projects");
            await loadProjects();
        }
        catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível excluir o projeto.");
        }
        finally {
            setSaving(false);
        }
    }
    async function saveProject(includeSdd = false) {
        if (!clientName.trim() || !projectName.trim()) {
            setNotice("Informe o nome do cliente e o nome do projeto para salvar.");
            return null;
        }
        setSaving(true);
        setNotice("");
        try {
            const endpoint = savedProjectId ? `/api/projects/${savedProjectId}` : "/api/projects";
            const response = await fetch(endpoint, {
                method: savedProjectId ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientName, contactName, email, phone, projectName, status: projectStatus, packageType, platform, estimatedValue: total, estimatedWeeks: Number(estimatedWeeks) || 0, meetingNotes: JSON.stringify({ format: "sdd-studio-meeting", notes, discovery }), modules: selectedModules.map((item) => ({ key: item.id, name: item.title, price: item.price, options: details[item.id] || [] })) }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Não foi possível salvar o projeto.");
            setSavedProjectId(data.projectId);
            if (includeSdd) {
                const documentResponse = await fetch(`/api/projects/${data.projectId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "sdd", content: sddText }) });
                if (!documentResponse.ok) {
                    const documentData = await documentResponse.json();
                    throw new Error(documentData.error || "Projeto salvo, mas o SDD não foi arquivado.");
                }
                await loadDocuments(data.projectId);
            }
            setNotice(includeSdd ? "Projeto e SDD salvos com sucesso." : savedProjectId ? "Projeto atualizado com sucesso." : "Rascunho salvo com sucesso.");
            return data.projectId as string;
        }
        catch (error) {
            setNotice(error instanceof Error ? error.message : "Não foi possível salvar agora.");
            return null;
        }
        finally {
            setSaving(false);
        }
    }
    function toggleModule(id: string) {
        setSelected((current) => {
            if (current.includes(id)) return current.filter((item) => item !== id);
            if (Number.isFinite(activePackage.maxModules) && current.length >= activePackage.maxModules) {
                setNotice(`${activePackage.label} permite até ${activePackage.maxModules} módulos. Para ampliar, selecione um pacote superior.`);
                return current;
            }
            return [...current, id];
        });
    }
    function toggleDetail(moduleId: string, detail: string) { setDetails((current) => { const values = current[moduleId] || []; return { ...current, [moduleId]: values.includes(detail) ? values.filter((item) => item !== detail) : [...values, detail] }; }); }
    function downloadSdd() { const blob = new Blob([sddText], { type: "text/markdown;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `SDD-${clientName.replace(/[^a-z0-9]/gi, "-") || "projeto"}.md`; link.click(); URL.revokeObjectURL(link.href); }
    function downloadProposal() { const blob = new Blob([proposalText], { type: "text/markdown;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Proposta-${clientName.replace(/[^a-z0-9]/gi, "-") || "cliente"}.md`; link.click(); URL.revokeObjectURL(link.href); }
    async function generateSdd() { await saveProject(true); setShowSdd(true); }
    const header = <header className="topbar">
<a className="brand" href="#" onClick={(event) => { event.preventDefault(); setScreen("catalog"); }}>
<span>SD</span>
<strong>SDD Studio</strong>
</a>
<nav>
<button className={screen === "projects" ? "active" : ""} onClick={() => { setScreen("projects"); loadProjects(); }}>Projetos</button>
<button className={screen === "meeting" ? "active" : ""} onClick={() => setScreen("meeting")}>Nova reunião</button>
<button className={screen === "catalog" ? "active" : ""} onClick={() => setScreen("catalog")}>Catálogo</button>
</nav>
<div className="header-actions">{screen === "meeting" && <button className="ghost-button" onClick={() => saveProject(false)}>{saving ? "Salvando..." : "Salvar rascunho"}</button>}<button className="avatar" aria-label="Perfil">EM</button>
</div>
</header>;
    if (screen === "catalog")
        return <main className="app-shell" key="catalog">{header}<section className="catalog-head">
<div>
<p className="eyebrow">MODELO COMERCIAL</p>
<h1>Pacotes<span>.</span>
</h1>
<p className="muted">Defina uma base comercial e personalize o escopo para cada cliente.</p>
</div>
<button className="new-project" onClick={() => setScreen("meeting")}>Usar em uma reunião</button>
</section>
<section className="package-grid">{packages.map((item, index) => <article key={item.id} className={`package-card ${item.id === packageType ? "is-selected" : ""}`} data-selected={item.id === packageType}>
<span className="package-number">0{index + 1}</span>
<p className="eyebrow">PACOTE {item.name.toUpperCase()}</p>
<h2>{item.name}</h2>
<p>{item.description}</p>
<strong>{item.price}</strong>
<small>a partir de</small>
<ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
<button type="button" aria-pressed={item.id === packageType} onClick={() => setPackageType(item.id)}>{item.id === packageType ? "Pacote selecionado ✓" : "Selecionar pacote →"}</button>
</article>)}</section>
<section className="package-comparison">
<div className="comparison-head"><div><p className="eyebrow">COMPARATIVO OBJETIVO</p><h2>O que muda em cada pacote?</h2></div><p>Use esta tabela durante a reunião para alinhar expectativa, investimento e limite de escopo.</p></div>
<div className="comparison-table" role="table" aria-label="Comparativo de pacotes"><div className="comparison-row comparison-labels" role="row"><span role="columnheader">ENTREGA</span><strong role="columnheader">ESSENCIAL</strong><strong role="columnheader">PROFISSIONAL</strong><strong role="columnheader">PREMIUM</strong></div><div className="comparison-row" role="row"><span>Investimento base</span><strong>R$ 1.200</strong><strong>R$ 3.000</strong><strong>R$ 5.000</strong></div><div className="comparison-row" role="row"><span>Para quem</span><strong>MVP de um processo</strong><strong>Operação em crescimento</strong><strong>Gestão completa e estratégica</strong></div><div className="comparison-row" role="row"><span>Telas e fluxos</span><strong>Até 3</strong><strong>Até 8</strong><strong>Até 15</strong></div><div className="comparison-row" role="row"><span>Módulos incluídos</span><strong>2 incluídos · máximo 3</strong><strong>4 incluídos · máximo 6</strong><strong>8 incluídos · sem limite total</strong></div><div className="comparison-row" role="row"><span>Complexidade</span><strong>Um fluxo principal</strong><strong>Fluxos conectados e perfis</strong><strong>Regras, áreas e jornadas integradas</strong></div><div className="comparison-row" role="row"><span>Validação</span><strong>1 ciclo de ajustes</strong><strong>2 ciclos de ajustes</strong><strong>Entrega por etapas e validações</strong></div><div className="comparison-row" role="row"><span>Padrão visual</span><strong>Design profissional responsivo</strong><strong>Design profissional responsivo</strong><strong>Design profissional responsivo</strong></div><div className="comparison-row" role="row"><span>Módulo adicional</span><strong>1 adicional possível</strong><strong>Até 2 adicionais possíveis</strong><strong>Sem limite, cobrado à parte</strong></div><div className="comparison-row" role="row"><span>Prazo de referência</span><strong>Até 2 semanas</strong><strong>4 a 6 semanas</strong><strong>6 a 10 semanas</strong></div></div>
</section>
<section className="catalog-modules">
<div>
<p className="eyebrow">ADICIONAIS</p>
<h2>Módulos que aumentam o escopo.</h2>
</div>
<div>{modules.map((item) => <span key={item.id}>
<b>{item.icon}</b>{item.title}<em>+{money.format(item.price)}</em>
</span>)}</div>
</section>
</main>;
    if (screen === "projects")
        return <main className="app-shell" key="projects">{header}<section className="projects-head">
<div>
<p className="eyebrow">SEU ESPAÇO DE TRABALHO</p>
<h1>Projetos<span>.</span>
</h1>
<p className="muted">Retome reuniões, acompanhe propostas e encontre os SDDs já gerados.</p>
</div>
<button className="new-project" onClick={() => setScreen("meeting")}>+ Nova reunião</button>
</section>
<section className="project-stats">
<div>
<span>PROJETOS SALVOS</span>
<strong>{projects.length.toString().padStart(2, "0")}</strong>
<small>registros do seu banco de dados</small>
</div>
<div>
<span>VALOR EM PROPOSTAS</span>
<strong>{money.format(projects.reduce((sum, item) => sum + Number(item.estimatedValue || 0), 0))}</strong>
<small>valor estimado acumulado</small>
</div>
<div>
<span>ÚLTIMA AÇÃO</span>
<strong>{savedProjectId ? "OK" : "—"}</strong>
<small>{savedProjectId ? "rascunho salvo nesta sessão" : "salve uma reunião para começar"}</small>
</div>
</section>
<section className="project-list">
<div className="list-head">
<div>
<p className="eyebrow">RECENTES</p>
<h2>Reuniões e propostas</h2>
</div>
<button onClick={loadProjects}>Atualizar lista</button>
</div>{projects.length ? projects.map((project) => <button className="project-row" key={project.id} onClick={() => openProject(project.id)}>
<span className="project-avatar">{project.clientName[0]}</span>
<span className="project-name">
<strong>{project.clientName}</strong>
<small>{project.name}</small>
</span>
<span className="status s1">{project.status}</span>
<span className="project-date">{new Date(project.updatedAt).toLocaleDateString("pt-BR")}</span>
<strong className="project-value">{money.format(Number(project.estimatedValue))}</strong>
<span className="row-arrow">→</span>
</button>) : <div className="empty-state">Nenhum projeto salvo ainda. Crie uma reunião e toque em <strong>Salvar rascunho</strong>.</div>}</section>{notice && <p className="notice">{notice}</p>}</main>;
    return <main className="app-shell" key="meeting">{header}<section className="meeting-head">
<div>
<p className="eyebrow">REUNIÃO EM ANDAMENTO <i /> {new Date().toLocaleDateString("pt-BR")}</p>
<h1>Descoberta de projeto<span>.</span>
</h1>
<p className="muted">Construa o escopo junto com o cliente e transforme a conversa em uma especificação clara.</p>
</div>
<div className="client-card">
<div className="client-symbol">{clientName[0] || "C"}</div>
<div>
<small>CLIENTE</small>
<strong>{clientName || "Novo cliente"}</strong>
<span>{projectName || "Novo projeto"}</span>
</div>
</div>
</section>
<section className="workflow">{["Contexto", "Solução", "Detalhes", "Revisão"].map((label, index) => <button key={label} className={index === 1 ? "current" : ""}>
<b>{index + 1}</b>
<span>{label}</span>
</button>)}</section>
<div className="workspace">
<section className="builder-card">
<div className="section-title">
<div>
<p className="eyebrow">01 — CONTEXTO</p>
<h2>Quem é o cliente e o que vamos criar?</h2>
</div>
<p>Preencha os dados enquanto conversa com o cliente.</p>
</div>
<div className="project-form">
<label>Nome da empresa<input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Ex.: Almeida Assistência"/>
</label>
<label>Nome do projeto<input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Ex.: App de gestão operacional"/>
</label>
<label>Pessoa de contato<input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Ex.: Ana Silva"/>
</label>
<label>Telefone / WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(47) 99999-9999" inputMode="tel"/>
</label>
<label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contato@empresa.com" inputMode="email"/>
</label>
<label>Tipo de entrega<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="web_tablet">Web + Tablet (PWA)</option><option value="web">Sistema web</option><option value="mobile">Aplicativo mobile</option></select>
</label>
<label>Pacote comercial<select value={packageType} onChange={(event) => setPackageType(event.target.value)}><option value="essential">Essencial</option><option value="professional">Profissional</option><option value="premium">Premium</option></select>
</label>
<label>Status comercial<select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option value="draft">Em descoberta</option><option value="proposal">Proposta enviada</option><option value="approved">Aprovado</option><option value="development">Em desenvolvimento</option><option value="completed">Concluído</option></select>
</label>
<label>Prazo estimado<select value={estimatedWeeks} onChange={(event) => setEstimatedWeeks(event.target.value)}><option value="2">2 semanas</option><option value="4">4 semanas</option><option value="6">6 semanas</option><option value="8">8 semanas</option><option value="12">12 semanas</option></select>
</label>
</div>
<div className="section-title discovery-title">
<div>
<p className="eyebrow">01.1 — DIAGNÓSTICO</p>
<h2>O que define o sucesso deste projeto?</h2>
</div>
<p>Essas respostas entram automaticamente no SDD para orientar a IA e o desenvolvimento.</p>
</div>
<div className="discovery-grid">
<label>Objetivo principal<input value={discovery.objective} onChange={(event) => setDiscovery((current) => ({ ...current, objective: event.target.value }))} placeholder="Ex.: reduzir o tempo de atendimento"/>
</label>
<label>Quem vai usar?<input value={discovery.users} onChange={(event) => setDiscovery((current) => ({ ...current, users: event.target.value }))} placeholder="Ex.: equipe externa e administrativo"/>
</label>
<label>Maior dor atual<input value={discovery.pain} onChange={(event) => setDiscovery((current) => ({ ...current, pain: event.target.value }))} placeholder="Ex.: informações espalhadas em WhatsApp"/>
</label>
<label>Integrações necessárias<input value={discovery.integrations} onChange={(event) => setDiscovery((current) => ({ ...current, integrations: event.target.value }))} placeholder="Ex.: WhatsApp, ERP, pagamentos"/>
</label>
<label className="discovery-wide">Como saberemos que deu certo?<input value={discovery.successMetric} onChange={(event) => setDiscovery((current) => ({ ...current, successMetric: event.target.value }))} placeholder="Ex.: orçamento emitido em menos de 5 minutos"/>
</label>
</div>
<div className="section-title solution-title">
<div>
<p className="eyebrow">02 — SOLUÇÃO</p>
<h2>O que este sistema precisa resolver?</h2>
</div>
<p>Selecione os módulos que fazem sentido para esta demanda.</p>
</div>
<div className="module-legend"><span className="included-dot">Incluído no pacote</span><span className="additional-dot">Adicional cobrado à parte</span></div><div className="module-grid">{modules.map((item) => { const selectedPosition = selected.indexOf(item.id); const moduleState = selectedPosition < 0 ? "" : selectedPosition < activePackage.includedModules ? "selected included" : "selected additional"; return <button key={item.id} className={`module ${moduleState}`} onClick={() => toggleModule(item.id)}>
<span className="module-icon">{item.icon}</span>
<span className="module-copy">
<strong>{item.title}</strong>
<small>{item.description}</small>
</span>
<span className="module-price">{selectedPosition >= 0 && selectedPosition < activePackage.includedModules ? "Incluído" : `+${money.format(item.price)}`}</span>
<span className="check">✓</span>
</button>; })}</div>{selectedModules.filter((item) => item.fields).map((item) => <div className="detail-group" key={item.id}>
<div>
<p className="eyebrow">CONFIGURAÇÃO</p>
<h3>{item.title}</h3>
</div>
<div className="chips">{item.fields?.map((field) => <button key={field} className={(details[item.id] || []).includes(field) ? "chip checked" : "chip"} onClick={() => toggleDetail(item.id, field)}>{field}<span>✓</span>
</button>)}</div>
</div>)}<div className="notes">
<label htmlFor="notes">Observações da reunião</label>
<textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anote regras, necessidades e informações importantes..."/>
</div>
</section>
<aside className="summary-card">
<div className="summary-top">
<div>
<p className="eyebrow">ESCOPO ATUAL</p>
<h2>{packageType === "essential" ? "Projeto essencial" : packageType === "premium" ? "Projeto premium" : "Projeto profissional"}</h2>
<small className="package-offer">{packageOffer}</small>
</div>
<span className="live-dot">{statusLabel}</span>
</div>
<div className="platform">
<span>Plataformas</span>
<strong>{platformLabel}</strong>
</div>
<div className="selection-list">
<p>MÓDULOS SELECIONADOS <b>{selected.length}</b>
</p>{selectedModules.map((item, index) => <div key={item.id}>
<span>{item.icon}</span>
<strong>{item.title}</strong>
<em>{index < activePackage.includedModules ? "Incluído" : `+${money.format(item.price)}`}</em>
</div>)}</div>
{additionalModules.length > 0 && <div className="additionals-note"><span>ADICIONAIS</span><strong>{additionalModules.length} módulo(s)</strong><b>+{money.format(additionalModules.reduce((sum, item) => sum + item.price, 0))}</b></div>}
<div className="estimate">
<div>
<span>Pacote {activePackage.label}</span>
<strong>{money.format(basePrice)}</strong>
</div>
<div>
<span>Investimento estimado</span>
<b>{money.format(total)}</b>
</div>
<small>{includedModules.length} de {activePackage.includedModules} incluídos · {selected.length} selecionado(s) · {Number.isFinite(activePackage.maxModules) ? `limite de ${activePackage.maxModules}` : "sem limite de módulos"}</small>
</div>
{savedProjectId && <div className="document-history"><p className="eyebrow">HISTÓRICO DE SDD <b>{documents.length}</b></p>{documents.length ? documents.map((document) => <button key={document.id} onClick={() => navigator.clipboard?.writeText(document.content).then(() => setNotice(`SDD versão ${document.version} copiado para a área de transferência.`))}><span>SDD · V{String(document.version).padStart(2, "0")}</span><small>{new Date(document.createdAt).toLocaleDateString("pt-BR")}</small></button>) : <small>Nenhum SDD gerado ainda.</small>}</div>}
<button className="primary-button" onClick={generateSdd} disabled={saving}>{saving ? "Salvando..." : "Gerar SDD completo"} <span>→</span>
</button><button className="proposal-button" onClick={() => setShowProposal(true)}>Gerar proposta comercial</button>{savedProjectId && <button className="delete-project" onClick={deleteProject} disabled={saving}>Excluir este projeto</button>}{notice && <p className="notice">{notice}</p>}</aside>
</div>{showSdd && <div className="sdd-modal" role="dialog" aria-modal="true" aria-label="SDD gerado">
<div className="sdd-sheet">
<header>
<div>
<p className="eyebrow">SDD STUDIO <i /> ESPECIFICAÇÃO</p>
<h2>{clientName}<span>.</span>
</h2>
</div>
<button className="close" onClick={() => setShowSdd(false)} aria-label="Fechar">×</button>
</header>
<div className="sdd-meta">
<span>VERSÃO 01</span>
<span>{new Date().toLocaleDateString("pt-BR")}</span>
<span>WEB + TABLET</span>
</div>
<section>
<p className="eyebrow">01 — VISÃO DO PROJETO</p>
<h3>{projectName}</h3>
<p>{notes || "Especificação criada a partir da descoberta com o cliente."}</p>
</section>
<section className="sdd-modules">
<p className="eyebrow">02 — MÓDULOS APROVADOS</p>{selectedModules.map((item, index) => <div key={item.id}>
<b>0{index + 1}</b>
<span>
<strong>{item.title}</strong>
<small>{item.description}</small>
</span>
<em>{money.format(item.price)}</em>
</div>)}</section>
<section className="two-column">
<div>
<p className="eyebrow">03 — TECNOLOGIAS</p>
<ul>
<li>Next.js + TypeScript</li>
<li>PostgreSQL / Supabase</li>
<li>PWA para tablet</li>
</ul>
</div>
<div>
<p className="eyebrow">04 — PRÓXIMA ETAPA</p>
<ul>
<li>Validar regras de negócio</li>
<li>Protótipo de telas</li>
<li>Implementação por módulos</li>
</ul>
</div>
</section>
<footer>
<div>
<span>INVESTIMENTO ESTIMADO</span>
<strong>{money.format(total)}</strong>
</div>
<div className="sdd-actions">
<button onClick={() => navigator.clipboard?.writeText(sddText).then(() => setNotice("SDD copiado. Agora é só colar na IA."))}>Copiar para IA</button>
<button className="download" onClick={downloadSdd}>Baixar .MD</button>
</div>
</footer>
</div>
</div>}{showProposal && <div className="sdd-modal" role="dialog" aria-modal="true" aria-label="Proposta comercial"><div className="proposal-sheet"><header><div><p className="eyebrow">SDD STUDIO · PROPOSTA COMERCIAL</p><h2>{clientName}<span>.</span></h2></div><button className="close" onClick={() => setShowProposal(false)} aria-label="Fechar">×</button></header><div className="proposal-intro"><p>PROPOSTA PARA</p><strong>{projectName}</strong><span>{platformLabel} · prazo estimado de {estimatedWeeks} semanas</span></div><section><p className="eyebrow">ESCOPO DA SOLUÇÃO</p><h3>Uma experiência profissional feita para a operação.</h3><p>{packageOffer}</p></section><section className="sdd-modules"><p className="eyebrow">MÓDULOS SELECIONADOS</p>{selectedModules.map((item, index) => <div key={item.id}><b>0{index + 1}</b><span><strong>{item.title}</strong><small>{index < activePackage.includedModules ? "Incluído no pacote" : "Módulo adicional"}</small></span><em>{index < activePackage.includedModules ? "Incluído" : money.format(item.price)}</em></div>)}</section><section className="proposal-value"><span>INVESTIMENTO TOTAL</span><strong>{money.format(total)}</strong><small>Proposta válida por 7 dias.</small></section><footer><div><span>PRÓXIMO PASSO</span><strong>Aprovar o escopo e iniciar o cronograma.</strong></div><div className="sdd-actions"><button onClick={() => navigator.clipboard?.writeText(proposalText).then(() => setNotice("Proposta copiada para envio."))}>Copiar proposta</button><button className="download" onClick={downloadProposal}>Baixar .MD</button></div></footer></div></div>}</main>;
}
