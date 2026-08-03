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
];
const securityBaseline = { title: "Segurança padrão", description: "Login, recuperação de acesso, proteção básica de dados e requisitos iniciais de LGPD.", fields: ["Login e recuperação", "Proteção básica de dados", "LGPD e consentimento"] };
const selectableModules = modules.filter((item) => item.id !== "security");
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const packageRules = {
    essential: { base: 1200, includedModules: 2, maxModules: 3, label: "Essencial" },
    professional: { base: 3000, includedModules: 4, maxModules: 6, label: "Profissional" },
    premium: { base: 5000, includedModules: 8, maxModules: Infinity, label: "Premium" },
} as const;
const packages = [
    { id: "essential", name: "Essencial", description: "Para sites e apps simples", price: "R$ 1.200", features: ["Até 3 telas ou fluxos", "2 módulos incluídos · máximo 3", "Segurança padrão incluída", "Até 3 usuários · 1 perfil de acesso", "Sem integração externa", "1 ciclo de ajustes", "Entrega e orientação de uso"] },
    { id: "professional", name: "Profissional", description: "Para operações conectadas", price: "R$ 3.000", features: ["Até 8 telas ou fluxos", "4 módulos incluídos · máximo 6", "Segurança padrão incluída", "Até 15 usuários · 3 perfis de acesso", "Até 2 integrações externas", "Dashboard + até 3 relatórios", "2 ciclos de ajustes + treinamento"] },
    { id: "premium", name: "Premium", description: "Para sistemas completos", price: "R$ 5.000", features: ["Até 15 telas ou fluxos", "8 módulos incluídos · adicionais sem limite", "Segurança padrão incluída", "Até 50 usuários · 5 perfis de acesso", "Até 4 integrações externas", "Dashboard executivo + relatórios estratégicos", "Entrega por etapas + treinamento ampliado"] },
] as const;
type Discovery = { objective: string; users: string; userCount: string; profileCount: string; screenCount: string; pain: string; integrations: string; integrationCount: string; successMetric: string };
const emptyDiscovery: Discovery = { objective: "", users: "", userCount: "", profileCount: "", screenCount: "", pain: "", integrations: "", integrationCount: "", successMetric: "" };
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
    const [projectSearch, setProjectSearch] = useState("");
    const [projectFilter, setProjectFilter] = useState("all");
    const [documents, setDocuments] = useState<SavedDocument[]>([]);
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);
    const selectedModules = selected.map((id) => modules.find((item) => item.id === id)).filter((item): item is Module => Boolean(item) && item.id !== "security");
    const activePackage = packageRules[packageType as keyof typeof packageRules] ?? packageRules.professional;
    const activePackageDefinition = packages.find((item) => item.id === packageType) ?? packages[1];
    const packageUserLimits = { essential: 3, professional: 15, premium: 50 } as const;
    const expectedUserCount = Number(discovery.userCount) || 0;
    const userCountDisplay = discovery.userCount === "51" ? "Mais de 50 usuários" : discovery.userCount ? `Até ${discovery.userCount} usuários` : "A definir";
    const userLimit = packageUserLimits[packageType as keyof typeof packageUserLimits] ?? packageUserLimits.professional;
    const userLimitWarning = expectedUserCount > userLimit ? expectedUserCount > packageUserLimits.premium ? "A demanda ultrapassa o Premium e precisa de uma proposta personalizada." : `Este pacote comporta até ${userLimit} usuários. Recomendamos subir o pacote.` : "";
    const packageIntegrationLimits = { essential: 0, professional: 2, premium: 4 } as const;
    const expectedIntegrationCount = Number(discovery.integrationCount) || 0;
    const integrationLimit = packageIntegrationLimits[packageType as keyof typeof packageIntegrationLimits] ?? packageIntegrationLimits.professional;
    const integrationLimitWarning = expectedIntegrationCount > integrationLimit ? expectedIntegrationCount > packageIntegrationLimits.premium ? "A demanda tem mais de 4 integrações e precisa de uma proposta personalizada." : `Este pacote inclui até ${integrationLimit} integrações. Recomendamos subir o pacote.` : "";
    const packageProfileLimits = { essential: 1, professional: 3, premium: 5 } as const;
    const expectedProfileCount = Number(discovery.profileCount) || 0;
    const profileLimit = packageProfileLimits[packageType as keyof typeof packageProfileLimits] ?? packageProfileLimits.professional;
    const profileLimitWarning = expectedProfileCount > profileLimit ? expectedProfileCount > packageProfileLimits.premium ? "A demanda tem mais de 5 perfis e precisa de uma proposta personalizada." : `Este pacote inclui até ${profileLimit} perfis de acesso. Recomendamos subir o pacote.` : "";
    const packageScreenLimits = { essential: 3, professional: 8, premium: 15 } as const;
    const expectedScreenCount = Number(discovery.screenCount) || 0;
    const screenLimit = packageScreenLimits[packageType as keyof typeof packageScreenLimits] ?? packageScreenLimits.professional;
    const screenLimitWarning = expectedScreenCount > screenLimit ? expectedScreenCount > packageScreenLimits.premium ? "A demanda tem mais de 15 telas ou fluxos e precisa de uma proposta personalizada." : `Este pacote contempla até ${screenLimit} telas ou fluxos. Recomendamos subir o pacote.` : "";
    const packageOptions = ["essential", "professional", "premium"] as const;
    const hasCommercialSizing = Boolean(discovery.userCount && discovery.profileCount && discovery.integrationCount && discovery.screenCount);
    const recommendedPackageType = hasCommercialSizing ? packageOptions.find((candidate) => expectedUserCount <= packageUserLimits[candidate] && expectedProfileCount <= packageProfileLimits[candidate] && expectedIntegrationCount <= packageIntegrationLimits[candidate] && expectedScreenCount <= packageScreenLimits[candidate] && selected.length <= packageRules[candidate].maxModules) ?? null : null;
    const recommendedPackage = recommendedPackageType ? packageRules[recommendedPackageType] : null;
    const basePrice = activePackage.base;
    const includedModules = selectedModules.slice(0, activePackage.includedModules);
    const additionalModules = selectedModules.slice(activePackage.includedModules);
    const moduleLimitLabel = Number.isFinite(activePackage.maxModules) ? `${activePackage.maxModules} módulos` : "módulos sem limite";
    const packageOffer = `${activePackage.includedModules} módulos incluídos; ${moduleLimitLabel} neste pacote. ${activePackageDefinition.features.slice(2, 5).join(" · ")}. Itens extras são cobrados à parte.`;
    const total = useMemo(() => basePrice + additionalModules.reduce((sum, item) => sum + item.price, 0), [additionalModules, basePrice]);
    const platformLabel = platform === "web" ? "Web" : platform === "mobile" ? "Aplicativo mobile" : "Web + Tablet (PWA)";
    const statusLabel = ({ draft: "Em descoberta", proposal: "Proposta enviada", approved: "Aprovado", preparation: "Preparação de desenvolvimento", development: "Em desenvolvimento", completed: "Concluído" } as Record<string, string>)[projectStatus] ?? "Em descoberta";
    const filteredProjects = useMemo(() => {
        const query = projectSearch.trim().toLocaleLowerCase("pt-BR");
        return projects.filter((project) => (projectFilter === "all" || project.status === projectFilter) && (!query || `${project.clientName} ${project.name}`.toLocaleLowerCase("pt-BR").includes(query)));
    }, [projects, projectSearch, projectFilter]);
    const readinessItems = [
        { label: "Cliente e projeto", complete: Boolean(clientName.trim() && projectName.trim()) },
        { label: "Contato do cliente", complete: Boolean(contactName.trim() || email.trim() || phone.trim()) },
        { label: "Objetivo definido", complete: Boolean(discovery.objective.trim()) },
        { label: "Módulos selecionados", complete: selectedModules.length > 0 },
        { label: "Quantidade de usuários", complete: Boolean(discovery.userCount) },
        { label: "Perfis de acesso", complete: Boolean(discovery.profileCount) },
        { label: "Telas e fluxos", complete: Boolean(discovery.screenCount) },
        { label: "Quantidade de integrações", complete: Boolean(discovery.integrationCount) },
        { label: "Anotações da reunião", complete: Boolean(notes.trim()) },
    ];
    const pendingReadiness = readinessItems.filter((item) => !item.complete).length;
    const sddText = `# SDD — ${clientName}\n\n## 1. Visão do projeto\n${projectName}. Sistema de gestão com experiência otimizada para ${platformLabel.toLowerCase()}.\n\n## 2. Dados do cliente\n- Empresa: ${clientName}\n- Contato: ${contactName || "A definir"}\n- E-mail: ${email || "A definir"}\n- Telefone: ${phone || "A definir"}\n\n## 3. Diagnóstico da descoberta\n- Objetivo principal: ${discovery.objective || "A definir"}\n- Usuários e perfis: ${discovery.users || "A definir"}\n- Quantidade estimada de usuários: ${discovery.userCount || "A definir"}\n- Dor atual: ${discovery.pain || "A definir"}\n- Integrações necessárias: ${discovery.integrations || "Nenhuma definida"}\n- Critério de sucesso: ${discovery.successMetric || "A definir"}\n\n## 4. Contexto e regras de negócio\n${notes || "As regras de negócio serão validadas na etapa de descoberta."}\n\n## 5. Escopo contratado\n- Pacote: ${activePackage.label}\n- Plataforma: ${platformLabel}\n- Prazo de referência: ${estimatedWeeks} semanas\n- Limite comercial de usuários: até ${userLimit}\n- Módulos incluídos: ${includedModules.map((item) => item.title).join(", ") || "A definir"}\n- Módulos adicionais: ${additionalModules.map((item) => item.title).join(", ") || "Nenhum"}\n\n## 6. Requisitos funcionais\n${selectedModules.map((item, index) => `### RF-${String(index + 1).padStart(2, "0")} — ${item.title}\n- Objetivo: ${item.description}\n- Capacidades: ${details[item.id]?.length ? details[item.id].join("; ") : "Definir durante o protótipo e validação."}`).join("\n\n")}\n\n## 7. Requisitos não funcionais\n- Interface responsiva e adequada ao uso em tablet.\n- Acesso controlado por perfis e permissões quando aplicável.\n- Dados organizados para consulta, relatórios e expansão futura.\n- Aplicar o design system aprovado pelo cliente em toda a experiência.\n\n## 8. Critérios de aceite\n- Os fluxos selecionados devem funcionar de ponta a ponta com os perfis definidos.\n- Cada módulo deve apresentar os campos e ações validados durante o protótipo.\n- A experiência deve ser validada em tela de tablet e navegador moderno.\n- O cliente aprova a entrega por etapa antes do início da próxima.\n\n## 9. Investimento e premissas\n- Pacote ${activePackage.label}: ${money.format(basePrice)}\n${additionalModules.length ? `- Adicionais: ${money.format(additionalModules.reduce((sum, item) => sum + item.price, 0))}\n` : ""}- Investimento estimado: ${money.format(total)}\n- Demandas fora do escopo aprovado serão avaliadas como adicionais.\n\n## 10. Stack recomendada\n- Next.js + TypeScript\n- PostgreSQL / Supabase\n- PWA responsivo para tablet\n- Design system definido pelo cliente\n\n## 11. Plano de execução\n1. Validar fluxos, regras de negócio e critérios de aceite.\n2. Criar protótipo das telas e obter aprovação.\n3. Implementar por módulos, com validação a cada etapa.\n4. Realizar homologação, ajustes finais e entrega.`;
    const aiBuildPrompt = `Você é uma pessoa engenheira de software sênior e especialista em produto. Transforme o SDD abaixo em uma aplicação pronta para produção.\n\nRegras de trabalho:\n1. Leia o documento inteiro e identifique lacunas; não invente regras de negócio. Liste dúvidas objetivas antes de implementar o que estiver indefinido.\n2. Proponha a arquitetura, modelo de dados, telas, permissões e plano de entregas por etapas.\n3. Use TypeScript, uma experiência responsiva para ${platformLabel} e mantenha o design consistente e refinado.\n4. Implemente primeiro o núcleo que atende os critérios de aceite. Depois avance módulo a módulo.\n5. Ao final de cada etapa, informe o que foi entregue, como validar e o que ficou pendente.\n\n--- INÍCIO DO SDD ---\n\n${sddText}\n\n--- FIM DO SDD ---`;
    const developmentPackage = { schemaVersion: 1, exportedAt: new Date().toISOString(), project: { id: savedProjectId, clientName, contactName, email, phone, name: projectName, status: projectStatus, package: activePackage.label, platform: platformLabel, estimatedWeeks: Number(estimatedWeeks), estimatedValue: total }, discovery, modules: selectedModules.map((item, index) => ({ order: index + 1, id: item.id, name: item.title, description: item.description, included: index < activePackage.includedModules, options: details[item.id] || [] })), sdd: sddText, aiBuildPrompt };
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
    useEffect(() => {
        setSelected((current) => current.filter((moduleId) => moduleId !== "security"));
        setDetails((current) => {
            if (!current.security) return current;
            const { security: _security, ...remainingDetails } = current;
            return remainingDetails;
        });
    }, []);
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
    function startNewMeeting(keepPackage = false) {
        const selectedPackage = packageType;
        window.localStorage.removeItem("sdd-studio-draft");
        setSelected([]);
        setDetails({});
        setClientName("");
        setContactName("");
        setEmail("");
        setPhone("");
        setProjectName("");
        setPlatform("web_tablet");
        setPackageType(keepPackage ? selectedPackage : "professional");
        setProjectStatus("draft");
        setEstimatedWeeks("4");
        setNotes("");
        setDiscovery(emptyDiscovery);
        setSavedProjectId(null);
        setDocuments([]);
        setNotice("");
        setScreen("meeting");
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
    function downloadDevelopmentPackage() { const blob = new Blob([JSON.stringify(developmentPackage, null, 2)], { type: "application/json;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Projeto-desenvolvimento-${clientName.replace(/[^a-z0-9]/gi, "-") || "cliente"}.json`; link.click(); URL.revokeObjectURL(link.href); }
    function printDocument() { window.print(); }
    async function generateSdd() { await saveProject(true); setShowSdd(true); }
    const header = <header className="topbar">
<a className="brand" href="#" onClick={(event) => { event.preventDefault(); setScreen("catalog"); }}>
<span>SD</span>
<strong>SDD Studio</strong>
</a>
<nav>
<button className={screen === "projects" ? "active" : ""} onClick={() => { setScreen("projects"); loadProjects(); }}>Projetos</button>
<button className={screen === "meeting" ? "active" : ""} onClick={() => startNewMeeting()}>Nova reunião</button>
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
<button className="new-project" onClick={() => startNewMeeting(true)}>Usar em uma reunião</button>
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
<div className="comparison-table" role="table" aria-label="Comparativo de pacotes">
<div className="comparison-row comparison-labels" role="row"><span role="columnheader">ENTREGA</span><strong role="columnheader">ESSENCIAL</strong><strong role="columnheader">PROFISSIONAL</strong><strong role="columnheader">PREMIUM</strong></div>
{[["Investimento base", "R$ 1.200", "R$ 3.000", "R$ 5.000"], ["Para quem", "MVP de um processo", "Operação em crescimento", "Gestão completa e estratégica"], ["Telas e fluxos", "Até 3", "Até 8", "Até 15"], ["Módulos", "2 incluídos · máximo 3", "4 incluídos · máximo 6", "8 incluídos · extras sem limite"], ["Segurança padrão", "Incluída", "Incluída", "Incluída"], ["Usuários", "Até 3", "Até 15", "Até 50"], ["Perfis de acesso", "1 perfil", "Até 3 perfis", "Até 5 perfis"], ["Integrações", "Não incluídas", "Até 2 integrações", "Até 4 integrações"], ["Dados e relatórios", "Listagens essenciais", "Dashboard + 3 relatórios", "Dashboard executivo + relatórios estratégicos"], ["Ajustes", "1 ciclo", "2 ciclos", "Validação por etapas"], ["Implantação", "Orientação de uso", "Treinamento da equipe", "Treinamento ampliado + entrega assistida"], ["Prazo de referência", "Até 2 semanas", "4 a 6 semanas", "6 a 10 semanas"]].map((row) => <div className="comparison-row" role="row" key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong><strong>{row[2]}</strong><strong>{row[3]}</strong></div>)}
</div>
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
<button className="new-project" onClick={() => startNewMeeting()}>+ Nova reunião</button>
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
</div><div className="project-controls">
<input aria-label="Buscar projeto" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Buscar cliente ou projeto..."/>
<div className="project-filters" aria-label="Filtrar projetos por status">
{[["all", "Todos"], ["draft", "Descoberta"], ["proposal", "Propostas"], ["approved", "Aprovados"], ["preparation", "Preparação"], ["development", "Em desenvolvimento"], ["completed", "Concluídos"]].map(([value, label]) => <button type="button" key={value} className={projectFilter === value ? "active" : ""} onClick={() => setProjectFilter(value)}>{label}</button>)}
</div>
</div>{filteredProjects.length ? filteredProjects.map((project) => <button className="project-row" key={project.id} onClick={() => openProject(project.id)}>
<span className="project-avatar">{project.clientName[0]}</span>
<span className="project-name">
<strong>{project.clientName}</strong>
<small>{project.name}</small>
</span>
<span className={`status status-${project.status}`}>{({ draft: "Descoberta", proposal: "Proposta", approved: "Aprovado", preparation: "Preparação", development: "Em desenvolvimento", completed: "Concluído" } as Record<string, string>)[project.status] || project.status}</span>
<span className="project-date">{new Date(project.updatedAt).toLocaleDateString("pt-BR")}</span>
<strong className="project-value">{money.format(Number(project.estimatedValue))}</strong>
<span className="row-arrow">→</span>
</button>) : <div className="empty-state">{projects.length ? "Nenhum projeto encontrado com esses filtros." : <>Nenhum projeto salvo ainda. Crie uma reunião e toque em <strong>Salvar rascunho</strong>.</>}</div>}</section>{notice && <p className="notice">{notice}</p>}</main>;
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
<label>Status comercial<select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option value="draft">Em descoberta</option><option value="proposal">Proposta enviada</option><option value="approved">Aprovado</option><option value="preparation">Preparação de desenvolvimento</option><option value="development">Em desenvolvimento</option><option value="completed">Concluído</option></select>
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
<label>Quantidade estimada de usuários<select value={discovery.userCount} onChange={(event) => setDiscovery((current) => ({ ...current, userCount: event.target.value }))}><option value="">Selecione</option><option value="1">1 usuário</option><option value="3">Até 3 usuários</option><option value="5">4 a 5 usuários</option><option value="15">6 a 15 usuários</option><option value="30">16 a 30 usuários</option><option value="50">31 a 50 usuários</option><option value="51">Mais de 50 usuários</option></select>
</label>
<label>Perfis de acesso<select value={discovery.profileCount} onChange={(event) => setDiscovery((current) => ({ ...current, profileCount: event.target.value }))}><option value="">Selecione</option><option value="1">1 perfil</option><option value="2">2 perfis</option><option value="3">3 perfis</option><option value="4">4 perfis</option><option value="5">5 perfis</option><option value="6">Mais de 5 perfis</option></select>
</label>
<label>Telas ou fluxos estimados<select value={discovery.screenCount} onChange={(event) => setDiscovery((current) => ({ ...current, screenCount: event.target.value }))}><option value="">Selecione</option><option value="3">Até 3</option><option value="5">4 a 5</option><option value="8">6 a 8</option><option value="12">9 a 12</option><option value="15">13 a 15</option><option value="16">Mais de 15</option></select>
</label>
<label>Maior dor atual<input value={discovery.pain} onChange={(event) => setDiscovery((current) => ({ ...current, pain: event.target.value }))} placeholder="Ex.: informações espalhadas em WhatsApp"/>
</label>
<label>Integrações necessárias<input value={discovery.integrations} onChange={(event) => setDiscovery((current) => ({ ...current, integrations: event.target.value }))} placeholder="Ex.: WhatsApp, ERP, pagamentos"/>
</label>
<label>Quantidade de integrações<select value={discovery.integrationCount} onChange={(event) => setDiscovery((current) => ({ ...current, integrationCount: event.target.value }))}><option value="">Selecione</option><option value="0">Nenhuma</option><option value="1">1 integração</option><option value="2">2 integrações</option><option value="3">3 integrações</option><option value="4">4 integrações</option><option value="5">Mais de 4 integrações</option></select>
</label>
<label className="discovery-wide">Como saberemos que deu certo?<input value={discovery.successMetric} onChange={(event) => setDiscovery((current) => ({ ...current, successMetric: event.target.value }))} placeholder="Ex.: orçamento emitido em menos de 5 minutos"/>
</label>
</div>
{userLimitWarning && <p className="package-fit-warning"><b>Pacote incompatível:</b> {userLimitWarning}</p>}
{integrationLimitWarning && <p className="package-fit-warning"><b>Pacote incompatível:</b> {integrationLimitWarning}</p>}
{profileLimitWarning && <p className="package-fit-warning"><b>Pacote incompatível:</b> {profileLimitWarning}</p>}
{screenLimitWarning && <p className="package-fit-warning"><b>Pacote incompatível:</b> {screenLimitWarning}</p>}
{hasCommercialSizing && <div className={`package-recommendation ${recommendedPackageType === packageType ? "matched" : ""}`}><div><p className="eyebrow">RECOMENDAÇÃO COMERCIAL</p><strong>{recommendedPackage ? `Pacote ${recommendedPackage.label}` : "Proposta personalizada"}</strong><span>{recommendedPackage ? recommendedPackageType === packageType ? "O pacote atual comporta a demanda informada." : "Calculado a partir de usuários, perfis, integrações, telas e módulos." : "A demanda ultrapassa os limites comerciais do Premium."}</span></div>{recommendedPackageType && recommendedPackageType !== packageType && <button type="button" onClick={() => setPackageType(recommendedPackageType)}>Aplicar recomendado</button>}</div>}
<div className="section-title solution-title">
<div>
<p className="eyebrow">02 — SOLUÇÃO</p>
<h2>O que este sistema precisa resolver?</h2>
</div>
<p>Selecione os módulos que fazem sentido para esta demanda.</p>
</div>
<div className="module-legend"><span className="included-dot">Incluído no pacote</span><span className="additional-dot">Adicional cobrado à parte</span></div><div className="security-standard"><span>✓</span><div><strong>{securityBaseline.title}</strong><small>{securityBaseline.description}</small></div><em>Inclusa em todos os pacotes</em></div><div className="module-grid">{selectableModules.map((item) => { const selectedPosition = selected.indexOf(item.id); const moduleState = selectedPosition < 0 ? "" : selectedPosition < activePackage.includedModules ? "selected included" : "selected additional"; return <button key={item.id} className={`module ${moduleState}`} onClick={() => toggleModule(item.id)}>
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
<div className={`readiness-card ${pendingReadiness ? "has-pending" : "complete"}`}>
<div><p className="eyebrow">PRONTIDÃO DO SDD</p><strong>{pendingReadiness ? `${pendingReadiness} ponto(s) para revisar` : "Pronto para gerar"}</strong></div>
<div className="readiness-list">{readinessItems.map((item) => <span key={item.label} className={item.complete ? "done" : "pending"}><b>{item.complete ? "✓" : "•"}</b>{item.label}</span>)}</div>
</div>
{savedProjectId && <div className="document-history"><p className="eyebrow">HISTÓRICO DE SDD <b>{documents.length}</b></p>{documents.length ? documents.map((document) => <button key={document.id} onClick={() => navigator.clipboard?.writeText(document.content).then(() => setNotice(`SDD versão ${document.version} copiado para a área de transferência.`))}><span>SDD · V{String(document.version).padStart(2, "0")}</span><small>{new Date(document.createdAt).toLocaleDateString("pt-BR")}</small></button>) : <small>Nenhum SDD gerado ainda.</small>}</div>}
<button className="primary-button" onClick={generateSdd} disabled={saving}>{saving ? "Salvando..." : pendingReadiness ? `Gerar SDD · ${pendingReadiness} revisão(ões)` : "Gerar SDD completo"} <span>→</span>
</button><button className="proposal-button" onClick={() => setShowProposal(true)}>Gerar proposta comercial</button>{savedProjectId && projectStatus === "preparation" && <div className="development-handoff"><p className="eyebrow">PACOTE PARA DESENVOLVIMENTO</p><span>Exporte o briefing estruturado para importar no futuro ambiente de design e desenvolvimento.</span><button onClick={downloadDevelopmentPackage}>Baixar pacote .JSON</button><button onClick={() => navigator.clipboard?.writeText(JSON.stringify(developmentPackage, null, 2)).then(() => setNotice("Pacote de desenvolvimento copiado."))}>Copiar pacote</button></div>}{savedProjectId && projectStatus === "completed" && <button className="new-meeting-button" onClick={() => startNewMeeting()}>Concluir e iniciar nova reunião</button>}{savedProjectId && <button className="delete-project" onClick={deleteProject} disabled={saving}>Excluir este projeto</button>}{notice && <p className="notice">{notice}</p>}</aside>
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
<section className="sdd-diagnosis">
<p className="eyebrow">02 — DIAGNÓSTICO</p>
<div><span>Objetivo</span><strong>{discovery.objective || "A definir"}</strong></div>
<div><span>Usuários</span><strong>{discovery.users || "A definir"}</strong></div>
<div><span>Quantidade</span><strong>{userCountDisplay}</strong></div>
<div><span>Dor atual</span><strong>{discovery.pain || "A definir"}</strong></div>
<div><span>Sucesso</span><strong>{discovery.successMetric || "A definir"}</strong></div>
</section>
<section className="sdd-modules">
<p className="eyebrow">03 — MÓDULOS APROVADOS</p>{selectedModules.map((item, index) => <div key={item.id}>
<b>0{index + 1}</b>
<span>
<strong>{item.title}</strong>
<small>{item.description}{details[item.id]?.length ? ` · ${details[item.id].join(", ")}` : ""}</small>
</span>
<em>{money.format(item.price)}</em>
</div>)}</section>
<section className="two-column">
<div>
<p className="eyebrow">04 — CRITÉRIOS DE ACEITE</p>
<ul>
<li>Fluxos validados com o cliente</li>
<li>Uso responsivo no tablet</li>
<li>Aprovação por etapa</li>
</ul>
</div>
<div>
<p className="eyebrow">05 — PLANO DE EXECUÇÃO</p>
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
<button className="ai-prompt" onClick={() => navigator.clipboard?.writeText(aiBuildPrompt).then(() => setNotice("Prompt de implementação copiado. Cole-o em uma nova conversa com a IA."))}>Copiar prompt de implementação</button>
<button className="print-document" onClick={printDocument}>Salvar em PDF</button>
<button className="download" onClick={downloadSdd}>Baixar .MD</button>
</div>
</footer>
</div>
</div>}{showProposal && <div className="sdd-modal" role="dialog" aria-modal="true" aria-label="Proposta comercial"><div className="proposal-sheet"><header><div><p className="eyebrow">SDD STUDIO · PROPOSTA COMERCIAL</p><h2>{clientName}<span>.</span></h2></div><button className="close" onClick={() => setShowProposal(false)} aria-label="Fechar">×</button></header><div className="proposal-intro"><p>PROPOSTA PARA</p><strong>{projectName}</strong><span>{platformLabel} · prazo estimado de {estimatedWeeks} semanas</span></div><section><p className="eyebrow">ESCOPO DA SOLUÇÃO</p><h3>Uma experiência profissional feita para a operação.</h3><p>{packageOffer}</p></section><section className="sdd-modules"><p className="eyebrow">MÓDULOS SELECIONADOS</p>{selectedModules.map((item, index) => <div key={item.id}><b>0{index + 1}</b><span><strong>{item.title}</strong><small>{index < activePackage.includedModules ? "Incluído no pacote" : "Módulo adicional"}</small></span><em>{index < activePackage.includedModules ? "Incluído" : money.format(item.price)}</em></div>)}</section><section className="proposal-value"><span>INVESTIMENTO TOTAL</span><strong>{money.format(total)}</strong><small>Proposta válida por 7 dias.</small></section><footer><div><span>PRÓXIMO PASSO</span><strong>Aprovar o escopo e iniciar o cronograma.</strong></div><div className="sdd-actions"><button onClick={() => navigator.clipboard?.writeText(proposalText).then(() => setNotice("Proposta copiada para envio."))}>Copiar proposta</button><button className="print-document" onClick={printDocument}>Salvar em PDF</button><button className="download" onClick={downloadProposal}>Baixar .MD</button></div></footer></div></div>}</main>;
}
