import React, { useState } from "react";

const Review = ({ onSubmit, disabled = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (disabled) return;
    if (!comment.trim()) return;
    onSubmit({ rating, comment });
    setRating(5);
    setComment("");
  };

  return (
    <div className="review-box">
      <h3>Deixe sua avaliação</h3>
      <div className="review-row">
        <span>Nota</span>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="review-select"
          disabled={disabled}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Escreva um comentário..."
        className="review-textarea"
        disabled={disabled}
      />
      <button onClick={handleSubmit} className="secondary-button" disabled={disabled}>
        Enviar avaliação
      </button>
    </div>
  );
};

export default Review;
