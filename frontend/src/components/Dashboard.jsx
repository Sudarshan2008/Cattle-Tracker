import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  // ✅ Call backend API to get coordinates
 // Replace your previous fetch useEffect with this one
useEffect(() => {
  const fetchCoordinates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/track/find');
      // 1) inspect the full response structure in console
      console.log('[fetchCoordinates] full response:', res);

      // 2) try multiple common paths to the feeds array
      const maybeFeeds =
        res?.data?.feeds ||            // direct ThingSpeak JSON: { feeds: [...] }
        res?.data?.data?.feeds ||     // backend wrapped: { data: { feeds: [...] } }
        res?.data ||                  // maybe your backend returns feeds as root (check in console)
        null;

      // If maybeFeeds is an object (not array) but contains feeds property, use it
      const feeds = Array.isArray(maybeFeeds)
        ? maybeFeeds
        : Array.isArray(maybeFeeds?.feeds)
        ? maybeFeeds.feeds
        : null;

      if (!feeds || feeds.length === 0) {
        console.warn('[fetchCoordinates] no feeds found or feeds empty:', maybeFeeds);
        return;
      }

      // 3) get latest feed (last element)
      const lastEntry = feeds[feeds.length - 1];

      console.log('[fetchCoordinates] lastEntry:', lastEntry);

      // 4) parse floats and only set if valid numbers
      const lat = parseFloat(lastEntry.field1 ?? lastEntry.lattitude ?? lastEntry.latitude ?? lastEntry.lat);
      const lng = parseFloat(lastEntry.field2 ?? lastEntry.longitude ?? lastEntry.long ?? lastEntry.lng);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setLatitude(lat);
        setLongitude(lng);
        console.log('[fetchCoordinates] set lat/lng to', lat, lng);
      } else {
        console.warn('[fetchCoordinates] lastEntry did not contain valid numeric lat/lng:', lastEntry);
      }
    } catch (err) {
      // helpful debug logs
      console.error('[fetchCoordinates] error fetching coordinates:', err);
    }
  };

  fetchCoordinates();
  const interval = setInterval(fetchCoordinates, 10000); // optional live refresh
  return () => clearInterval(interval);
}, []);


  const cattle = [
    {
      id: 'C001',
      name: 'Bella',
      location: { lat: latitude, lng: longitude },
      status: 'Healthy',
    }
  ];

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBxIVH5kP4ETGkzkSaM1Yj3mfbbAobe4Ro',
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  if (!isLoaded) return <div className="text-center mt-10">Loading map...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">Cattle Tracker Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="h-[400px] w-full mb-6 rounded-xl overflow-hidden shadow-lg">
        <GoogleMap
          center={{ lat: latitude || 23.2599, lng: longitude || 77.4126 }}
          zoom={12}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          {cattle.map((c) => (
            <Marker key={c.id} position={c.location} label={c.name} />
          ))}
        </GoogleMap>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cattle.map((c) => (
          <div key={c.id} className="p-4 border rounded-lg bg-white shadow">
            <h2 className="text-lg font-bold">{c.name}</h2>
            <p>ID: {c.id}</p>
            <p>
              Status:{' '}
              <span className={c.status === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}>
                {c.status}
              </span>
            </p>
            <p>Lat: {c.location.lat}</p>
            <p>Lng: {c.location.lng}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
