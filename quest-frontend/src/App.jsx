import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


// Utility function for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
  
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
  
    return debouncedValue;
};

function App() {
    const [query, setQuery] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const debouncedQuery = useDebounce(query, 500); // Delay of 500ms for search

    const fetchQuestions = async () => {
        if (!debouncedQuery) return; // Avoid fetching if query is empty
        setLoading(true);
        try {
            const res = await axios.get('https://questsearch-1.onrender.com/api/questions', {
                params: { title: debouncedQuery, page, limit: 5 }
            });
            setQuestions(res.data.questions);
            setTotalPages(res.data.pages);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [debouncedQuery, page]);

    return (
        <div className="App">
            <h1>QuestSearch</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for questions"
            />
            <button onClick={() => setPage(1)}>Search</button>

            {loading && <p>Loading...</p>}

            <ul>
                {questions.map((question) => (
                    <li key={question._id}>
                        <h3>{question.title}</h3>
                        <p>Type: {question.type}</p>
                        {question.options && (
                            <ul>
                                {question.options.map((option, index) => (
                                    <li key={index}>{option}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            <div>
                <button
                    onClick={() => setPage(Math.max(page - 1, 1))}
                    disabled={page <= 1}
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(Math.min(page + 1, totalPages))}
                    disabled={page >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default App;
