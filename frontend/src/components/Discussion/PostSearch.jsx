import { useEffect, useRef, useState } from "react";
import axios from "axios";

function PostSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!trimmedQuery) {
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/discussion/search", {
          params: { keyword: trimmedQuery },
        });

        setSuggestions(
          Array.isArray(response.data.posts) ? response.data.posts.slice(0, 8) : [],
        );
        setError("");
      } catch (searchError) {
        console.error("Search error:", searchError);
        setError("Lỗi tìm kiếm bài đăng.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [trimmedQuery]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setQuery(nextValue);

    if (nextValue.trim()) {
      setLoading(true);
      setError("");
    } else {
      setSuggestions([]);
      setLoading(false);
      setError("");
    }
  };

  const handleSelect = (post) => {
    setQuery(post.title);
    setSuggestions([]);
    if (onSelect) {
      onSelect(post);
    }
  };

  return (
    <div className="post-search-container">
      <input
        type="text"
        className="discussion-input"
        placeholder="Tìm kiếm bài đăng..."
        value={query}
        onChange={handleChange}
      />
      {loading && <div className="search-loading">Đang tìm...</div>}
      {error && <div className="search-error">{error}</div>}
      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((post) => (
            <li key={post.post_id} onClick={() => handleSelect(post)}>
              {post.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PostSearch;
