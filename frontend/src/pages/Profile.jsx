import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, updateUserProfile } from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    name: "",
    service: "",
    bio: "",
    budgetAverage: "",
    zipCode: "",
    address: "",
    neighborhood: "",
    city: "",
    latitude: "",
    longitude: ""
  });
  const [user, setUser] = useState(storedUser);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!storedUser?._id) return;

      const freshUser = await getUserById(storedUser._id);
      setUser(freshUser);
      setForm({
        name: freshUser.name || "",
        email: freshUser.email || storedUser?.email || "",
        service: freshUser.service || "",
        bio: freshUser.bio || "",
        budgetAverage: freshUser.budgetAverage || "",
        zipCode: freshUser.zipCode || "",
        address: freshUser.address || "",
        neighborhood: freshUser.neighborhood || "",
        city: freshUser.city || "",
        latitude: freshUser.latitude ?? "",
        longitude: freshUser.longitude ?? ""
      });
    };

    loadProfile();
  }, [storedUser?._id]);

  const handleChange = (event) => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Seu navegador não oferece suporte à geolocalização.");
      return;
    }

    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm(prev => ({
          ...prev,
          latitude: String(coords.latitude),
          longitude: String(coords.longitude)
        }));
        setLocating(false);
        setMessage("Localização atual preenchida com sucesso.");
      },
      () => {
        setLocating(false);
        setMessage("Não foi possível obter sua localização atual.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const updatedUser = await updateUserProfile(storedUser._id, {
        ...form,
        email: storedUser?.email
      });
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      setMessage(error.message || "Nao foi possivel atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const receivedReviews = Array.isArray(user.reviews) ? user.reviews : [];

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <span className="section-badge">Perfil</span>
          <h2>{user.name}</h2>
          <p className="topbar-subtitle">
            {user.type === "prestador"
              ? "Atualize como seu serviço aparece para os clientes."
              : "Mantenha seu endereço em dia para calcular a proximidade."}
          </p>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate("/")} className="ghost-button">
            Voltar
          </button>
        </div>
      </header>

      <div className="profile-layout">
        <section className="profile-card">
          <div className="section-header">
            <div>
              <h2>{user.type === "prestador" ? "Meu perfil profissional" : "Meus dados"}</h2>
              <p>
                {user.type === "prestador"
                  ? "Inclua apresentação, serviço e localização para melhorar sua vitrine."
                  : "Informe seu endereço e o serviço que procura para aparecer melhor para os prestadores."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <label className="form-field">
              <span>Nome</span>
              <input name="name" value={form.name} onChange={handleChange} />
            </label>

            {user.type === "prestador" && (
              <>
                <label className="form-field">
                  <span>Serviço principal</span>
                  <input
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    placeholder="Ex.: encanamento, limpeza, elétrica"
                  />
                </label>

                <label className="form-field">
                  <span>Sobre você e seu serviço</span>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="profile-textarea"
                    placeholder="Conte experiencia, especialidades e diferencial do atendimento."
                  />
                </label>

                <label className="form-field">
                  <span>Orçamento médio</span>
                  <input
                    name="budgetAverage"
                    type="number"
                    value={form.budgetAverage}
                    onChange={handleChange}
                    placeholder="Ex.: 180"
                  />
                </label>
              </>
            )}

            {user.type === "cliente" && (
              <label className="form-field">
                <span>Serviço procurado</span>
                <input
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  placeholder="Ex.: encanamento, limpeza, pintura"
                />
              </label>
            )}

            <label className="form-field">
              <span>CEP</span>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                placeholder="Ex.: 30110-000"
              />
            </label>

            <label className="form-field">
              <span>Endereço</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rua, número e complemento"
              />
            </label>

            <div className="profile-grid">
              <label className="form-field">
                <span>Bairro</span>
                <input
                  name="neighborhood"
                  value={form.neighborhood}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                <span>Cidade</span>
                <input name="city" value={form.city} onChange={handleChange} />
              </label>
            </div>

            <div className="profile-grid">
              <label className="form-field">
                <span>Latitude</span>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Ex.: -23.55052"
                />
              </label>

              <label className="form-field">
                <span>Longitude</span>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Ex.: -46.633308"
                />
              </label>
            </div>

            <div className="location-actions">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="ghost-button location-button"
                disabled={locating}
              >
                {locating ? "Obtendo localização..." : "Usar minha localização"}
              </button>
              <p className="location-helper">
                O CEP fica salvo no perfil. Para distância mais precisa, use sua
                localização atual ou preencha latitude e longitude.
              </p>
            </div>

            {message && <div className="form-alert profile-message">{message}</div>}

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </section>

        <aside className="profile-card">
          <div className="section-header">
            <div>
              <h2>
                {user.type === "prestador" ? "Avaliações recebidas" : "Resumo da conta"}
              </h2>
              <p>
                {user.type === "prestador"
                  ? "Clientes poderão ver sua reputação antes de solicitar atendimento."
                  : "Seu endereço será usado para estimar a distância para os prestadores."}
              </p>
            </div>
          </div>

          {user.type === "prestador" ? (
            <>
              <div className="rating-summary">
                <strong>⭐ {Number(user.rating || 0).toFixed(1)}</strong>
                <span>{receivedReviews.length} avaliações públicas recebidas</span>
              </div>

              <div className="account-summary budget-summary">
                <p>
                  <strong>Orçamento médio:</strong>{" "}
                  {user.budgetAverage
                    ? `R$ ${Number(user.budgetAverage).toFixed(0)}`
                    : "não informado"}
                </p>
              </div>

              {receivedReviews.length === 0 ? (
                <div className="empty-state">
                  Você ainda não recebeu avaliações.
                </div>
              ) : (
                <div className="review-list">
                  {receivedReviews.map(review => (
                    <article key={review.id} className="review-card">
                      <div className="review-card-top">
                        <strong>{review.authorName}</strong>
                        <span>⭐ {Number(review.rating).toFixed(1)}</span>
                      </div>
                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="account-summary">
              <p>
                <strong>Serviço procurado:</strong> {user.service || "não informado"}
              </p>
              <p>
                <strong>CEP:</strong> {user.zipCode || "não informado"}
              </p>
              <p>
                <strong>Endereço atual:</strong> {user.address || "não informado"}
              </p>
              <p>
                <strong>Bairro:</strong> {user.neighborhood || "não informado"}
              </p>
              <p>
                <strong>Cidade:</strong> {user.city || "não informada"}
              </p>
              <p>
                <strong>Latitude:</strong> {user.latitude ?? "não informada"}
              </p>
              <p>
                <strong>Longitude:</strong> {user.longitude ?? "não informada"}
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};

export default Profile;
