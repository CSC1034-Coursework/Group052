/*Perhaps better to just have 1 js file linking to database? Look in to later.
Otherwise you get redeclaration error
*/
const runQuery = async (sql) => {
        const url = "https://sbrown635.webhosting1.eeecs.qub.ac.uk/dbConnector.php";
        const response = await fetch(url, {
             method: "POST",
             body: new URLSearchParams({
             query: sql
         })
        });

  if (!response.ok) {
    throw new Error("HTTP error " + response.status);
  }

  return await response.json();
};