import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
        return;
      }

      setError(data.msg || "Nao foi possivel entrar no sistema.");
    } catch (err) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <span className="auth-badge">App Serviços</span>
        <h1>Contrate com mais confiança e encontre profissionais por perto.</h1>
        <p>
          Veja prestadores avaliados, compare serviços e acompanhe suas
          solicitações em um painel mais claro e moderno.
        </p>

        <div className="auth-highlights">
          <div className="auth-highlight-card">
            <strong>+120 profissionais</strong>
            <span>eletricista, limpeza, reformas e mais</span>
          </div>
          <div className="auth-highlight-card">
            <strong>Avaliação verificada</strong>
            <span>decida com base em reputação e distância</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card-header">
            <span className="auth-kicker">Acesse sua conta</span>
            <h2>Entrar</h2>
            <p>Use seu email e senha para continuar.</p>
          </div>

          {error && <div className="form-alert">{error}</div>}

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-footer">
            Ainda nao tem conta? <Link to="/register">Criar cadastro</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;
