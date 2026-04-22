import React, { useState } from "react";

const Budget = ({ budget, onSendBudget }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim() === "") return;
    onSendBudget(parseFloat(value));
    setValue("");
  };

  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="font-bold mb-2">Orçamento atual: {budget ? `R$ ${budget}` : "Nenhum"}</h3>
      <input
        type="number"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Digite seu orçamento"
        className="border rounded px-2 py-1 mr-2"
      />
      <button onClick={handleSend} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
        Enviar Orçamento
      </button>
    </div>
  );
};

export default Budget;