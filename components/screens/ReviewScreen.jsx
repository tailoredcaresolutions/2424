import React from "react";

const ReviewScreen = ({ pairs, onSubmit }) => (
  <div style={{ padding: 40 }}>
    <h2>Review Your Report</h2>
    <ul>
      {pairs.map((p, i) => (
        <li key={i}>
          <strong>{p.q}</strong>: {p.a}
        </li>
      ))}
    </ul>
    <button onClick={onSubmit}>Submit Report</button>
  </div>
);

export default ReviewScreen;
