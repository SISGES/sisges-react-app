// A mensagem deixa o clique passar. O botão de fechar continua acessível.
export function expectNotification(message: string, timeout = 10000) {
  return cy
    .contains('[data-testid="toast"]', message, { timeout })
    .find('button[aria-label="Fechar notificação"]')
    .should("be.visible");
}
