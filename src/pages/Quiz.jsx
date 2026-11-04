import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { getTopics } from "../api/quiz";

export default function Quiz() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getTopics();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <section>
      <div className="w-full px-4 py-3 space-y-2">
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
      </div>
      <div>
        <ul>
          {quiz.map((q) => (
            <li key={q.id}>{q.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
