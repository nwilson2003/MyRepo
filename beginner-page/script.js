const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
];

function showDate() {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  document.getElementById("date").textContent = formatted;
}

function showRandomQuote() {
  const pick = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = `"${pick.text}"`;
  document.getElementById("author").textContent = `— ${pick.author}`;
}

showDate();
showRandomQuote();
document.getElementById("new-quote").addEventListener("click", showRandomQuote);
