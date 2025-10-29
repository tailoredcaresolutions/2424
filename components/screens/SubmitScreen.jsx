import React from "react";

const SubmitScreen = ({ onRestart }) => (
  <div style={{ paddingTop: 60 }}>
    <h2>Report Submitted!</h2>
    <button onClick={onRestart}>Start New Report</button>
  </div>
);

export default SubmitScreen;
