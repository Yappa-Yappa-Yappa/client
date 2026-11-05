import { Brain, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getTopics, getPlayQuestions, submitAnswer } from "../api/quiz";

function Header() {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-2xl flex justify-center items-center bg-rose-500/50">
        <Brain className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-indigo-500 uppercase text-xs font-bold">
          Exercise your brain with
        </h3>
        <h1 className="text-2xl font-bold">Quizzy</h1>
      </div>
    </div>
  );
}

function TopicList({ onSelect }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopics(await getTopics());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;
  if (topics.length === 0)
    return <p className="text-sm text-neutral-500">No topics yet.</p>;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {topics.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => onSelect(t)}
            className="w-full rounded-xl border border-black/10 bg-white/60 p-4 text-left font-semibold shadow-sm transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/10 dark:border-neutral-800 dark:bg-neutral-900/60"
          >
            {t.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Play({ topic, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getPlayQuestions(topic.id);
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [topic.id, round]);

  const playAgain = () => {
    setLoading(true);
    setError(null);
    setIndex(0);
    setScore(0);
    setResult(null);
    setPicked(null);
    setRound((r) => r + 1);
  };

  const choose = async (option) => {
    if (result || submitting) return;
    setPicked(option);
    setSubmitting(true);
    try {
      const res = await submitAnswer(questions[index].id, option);
      setResult(res);
      if (res.correct) setScore((s) => s + 1);
    } catch (err) {
      setError(err.message);
      setPicked(null);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setResult(null);
    setPicked(null);
  };

  const optionClass = (option) => {
    const base =
      "w-full rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-default";
    if (!result)
      return `${base} border-black/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 dark:border-neutral-800`;
    if (option === result.answer)
      return `${base} border-green-500 bg-green-500/15`;
    if (option === picked) return `${base} border-red-500 bg-red-500/15`;
    return `${base} border-black/10 opacity-60 dark:border-neutral-800`;
  };

  const back = (
    <button
      onClick={onExit}
      className="flex items-center gap-1 text-sm text-neutral-500 hover:text-indigo-500"
    >
      <ArrowLeft className="w-4 h-4" /> Topics
    </button>
  );

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (error)
    return (
      <div className="space-y-3">
        {back}
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  if (questions.length === 0)
    return (
      <div className="space-y-3">
        {back}
        <p className="text-sm text-neutral-500">
          No questions in {topic.name} yet.
        </p>
      </div>
    );

  if (index >= questions.length)
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-bold">{topic.name} complete</h2>
        <p className="text-4xl font-bold text-indigo-500">
          {score}/{questions.length}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={playAgain}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Play again
          </button>
          <button
            onClick={onExit}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold dark:border-neutral-800"
          >
            Topics
          </button>
        </div>
      </div>
    );

  const q = questions[index];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {back}
        <span className="text-xs font-bold uppercase text-neutral-500">
          {index + 1} / {questions.length} · Score {score}
        </span>
      </div>
      <h2 className="text-lg font-semibold">{q.text}</h2>
      <ul className="space-y-2">
        {q.options.map((option) => (
          <li key={option}>
            <button
              onClick={() => choose(option)}
              disabled={!!result || submitting}
              className={optionClass(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      {result && (
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-semibold ${
              result.correct ? "text-green-500" : "text-red-500"
            }`}
          >
            {result.correct ? "Correct!" : `Wrong. Answer: ${result.answer}`}
          </p>
          <button
            onClick={next}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            {index + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Quiz() {
  const [topic, setTopic] = useState(null);

  return (
    <section className="w-full space-y-5 px-4 py-3">
      <Header />
      {topic ? (
        <Play topic={topic} onExit={() => setTopic(null)} />
      ) : (
        <TopicList onSelect={setTopic} />
      )}
    </section>
  );
}
