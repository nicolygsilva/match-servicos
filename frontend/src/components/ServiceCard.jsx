import React from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  const rating = Number(service.rating || 0).toFixed(1);
  const distance = Number(service.distance || 0).toFixed(1);
  const reviewCount = Array.isArray(service.reviews) ? service.reviews.length : 0;
  const publicReviews = Array.isArray(service.reviews)
    ? service.reviews.slice(0, 2)
    : [];

  const handleCreateRequest = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: user._id,
        prestador: service._id,
        service: service.service
      })
    });

    const data = await res.json();

    navigate(`/request/${data._id}`, {
      state: { requestId: data._id }
    });
  };

  return (
    <article className="service-card">
      <div className="service-card-top">
        <div className="service-avatar" aria-hidden="true">
          {service.name?.charAt(0) || "P"}
        </div>

        <div>
          <h3>{service.name}</h3>
          <p className="service-category">{service.service}</p>
        </div>
      </div>

      <div className="service-meta">
        <span className="service-chip">⭐ {rating}</span>
        <span className="service-chip">{distance} km</span>
        <span className="service-chip">{service.neighborhood || service.city}</span>
        <span className="service-chip">{reviewCount} avaliações</span>
      </div>

      <div className="service-budget">
        <strong>
          Orçamento médio:{" "}
          {service.budgetAverage
            ? `R$ ${Number(service.budgetAverage).toFixed(0)}`
            : "a combinar"}
        </strong>
        <span>valor médio informado pelo prestador para esse tipo de serviço</span>
      </div>

      <p className="service-description">
        {service.bio ||
          "Atendimento rapido, perfil avaliado e disponibilidade para servicos residenciais."}
      </p>

      {publicReviews.length > 0 && (
        <div className="public-reviews">
          {publicReviews.map(review => (
            <article key={review.id} className="public-review-item">
              <div className="review-card-top">
                <strong>{review.authorName}</strong>
                <span>⭐ {Number(review.rating).toFixed(1)}</span>
              </div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      )}

      <button onClick={handleCreateRequest} className="primary-button">
        Dar match e abrir chat
      </button>
    </article>
  );
};

export default ServiceCard;
