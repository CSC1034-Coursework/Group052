const ctx = document.getElementById("myChart");
const sql = `SELECT gender, COUNT(staffID) AS NumberOfStaff
FROM tblStaff
GROUP BY gender;`;

runQuery(sql)
  .then(data => {
    
    const rows = Array.isArray(data) ? data : data.data || [];
    /*If array, use data, add data, else use empty*/
    const labels = rows.map(row => row.gender);
    const values = rows.map(row => row.NumberOfStaff);

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          label: "Gender",
          data: values
        }]
      }, 
      options: {
        responsive: false,
      }
    });
  })
  .catch(error => {
    console.error("Error:", error);
  });