import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    type: "cliente",
    service: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Erro ao cadastrar");
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <span className="auth-badge">Novo cadastro</span>
        <h1>Crie seu perfil e comece a contratar ou atender hoje.</h1>
        <p>
          Clientes encontram profissionais com mais facilidade e prestadores
          ganham uma vitrine melhor para seus servicos.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-kicker">Criar conta</span>
            <h2>Cadastro</h2>
            <p>Preencha seus dados para acessar a plataforma.</p>
          </div>

          {error && <div className="form-alert">{error}</div>}

          <label className="form-field">
            <span>Nome</span>
            <input name="name" placeholder="Seu nome" onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              name="password"
              type="password"
              placeholder="Crie uma senha"
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Perfil</span>
            <select name="type" onChange={handleChange}>
              <option value="cliente">Cliente</option>
              <option value="prestador">Prestador</option>
            </select>
          </label>

          {form.type === "prestador" && (
            <label className="form-field">
              <span>Servico principal</span>
              <input
                name="service"
                placeholder="Ex.: eletrica, limpeza, pintura"
                onChange={handleChange}
              />
            </label>
          )}

          <button onClick={handleRegister} className="primary-button">
            Cadastrar
          </button>

          <p className="auth-footer">
            Ja tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
