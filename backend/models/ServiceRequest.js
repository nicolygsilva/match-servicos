import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const ServiceRequest = () => {
  const { id } = useParams();
  const location = useLocation();

  const requestId = location.state?.requestId;

  const [request, setRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);

  const chatEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔄 buscar request
  const fetchRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/requests`);
      const data = await res.json();

      const found = data.find(r => r._id === requestId);

      if (found) {
        setRequest(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 carregamento inicial
  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  // 🔁 polling leve (temporário até socket)
  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(() => {
      fetchRequest();
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId]);

  // 🔽 scroll automático
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [request]);

  // 🔐 segurança básica
  if (request && user) {
    const isClient = request.client?._id === user._id;
    const isPrestador = request.prestador?._id === user._id;

    if (!isClient && !isPrestador) {
      return <p className="p-4 text-red-500">Acesso negado</p>;
    }
  }

  // 💬 enviar mensagem
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
          sender: user.name,
          text: message
        })
      });

      const updated = await res.json();

      setRequest(updated);
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // 💰 enviar orçamento (SÓ PRESTADOR)
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
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">Carregando...</p>;
  if (!request) return <p className="p-4">Solicitação não encontrada</p>;

  const isPrestador = user?.type === "prestador";

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">
        Serviço: {request.service}
      </h2>

      <p>Status: {request.status}</p>
      <p className="mb-4">
        Orçamento:{" "}
        <span className="font-bold text-green-600">
          {request.budget ? `R$ ${request.budget}` : "Não definido"}
        </span>
      </p>

      {/* 💬 CHAT */}
      <div className="border p-3 h-64 overflow-y-auto bg-gray-50 rounded shadow">
        {request.messages.length === 0 && (
          <p className="text-gray-500">Nenhuma mensagem ainda</p>
        )}

        {request.messages.map((msg, index) => (
          <div key={index} className="mb-1">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT CHAT */}
      <div className="flex mt-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
        >
          Enviar
        </button>
      </div>

      {/* 💰 ORÇAMENTO (SÓ PRESTADOR) */}
      {isPrestador && (
        <div className="mt-4 border p-3 rounded shadow">
          <h3 className="font-bold mb-2">Enviar Orçamento</h3>

          <div className="flex">
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              placeholder="Digite o valor"
              className="flex-1 border px-2 py-1 rounded"
            />
            <button
              onClick={sendBudget}
              className="ml-2 bg-green-500 text-white px-4 rounded hover:bg-green-600"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequest;