import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";

const API_URL = "http://localhost:5001/api";

const distancePresets = [1.2, 2.4, 3.1, 4.8, 6.3];
const ratingPresets = [4.9, 4.8, 4.7, 4.6, 5.0];

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (originLat, originLng, targetLat, targetLng) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(targetLat - originLat);
  const dLng = toRadians(targetLng - originLng);
  const lat1 = toRadians(originLat);
  const lat2 = toRadians(targetLat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(1));
};

const calculateRelativeDistance = (cliente, prestador, index) => {
  const sameAddress =
    normalizeText(cliente?.address) &&
    normalizeText(cliente?.address) === normalizeText(prestador?.address) &&
    normalizeText(cliente?.neighborhood) === normalizeText(prestador?.neighborhood) &&
    normalizeText(cliente?.city) === normalizeText(prestador?.city);

  if (sameAddress) {
    return 0;
  }

  const clientLat = toNumberOrNull(cliente?.latitude);
  const clientLng = toNumberOrNull(cliente?.longitude);
  const providerLat = toNumberOrNull(prestador?.latitude);
  const providerLng = toNumberOrNull(prestador?.longitude);

  if (
    clientLat !== null &&
    clientLng !== null &&
    providerLat !== null &&
    providerLng !== null
  ) {
    return haversineDistanceKm(clientLat, clientLng, providerLat, providerLng);
  }

  const sameNeighborhood =
    normalizeText(cliente?.neighborhood) &&
    normalizeText(cliente?.neighborhood) === normalizeText(prestador?.neighborhood) &&
    normalizeText(cliente?.city) === normalizeText(prestador?.city);

  if (sameNeighborhood) {
    return 1.4;
  }

  const sameCity =
    normalizeText(cliente?.city) &&
    normalizeText(cliente?.city) === normalizeText(prestador?.city);

  if (sameCity) {
    return 5.8;
  }

  return typeof prestador.distance === "number"
    ? prestador.distance
    : distancePresets[index % distancePresets.length];
};

const normalizePrestador = (prestador, index, cliente) => ({
  ...prestador,
  rating:
    typeof prestador.rating === "number"
      ? prestador.rating
      : ratingPresets[index % ratingPresets.length],
  distance: calculateRelativeDistance(cliente, prestador, index),
  service: prestador.service || "Servico residencial",
  city: prestador.city || "Na sua regiao"
});

const normalizeCliente = (cliente, index, prestador) => ({
  ...cliente,
  distance: calculateRelativeDistance(cliente, prestador, index),
  service: cliente.service || "Serviço não informado",
  city: cliente.city || "Na sua regiao"
});

const getChatStatusMeta = (request) => {
  const hasBudget = Boolean(request?.budget);
  const hasMessages = Array.isArray(request?.messages) && request.messages.length > 0;

  if (hasBudget) {
    return {
      label: "orçamento enviado",
      badgeClassName: "status-badge status-budget",
      cardClassName: "request-card request-card-budget"
    };
  }

  if (hasMessages) {
    return {
      label: "aguardando resposta",
      badgeClassName: "status-badge status-waiting",
      cardClassName: "request-card request-card-waiting"
    };
  }

  return {
    label: "match iniciado",
    badgeClassName: "status-badge status-match",
    cardClassName: "request-card request-card-match"
  };
};

const opportunityMeta = {
  label: "oportunidade nova",
  badgeClassName: "status-badge status-opportunity",
  cardClassName: "request-card request-card-opportunity"
};

const Home = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCreateMatch = async ({ clientId, prestadorId, service }) => {
    const res = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: clientId,
        prestador: prestadorId,
        service
      })
    });

    const data = await res.json();

    navigate(`/request/${data._id}`, {
      state: { requestId: data._id }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Carrega usuário logado
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Buscar dados do backend
  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const usersRes = await fetch(`${API_URL}/users`);
        const usersData = await usersRes.json();

        let requestsData = [];

        try {
          const requestsRes = await fetch(`${API_URL}/requests`);
          if (requestsRes.ok) {
            requestsData = await requestsRes.json();
          }
        } catch (requestError) {
          console.warn("Nao foi possivel carregar solicitacoes:", requestError);
        }

        // GARANTE ARRAY
        const usersArray = Array.isArray(usersData) ? usersData : [];
        const requestsArray = Array.isArray(requestsData) ? requestsData : [];
        const currentUser =
          usersArray.find(item => item._id === user._id) ||
          usersArray.find(item => item.email === user.email) ||
          user;

        // Filtra prestadores
        const onlyPrestadores = usersArray
          .filter(u => u.type === "prestador")
          .map((prestador, index) =>
            normalizePrestador(prestador, index, currentUser)
          );

        setAllUsers(usersArray);
        setPrestadores(onlyPrestadores);
        setRequests(requestsArray);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-loading">Carregando painel...</div>
      </div>
    );
  }

  // CLIENTE
  if (user.type === "cliente") {
    const topRated = [...prestadores].sort((a, b) => b.rating - a.rating);
    const meusMatches = (requests || []).filter(
      request => request.client && request.client._id === user._id
    );
    const averageDistance = prestadores.length
      ? (
          prestadores.reduce((sum, item) => sum + item.distance, 0) /
          prestadores.length
        ).toFixed(1)
      : "0.0";

    return (
      <main className="page-shell">
        <header className="topbar">
          <div>
            <span className="section-badge">Sessão ativa</span>
            <h2>{user.name}</h2>
            <p className="topbar-subtitle">Cliente conectado</p>
          </div>
          <div className="topbar-actions">
            <button
              onClick={() => navigate("/profile")}
              className="ghost-button"
            >
              Meu perfil
            </button>
            <button onClick={handleLogout} className="ghost-button">
              Sair
            </button>
          </div>
        </header>

        <section className="home-hero">
          <div>
            <span className="section-badge">Painel do cliente</span>
            <h1>Prestadores bem avaliados e perto de voce.</h1>
            <p>
              Escolha com base em especialidade, reputação e proximidade para
              pedir atendimento, ver avaliações públicas e iniciar um match com
              chat para conversar sobre o serviço.
            </p>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <strong>{prestadores.length}</strong>
              <span>prestadores disponíveis</span>
            </article>
            <article className="stat-card">
              <strong>{averageDistance} km</strong>
              <span>distância média</span>
            </article>
            <article className="stat-card">
              <strong>
                {topRated[0] ? topRated[0].rating.toFixed(1) : "0.0"}
              </strong>
              <span>melhor avaliação</span>
            </article>
          </div>
        </section>

        <section className="section-header">
          <div>
            <h2>Profissionais em destaque</h2>
          </div>
        </section>

        {meusMatches.length > 0 && (
          <>
            <section className="section-header">
              <div>
                <h2>Seus chats ativos</h2>
                <p>Retome conversas e acompanhe orçamentos quando quiser.</p>
              </div>
            </section>

            <div className="request-list">
              {meusMatches.map(match => (
                <article
                  key={match._id}
                  className={getChatStatusMeta(match).cardClassName}
                >
                  <div>
                    <h2>{match.service || "Serviço não informado"}</h2>
                    <p>Prestador: {match.prestador?.name || "Prestador"}</p>
                    <p>
                      <span className={getChatStatusMeta(match).badgeClassName}>
                        {getChatStatusMeta(match).label}
                      </span>
                    </p>
                    <p>
                      Orçamento:{" "}
                      {match.budget ? `R$ ${match.budget}` : "ainda não definido"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/request/${match._id}`, {
                        state: { requestId: match._id }
                      })
                    }
                    className="secondary-button"
                  >
                    Abrir chat
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {prestadores.length === 0 ? (
          <div className="empty-state">
            Nenhum prestador encontrado no momento.
          </div>
        ) : (
          <div className="service-grid">
            {prestadores.map(prestador => (
              <ServiceCard key={prestador._id} service={prestador} />
            ))}
          </div>
        )}
      </main>
    );
  }

  // PRESTADOR
  if (user.type === "prestador") {
    const minhasSolicitacoes = (requests || []).filter(
      r => r.prestador && r.prestador._id === user._id
    );
    const clientesProximos = allUsers
      .filter(item => item.type === "cliente" && item._id !== user._id)
      .map((cliente, index) => {
        const existingRequest = minhasSolicitacoes.find(
          request => request.client && request.client._id === cliente._id
        );

        return {
          ...normalizeCliente(cliente, index, user),
          existingRequest
        };
      })
      .sort((a, b) => a.distance - b.distance);

    return (
      <main className="page-shell">
        <header className="topbar">
          <div>
            <span className="section-badge">Sessão ativa</span>
            <h2>{user.name}</h2>
            <p className="topbar-subtitle">Prestador conectado</p>
          </div>
          <div className="topbar-actions">
            <button
              onClick={() => navigate("/profile")}
              className="ghost-button"
            >
              Meu perfil
            </button>
            <button onClick={handleLogout} className="ghost-button">
              Sair
            </button>
          </div>
        </header>

        <section className="home-hero provider-hero">
          <div>
            <span className="section-badge">Painel do prestador</span>
            <h1>Solicitações recebidas e próximos atendimentos.</h1>
            <p>
              Acompanhe pedidos abertos, veja o cliente responsável e entre em
              cada solicitação para responder.
            </p>
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <strong>{minhasSolicitacoes.length}</strong>
              <span>solicitações recebidas</span>
            </article>
          </div>
        </section>

        <section className="section-header">
          <div>
            <h2>Clientes próximos</h2>
            <p>Veja quem está buscando serviço na sua região e dê match se houver interesse.</p>
          </div>
        </section>

        {clientesProximos.length === 0 ? (
          <div className="empty-state">
            Nenhum cliente próximo procurando serviço no momento.
          </div>
        ) : (
          <div className="request-list">
            {clientesProximos.map(cliente => (
              <article
                key={cliente._id}
                className={
                  cliente.existingRequest
                    ? getChatStatusMeta(cliente.existingRequest).cardClassName
                    : opportunityMeta.cardClassName
                }
              >
                <div>
                  <h2>{cliente.name || "Cliente"}</h2>
                  <p>Serviço procurado: {cliente.service || "Não informado"}</p>
                  <p>
                    Localidade: {cliente.neighborhood || "Bairro não informado"}
                    {cliente.city ? ` - ${cliente.city}` : ""}
                  </p>
                  <p>Distância estimada: {cliente.distance.toFixed(1)} km</p>
                  <p>
                    <span
                      className={
                        cliente.existingRequest
                          ? getChatStatusMeta(cliente.existingRequest).badgeClassName
                          : opportunityMeta.badgeClassName
                      }
                    >
                      {cliente.existingRequest
                        ? "já existe match com este cliente"
                        : opportunityMeta.label}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() =>
                    cliente.existingRequest
                      ? navigate(`/request/${cliente.existingRequest._id}`, {
                          state: { requestId: cliente.existingRequest._id }
                        })
                      : handleCreateMatch({
                          clientId: cliente._id,
                          prestadorId: user._id,
                          service: cliente.service || user.service || "Contato direto"
                        })
                  }
                  className="secondary-button"
                >
                  {cliente.existingRequest ? "Abrir chat" : "Dar match"}
                </button>
              </article>
            ))}
          </div>
        )}

        <section className="section-header">
          <div>
            <h2>Chats ativos</h2>
            <p>Conversas já iniciadas com clientes que deram match com você.</p>
          </div>
        </section>

        {minhasSolicitacoes.length === 0 ? (
          <div className="empty-state">Nenhum chat ativo ainda.</div>
        ) : (
          <div className="request-list">
            {minhasSolicitacoes.map(req => (
              <article
                key={req._id}
                className={getChatStatusMeta(req).cardClassName}
              >
                <div>
                  <h2>{req.service || "Servico nao informado"}</h2>
                  <p>Cliente: {req.client?.name || "Cliente"}</p>
                  <p>
                    Endereço: {req.client?.address || "Endereço não informado"}
                  </p>
                  <p>
                    Distância estimada:{" "}
                    {typeof req.distanceKm === "number"
                      ? `${req.distanceKm.toFixed(1)} km`
                      : "indisponível"}
                  </p>
                  <p>
                    <span className={getChatStatusMeta(req).badgeClassName}>
                      {getChatStatusMeta(req).label}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/request/${req._id}`, {
                      state: { requestId: req._id }
                    })
                  }
                  className="secondary-button"
                >
                  Abrir chat
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    );
  }

  return null;
};

export default Home;
