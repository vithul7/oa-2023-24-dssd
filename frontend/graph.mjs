const graphDiv = document.getElementById("graph");
const generateGraphButton = document.getElementById("generateGraphButton");
const loadingIndicator = document.getElementById("loadingIndicator");

const layout = {
  title: "Forks On Summer2024-Internships Repository",
  xaxis: {
    title: "Weeks Since First Fork",
    showgrid: false,
    zeroline: false,
  },
  yaxis: {
    title: "Number of Forks",
    showline: false,
  },
};

generateGraphButton.addEventListener("click", () => {
  // Show loading indicator and disable the button
  loadingIndicator.style.display = "block";
  generateGraphButton.disabled = true;

  // Fetch data and generate the graph
  fetch("http://localhost:3000")
    .then(async (res) => {
      const jsonData = await res.json();
      // Create or update the graph
      Plotly.newPlot(graphDiv, [jsonData], layout);
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      // Hide loading indicator and enable the button
      loadingIndicator.style.display = "none";
      generateGraphButton.disabled = false;
    });
});
