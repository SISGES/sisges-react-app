import { useState, FormEvent } from "react";
import { FiArrowRight, FiCheckCircle, FiLock, FiMail } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/authService";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { Alert, Input, Spinner } from "../ui";
import { SisgesLogo } from "../SisgesLogo/SisgesLogo";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/";
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "AUTH_INVALID_CREDENTIALS":
            setError(err.message);
            break;
          case "VALIDATION_ERROR":
            setError(
              err.errors?.map((e) => e.message).join(", ") || err.message,
            );
            break;
          default:
            setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[var(--color-background)] lg:grid-cols-[minmax(320px,0.82fr)_1.18fr]">
      <section className="relative hidden overflow-hidden bg-[var(--color-sidebar)] px-12 py-10 text-white lg:flex lg:flex-col">
        <SisgesLogo
          variant="lockup"
          className="relative z-10"
          textClassName="text-2xl font-bold tracking-tight text-white"
        />
        <div className="relative z-10 my-auto max-w-md py-16">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Gestão escolar integrada
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-[-0.04em] xl:text-5xl">
            Tudo o que a escola precisa, em um só lugar.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-[var(--color-sidebar-muted)]">
            Acompanhe alunos, turmas, notas, aulas e comunicados com clareza e
            segurança.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-sm text-white/90">
            {[
              "Rotinas organizadas",
              "Informações sempre acessíveis",
              "Experiência simples para toda a comunidade",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <FiCheckCircle
                  size={18}
                  className="shrink-0 text-[var(--color-accent)]"
                  aria-hidden
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-[var(--color-sidebar-muted)]">
          Sistema de Gestão Escolar
        </p>
      </section>

      <section className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="absolute right-5 top-5 text-[var(--color-text-primary)] sm:right-8 sm:top-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <SisgesLogo
              variant="lockup"
              textClassName="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
            />
          </div>
          <div className="mb-8">
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              Bem-vindo de volta
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[var(--color-text-primary)]">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Entre com as credenciais fornecidas pela sua instituição.
            </p>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <Alert type="error">{error}</Alert>}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Insira seu email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  icon={<FiMail size={17} />}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  icon={<FiLock size={17} />}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:border-[var(--color-primary-hover)] hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Spinner size="sm" />}
                {isLoading ? "Entrando..." : "Entrar"}
                {!isLoading && <FiArrowRight size={17} aria-hidden />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
