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
    const [estimatedWeeks, setEstimatedWeeks] = useState("6");
    const [notes, setNotes] = useState("O cliente precisa usar o sistema no tablet durante atendimentos externos. A equipe administrativa acompanha tudo pelo painel de gestão.");
    const [showSdd, setShowSdd] = useState(false);
    const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);
    const selectedModules = modules.filter((item) => selected.includes(item.id));
    const basePrice = 1200;
    const packageFloor = packageType === "premium" ? 5000 : packageType === "professional" ? 3000 : 1200;
    const packageOffer = packageType === "premium" ? "Até 15 telas, 8 módulos, automações e até 3 integrações." : packageType === "professional" ? "Até 8 telas, 4 módulos, dashboard, PWA e 1 integração." : "Até 3 telas, 1 objetivo principal e visual profissional.";
    const total = useMemo(() => Math.min(5000, Math.max(packageFloor, basePrice + selectedModules.reduce((sum, item) => sum + item.price, 0))), [selectedModules, packageFloor]);
    const platformLabel = platform === "web" ? "Web" : platform === "mobile" ? "Aplicativo mobile" : "Web + Tablet (PWA)";
    const sddText = `# SDD — ${clientName}\n\n## Visão do projeto\n${projectName}. Sistema de gestão com experiência otimizada para ${platformLabel.toLowerCase()}.\n\n## Dados do cliente\n- Empresa: ${clientName}\n- Contato: ${contactName || "A definir"}\n- E-mail: ${email || "A definir"}\n- Telefone: ${phone || "A definir"}\n\n## Contexto da reunião\n${notes}\n\n## Escopo\n- Pacote: ${packageType === "essential" ? "Essencial" : packageType === "premium" ? "Premium" : "Profissional"}\n- Plataforma: ${platformLabel}\n- Prazo estimado: ${estimatedWeeks} semanas\n\n## Módulos aprovados\n${selectedModules.map((item) => `- ${item.title}: ${item.description}${details[item.id]?.length ? ` (${details[item.id].join(", ")})` : ""}`).join("\n")}\n\n## Investimento estimado\n${money.format(total)}\n\n## Stack recomendada\n- Next.js + TypeScript\n- PostgreSQL / Supabase\n- PWA responsivo para tablet\n- Design system definido pelo cliente\n\n## Próximas etapas\n1. Validar fluxos e regras de negócio\n2. Criar protótipo das telas principais\n3. Implementar por módulos e validar com o cliente`;
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
            if (value.estimatedWeeks)
                setEstimatedWeeks(value.estimatedWeeks);
            if (value.notes)
                setNotes(value.notes);
        }
        catch { /* a new draft is safer than broken data */ }
    }, []);
    useEffect(() => {
        window.localStorage.setItem("sdd-studio-draft", JSON.stringify({ selected, details, clientName, contactName, email, phone, projectName, platform, packageType, estimatedWeeks, notes }));
    }, [selected, details, clientName, contactName, email, phone, projectName, platform, packageType, estimatedWeeks, notes]);
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
    async function saveProject(includeSdd = false) {
        if (!clientName.trim() || !projectName.trim()) {
            setNotice("Informe o nome do cliente e o nome do projeto para salvar.");
            return null;
        }
        setSaving(true);
        setNotice("");
        try {
            const response = await fetch("/api/projects", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientName, contactName, email, phone, projectName, packageType, platform, estimatedValue: total, estimatedWeeks: Number(estimatedWeeks) || 0, meetingNotes: notes, modules: selectedModules.map((item) => ({ key: item.id, name: item.title, price: item.price, options: details[item.id] || [] })) }),
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
            }
            setNotice(includeSdd ? "Projeto e SDD salvos com sucesso." : "Rascunho salvo com sucesso.");
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
    function toggleModule(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
    function toggleDetail(moduleId: string, detail: string) { setDetails((current) => { const values = current[moduleId] || []; return { ...current, [moduleId]: values.includes(detail) ? values.filter((item) => item !== detail) : [...values, detail] }; }); }
    function downloadSdd() { const blob = new Blob([sddText], { type: "text/markdown;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `SDD-${clientName.replace(/[^a-z0-9]/gi, "-") || "projeto"}.md`; link.click(); URL.revokeObjectURL(link.href); }
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
        return <main className="app-shell">{header}<section className="catalog-head">
<div>
<p className="eyebrow">MODELO COMERCIAL</p>
<h1>Pacotes<span>.</span>
</h1>
<p className="muted">Defina uma base comercial e personalize o escopo para cada cliente.</p>
</div>
<button className="new-project" onClick={() => setScreen("meeting")}>Usar em uma reunião</button>
</section>
<section className="package-grid">{[["Essencial", "Para sites e apps simples", "R$ 1.200", "Até 3 telas ou fluxos", "1 objetivo principal", "Visual profissional baseado no design system", "Sem integrações ou automações"], ["Profissional", "Para operações conectadas", "R$ 3.000", "Até 8 telas ou fluxos", "Até 4 módulos de gestão", "Dashboard e relatórios essenciais", "Web + tablet (PWA) e 1 integração"], ["Premium", "Para sistemas completos", "R$ 5.000", "Até 15 telas ou fluxos", "Até 8 módulos de gestão", "Automações e até 3 integrações", "Experiência visual refinada e entrega por etapas"]].map((item, index) => <article key={item[0]} className={`package-card ${index === 1 ? "featured" : ""}`}>
<span className="package-number">0{index + 1}</span>
<p className="eyebrow">PACOTE {item[0].toUpperCase()}</p>
<h2>{item[0]}</h2>
<p>{item[1]}</p>
<strong>{item[2]}</strong>
<small>a partir de</small>
<ul>{item.slice(3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
<button onClick={() => { setPackageType(index === 0 ? "essential" : index === 1 ? "professional" : "premium"); setScreen("meeting"); }}>Selecionar pacote →</button>
</article>)}</section>
<section className="package-comparison">
<div className="comparison-head"><div><p className="eyebrow">COMPARATIVO OBJETIVO</p><h2>O que muda em cada pacote?</h2></div><p>Use esta tabela durante a reunião para alinhar expectativa, investimento e limite de escopo.</p></div>
<div className="comparison-table" role="table" aria-label="Comparativo de pacotes"><div className="comparison-row comparison-labels" role="row"><span role="columnheader">ENTREGA</span><strong role="columnheader">ESSENCIAL</strong><strong role="columnheader">PROFISSIONAL</strong><strong role="columnheader">PREMIUM</strong></div><div className="comparison-row" role="row"><span>Investimento</span><strong>R$ 1.200</strong><strong>R$ 3.000</strong><strong>R$ 5.000</strong></div><div className="comparison-row" role="row"><span>Telas e fluxos</span><strong>Até 3</strong><strong>Até 8</strong><strong>Até 15</strong></div><div className="comparison-row" role="row"><span>Módulos</span><strong>1 objetivo</strong><strong>Até 4 módulos</strong><strong>Até 8 módulos</strong></div><div className="comparison-row" role="row"><span>Plataforma</span><strong>Site ou web simples</strong><strong>Web + Tablet (PWA)</strong><strong>Web + Tablet refinado</strong></div><div className="comparison-row" role="row"><span>Integrações</span><strong>Não incluso</strong><strong>1 integração</strong><strong>Até 3 integrações</strong></div><div className="comparison-row" role="row"><span>Automação</span><strong>Não incluso</strong><strong>Essencial, se necessário</strong><strong>Fluxos automatizados</strong></div><div className="comparison-row" role="row"><span>Prazo de referência</span><strong>Até 2 semanas</strong><strong>4 a 6 semanas</strong><strong>6 a 10 semanas</strong></div></div>
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
        return <main className="app-shell">{header}<section className="projects-head">
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
</div>{projects.length ? projects.map((project) => <button className="project-row" key={project.id} onClick={() => { setClientName(project.clientName); setProjectName(project.name); setScreen("meeting"); }}>
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
    return <main className="app-shell">{header}<section className="meeting-head">
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
<label>Prazo estimado<select value={estimatedWeeks} onChange={(event) => setEstimatedWeeks(event.target.value)}><option value="2">2 semanas</option><option value="4">4 semanas</option><option value="6">6 semanas</option><option value="8">8 semanas</option><option value="12">12 semanas</option></select>
</label>
</div>
<div className="section-title solution-title">
<div>
<p className="eyebrow">02 — SOLUÇÃO</p>
<h2>O que este sistema precisa resolver?</h2>
</div>
<p>Selecione os módulos que fazem sentido para esta demanda.</p>
</div>
<div className="module-grid">{modules.map((item) => <button key={item.id} className={`module ${selected.includes(item.id) ? "selected" : ""}`} onClick={() => toggleModule(item.id)}>
<span className="module-icon">{item.icon}</span>
<span className="module-copy">
<strong>{item.title}</strong>
<small>{item.description}</small>
</span>
<span className="module-price">+{money.format(item.price)}</span>
<span className="check">✓</span>
</button>)}</div>{selectedModules.filter((item) => item.fields).map((item) => <div className="detail-group" key={item.id}>
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
<span className="live-dot">Ao vivo</span>
</div>
<div className="platform">
<span>Plataformas</span>
<strong>{platformLabel}</strong>
</div>
<div className="selection-list">
<p>MÓDULOS SELECIONADOS <b>{selected.length}</b>
</p>{selectedModules.map((item) => <div key={item.id}>
<span>{item.icon}</span>
<strong>{item.title}</strong>
<em>{money.format(item.price)}</em>
</div>)}</div>
<div className="estimate">
<div>
<span>Piso do pacote</span>
<strong>{money.format(packageFloor)}</strong>
</div>
<div>
<span>Investimento estimado</span>
<b>{money.format(total)}</b>
</div>
<small>Prazo estimado: {estimatedWeeks} semanas · teto comercial: {money.format(5000)}</small>
</div>
<button className="primary-button" onClick={generateSdd} disabled={saving}>{saving ? "Salvando..." : "Gerar SDD completo"} <span>→</span>
</button>{notice && <p className="notice">{notice}</p>}</aside>
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
</div>}</main>;
}
