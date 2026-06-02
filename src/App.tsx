import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Categoria = {
  id: number;
  nome: string;
  descricao: string;
  tipo: string;
  ativa: boolean;
  padraoSistema: boolean;
};

type Banco = {
  id: number;
  nomeBanco: string;
  tipoConta: string;
  descricao: string;
  ativo: boolean;
};

type SaldoConta = {
  id: number;
  descricao: string;
  bancoId: number;
  valor: number;
  tipoDestino: 'saldo_em_conta' | 'investimento';
  podeUsarParaCobrirGastos: boolean;
  dataMovimentacao: string;
};

type Investimento = {
  id: number;
  descricao: string;
  bancoId: number;
  tipoInvestimento: string;
  valorAtual: number;
  valorMeta: number;
  dataMeta: string;
  observacao: string;
  podeUsarParaGastos: boolean;
};

type DespesaDiaria = {
  id: number;
  descricao: string;
  valor: number;
  categoriaId: number;
  dataDespesa: string;
  mesReferencia: number;
  anoReferencia: number;
  formaPagamento: string;
  bancoId: number | null;
  observacao: string;
};

type DespesaFixa = {
  id: number;
  descricao: string;
  valor: number;
  categoriaId: number;
  quantidadeMeses: string;
  dataInicio: string;
  dataFim: string;
  semDataFinal: boolean;
  status: 'ativa' | 'finalizada' | 'pausada';
  editavel: boolean;
  observacao: string;
};

type Emprestimo = {
  id: number;
  descricao: string;
  bancoId: number;
  categoriaId: number;
  valorParcela: number;
  quantidadeTotalParcelas: number;
  parcelasJaPagas: number;
  parcelasRestantes: number;
  dataInicio: string;
  dataFimPrevista: string;
  status: 'ativo' | 'finalizado' | 'pausado';
  incluiEmDespesaFixa: boolean;
};

type ConfigFinanceira = {
  nomeUsuario: string;
  salarioMensal: number;
  diaPagamento: number;
  dataProximoPagamento: string;
  moeda: string;
  senhaAcesso: string;
  mostrarSaldoDisponivel: boolean;
  mostrarDespesasDiarias: boolean;
  mostrarDespesasFixas: boolean;
  mostrarSaldoConta: boolean;
  mostrarInvestimentos: boolean;
};

type AppData = {
  config: ConfigFinanceira;
  categorias: Categoria[];
  bancos: Banco[];
  saldosConta: SaldoConta[];
  investimentos: Investimento[];
  despesasDiarias: DespesaDiaria[];
  despesasFixas: DespesaFixa[];
  despesasPagas: {
  id: number;
  tipo: "fixa" | "cartao" | "emprestimo";
  referenciaId: number;
  descricao: string;
  mesAno: string;
  valor: number;
  dataPagamento: string;
}[];
  cartaoCredito: {
    id: number;
    mesAno: string;
    valor: number;
  }[];
  emprestimosMensais: {
    id: number;
    mesAno: string;
    valor: number;
  }[];
  emprestimos: Emprestimo[];
};

type Screen =
  | 'home'
  | 'daily'
  | 'expenses'
  | 'fixed'
  | 'settings'
  | 'salary'
  | 'banks'
  | 'categories'
  | 'balance'
  | 'investments'
  | 'loans'
  | 'projection';

const todayISO = () => new Date().toISOString().slice(0, 10);

const money = (value: number) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const hiddenMoney = 'R$ ••••••';

const initialData: AppData = {
  config: {
    nomeUsuario: 'Enzo Chagas',
    salarioMensal: 2300,
    diaPagamento: 5,
    dataProximoPagamento: '2026-07-05',
    moeda: 'BRL',
    senhaAcesso: '1234',
    mostrarSaldoDisponivel: false,
    mostrarDespesasDiarias: false,
    mostrarDespesasFixas: false,
    mostrarSaldoConta: false,
    mostrarInvestimentos: false,
  },

  categorias: [
    {
      id: 1,
      nome: "Lazer",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 2,
      nome: "Academia",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 3,
      nome: "Moradia",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 4,
      nome: "Alimentação",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 5,
      nome: "Empréstimo",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 6,
      nome: "Celular",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 7,
      nome: "Outras despesas",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 8,
      nome: "Transporte",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 9,
      nome: "Fatura cartão de Crédito",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 10,
      nome: "Educação",
      descricao: "",
      tipo: "geral",
      ativa: true,
      padraoSistema: true,
    },
  ],
  bancos: [
    {
      id: 1,
      nomeBanco: "Nubank Saldo",
      tipoConta: "Conta corrente",
      descricao: "",
      ativo: true,
    },
    {
      id: 2,
      nomeBanco: "Nubank investimento",
      tipoConta: "Investimento",
      descricao: "",
      ativo: true,
    },
    {
      id: 3,
      nomeBanco: "Itau Salario",
      tipoConta: "Conta corrente",
      descricao: "",
      ativo: true,
    },
  ],
  
  saldosConta: [
    {
      id: 1,
      descricao: "Nubank Saldo",
      bancoId: 1,
      valor: 3623.76,
      tipoDestino: "saldo_em_conta",
      podeUsarParaCobrirGastos: true,
      dataMovimentacao: todayISO(),
    },
  ],
  
  investimentos: [
    {
      id: 1,
      descricao: "Nubank investimento",
      bancoId: 2,
      tipoInvestimento: "Investimento",
      valorAtual: 1001.41,
      valorMeta: 0,
      dataMeta: "",
      observacao: "",
      podeUsarParaGastos: false,
    },
  ],
  
  despesasDiarias: [],
  
  despesasFixas: [
    {
      id: 1,
      descricao: "Faculdade",
      valor: 700,
      categoriaId: 10,
      quantidadeMeses: "sem prazo",
      dataInicio: todayISO(),
      dataFim: "",
      semDataFinal: true,
      status: "ativa",
      editavel: true,
      observacao: "",
    },
    {
      id: 2,
      descricao: "Gympass",
      valor: 90,
      categoriaId: 2,
      quantidadeMeses: "sem prazo",
      dataInicio: todayISO(),
      dataFim: "",
      semDataFinal: true,
      status: "ativa",
      editavel: true,
      observacao: "",
    },
    {
      id: 3,
      descricao: "Plano TIM",
      valor: 85,
      categoriaId: 6,
      quantidadeMeses: "sem prazo",
      dataInicio: todayISO(),
      dataFim: "",
      semDataFinal: true,
      status: "ativa",
      editavel: true,
      observacao: "",
    },
    {
      id: 4,
      descricao: "Aluguel e Dízimo",
      valor: 900,
      categoriaId: 3,
      quantidadeMeses: "sem prazo",
      dataInicio: todayISO(),
      dataFim: "",
      semDataFinal: true,
      status: "ativa",
      editavel: true,
      observacao: "",
    },
  ],
  
  despesasPagas: [],
  
  cartaoCredito: [
    {
      id: 1,
      mesAno: "07/2026",
      valor: 1401.11,
    },
    {
      id: 2,
      mesAno: "08/2026",
      valor: 1152.0,
    },
    {
      id: 3,
      mesAno: "09/2026",
      valor: 912.73,
    },
    {
      id: 4,
      mesAno: "10/2026",
      valor: 867.42,
    },
    {
      id: 5,
      mesAno: "11/2026",
      valor: 371.86,
    },
    {
      id: 6,
      mesAno: "12/2026",
      valor: 66.66,
    },
    {
      id: 7,
      mesAno: "01/2027",
      valor: 66.66,
    },
  ],
  
  emprestimosMensais: [
    {
      id: 1,
      mesAno: "07/2026",
      valor: 389.67,
    },
    {
      id: 2,
      mesAno: "08/2026",
      valor: 216.65,
    },
    {
      id: 3,
      mesAno: "09/2026",
      valor: 96.12,
    },
    {
      id: 4,
      mesAno: "10/2026",
      valor: 96.12,
    },
    {
      id: 5,
      mesAno: "11/2026",
      valor: 96.12,
    },
    {
      id: 6,
      mesAno: "12/2026",
      valor: 96.12,
    },
    {
      id: 7,
      mesAno: "01/2027",
      valor: 96.12,
    },
    {
      id: 8,
      mesAno: "02/2027",
      valor: 96.12,
    },
    {
      id: 9,
      mesAno: "03/2027",
      valor: 96.12,
    },
    {
      id: 10,
      mesAno: "04/2027",
      valor: 96.12,
    },
  ],
  
  emprestimos: [],
  };
  function getMesAnoReferencia() {
    const hoje = new Date();
  
    return hoje.toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric",
    });
  }
  function getPaymentDate(dateString: string) {
  if (!dateString) return '--/--/----';

  const paymentDate = new Date(dateString + 'T00:00:00');

  return paymentDate.toLocaleDateString('pt-BR');
}

function getDaysToPayment(dateString: string) {
  if (!dateString) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const paymentDate = new Date(dateString + "T00:00:00");

  const diff = paymentDate.getTime() - today.getTime();

  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
}
function Value({
  value,
  visible,
  negative = false,
}: {
  value: number;
  visible: boolean;
  negative?: boolean;
}) {
  return (
    <span className={negative ? "red" : "green"}>
      {visible ? money(value) : hiddenMoney}
    </span>
  );
}
function EyeButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button className="eye" onClick={onClick} type="button">
      {visible ? '👁' : '🙈'}
    </button>
  );
}

function getCategoryName(data: AppData, id: number) {
  return (
    data.categorias.find((item) => item.id === Number(id))?.nome ||
    'Sem categoria'
  );
}

function getBankName(data: AppData, id: number) {
  return (
    data.bancos.find((item) => item.id === Number(id))?.nomeBanco || 'Sem banco'
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem('enzo-financas-unlocked') === 'true';
  });

  const [screen, setScreen] = useState<Screen>('home');

  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('enzo-financas-mvp');
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('enzo-financas-mvp', JSON.stringify(data));
  }, [data]);

  const totals = useMemo(() => {
    const despesasDiariasMes = data.despesasDiarias.reduce(
      (sum, item) => sum + Number(item.valor || 0),
      0
    );
  
    const mesAnoReferencia = getMesAnoReferencia();
  
    function despesaFixaFoiPaga(id: number) {
      return (data.despesasPagas || []).some(
        (item) =>
          item.tipo === "fixa" &&
          item.referenciaId === id &&
          item.mesAno === mesAnoReferencia
      );
    }
  
    const despesasFixasTotal = data.despesasFixas
      .filter((item) => item.status === "ativa")
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  
    const despesasFixasAtivas = data.despesasFixas
      .filter(
        (item) =>
          item.status === "ativa" &&
          !despesaFixaFoiPaga(item.id)
      )
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  
    const cartaoCreditoMes = (data.cartaoCredito || [])
      .filter((item) => item.mesAno === mesAnoReferencia)
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  
    const emprestimosMensaisMes = (data.emprestimosMensais || [])
      .filter((item) => item.mesAno === mesAnoReferencia)
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  
    const emprestimosAtivos = data.emprestimos
      .filter(
        (item) =>
          item.status === "ativo" &&
          item.incluiEmDespesaFixa &&
          Number(item.parcelasRestantes || 0) > 0
      )
      .reduce((sum, item) => sum + Number(item.valorParcela || 0), 0);
  
    const saldoConta = data.saldosConta
      .filter((item) => item.tipoDestino === "saldo_em_conta")
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  
    const investimentos = data.investimentos.reduce(
      (sum, item) => sum + Number(item.valorAtual || 0),
      0
    );
  
    const saldoDisponivel =
      Number(data.config.salarioMensal || 0) -
      despesasFixasTotal -
      cartaoCreditoMes -
      emprestimosMensaisMes -
      emprestimosAtivos -
      despesasDiariasMes;
  
    return {
      despesasDiariasMes,
      despesasFixasAtivas,
      despesasFixasTotal,
      cartaoCreditoMes,
      emprestimosMensaisMes,
      emprestimosAtivos,
      saldoConta,
      investimentos,
      saldoDisponivel,
    };
  }, [data]);
  function updateConfig(field: keyof ConfigFinanceira, value: any) {
    setData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  }

  if (!unlocked) {
    return (
      <PasswordScreen
        savedPassword={data.config.senhaAcesso || '1234'}
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          data={data}
          totals={totals}
          updateConfig={updateConfig}
          setScreen={setScreen}
        />
      )}

      {screen === 'daily' && (
        <DailyExpenseScreen
          data={data}
          setData={setData}
          setScreen={setScreen}
        />
      )}

{screen === "expenses" && (
  <DailyHistoryScreen
    data={data}
    totals={totals}
    setData={setData}
    setScreen={setScreen}
  />
      )}

      {screen === 'fixed' && (
        <FixedExpensesScreen
          data={data}
          setData={setData}
          totals={totals}
          setScreen={setScreen}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen data={data} setData={setData} setScreen={setScreen} />
      )}

      {screen === 'salary' && (
        <SalaryScreen data={data} setData={setData} setScreen={setScreen} />
      )}
      {screen === 'categories' && (
        <CategoryScreen data={data} setData={setData} setScreen={setScreen} />
      )}

      {screen === 'banks' && (
        <BankScreen data={data} setData={setData} setScreen={setScreen} />
      )}

      {screen === 'balance' && (
        <BalanceScreen data={data} setData={setData} setScreen={setScreen} />
      )}

      {screen === 'investments' && (
        <InvestmentsScreen
          data={data}
          setData={setData}
          setScreen={setScreen}
        />
      )}

      {screen === 'loans' && (
        <LoansScreen data={data} setData={setData} setScreen={setScreen} />
      )}

      {screen === 'projection' && (
        <ProjectionScreen data={data} setScreen={setScreen} />
      )}

      <BottomNav screen={screen} setScreen={setScreen} />
    </>
  );
}

function PasswordScreen({
  savedPassword,
  onUnlock,
}: {
  savedPassword: string;
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function enter() {
    if (password === savedPassword) {
      sessionStorage.setItem('enzo-financas-unlocked', 'true');
      onUnlock();
      return;
    }

    setError('Senha incorreta.');
  }

  return (
    <div className="password-screen">
      <div className="password-box">
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 42 }}>🔒</div>
            <p className="label">Acesso protegido</p>
            <h1 className="header-title">Enzo Chagas</h1>
          </div>

          <div className="input-group">
            <label>Digite a senha</label>
            <input
              className="input"
              type="password"
              placeholder="••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') enter();
              }}
            />
          </div>

          {error && <p className="red">{error}</p>}

          <button className="save-button" onClick={enter}>
            Entrar
          </button>
        </div>

        <p className="small-info" style={{ textAlign: 'center' }}>
          Proteção simples para uso pessoal.
        </p>
      </div>
    </div>
  );
}
function Header({
  title,
  setScreen,
}: {
  title: string;
  setScreen?: (screen: Screen) => void;
}) {
  return (
    <div className="header">
      {setScreen ? (
        <button className="icon-button" onClick={() => setScreen('home')}>
          ←
        </button>
      ) : (
        <div style={{ width: 40 }} />
      )}

      <div className="header-title">{title}</div>

      <div style={{ width: 40 }} />
    </div>
  );
}
function HomeScreen({
  data,
  totals,
  updateConfig,
  setScreen,
}: {
  data: AppData;
  totals: any;
  updateConfig: (field: keyof ConfigFinanceira, value: any) => void;
  setScreen: (screen: Screen) => void;
}) {
  const saldoNegativo = totals.saldoDisponivel < 0;

  return (
    <div className="app">
      <Header title={data.config.nomeUsuario} />

      <div className="card">
        <div className="summary-top">
          <div>
            <div className="label">Saldo disponível</div>
            <div className="label">até o pagamento</div>
          </div>

          <EyeButton
            visible={data.config.mostrarSaldoDisponivel}
            onClick={() =>
              updateConfig(
                'mostrarSaldoDisponivel',
                !data.config.mostrarSaldoDisponivel
              )
            }
          />
        </div>

        <div className={`balance ${saldoNegativo ? 'negative' : ''}`}>
          <Value
            value={totals.saldoDisponivel}
            visible={data.config.mostrarSaldoDisponivel}
            negative={saldoNegativo}
          />
        </div>

        <div className="grid">
          <div className="card-dark">
            <div className="muted">Próximo pagamento</div>
            <strong>
              {getPaymentDate(data.config.dataProximoPagamento)}
            </strong>{' '}
          </div>

          <div className="card-dark">
            <div className="muted">Faltam</div>
            <strong className="green">
              {getDaysToPayment(data.config.dataProximoPagamento)} dias
            </strong>
          </div>
        </div>
      </div>

      <button className="main-button" onClick={() => setScreen('daily')}>
        + Incluir despesa diária
      </button>

      <h3 className="label" style={{ marginBottom: 14 }}>
        Visão geral
      </h3>

      <div className="grid">
        <SummaryCard
          title="Despesas diárias"
          value={totals.despesasDiariasMes}
          visible={data.config.mostrarDespesasDiarias}
          negative
          onClick={() => setScreen('expenses')}
          onToggle={() =>
            updateConfig(
              'mostrarDespesasDiarias',
              !data.config.mostrarDespesasDiarias
            )
          }
        />

        <SummaryCard
          title="Despesas fixas"
          value={
            totals.despesasFixasAtivas +
            totals.cartaoCreditoMes +
            totals.emprestimosMensaisMes +
            totals.emprestimosAtivos
          }
          visible={data.config.mostrarDespesasFixas}
          negative
          onClick={() => setScreen('fixed')}
          onToggle={() =>
            updateConfig(
              'mostrarDespesasFixas',
              !data.config.mostrarDespesasFixas
            )
          }
        />

        <SummaryCard
          title="Saldo em conta"
          value={totals.saldoConta}
          visible={data.config.mostrarSaldoConta}
          onClick={() => setScreen("balance")}
          onToggle={() =>
            updateConfig('mostrarSaldoConta', !data.config.mostrarSaldoConta)
          }
        />

        <SummaryCard
          title="Investimentos"
          value={totals.investimentos}
          visible={data.config.mostrarInvestimentos}
          onClick={() => setScreen("investments")}
          onToggle={() =>
            updateConfig(
              'mostrarInvestimentos',
              !data.config.mostrarInvestimentos
            )
          }
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  visible,
  negative = false,
  onToggle,
  onClick,
}: {
  title: string;
  value: number;
  visible: boolean;
  negative?: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  return (
    <div className="summary-card" onClick={onClick}>
      <div className="summary-top">
        <div>
          <div className="label">{title}</div>
          <div className="muted">Este mês</div>
        </div>

        <button
          className="eye"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          type="button"
        >
          {visible ? '👁' : '🙈'}
        </button>
      </div>

      <div className={`summary-value ${negative ? 'red' : 'green'}`}>
        {visible ? money(value) : hiddenMoney}
      </div>
    </div>
  );
}
function DailyExpenseScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [form, setForm] = useState({
    categoriaId: data.categorias[0]?.id || 1,
    valor: '',
    descricao: '',
    dataDespesa: todayISO(),
  });

  function saveExpense() {
    if (!form.valor || Number(form.valor) <= 0) {
      alert('Informe o valor da despesa.');
      return;
    }

    const date = new Date(form.dataDespesa);

    const newExpense: DespesaDiaria = {
      id: Date.now(),
      descricao: form.descricao || 'Despesa diária',
      valor: Number(form.valor),
      categoriaId: Number(form.categoriaId),
      dataDespesa: form.dataDespesa,
      mesReferencia: date.getMonth() + 1,
      anoReferencia: date.getFullYear(),
      formaPagamento: '',
      bancoId: null,
      observacao: '',
    };

    setData((prev) => ({
      ...prev,
      despesasDiarias: [newExpense, ...prev.despesasDiarias],
    }));

    setScreen('home');
  }

  return (
    <div className="app">
      <Header title="Valor da despesa" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Categoria</label>
          <select
            className="select"
            value={form.categoriaId}
            onChange={(event) =>
              setForm({ ...form, categoriaId: Number(event.target.value) })
            }
          >
            {data.categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Valor</label>
          <input
            className="input"
            type="number"
            placeholder="0,00"
            value={form.valor}
            onChange={(event) =>
              setForm({ ...form, valor: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Data</label>
          <input
            className="input"
            type="date"
            value={form.dataDespesa}
            onChange={(event) =>
              setForm({ ...form, dataDespesa: event.target.value })
            }
          />
        </div>
      </div>

      <button className="main-button" onClick={saveExpense}>
        Salvar despesa
      </button>
    </div>
  );
}

function DailyHistoryScreen({
  data,
  totals,
  setData,
  setScreen,
}: {
  data: AppData;
  totals: any;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [editingDaily, setEditingDaily] = useState<DespesaDiaria | null>(null);

  function saveDailyEdit(form: DespesaDiaria) {
    setData((prev) => ({
      ...prev,
      despesasDiarias: prev.despesasDiarias.map((item) =>
        item.id === form.id ? form : item
      ),
    }));

    setEditingDaily(null);
  }

  if (editingDaily) {
    return (
      <DailyEditForm
        data={data}
        item={editingDaily}
        onCancel={() => setEditingDaily(null)}
        onSave={saveDailyEdit}
      />
    );
  }

  return (
    <div className="app">
      <Header title="Despesas diárias" setScreen={setScreen} />

      <div className="card">
        <div className="label">Total de despesas do mês</div>
        <div className="balance negative">
          {money(totals.despesasDiariasMes)}
        </div>
      </div>

      {data.despesasDiarias.length === 0 ? (
        <div className="card-dark">
          <p className="muted">Nenhuma despesa diária cadastrada ainda.</p>
        </div>
      ) : (
        data.despesasDiarias.map((despesa) => (
          <div className="list-item" key={despesa.id}>
            <div>
              <div className="list-title">{despesa.descricao}</div>
              <div className="list-subtitle">
                {getCategoryName(data, despesa.categoriaId)} •{" "}
                {new Date(despesa.dataDespesa).toLocaleDateString("pt-BR")}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong className="red">-{money(despesa.valor)}</strong>
              <br />
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => setEditingDaily(despesa)}
              >
                Editar
              </button>
            </div>
          </div>
        ))
      )}

      <button className="main-button" onClick={() => setScreen("daily")}>
        + Incluir despesa diária
      </button>
    </div>
  );
}
function DailyEditForm({
  data,
  item,
  onCancel,
  onSave,
}: {
  data: AppData;
  item: DespesaDiaria;
  onCancel: () => void;
  onSave: (form: DespesaDiaria) => void;
}) {
  const [form, setForm] = useState<DespesaDiaria>(item);

  function save() {
    const date = new Date(form.dataDespesa);

    onSave({
      ...form,
      valor: Number(form.valor || 0),
      categoriaId: Number(form.categoriaId),
      mesReferencia: date.getMonth() + 1,
      anoReferencia: date.getFullYear(),
    });
  }

  return (
    <div className="app">
      <div className="header">
        <button className="icon-button" onClick={onCancel}>
          ←
        </button>
        <div className="header-title">Editar despesa diária</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="card">
        <div className="input-group">
          <label>Categoria</label>
          <select
            className="select"
            value={form.categoriaId}
            onChange={(event) =>
              setForm({ ...form, categoriaId: Number(event.target.value) })
            }
          >
            {data.categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Valor</label>
          <input
            className="input"
            type="number"
            value={form.valor}
            onChange={(event) =>
              setForm({ ...form, valor: Number(event.target.value) })
            }
          />
        </div>

        <div className="input-group">
          <label>Descrição</label>
          <textarea
            className="textarea"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Data</label>
          <input
            className="input"
            type="date"
            value={form.dataDespesa}
            onChange={(event) =>
              setForm({ ...form, dataDespesa: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={save}>
        Salvar alteração
      </button>
    </div>
  );
}

function FixedExpensesScreen({
  data,
  setData,
  totals,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  totals: any;
  setScreen: (screen: Screen) => void;
}) {
  const [editing, setEditing] = useState<DespesaFixa | null>(null);
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState(
    getMesAnoReferencia()
  );

  const mesAnoReferencia = mesAnoSelecionado;

  const cartaoCreditoItem = (data.cartaoCredito || []).find(
    (item) => item.mesAno === mesAnoSelecionado
  );

  const emprestimoMensalItem = (data.emprestimosMensais || []).find(
    (item) => item.mesAno === mesAnoSelecionado
  );

  const cartaoCreditoSelecionado = cartaoCreditoItem
    ? Number(cartaoCreditoItem.valor || 0)
    : 0;

  const emprestimosMensaisSelecionado = emprestimoMensalItem
    ? Number(emprestimoMensalItem.valor || 0)
    : 0;

  function isDespesaPaga(
    tipo: "fixa" | "cartao" | "emprestimo",
    referenciaId: number
  ) {
    return (data.despesasPagas || []).some(
      (item) =>
        item.tipo === tipo &&
        item.referenciaId === referenciaId &&
        item.mesAno === mesAnoReferencia
    );
  }

  function marcarComoPago({
    tipo,
    referenciaId,
    descricao,
    valor,
  }: {
    tipo: "fixa" | "cartao" | "emprestimo";
    referenciaId: number;
    descricao: string;
    valor: number;
  }) {
    if (isDespesaPaga(tipo, referenciaId)) return;

    setData((prev) => ({
      ...prev,
      despesasPagas: [
        ...(prev.despesasPagas || []),
        {
          id: Date.now(),
          tipo,
          referenciaId,
          descricao,
          mesAno: mesAnoReferencia,
          valor,
          dataPagamento: todayISO(),
        },
      ],
    }));
  }

  function marcarComoNaoPago(
    tipo: "fixa" | "cartao" | "emprestimo",
    referenciaId: number
  ) {
    setData((prev) => ({
      ...prev,
      despesasPagas: (prev.despesasPagas || []).filter(
        (item) =>
          !(
            item.tipo === tipo &&
            item.referenciaId === referenciaId &&
            item.mesAno === mesAnoReferencia
          )
      ),
    }));
  }

  function editarCartaoCredito(id: number, valorAtual: number) {
    const novoValorTexto = window.prompt(
      "Novo valor da fatura do cartão:",
      String(valorAtual).replace(".", ",")
    );

    if (novoValorTexto === null) return;

    const novoValor = Number(novoValorTexto.replace(",", "."));
    if (Number.isNaN(novoValor)) return;

    setData((prev) => ({
      ...prev,
      cartaoCredito: (prev.cartaoCredito || []).map((item) =>
        item.id === id ? { ...item, valor: novoValor } : item
      ),
    }));
  }

  function editarEmprestimoMensal(id: number, valorAtual: number) {
    const novoValorTexto = window.prompt(
      "Novo valor do empréstimo:",
      String(valorAtual).replace(".", ",")
    );

    if (novoValorTexto === null) return;

    const novoValor = Number(novoValorTexto.replace(",", "."));
    if (Number.isNaN(novoValor)) return;

    setData((prev) => ({
      ...prev,
      emprestimosMensais: (prev.emprestimosMensais || []).map((item) =>
        item.id === id ? { ...item, valor: novoValor } : item
      ),
    }));
  }

  function saveFixedExpense(form: DespesaFixa) {
    setData((prev) => {
      const exists = prev.despesasFixas.some((item) => item.id === form.id);

      const updatedExpenses = exists
        ? prev.despesasFixas.map((item) => (item.id === form.id ? form : item))
        : [
            {
              ...form,
              id: Date.now(),
              status: "ativa" as const,
              editavel: true,
            },
            ...prev.despesasFixas,
          ];

      return {
        ...prev,
        despesasFixas: updatedExpenses,
      };
    });

    setEditing(null);
  }

  function deleteFixedExpense(id: number) {
    const confirmDelete = window.confirm("Deseja excluir esta despesa fixa?");
    if (!confirmDelete) return;

    setData((prev) => ({
      ...prev,
      despesasFixas: prev.despesasFixas.filter((item) => item.id !== id),
    }));

    setEditing(null);
  }

  if (editing) {
    return (
      <div className="app">
        <Header title="Despesa fixa" setScreen={() => setEditing(null)} />
  
        <div className="card">
          <div className="input-group">
            <label>Categoria</label>
            <select
              className="select"
              value={editing.categoriaId}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  categoriaId: Number(event.target.value),
                })
              }
            >
              {data.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
  
          <div className="input-group">
            <label>Valor</label>
            <input
              className="input"
              type="number"
              placeholder="0,00"
              value={editing.valor}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  valor: Number(event.target.value),
                })
              }
            />
          </div>
  
          <div className="input-group">
            <label>Descrição</label>
            <textarea
              className="textarea"
              placeholder="Ex: faculdade, aluguel, internet"
              value={editing.descricao}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  descricao: event.target.value,
                })
              }
            />
          </div>
  
          <div className="input-group">
            <label>Data de início</label>
            <input
              className="input"
              type="date"
              value={editing.dataInicio}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  dataInicio: event.target.value,
                })
              }
            />
          </div>
        </div>
  
        <button className="save-button" onClick={() => saveFixedExpense(editing)}>
          Salvar despesa fixa
        </button>
  
        <button className="main-button" onClick={() => setEditing(null)}>
          Cancelar
        </button>
  
        <button className="main-button" onClick={() => deleteFixedExpense(editing.id)}>
          Excluir despesa fixa
        </button>
      </div>
    );
  }
  return (
    <div className="app">
      <Header title="Despesas fixas" setScreen={setScreen} />

      <div className="card">
        <div className="label">Total fixo este mês</div>
        <div className="balance negative">
          {money(
            (totals.despesasFixasAtivas || 0) +
              (totals.cartaoCreditoMes || 0) +
              (totals.emprestimosMensaisMes || 0) +
              (totals.emprestimosAtivos || 0)
          )}
        </div>
      </div>

      <button
  className="green-button"
  onClick={() =>
    setEditing({
      id: Date.now(),
      descricao: "",
      valor: 0,
      categoriaId: data.categorias[0]?.id || 1,
      quantidadeMeses: "sem prazo",
      dataInicio: todayISO(),
      dataFim: "",
      semDataFinal: true,
      status: "ativa",
      editavel: true,
      observacao: "",
    })
  }
>
  + Incluir nova despesa fixa
</button>
      <div className="card-dark">
        <div className="input-group">
          <label>Mês da despesa fixa</label>
          <select
            className="select"
            value={mesAnoSelecionado}
            onChange={(event) => setMesAnoSelecionado(event.target.value)}
          >
            <option value="06/2026">Junho/2026</option>
            <option value="07/2026">Julho/2026</option>
            <option value="08/2026">Agosto/2026</option>
            <option value="09/2026">Setembro/2026</option>
            <option value="10/2026">Outubro/2026</option>
            <option value="11/2026">Novembro/2026</option>
            <option value="12/2026">Dezembro/2026</option>
            <option value="01/2027">Janeiro/2027</option>
            <option value="02/2027">Fevereiro/2027</option>
            <option value="03/2027">Março/2027</option>
            <option value="04/2027">Abril/2027</option>
          </select>
        </div>
      </div>

      {cartaoCreditoItem && cartaoCreditoSelecionado > 0 && (
        <div className="list-item">
          <div>
            <div className="list-title">Fatura cartão de Crédito</div>
            <div className="list-subtitle">{mesAnoSelecionado}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <strong
              className={
                isDespesaPaga("cartao", cartaoCreditoItem.id) ? "green" : "red"
              }
            >
              {isDespesaPaga("cartao", cartaoCreditoItem.id)
                ? `Pago ${money(cartaoCreditoSelecionado)}`
                : `-${money(cartaoCreditoSelecionado)}`}
            </strong>

            <br />

            <button
              className="eye"
              style={{ fontSize: 14, marginTop: 8 }}
              onClick={() =>
                editarCartaoCredito(cartaoCreditoItem.id, cartaoCreditoItem.valor)
              }
            >
              Editar
            </button>

            <br />

            {isDespesaPaga("cartao", cartaoCreditoItem.id) ? (
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => marcarComoNaoPago("cartao", cartaoCreditoItem.id)}
              >
                Não pago
              </button>
            ) : (
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() =>
                  marcarComoPago({
                    tipo: "cartao",
                    referenciaId: cartaoCreditoItem.id,
                    descricao: "Fatura cartão de Crédito",
                    valor: cartaoCreditoSelecionado,
                  })
                }
              >
                Pago
              </button>
            )}
          </div>
        </div>
      )}

      {emprestimoMensalItem && emprestimosMensaisSelecionado > 0 && (
        <div className="list-item">
          <div>
            <div className="list-title">Empréstimos</div>
            <div className="list-subtitle">{mesAnoSelecionado}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <strong
              className={
                isDespesaPaga("emprestimo", emprestimoMensalItem.id)
                  ? "green"
                  : "red"
              }
            >
              {isDespesaPaga("emprestimo", emprestimoMensalItem.id)
                ? `Pago ${money(emprestimosMensaisSelecionado)}`
                : `-${money(emprestimosMensaisSelecionado)}`}
            </strong>

            <br />

            <button
              className="eye"
              style={{ fontSize: 14, marginTop: 8 }}
              onClick={() =>
                editarEmprestimoMensal(
                  emprestimoMensalItem.id,
                  emprestimoMensalItem.valor
                )
              }
            >
              Editar
            </button>

            <br />

            {isDespesaPaga("emprestimo", emprestimoMensalItem.id) ? (
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() =>
                  marcarComoNaoPago("emprestimo", emprestimoMensalItem.id)
                }
              >
                Não pago
              </button>
            ) : (
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() =>
                  marcarComoPago({
                    tipo: "emprestimo",
                    referenciaId: emprestimoMensalItem.id,
                    descricao: "Empréstimos",
                    valor: emprestimosMensaisSelecionado,
                  })
                }
              >
                Pago
              </button>
            )}
          </div>
        </div>
      )}

      {data.despesasFixas.length === 0 ? (
        <div className="card-dark">
          <p className="muted">Nenhuma despesa fixa cadastrada.</p>
        </div>
      ) : (
        data.despesasFixas.map((despesa) => (
          <div className="list-item" key={despesa.id}>
            <div>
              <div className="list-title">{despesa.descricao}</div>
              <div className="list-subtitle">
                {getCategoryName(data, despesa.categoriaId)} • {despesa.status}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong
                className={isDespesaPaga("fixa", despesa.id) ? "green" : "red"}
              >
                {isDespesaPaga("fixa", despesa.id)
                  ? `Pago ${money(despesa.valor)}`
                  : `-${money(despesa.valor)}`}
              </strong>

              <br />

              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => setEditing(despesa)}
              >
                Editar
              </button>

              <br />

              {isDespesaPaga("fixa", despesa.id) ? (
                <button
                  className="eye"
                  style={{ fontSize: 14, marginTop: 8 }}
                  onClick={() => marcarComoNaoPago("fixa", despesa.id)}
                >
                  Não pago
                </button>
              ) : (
                <button
                  className="eye"
                  style={{ fontSize: 14, marginTop: 8 }}
                  onClick={() =>
                    marcarComoPago({
                      tipo: "fixa",
                      referenciaId: despesa.id,
                      descricao: despesa.descricao,
                      valor: despesa.valor,
                    })
                  }
                >
                  Pago
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
function SettingsScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  function clearData() {
    const confirmClear = window.confirm(
      'Tem certeza que deseja apagar todos os dados salvos neste aparelho?'
    );

    if (!confirmClear) return;

    localStorage.removeItem('enzo-financas-mvp');
    sessionStorage.removeItem('enzo-financas-unlocked');
    window.location.reload();
  }

  return (
    <div className="app">
      <Header title="Configurações" setScreen={setScreen} />

      <button className="green-button" onClick={() => setScreen('salary')}>
        Salário e pagamento
      </button>

      <button className="green-button" onClick={() => setScreen('categories')}>
        Cadastrar categoria
      </button>

      <button className="green-button" onClick={() => setScreen('banks')}>
        Cadastrar banco
      </button>

      <button className="green-button" onClick={() => setScreen('balance')}>
        Incluir saldo em conta
      </button>

      <button className="green-button" onClick={() => setScreen('investments')}>
        Investimentos
      </button>

      <button className="green-button" onClick={() => setScreen('loans')}>
        Empréstimos
      </button>

      <button className="green-button" onClick={() => setScreen('projection')}>
        Projeção até dezembro
      </button>

      <button className="delete-button" onClick={clearData}>
        Zerar dados deste aparelho
      </button>

      <p className="small-info">
        Os dados ficam salvos apenas neste aparelho. Essa versão não usa banco
        de dados pago e não tem mensalidade.
      </p>
    </div>
  );
}

function SalaryScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [form, setForm] = useState<ConfigFinanceira>(data.config);

  function save() {
    setData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...form,
        salarioMensal: Number(form.salarioMensal || 0),
        diaPagamento: Number(form.diaPagamento || 1),
      },
    }));

    setScreen('home');
  }

  return (
    <div className="app">
      <Header title="Salário e pagamento" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Nome do usuário</label>
          <input
            className="input"
            value={form.nomeUsuario}
            onChange={(event) =>
              setForm({ ...form, nomeUsuario: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Salário mensal</label>
          <input
            className="input"
            type="number"
            value={form.salarioMensal}
            onChange={(event) =>
              setForm({ ...form, salarioMensal: Number(event.target.value) })
            }
          />
        </div>
        <div className="input-group">
          <label>Data do próximo pagamento</label>
          <input
            className="input"
            type="date"
            value={form.dataProximoPagamento}
            onChange={(event) =>
              setForm({ ...form, dataProximoPagamento: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Senha de acesso</label>
          <input
            className="input"
            type="password"
            value={form.senhaAcesso}
            onChange={(event) =>
              setForm({ ...form, senhaAcesso: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={save}>
        Salvar configurações
      </button>
    </div>
  );
}
function CategoryScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [nome, setNome] = useState('Lazer');
  const [descricao, setDescricao] = useState('');

  function saveCategory() {
    const finalName =
      nome === 'Outras despesas' && descricao ? descricao : nome;

    if (!finalName) {
      alert('Informe a categoria.');
      return;
    }

    const newCategory: Categoria = {
      id: Date.now(),
      nome: finalName,
      descricao,
      tipo: 'geral',
      ativa: true,
      padraoSistema: false,
    };

    setData((prev) => ({
      ...prev,
      categorias: [newCategory, ...prev.categorias],
    }));

    alert('Categoria cadastrada.');
    setScreen('settings');
  }

  return (
    <div className="app">
      <Header title="Cadastrar categoria" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Categoria</label>
          <select
            className="select"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          >
            <option>Lazer</option>
            <option>Academia</option>
            <option>Moradia</option>
            <option>Alimentação</option>
            <option>Empréstimo</option>
            <option>Celular</option>
            <option>Outras despesas</option>
          </select>
        </div>

        {nome === 'Outras despesas' && (
          <div className="input-group">
            <label>Descrição da categoria</label>
            <input
              className="input"
              placeholder="Ex: Farmácia, Transporte, Pet"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>
        )}
      </div>

      <button className="save-button" onClick={saveCategory}>
        Salvar categoria
      </button>
    </div>
  );
}

function BankScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [form, setForm] = useState({
    nomeBanco: '',
    tipoConta: 'Conta corrente',
    descricao: '',
  });

  function saveBank() {
    if (!form.nomeBanco) {
      alert('Informe o nome do banco.');
      return;
    }

    const newBank: Banco = {
      id: Date.now(),
      nomeBanco: form.nomeBanco,
      tipoConta: form.tipoConta,
      descricao: form.descricao,
      ativo: true,
    };

    setData((prev) => ({
      ...prev,
      bancos: [newBank, ...prev.bancos],
    }));

    alert('Banco cadastrado.');
    setScreen('settings');
  }

  return (
    <div className="app">
      <Header title="Cadastrar banco" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Nome do banco</label>
          <input
            className="input"
            placeholder="Ex: Nubank, Itaú, Caixa"
            value={form.nomeBanco}
            onChange={(event) =>
              setForm({ ...form, nomeBanco: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Tipo de conta</label>
          <select
            className="select"
            value={form.tipoConta}
            onChange={(event) =>
              setForm({ ...form, tipoConta: event.target.value })
            }
          >
            <option>Conta corrente</option>
            <option>Conta poupança</option>
            <option>Carteira digital</option>
            <option>Investimento</option>
            <option>Outro</option>
          </select>
        </div>

        <div className="input-group">
          <label>Descrição opcional</label>
          <input
            className="input"
            placeholder="Ex: Conta principal"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={saveBank}>
        Salvar banco
      </button>
    </div>
  );
}

function BalanceScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [form, setForm] = useState({
    bancoId: data.bancos.find((banco) => banco.tipoConta !== "Investimento")?.id || 1,
    valor: "",
    destino: "saldo_em_conta" as "saldo_em_conta" | "investimento",
  });

  const saldoTotal = (data.saldosConta || [])
    .filter((item) => item.tipoDestino === "saldo_em_conta")
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);

  function saveBalance() {
    if (!form.valor) {
      alert("Informe o valor.");
      return;
    }

    const valor = Number(form.valor);

    if (Number.isNaN(valor)) {
      alert("Valor inválido.");
      return;
    }

    setData((prev) => {
      const existingIndex = prev.saldosConta.findIndex(
        (item) =>
          item.bancoId === Number(form.bancoId) &&
          item.tipoDestino === form.destino
      );

      if (existingIndex >= 0) {
        const updated = [...prev.saldosConta];

        updated[existingIndex] = {
          ...updated[existingIndex],
          valor,
          dataMovimentacao: todayISO(),
        };

        return {
          ...prev,
          saldosConta: updated,
        };
      }

      const newBalance: SaldoConta = {
        id: Date.now(),
        descricao: getBankName(data, Number(form.bancoId)),
        bancoId: Number(form.bancoId),
        valor,
        tipoDestino: form.destino,
        podeUsarParaCobrirGastos: true,
        dataMovimentacao: todayISO(),
      };

      return {
        ...prev,
        saldosConta: [newBalance, ...prev.saldosConta],
      };
    });

    setForm({
      ...form,
      valor: "",
    });
  }

  function atualizarSaldo(id: number, valorAtual: number) {
    const novoValorTexto = window.prompt(
      "Novo valor do saldo:",
      String(valorAtual).replace(".", ",")
    );

    if (novoValorTexto === null) return;

    const novoValor = Number(novoValorTexto.replace(",", "."));

    if (Number.isNaN(novoValor)) {
      alert("Valor inválido.");
      return;
    }

    setData((prev) => ({
      ...prev,
      saldosConta: prev.saldosConta.map((item) =>
        item.id === id ? { ...item, valor: novoValor } : item
      ),
    }));
  }

  function debitarSaldo(id: number, valorAtual: number) {
    const valorTexto = window.prompt(
      "Valor que deseja debitar:",
      "0,00"
    );

    if (valorTexto === null) return;

    const valorDebito = Number(valorTexto.replace(",", "."));

    if (Number.isNaN(valorDebito)) {
      alert("Valor inválido.");
      return;
    }

    setData((prev) => ({
      ...prev,
      saldosConta: prev.saldosConta.map((item) =>
        item.id === id
          ? { ...item, valor: Number(valorAtual || 0) - valorDebito }
          : item
      ),
    }));
  }

  return (
    <div className="app">
      <Header title="Incluir saldo" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Valor</label>
          <input
            className="input"
            type="number"
            placeholder="0,00"
            value={form.valor}
            onChange={(event) => setForm({ ...form, valor: event.target.value })}
          />
        </div>

        <div className="input-group">
          <label>Banco</label>
          <select
            className="select"
            value={form.bancoId}
            onChange={(event) =>
              setForm({ ...form, bancoId: Number(event.target.value) })
            }
          >
            {data.bancos
              .filter((banco) => banco.tipoConta !== "Investimento")
              .map((banco) => (
                <option key={banco.id} value={banco.id}>
                  {banco.nomeBanco}
                </option>
              ))}
          </select>
        </div>

        <div className="input-group">
          <label>Destino</label>
          <select
            className="select"
            value={form.destino}
            onChange={(event) =>
              setForm({
                ...form,
                destino: event.target.value as "saldo_em_conta" | "investimento",
              })
            }
          >
            <option value="saldo_em_conta">Saldo em conta</option>
            <option value="investimento">Investimento</option>
          </select>
        </div>
      </div>

      <button className="save-button" onClick={saveBalance}>
        Salvar saldo
      </button>

      <div className="card">
        <div className="label">Saldo total em conta</div>
        <div className="balance green">{money(saldoTotal)}</div>
      </div>

      {(data.saldosConta || [])
        .filter((item) => item.tipoDestino === "saldo_em_conta")
        .map((item) => (
          <div className="list-item" key={item.id}>
            <div>
              <div className="list-title">{getBankName(data, item.bancoId)}</div>
              <div className="list-subtitle">Saldo em conta</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong className="green">{money(item.valor)}</strong>
              <br />

              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => atualizarSaldo(item.id, item.valor)}
              >
                Atualizar
              </button>

              <br />

              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => debitarSaldo(item.id, item.valor)}
              >
                Debitar
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
function InvestmentsScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const investimentoBancoPadrao =
    data.bancos.find((banco) => banco.tipoConta === "Investimento")?.id || 1;

  const metaAtual = Number(data.investimentos[0]?.valorMeta || 0);

  const [form, setForm] = useState({
    bancoId: investimentoBancoPadrao,
    valorAtual: "",
  });

  const [metaForm, setMetaForm] = useState(String(metaAtual || ""));

  const investimentoTotal = (data.investimentos || []).reduce(
    (sum, item) => sum + Number(item.valorAtual || 0),
    0
  );

  const faltaParaMeta = Math.max(metaAtual - investimentoTotal, 0);

  function saveInvestment() {
    if (!form.valorAtual) {
      alert("Informe o valor do investimento.");
      return;
    }

    const valorInvestido = Number(form.valorAtual);

    if (Number.isNaN(valorInvestido) || valorInvestido <= 0) {
      alert("Valor inválido.");
      return;
    }

    setData((prev) => {
      const bancoId = Number(form.bancoId);

      const investimentoExistente = prev.investimentos.find(
        (item) => item.bancoId === bancoId
      );

      if (investimentoExistente) {
        return {
          ...prev,
          investimentos: prev.investimentos.map((item) =>
            item.bancoId === bancoId
              ? {
                  ...item,
                  valorAtual: Number(item.valorAtual || 0) + valorInvestido,
                  valorMeta: metaAtual,
                }
              : item
          ),
        };
      }

      const newInvestment: Investimento = {
        id: Date.now(),
        descricao: getBankName(data, bancoId),
        bancoId,
        tipoInvestimento: "Investimento",
        valorAtual: valorInvestido,
        valorMeta: metaAtual,
        dataMeta: "",
        observacao: "",
        podeUsarParaGastos: false,
      };

      return {
        ...prev,
        investimentos: [newInvestment, ...prev.investimentos],
      };
    });

    setForm({
      ...form,
      valorAtual: "",
    });
  }

  function salvarMeta() {
    const novaMeta = Number(metaForm);

    if (Number.isNaN(novaMeta) || novaMeta < 0) {
      alert("Meta inválida.");
      return;
    }

    setData((prev) => {
      if (prev.investimentos.length === 0) {
        const bancoId = Number(form.bancoId);

        const newInvestment: Investimento = {
          id: Date.now(),
          descricao: getBankName(data, bancoId),
          bancoId,
          tipoInvestimento: "Investimento",
          valorAtual: 0,
          valorMeta: novaMeta,
          dataMeta: "",
          observacao: "",
          podeUsarParaGastos: false,
        };

        return {
          ...prev,
          investimentos: [newInvestment],
        };
      }

      return {
        ...prev,
        investimentos: prev.investimentos.map((item) => ({
          ...item,
          valorMeta: novaMeta,
        })),
      };
    });
  }

  function atualizarInvestimento(id: number, valorAtual: number) {
    const novoValorTexto = window.prompt(
      "Novo valor total do investimento:",
      String(valorAtual).replace(".", ",")
    );

    if (novoValorTexto === null) return;

    const novoValor = Number(novoValorTexto.replace(",", "."));

    if (Number.isNaN(novoValor)) {
      alert("Valor inválido.");
      return;
    }

    setData((prev) => ({
      ...prev,
      investimentos: prev.investimentos.map((item) =>
        item.id === id ? { ...item, valorAtual: novoValor } : item
      ),
    }));
  }

  return (
    <div className="app">
      <Header title="Investimentos" setScreen={setScreen} />

      <div className="card">
        <div className="label">Total investido</div>
        <div className="balance green">{money(investimentoTotal)}</div>
      </div>

      <div className="card">
        <div className="label">Meta de investimento</div>
        <div className="balance green">{money(metaAtual)}</div>

        <div className="list-subtitle" style={{ marginTop: 10 }}>
          Falta para alcançar a meta:
        </div>

        <div className={faltaParaMeta > 0 ? "balance negative" : "balance green"}>
          {money(faltaParaMeta)}
        </div>

        <div className="input-group">
          <label>Editar meta</label>
          <input
            className="input"
            type="number"
            placeholder="0,00"
            value={metaForm}
            onChange={(event) => setMetaForm(event.target.value)}
          />
        </div>

        <button className="save-button" onClick={salvarMeta}>
          Salvar meta
        </button>
      </div>

      <div className="card">
        <div className="input-group">
          <label>Banco</label>
          <select
            className="select"
            value={form.bancoId}
            onChange={(event) =>
              setForm({ ...form, bancoId: Number(event.target.value) })
            }
          >
            {data.bancos
              .filter((banco) => banco.tipoConta === "Investimento")
              .map((banco) => (
                <option key={banco.id} value={banco.id}>
                  {banco.nomeBanco}
                </option>
              ))}
          </select>
        </div>

        <div className="input-group">
          <label>Incluir Valor</label>
          <input
            className="input"
            type="number"
            placeholder="0,00"
            value={form.valorAtual}
            onChange={(event) =>
              setForm({ ...form, valorAtual: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={saveInvestment}>
        Salvar investimento
      </button>

      {(data.investimentos || []).length === 0 ? (
        <div className="card-dark">
          <p className="muted">Nenhum investimento cadastrado.</p>
        </div>
      ) : (
        data.investimentos.map((item) => (
          <div className="list-item" key={item.id}>
            <div>
              <div className="list-title">
                {getBankName(data, item.bancoId)}
              </div>

              <div className="list-subtitle">
                Valor investido: {money(item.valorAtual)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong className="green">{money(item.valorAtual)}</strong>
              <br />
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() =>
                  atualizarInvestimento(item.id, item.valorAtual)
                }
              >
                Atualizar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function LoansScreen({
  data,
  setData,
  setScreen,
}: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setScreen: (screen: Screen) => void;
}) {
  const [form, setForm] = useState({
    descricao: '',
    bancoId: data.bancos[0]?.id || 1,
    valorParcela: '',
    quantidadeTotalParcelas: '',
    parcelasJaPagas: '',
    dataInicio: todayISO(),
    dataFimPrevista: '',
  });

  function saveLoan() {
    if (!form.valorParcela || Number(form.valorParcela) <= 0) {
      alert('Informe o valor da parcela.');
      return;
    }

    const total = Number(form.quantidadeTotalParcelas || 0);
    const pagas = Number(form.parcelasJaPagas || 0);
    const restantes = Math.max(total - pagas, 0);

    const loanCategory =
      data.categorias.find((item) => item.nome === 'Empréstimo')?.id || 5;

    const newLoan: Emprestimo = {
      id: Date.now(),
      descricao: form.descricao || 'Empréstimo',
      bancoId: Number(form.bancoId),
      categoriaId: loanCategory,
      valorParcela: Number(form.valorParcela),
      quantidadeTotalParcelas: total,
      parcelasJaPagas: pagas,
      parcelasRestantes: restantes,
      dataInicio: form.dataInicio,
      dataFimPrevista: form.dataFimPrevista,
      status: restantes > 0 ? 'ativo' : 'finalizado',
      incluiEmDespesaFixa: true,
    };

    setData((prev) => ({
      ...prev,
      emprestimos: [newLoan, ...prev.emprestimos],
    }));

    alert('Empréstimo cadastrado.');
    setScreen('home');
  }

  return (
    <div className="app">
      <Header title="Empréstimos" setScreen={setScreen} />

      <div className="card">
        <div className="label">Cadastrar novo empréstimo</div>

        <div className="input-group">
          <label>Descrição</label>
          <input
            className="input"
            placeholder="Ex: Empréstimo Nubank"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Banco</label>
          <select
            className="select"
            value={form.bancoId}
            onChange={(event) =>
              setForm({ ...form, bancoId: Number(event.target.value) })
            }
          >
            {data.bancos.map((banco) => (
              <option key={banco.id} value={banco.id}>
                {banco.nomeBanco}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Valor da parcela</label>
          <input
            className="input"
            type="number"
            placeholder="0,00"
            value={form.valorParcela}
            onChange={(event) =>
              setForm({ ...form, valorParcela: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Quantidade total de parcelas</label>
          <input
            className="input"
            type="number"
            value={form.quantidadeTotalParcelas}
            onChange={(event) =>
              setForm({ ...form, quantidadeTotalParcelas: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Parcelas já pagas</label>
          <input
            className="input"
            type="number"
            value={form.parcelasJaPagas}
            onChange={(event) =>
              setForm({ ...form, parcelasJaPagas: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Data início</label>
          <input
            className="input"
            type="date"
            value={form.dataInicio}
            onChange={(event) =>
              setForm({ ...form, dataInicio: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Data final prevista</label>
          <input
            className="input"
            type="date"
            value={form.dataFimPrevista}
            onChange={(event) =>
              setForm({ ...form, dataFimPrevista: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={saveLoan}>
        Salvar empréstimo
      </button>

      {data.emprestimos.map((item) => (
        <div className="list-item" key={item.id}>
          <div>
            <div className="list-title">{item.descricao}</div>
            <div className="list-subtitle">
              {getBankName(data, item.bancoId)} • Faltam{' '}
              {item.parcelasRestantes} parcelas
            </div>
          </div>

          <strong className="red">-{money(item.valorParcela)}</strong>
        </div>
      ))}
    </div>
  );
}
function ProjectionScreen({
  data,
  setScreen,
}: {
  data: AppData;
  setScreen: (screen: Screen) => void;
}) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [anoFinal, setAnoFinal] = useState(2026);

  function isActiveInMonth(item: DespesaFixa, month: number, year: number) {
    if (item.status !== "ativa") return false;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const start = item.dataInicio ? new Date(item.dataInicio) : monthStart;
    const end = item.dataFim ? new Date(item.dataFim) : null;

    if (start > monthEnd) return false;
    if (end && end < monthStart) return false;

    return true;
  }

  const months: {
    mesAno: string;
    label: string;
    total: number;
    despesas: DespesaFixa[];
    cartaoCreditoValor: number;
    cartaoCreditoPago: boolean;
    emprestimosMensaisValor: number;
    emprestimosMensaisPago: boolean;
    emprestimos: Emprestimo[];
  }[] = [];

  for (let year = currentYear; year <= anoFinal; year++) {
    const startMonth = year === currentYear ? currentMonth : 0;

    for (let month = startMonth; month <= 11; month++) {
      const mesAno = new Date(year, month, 1).toLocaleDateString("pt-BR", {
        month: "2-digit",
        year: "numeric",
      });

      function despesaFixaFoiPaga(id: number) {
        return (data.despesasPagas || []).some(
          (item) =>
            item.tipo === "fixa" &&
            item.referenciaId === id &&
            item.mesAno === mesAno
        );
      }

      const despesasFixasDoMes = (data.despesasFixas || []).filter((item) =>
        isActiveInMonth(item, month, year)
      );

      const totalFixas = despesasFixasDoMes
        .filter((item) => !despesaFixaFoiPaga(item.id))
        .reduce((sum, item) => sum + Number(item.valor || 0), 0);

      const cartaoCreditoItem = (data.cartaoCredito || []).find(
        (item) => item.mesAno === mesAno
      );

      const cartaoCreditoValor = cartaoCreditoItem
        ? Number(cartaoCreditoItem.valor || 0)
        : 0;

      const cartaoCreditoPago = cartaoCreditoItem
        ? (data.despesasPagas || []).some(
            (paga) =>
              paga.tipo === "cartao" &&
              paga.referenciaId === cartaoCreditoItem.id &&
              paga.mesAno === mesAno
          )
        : false;

      const emprestimoMensalItem = (data.emprestimosMensais || []).find(
        (item) => item.mesAno === mesAno
      );

      const emprestimosMensaisValor = emprestimoMensalItem
        ? Number(emprestimoMensalItem.valor || 0)
        : 0;

      const emprestimosMensaisPago = emprestimoMensalItem
        ? (data.despesasPagas || []).some(
            (paga) =>
              paga.tipo === "emprestimo" &&
              paga.referenciaId === emprestimoMensalItem.id &&
              paga.mesAno === mesAno
          )
        : false;

      const totalCartao = cartaoCreditoPago ? 0 : cartaoCreditoValor;
      const totalEmprestimoMensal = emprestimosMensaisPago
        ? 0
        : emprestimosMensaisValor;

      const emprestimosAntigos = (data.emprestimos || []).filter(
        (item) =>
          item.status === "ativo" &&
          item.incluiEmDespesaFixa &&
          Number(item.parcelasRestantes || 0) > 0
      );

      const totalEmprestimosAntigos = emprestimosAntigos.reduce(
        (sum, item) => sum + Number(item.valorParcela || 0),
        0
      );

      months.push({
        mesAno,
        label: new Date(year, month, 1).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        total: totalFixas + totalCartao + totalEmprestimoMensal + totalEmprestimosAntigos,
        despesas: despesasFixasDoMes,
        cartaoCreditoValor,
        cartaoCreditoPago,
        emprestimosMensaisValor,
        emprestimosMensaisPago,
        emprestimos: emprestimosAntigos,
      });
    }
  }

  return (
    <div className="app">
      <Header title="Projeção" setScreen={setScreen} />

      <div className="card">
        <div className="label">Projeção até dezembro</div>
        <p className="small-info">
          Escolha até qual ano deseja projetar suas despesas.
        </p>

        <div className="input-group">
          <label>Projetar até</label>
          <select
            className="select"
            value={anoFinal}
            onChange={(event) => setAnoFinal(Number(event.target.value))}
          >
            <option value={2026}>Dezembro de 2026</option>
            <option value={2027}>Dezembro de 2027</option>
            <option value={2028}>Dezembro de 2028</option>
          </select>
        </div>
      </div>

      {months.map((month) => (
        <div className="card-dark" key={month.mesAno}>
          <div className="summary-top">
            <div>
              <div
                className="list-title"
                style={{ textTransform: "capitalize" }}
              >
                {month.label}
              </div>
              <div className="list-subtitle">Total de despesas</div>
            </div>

            <strong className="red">{money(month.total)}</strong>
          </div>

          <div style={{ marginTop: 14 }}>
            {month.despesas.map((item) => {
              const pago = (data.despesasPagas || []).some(
                (paga) =>
                  paga.tipo === "fixa" &&
                  paga.referenciaId === item.id &&
                  paga.mesAno === month.mesAno
              );

              return (
                <div
                  className="list-subtitle"
                  key={item.id}
                  style={{ color: pago ? "#39ff14" : undefined }}
                >
                  {item.descricao} — {money(item.valor)} {pago ? "Pago" : ""}
                </div>
              );
            })}

            {month.cartaoCreditoValor > 0 && (
              <div
                className="list-subtitle"
                style={{ color: month.cartaoCreditoPago ? "#39ff14" : undefined }}
              >
                Fatura cartão de Crédito — {money(month.cartaoCreditoValor)}{" "}
                {month.cartaoCreditoPago ? "Pago" : ""}
              </div>
            )}

            {month.emprestimosMensaisValor > 0 && (
              <div
                className="list-subtitle"
                style={{
                  color: month.emprestimosMensaisPago ? "#39ff14" : undefined,
                }}
              >
                Empréstimos — {money(month.emprestimosMensaisValor)}{" "}
                {month.emprestimosMensaisPago ? "Pago" : ""}
              </div>
            )}

            {month.emprestimos.map((item) => (
              <div className="list-subtitle" key={item.id}>
                {item.descricao} — {money(item.valorParcela)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  return (
    <div className="bottom-nav">
      <button
        className={`nav-button ${screen === 'home' ? 'active' : ''}`}
        onClick={() => setScreen('home')}
      >
        Início
      </button>

      <button
        className={`nav-button ${
          screen === 'expenses' || screen === 'fixed' ? 'active' : ''
        }`}
        onClick={() => setScreen('expenses')}
      >
        Despesas
      </button>

      <button
        className={`nav-button ${screen === 'settings' ? 'active' : ''}`}
        onClick={() => setScreen('settings')}
      >
        Configurações
      </button>
    </div>
  );
}
