import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Review from "../components/Review";
import { submitRequestReview } from "../services/api";

const API_URL = "http://localhost:5001/api";

const ServiceRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const requestId = location.state?.requestId || id;
  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!requestId) {
    return <p className="p-4 text-red-500">Erro: requestId não encontrado</p>;
  }

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`${API_URL}/requests`);
        const data = await res.json();
        const found = data.find(item => item._id === requestId);
        setRequest(found || null);
      } catch (err) {
        console.error("Erro ao buscar request:", err);
      }
    };

    fetchRequest();
    const interval = setInterval(fetchRequest, 4000);

    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [request]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await fetch(`${API_URL}/requests/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId,
          sender: user?.name || "Usuario",
          text: message
        })
      });

      const updated = await res.json();
      setRequest(updated);
      setMessage("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const sendBudget = async () => {
    if (!budgetInput) return;

    try {
      const res = await fetch(`${API_URL}/requests/budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId,
          budget: Number(budgetInput)
        })
      });

      const updated = await res.json();
      setRequest(updated);
      setBudgetInput("");
    } catch (err) {
      console.error("Erro ao enviar orçamento:", err);
    }
  };

  if (!request) {
    return <p className="p-4">Carregando ou solicitação não encontrada...</p>;
  }

  const isPrestador = user?.type === "prestador";
  const canReview =
    user?.type === "cliente" &&
    user?._id === request.client?._id &&
    !request.review;

  const handleSubmitReview = async ({ rating, comment }) => {
    try {
      const data = await submitRequestReview({
        requestId,
        authorId: user._id,
        authorName: user.name,
        rating,
        comment
      });

      setRequest(data.request);
      setFeedbackMessage("Avaliação pública enviada com sucesso.");
    } catch (error) {
      setFeedbackMessage(error.message || "Não foi possível enviar a avaliação.");
    }
  };

  return (
    <main className="page-shell request-page">
      <header className="topbar">
        <div>
          <span className="section-badge">Match e chat</span>
          <h2>Serviço: {request.service || "N/A"}</h2>
          <p className="topbar-subtitle">
            Conversem pelo chat, alinhem detalhes e cheguem a um orçamento.
          </p>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate("/")} className="ghost-button">
            Voltar para a home
          </button>
          <button onClick={() => navigate("/profile")} className="ghost-button">
            Meu perfil
          </button>
        </div>
      </header>

      <section className="request-detail-card">
        <h2>Serviço: {request.service || "N/A"}</h2>
        <p>Status: {request.status || "N/A"}</p>
        <p>
          Distância estimada:{" "}
          {typeof request.distanceKm === "number"
            ? `${request.distanceKm.toFixed(1)} km`
            : "indisponível"}
        </p>

        {isPrestador && (
          <p>Endereço do cliente: {request.client?.address || "Não informado"}</p>
        )}

        <p>
          Orçamento combinado:{" "}
          <strong>
            {request.budget ? `R$ ${request.budget}` : "Ainda não definido"}
          </strong>
        </p>

        <div className="request-chat-box">
          {(request.messages || []).length === 0 && (
            <p className="muted-copy">
              O match foi criado. Use o chat para alinhar detalhes do serviço.
            </p>
          )}

          {(request.messages || []).map((msg, index) => (
            <div key={index} className="request-message">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="request-chat-row">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="request-input"
            placeholder="Digite uma mensagem..."
          />
          <button onClick={sendMessage} className="secondary-button">
            Enviar
          </button>
        </div>

        {isPrestador && (
          <div className="request-budget-box">
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              className="request-input"
              placeholder="Valor"
            />
            <button onClick={sendBudget} className="secondary-button">
              Enviar orçamento
            </button>
          </div>
        )}

        {canReview && <Review onSubmit={handleSubmitReview} />}

        {request.review && (
          <div className="review-card submitted-review">
            <div className="review-card-top">
              <strong>Avaliação pública enviada</strong>
              <span>⭐ {Number(request.review.rating).toFixed(1)}</span>
            </div>
            <p>{request.review.comment}</p>
          </div>
        )}

        {feedbackMessage && <div className="form-alert profile-message">{feedbackMessage}</div>}
      </section>
    </main>
  );
};

export default ServiceRequest;
