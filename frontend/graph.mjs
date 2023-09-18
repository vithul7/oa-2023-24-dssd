const graphDiv = document.getElementById("graph");

const layout = {
    title: 'Forks On Simplify Repository',
    xaxis: {
      title: 'Weeks Since First Fork',
      showgrid: false,
      zeroline: false
    },
    yaxis: {
      title: 'Number of Forks',
      showline: false
    }
  };




fetch(
    "https://forks-for-github-repositories.onrender.com/" //use "http://localhost:3000" if running sample express backend locally, or replace with your own backend endpoint url
).then(async res => {
    Plotly.newPlot( graphDiv, [ await res.json() ], layout); 
})

// https://oa-2023-24-backend.onrender.com

