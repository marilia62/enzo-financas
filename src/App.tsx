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
    salarioMensal: 2000,
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
      nome: 'Lazer',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 2,
      nome: 'Academia',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 3,
      nome: 'Moradia',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 4,
      nome: 'Alimentação',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 5,
      nome: 'Empréstimo',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 6,
      nome: 'Celular',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
    {
      id: 7,
      nome: 'Outras despesas',
      descricao: '',
      tipo: 'geral',
      ativa: true,
      padraoSistema: true,
    },
  ],

  bancos: [
    {
      id: 1,
      nomeBanco: 'Nubank',
      tipoConta: 'Conta corrente',
      descricao: 'Conta principal',
      ativo: true,
    },
  ],

  saldosConta: [
    {
      id: 1,
      descricao: 'Saldo inicial',
      bancoId: 1,
      valor: 500,
      tipoDestino: 'saldo_em_conta',
      podeUsarParaCobrirGastos: true,
      dataMovimentacao: todayISO(),
    },
  ],

  investimentos: [
    {
      id: 1,
      descricao: 'Nubank Caixinha',
      bancoId: 1,
      tipoInvestimento: 'Caixinha',
      valorAtual: 500,
      valorMeta: 5000,
      dataMeta: '2026-12-31',
      observacao: 'Reserva protegida',
      podeUsarParaGastos: false,
    },
  ],

  despesasDiarias: [],

  despesasFixas: [
    {
      id: 1,
      descricao: 'Aluguel',
      valor: 800,
      categoriaId: 3,
      quantidadeMeses: 'sem prazo',
      dataInicio: todayISO(),
      dataFim: '',
      semDataFinal: true,
      status: 'ativa',
      editavel: true,
      observacao: '',
    },
    {
      id: 2,
      descricao: 'Conta TIM',
      valor: 85,
      categoriaId: 6,
      quantidadeMeses: 'sem prazo',
      dataInicio: todayISO(),
      dataFim: '',
      semDataFinal: true,
      status: 'ativa',
      editavel: true,
      observacao: '',
    },
    {
      id: 3,
      descricao: 'Gympass',
      valor: 85,
      categoriaId: 2,
      quantidadeMeses: 'sem prazo',
      dataInicio: todayISO(),
      dataFim: '',
      semDataFinal: true,
      status: 'ativa',
      editavel: true,
      observacao: '',
    },
  ],

  emprestimos: [],
};

function getPaymentDate(dateString: string) {
  if (!dateString) return '--/--/----';

  const paymentDate = new Date(dateString + 'T00:00:00');

  return paymentDate.toLocaleDateString('pt-BR');
}

function getDaysToPayment(dateString: string) {
  if (!dateString) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const paymentDate = new Date(dateString + 'T00:00:00');

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
    <span className={negative ? 'red' : 'green'}>
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

    const despesasFixasAtivas = data.despesasFixas
      .filter((item) => item.status === 'ativa')
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);

    const emprestimosAtivos = data.emprestimos
      .filter(
        (item) =>
          item.status === 'ativo' &&
          item.incluiEmDespesaFixa &&
          Number(item.parcelasRestantes || 0) > 0
      )
      .reduce((sum, item) => sum + Number(item.valorParcela || 0), 0);

    const saldoConta = data.saldosConta
      .filter((item) => item.tipoDestino === 'saldo_em_conta')
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);

    const investimentos = data.investimentos.reduce(
      (sum, item) => sum + Number(item.valorAtual || 0),
      0
    );

    const saldoDisponivel =
      Number(data.config.salarioMensal || 0) -
      despesasFixasAtivas -
      emprestimosAtivos -
      despesasDiariasMes;

    return {
      despesasDiariasMes,
      despesasFixasAtivas,
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

      {screen === 'expenses' && (
        <DailyHistoryScreen data={data} totals={totals} setScreen={setScreen} />
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
          value={totals.despesasFixasAtivas + totals.emprestimosAtivos}
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
          onClick={() =>
            alert('Tela de saldo em conta será adicionada depois.')
          }
          onToggle={() =>
            updateConfig('mostrarSaldoConta', !data.config.mostrarSaldoConta)
          }
        />

        <SummaryCard
          title="Investimentos"
          value={totals.investimentos}
          visible={data.config.mostrarInvestimentos}
          onClick={() => alert('Tela de investimentos será adicionada depois.')}
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
          <label>Descrição</label>
          <textarea
            className="textarea"
            placeholder="Ex: lanche, mercado, Uber"
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

      <button className="main-button" onClick={saveExpense}>
        Salvar despesa
      </button>
    </div>
  );
}

function DailyHistoryScreen({
  data,
  totals,
  setScreen,
}: {
  data: AppData;
  totals: any;
  setScreen: (screen: Screen) => void;
}) {
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
                {getCategoryName(data, despesa.categoriaId)} •{' '}
                {new Date(despesa.dataDespesa).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <strong className="red">-{money(despesa.valor)}</strong>
          </div>
        ))
      )}

      <button className="main-button" onClick={() => setScreen('daily')}>
        + Incluir despesa diária
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

  function saveFixedExpense(form: DespesaFixa) {
    setData((prev) => {
      const exists = prev.despesasFixas.some((item) => item.id === form.id);

      const updatedExpenses = exists
        ? prev.despesasFixas.map((item) => (item.id === form.id ? form : item))
        : [
            {
              ...form,
              id: Date.now(),
              status: 'ativa' as const,
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
    const confirmDelete = window.confirm('Deseja excluir esta despesa fixa?');

    if (!confirmDelete) return;

    setData((prev) => ({
      ...prev,
      despesasFixas: prev.despesasFixas.filter((item) => item.id !== id),
    }));

    setEditing(null);
  }

  if (editing) {
    return (
      <FixedExpenseForm
        data={data}
        item={editing}
        onCancel={() => setEditing(null)}
        onSave={saveFixedExpense}
        onDelete={deleteFixedExpense}
      />
    );
  }

  return (
    <div className="app">
      <Header title="Despesas fixas" setScreen={setScreen} />

      <div className="card">
        <div className="label">Total fixo este mês</div>
        <div className="balance negative">
          {money(totals.despesasFixasAtivas + totals.emprestimosAtivos)}
        </div>
      </div>

      <button
        className="green-button"
        onClick={() =>
          setEditing({
            id: Date.now(),
            descricao: '',
            valor: 0,
            categoriaId: data.categorias[0]?.id || 1,
            quantidadeMeses: 'sem prazo',
            dataInicio: todayISO(),
            dataFim: '',
            semDataFinal: true,
            status: 'ativa',
            editavel: true,
            observacao: '',
          })
        }
      >
        + Incluir nova despesa fixa
      </button>

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

            <div style={{ textAlign: 'right' }}>
              <strong className="red">-{money(despesa.valor)}</strong>
              <br />
              <button
                className="eye"
                style={{ fontSize: 14, marginTop: 8 }}
                onClick={() => setEditing(despesa)}
              >
                Editar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FixedExpenseForm({
  data,
  item,
  onCancel,
  onSave,
  onDelete,
}: {
  data: AppData;
  item: DespesaFixa;
  onCancel: () => void;
  onSave: (form: DespesaFixa) => void;
  onDelete: (id: number) => void;
}) {
  const [form, setForm] = useState<DespesaFixa>(item);

  return (
    <div className="app">
      <div className="header">
        <button className="icon-button" onClick={onCancel}>
          ←
        </button>
        <div className="header-title">Editar despesa fixa</div>
        <button className="icon-button">✎</button>
      </div>

      <div className="card">
        <div className="input-group">
          <label>Descrição</label>
          <input
            className="input"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
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
          <label>Quantidade de meses</label>
          <input
            className="input"
            value={form.quantidadeMeses}
            onChange={(event) =>
              setForm({ ...form, quantidadeMeses: event.target.value })
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
          <label>Data fim</label>
          <input
            className="input"
            type="date"
            value={form.dataFim}
            onChange={(event) =>
              setForm({ ...form, dataFim: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Status</label>
          <select
            className="select"
            value={form.status}
            onChange={(event) =>
              setForm({
                ...form,
                status: event.target.value as DespesaFixa['status'],
              })
            }
          >
            <option value="ativa">Ativa</option>
            <option value="pausada">Pausada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      <button className="save-button" onClick={() => onSave(form)}>
        Salvar alteração
      </button>

      <button className="delete-button" onClick={() => onDelete(form.id)}>
        Excluir despesa fixa
      </button>
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
    descricao: '',
    valor: '',
    bancoId: data.bancos[0]?.id || 1,
    tipoDestino: 'saldo_em_conta' as 'saldo_em_conta' | 'investimento',
  });

  function saveBalance() {
    if (!form.valor || Number(form.valor) <= 0) {
      alert('Informe o valor.');
      return;
    }

    if (form.tipoDestino === 'investimento') {
      const newInvestment: Investimento = {
        id: Date.now(),
        descricao: form.descricao || 'Investimento',
        bancoId: Number(form.bancoId),
        tipoInvestimento: 'Outro',
        valorAtual: Number(form.valor),
        valorMeta: 0,
        dataMeta: '',
        observacao: '',
        podeUsarParaGastos: false,
      };

      setData((prev) => ({
        ...prev,
        investimentos: [newInvestment, ...prev.investimentos],
      }));
    } else {
      const newBalance: SaldoConta = {
        id: Date.now(),
        descricao: form.descricao || 'Saldo em conta',
        bancoId: Number(form.bancoId),
        valor: Number(form.valor),
        tipoDestino: 'saldo_em_conta',
        podeUsarParaCobrirGastos: true,
        dataMovimentacao: todayISO(),
      };

      setData((prev) => ({
        ...prev,
        saldosConta: [newBalance, ...prev.saldosConta],
      }));
    }

    alert('Valor salvo.');
    setScreen('home');
  }

  return (
    <div className="app">
      <Header title="Incluir saldo" setScreen={setScreen} />

      <div className="card">
        <div className="input-group">
          <label>Descrição</label>
          <input
            className="input"
            placeholder="Ex: Saldo Nubank"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
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
          <label>Destino</label>
          <select
            className="select"
            value={form.tipoDestino}
            onChange={(event) =>
              setForm({
                ...form,
                tipoDestino: event.target.value as
                  | 'saldo_em_conta'
                  | 'investimento',
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
  const [form, setForm] = useState({
    descricao: '',
    bancoId: data.bancos[0]?.id || 1,
    tipoInvestimento: 'Caixinha',
    valorAtual: '',
    valorMeta: '',
    dataMeta: '',
    observacao: '',
  });

  const totalInvestido = data.investimentos.reduce(
    (sum, item) => sum + Number(item.valorAtual || 0),
    0
  );

  function saveInvestment() {
    if (!form.valorAtual || Number(form.valorAtual) <= 0) {
      alert('Informe o valor atual do investimento.');
      return;
    }

    const newInvestment: Investimento = {
      id: Date.now(),
      descricao: form.descricao || 'Investimento',
      bancoId: Number(form.bancoId),
      tipoInvestimento: form.tipoInvestimento,
      valorAtual: Number(form.valorAtual),
      valorMeta: Number(form.valorMeta || 0),
      dataMeta: form.dataMeta,
      observacao: form.observacao,
      podeUsarParaGastos: false,
    };

    setData((prev) => ({
      ...prev,
      investimentos: [newInvestment, ...prev.investimentos],
    }));

    alert('Investimento cadastrado.');
    setScreen('home');
  }

  return (
    <div className="app">
      <Header title="Investimentos" setScreen={setScreen} />

      <div className="card">
        <div className="label">Total investido</div>
        <div className="balance">{money(totalInvestido)}</div>
        <p className="small-info">
          Investimento é dinheiro protegido. Ele não cobre gastos que
          ultrapassarem o salário.
        </p>
      </div>

      <div className="card">
        <div className="input-group">
          <label>Descrição</label>
          <input
            className="input"
            placeholder="Ex: Nubank Caixinha"
            value={form.descricao}
            onChange={(event) =>
              setForm({ ...form, descricao: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Valor atual</label>
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
          <label>Tipo de investimento</label>
          <select
            className="select"
            value={form.tipoInvestimento}
            onChange={(event) =>
              setForm({ ...form, tipoInvestimento: event.target.value })
            }
          >
            <option>Caixinha</option>
            <option>CDB</option>
            <option>Tesouro Direto</option>
            <option>Poupança</option>
            <option>Outro</option>
          </select>
        </div>

        <div className="input-group">
          <label>Valor da meta</label>
          <input
            className="input"
            type="number"
            placeholder="Ex: 5000"
            value={form.valorMeta}
            onChange={(event) =>
              setForm({ ...form, valorMeta: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Data para atingir a meta</label>
          <input
            className="input"
            type="date"
            value={form.dataMeta}
            onChange={(event) =>
              setForm({ ...form, dataMeta: event.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Observação</label>
          <textarea
            className="textarea"
            placeholder="Observação opcional"
            value={form.observacao}
            onChange={(event) =>
              setForm({ ...form, observacao: event.target.value })
            }
          />
        </div>
      </div>

      <button className="save-button" onClick={saveInvestment}>
        Salvar investimento
      </button>

      {data.investimentos.map((item) => {
        const falta =
          Number(item.valorMeta || 0) - Number(item.valorAtual || 0);

        return (
          <div className="list-item" key={item.id}>
            <div>
              <div className="list-title">{item.descricao}</div>
              <div className="list-subtitle">
                {getBankName(data, item.bancoId)} • {item.tipoInvestimento}
              </div>
              {item.valorMeta > 0 && (
                <div className="list-subtitle">
                  Meta: {money(item.valorMeta)} • Falta:{' '}
                  {money(Math.max(falta, 0))}
                </div>
              )}
            </div>

            <strong className="green">{money(item.valorAtual)}</strong>
          </div>
        );
      })}
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

  function isActiveInMonth(item: DespesaFixa, month: number, year: number) {
    if (item.status !== 'ativa') return false;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const start = item.dataInicio ? new Date(item.dataInicio) : monthStart;
    const end = item.dataFim ? new Date(item.dataFim) : null;

    if (start > monthEnd) return false;
    if (end && end < monthStart) return false;

    return true;
  }

  const months = [];

  for (let month = currentMonth; month <= 11; month++) {
    const despesasFixasDoMes = data.despesasFixas.filter((item) =>
      isActiveInMonth(item, month, currentYear)
    );

    const totalFixas = despesasFixasDoMes.reduce(
      (sum, item) => sum + Number(item.valor || 0),
      0
    );

    const totalEmprestimos = data.emprestimos
      .filter(
        (item) =>
          item.status === 'ativo' &&
          item.incluiEmDespesaFixa &&
          Number(item.parcelasRestantes || 0) > 0
      )
      .reduce((sum, item) => sum + Number(item.valorParcela || 0), 0);

    months.push({
      label: new Date(currentYear, month, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      total: totalFixas + totalEmprestimos,
      despesas: despesasFixasDoMes,
      emprestimos: data.emprestimos.filter(
        (item) =>
          item.status === 'ativo' &&
          item.incluiEmDespesaFixa &&
          Number(item.parcelasRestantes || 0) > 0
      ),
    });
  }

  return (
    <div className="app">
      <Header title="Projeção" setScreen={setScreen} />

      <div className="card">
        <div className="label">Projeção até dezembro</div>
        <p className="small-info">
          Soma apenas despesas fixas e empréstimos ativos. Despesas diárias não
          entram nessa projeção.
        </p>
      </div>

      {months.map((month) => (
        <div className="card-dark" key={month.label}>
          <div className="summary-top">
            <div>
              <div
                className="list-title"
                style={{ textTransform: 'capitalize' }}
              >
                {month.label}
              </div>
              <div className="list-subtitle">Total de despesas</div>
            </div>

            <strong className="red">{money(month.total)}</strong>
          </div>

          <div style={{ marginTop: 14 }}>
            {month.despesas.map((item) => (
              <div className="list-subtitle" key={item.id}>
                {item.descricao} — {money(item.valor)}
              </div>
            ))}

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
