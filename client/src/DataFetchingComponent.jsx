import React, { use } from 'react';

// Function to fetch data
async function fetchData() {
  // const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

const DataFetchingComponent = () => {
  // `use()` suspends the component until the promise resolves
  const data = use(fetchData());

  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DataFetchingComponent;