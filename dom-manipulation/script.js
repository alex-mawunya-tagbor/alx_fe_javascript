// A simple array of quote objects to start with.
// This array will be used only if no quotes are found in local storage.
let quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Inspiration",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "Technology",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Motivation",
  },
  {
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
    category: "History",
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    category: "Life",
  },
];

// Mock server data to simulate a remote API endpoint.
const serverQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Inspiration",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Motivation",
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    category: "Life",
  },
  {
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
    category: "History",
  },
  {
    text: "Change your thoughts and you change your world.",
    author: "Norman Vincent Peale",
    category: "Motivation",
  },
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    saveQuotes();
  }
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function showRandomQuote(quoteArray = quotes) {
  if (quoteArray.length === 0) {
    document.getElementById("quoteText").textContent = "No quotes available for this category. Add a new one!";
    document.getElementById("quoteAuthor").textContent = "";
    document.getElementById("quoteCategory").textContent = "";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quoteArray.length);
  const randomQuote = quoteArray[randomIndex];
  document.getElementById("quoteText").textContent = `"${randomQuote.text}"`;
  document.getElementById("quoteAuthor").textContent = `— ${randomQuote.author}`;
  document.getElementById("quoteCategory").textContent = randomQuote.category;
}

function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastFilter", selectedCategory);
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  showRandomQuote(filteredQuotes);
}

function createAddQuoteForm() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteAuthor = document.getElementById("newQuoteAuthor");
  const newQuoteCategory = document.getElementById("newQuoteCategory");
  const messageElement = document.getElementById("message");

  if (
    newQuoteText.value.trim() === "" ||
    newQuoteAuthor.value.trim() === "" ||
    newQuoteCategory.value.trim() === ""
  ) {
    messageElement.textContent = "All fields are required!";
    messageElement.className = "mt-4 text-center text-sm font-medium text-red-600";
    alert("All fields are required!");
    return;
  }

  const newQuote = {
    text: newQuoteText.value.trim(),
    author: newQuoteAuthor.value.trim(),
    category: newQuoteCategory.value.trim(),
  };

  quotes.unshift(newQuote);
  saveQuotes();
  postQuoteToServer(newQuote);

  newQuoteText.value = "";
  newQuoteAuthor.value = "";
  newQuoteCategory.value = "";

  messageElement.textContent = "Quote added successfully!";
  messageElement.className = "mt-4 text-center text-sm font-medium text-green-600";
  alert("Quote added successfully!");

  populateCategories();
  filterQuotes();

  setTimeout(() => {
    messageElement.textContent = "";
  }, 3000);
}

function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', 'quotes.json');
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        const existingQuotes = new Set(quotes.map(q => `${q.text}-${q.author}`));
        const newUniqueQuotes = importedQuotes.filter(q => !existingQuotes.has(`${q.text}-${q.author}`));
        quotes.push(...newUniqueQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        const messageElement = document.getElementById("message");
        messageElement.textContent = `${newUniqueQuotes.length} quotes imported successfully!`;
        messageElement.className = "mt-4 text-center text-sm font-medium text-green-600";
        alert(`${newUniqueQuotes.length} quotes imported successfully!`);
        setTimeout(() => {
          messageElement.textContent = "";
        }, 3000);
      } else {
        throw new Error("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (e) {
      const messageElement = document.getElementById("message");
      messageElement.textContent = "Error importing file: " + e.message;
      messageElement.className = "mt-4 text-center text-sm font-medium text-red-600";
      alert("Error importing file: " + e.message);
      setTimeout(() => {
        messageElement.textContent = "";
      }, 5000);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    if (!response.ok) throw new Error("Failed to post quote to server.");
    const data = await response.json();
    console.log("Quote posted successfully:", data);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

async function fetchQuotesFromServer() {
  const messageElement = document.getElementById("message");
  messageElement.textContent = "Syncing with server...";
  messageElement.className = "mt-4 text-center text-sm font-medium text-gray-600";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();
    const serverQuotes = serverData.map(post => ({
      text: post.body,
      author: `User ${post.userId}`,
      category: "placeholder",
    }));
    const localQuotesMap = new Map();
    quotes.forEach((quote, index) => {
      const key = `${quote.text}-${quote.author}`;
      localQuotesMap.set(key, { quote, index });
    });
    let addedCount = 0;
    serverQuotes.forEach(serverQuote => {
      const key = `${serverQuote.text}-${serverQuote.author}`;
      if (!localQuotesMap.has(key)) {
        quotes.push(serverQuote);
        addedCount++;
      }
    });
    saveQuotes();
    populateCategories();
    filterQuotes();
    messageElement.textContent = "Quotes synced with server!";
    messageElement.className = "mt-4 text-center text-sm font-medium text-green-600";
    alert("Quotes synced with server!");
  } catch (error) {
    messageElement.textContent = "Error syncing with server.";
    messageElement.className = "mt-4 text-center text-sm font-medium text-red-600";
    alert("Error syncing with server.");
    console.error("Sync error:", error);
  } finally {
    setTimeout(() => {
      messageElement.textContent = "";
    }, 5000);
  }
}

document.getElementById("newQuote").addEventListener("click", () => {
  createAddQuoteForm();
});

document.getElementById("syncQuotes").addEventListener("click", fetchQuotesFromServer);

window.onload = function() {
  loadQuotes();
  populateCategories();
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    document.getElementById("categoryFilter").value = lastFilter;
  }
  filterQuotes();
  setInterval(fetchQuotesFromServer, 30000);
};
