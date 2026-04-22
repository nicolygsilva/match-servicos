import ServiceRequest from "../models/ServiceRequest.js";

export const createRequest = async (req, res) => {
  const { client, prestador, service } = req.body;

  const request = await ServiceRequest.create({
    client,
    prestador,
    service
  });

  res.json(request);
};

export const getRequests = async (req, res) => {
  const requests = await ServiceRequest.find()
    .populate("client")
    .populate("prestador");

  res.json(requests);
};

export const sendMessage = async (req, res) => {
  const { requestId, sender, text } = req.body;

  const request = await ServiceRequest.findById(requestId);

  request.messages.push({ sender, text });
  await request.save();

  res.json(request);
};

export const sendBudget = async (req, res) => {
  const { requestId, budget } = req.body;

  const request = await ServiceRequest.findById(requestId);
  request.budget = budget;

  await request.save();

  res.json(request);
};