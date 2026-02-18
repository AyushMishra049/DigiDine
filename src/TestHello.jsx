import { useEffect, useState } from "react";

const TestHello = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHello = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/hello");
        const text = await res.text();
        setMessage(text);
      } catch (err) {
        console.error("Error calling backend:", err);
      }
    };

    fetchHello();
  }, []);

  return (
    <div style={{ padding: 16, border: "1px solid #ccc", margin: 16 }}>
      <h3>Backend Test:</h3>
      <p>{message || "Loading..."}</p>
    </div>
  );
};

export default TestHello;
