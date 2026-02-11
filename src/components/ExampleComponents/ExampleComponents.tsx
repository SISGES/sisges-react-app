import './ExampleComponents.css'

export function ExampleComponents() {
  return (
    <div className="example-components">
      <h2 className="example-title">Componentes de Exemplo</h2>
      
      <div className="example-grid">
        {/* Cards */}
        <div className="card example-card">
          <h3 className="card-title">Card de Exemplo</h3>
          <p className="card-text">
            Este é um exemplo de card usando as cores do tema. O background usa
            a cor surface e a borda usa a cor border.
          </p>
        </div>

        {/* Botões */}
        <div className="example-section">
          <h3 className="section-title">Botões</h3>
          <div className="button-group">
            <button className="btn-primary">Botão Primary</button>
            <button className="btn-accent">Botão Accent</button>
          </div>
        </div>

        {/* Alertas */}
        <div className="example-section">
          <h3 className="section-title">Alertas</h3>
          <div className="alert-group">
            <div className="alert-success">
              ✓ Operação realizada com sucesso!
            </div>
            <div className="alert-warning">
              ⚠ Atenção: Verifique os dados informados.
            </div>
            <div className="alert-error">
              ✗ Erro ao processar a solicitação.
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="example-section">
          <h3 className="section-title">Campos de Entrada</h3>
          <div className="input-group">
            <label className="input-label">Nome</label>
            <input
              type="text"
              className="input-field"
              placeholder="Digite seu nome"
            />
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
