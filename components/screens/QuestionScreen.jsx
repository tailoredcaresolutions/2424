import React, { useEffect } from "react";
import { useI18n } from "../LanguageProvider";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useTextToSpeech from "../hooks/useTextToSpeech";

const QuestionScreen = ({ q, value, onChange, onNext }) => {
  const { t } = useI18n();
  const { transcript, listening, start, stop, error } = useSpeechRecognition({ lang: "en-CA" });
  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (transcript) onChange(transcript);
  }, [transcript, onChange]);

  useEffect(() => {
    speak(q, "en-CA");
  }, [q, speak]);

  return (
    <div style={{ padding: 40 }}>
      <h2>{q}</h2>
      <textarea
        style={{ width: '100%', maxWidth: 400, height: 100 }}
        placeholder={t.questionPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{String(error)}</p>}
      <div>
        {listening ? (
          <button onClick={stop}>{t.stop || "Stop"}</button>
        ) : (
          <button onClick={start}>{t.speak || "Speak"}</button>
        )}
        <button onClick={onNext}>{t.next}</button>
      </div>
    </div>
  );
};

export default QuestionScreen;
