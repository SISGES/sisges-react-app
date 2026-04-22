import { Button, Alert, Input, FormField } from '../ui'

export function ExampleComponents() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-text-primary">Componentes de Exemplo</h2>

      <div className="grid gap-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="font-medium text-text-primary mb-2">Card de Exemplo</h3>
          <p className="text-sm text-text-secondary">
            Este é um exemplo de card usando as cores do tema. O background usa
            a cor surface e a borda usa a cor border.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-text-primary">Botões</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary">Botão Primary</Button>
            <Button variant="secondary">Botão Secondary</Button>
            <Button variant="danger">Botão Danger</Button>
            <Button variant="ghost">Botão Ghost</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-text-primary">Alertas</h3>
          <div className="space-y-2">
            <Alert type="success">Operação realizada com sucesso!</Alert>
            <Alert type="warning">Atenção: Verifique os dados informados.</Alert>
            <Alert type="error">Erro ao processar a solicitação.</Alert>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-text-primary">Campos de Entrada</h3>
          <FormField label="Nome">
            <Input placeholder="Digite seu nome" />
          </FormField>
          <FormField label="Email">
            <Input type="email" placeholder="seu@email.com" />
          </FormField>
        </div>
      </div>
    </div>
  )
}
