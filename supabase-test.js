async function run() {
  const url = "https://awoqnfrxdeonqjwxbkzy.supabase.co/rest/v1/properties?select=*";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3b3FuZnJ4ZGVvbnFqd3hia3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTUyNTIsImV4cCI6MjA4Nzc3MTI1Mn0.HG6dC3o33qFpymdQybl6MWtjlwBRRzGH93Xz6oIqdoc";
  
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Properties length:", Array.isArray(data) ? data.length : data);
    if (data.error) console.log("Error:", data.error);
  } catch (e) {
    console.log("Fetch failed:", e);
  }
}
run();
