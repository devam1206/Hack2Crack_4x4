import React, { useState } from 'react';
import { fetchGeoData } from '../api/geodata';

const GeoDataDisplay = () => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchData = async () => {
    if (isNaN(lat) || isNaN(lon)) {
      setError('Latitude and Longitude must be valid numbers.');
      setData(null);
      return;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Latitude must be between -90 and 90, and Longitude between -180 and 180.');
      setData(null);
      return;
    }
    try {
      const result = await fetchGeoData(parseFloat(lat), parseFloat(lon));
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please check the coordinates.');
      setData(null);
    }
  };

  return (
    <div>
      <h1>GeoData Fetcher</h1>
      <input
        type="text"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />
      <input
        type="text"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
      />
      <button onClick={handleFetchData}>Fetch Data</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && (
        <pre style={{ textAlign: 'left' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default GeoDataDisplay;
