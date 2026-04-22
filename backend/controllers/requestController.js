import {
  calculateDistanceKm,
  findUserById,
  refreshProviderRating,
  saveUsers
} from "../data/mockUsers.js";

const requests = [];

export const createRequest = async (req, res) => {
  const { client, prestador, service } = req.body;
  const clientUser = findUserById(client);
  const providerUser = findUserById(prestador);

  const request = {
    _id: String(Date.now()),
    client: {
      _id: client,
      name: clientUser?.name || "Cliente",
      address: clientUser?.address || "",
      neighborhood: clientUser?.neighborhood || "",
      city: clientUser?.city || ""
    },
    prestador: {
      _id: prestador,
      name: providerUser?.name || "Prestador",
      address: providerUser?.address || "",
      neighborhood: providerUser?.neighborhood || "",
      city: providerUser?.city || ""
    },
    service,
    status: "match iniciado",
    budget: null,
    distanceKm: calculateDistanceKm(providerUser, clientUser),
    messages: [],
    review: null
  };

  requests.push(request);
  res.status(201).json(request);
};

export const getRequests = async (_req, res) => {
  res.json(requests);
};

export const sendMessage = async (req, res) => {
  const { requestId, sender, text } = req.body;
  const request = requests.find(item => item._id === requestId);

  if (!request) {
    return res.status(404).json({ msg: "Solicitacao nao encontrada" });
  }

  request.messages.push({ sender, text });
  res.json(request);
};

export const sendBudget = async (req, res) => {
  const { requestId, budget } = req.body;
  const request = requests.find(item => item._id === requestId);

  if (!request) {
    return res.status(404).json({ msg: "Solicitacao nao encontrada" });
  }

  request.budget = budget;
  res.json(request);
};

export const sendReview = async (req, res) => {
  const { requestId, authorId, authorName, rating, comment } = req.body;
  const request = requests.find(item => item._id === requestId);

  if (!request) {
    return res.status(404).json({ msg: "Solicitacao nao encontrada" });
  }

  if (request.review) {
    return res.status(400).json({ msg: "Esta solicitacao ja foi avaliada" });
  }

  const provider = findUserById(request.prestador._id);

  if (!provider) {
    return res.status(404).json({ msg: "Prestador nao encontrado" });
  }

  const review = {
    id: `r${Date.now()}`,
    authorId,
    authorName,
    rating: Number(rating || 5),
    comment,
    createdAt: new Date().toISOString()
  };

  provider.reviews = Array.isArray(provider.reviews) ? provider.reviews : [];
  provider.reviews.unshift(review);
  refreshProviderRating(provider);
  saveUsers();

  request.review = review;

  res.status(201).json({
    msg: "Avaliacao enviada com sucesso",
    request,
    provider
  });
};
