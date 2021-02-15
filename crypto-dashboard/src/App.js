import React, { useState, useEffect, useRef } from 'React';
import Dashboard from '../components/Dashboard';
import './App.css';

function App() {

  const [currencies, setCurrencies] = useState([]);
  const [pair, setPair] = useState('');
  const [price, setPrice] = useState('0.00');
  const [pastData, setPastData] = useState({});
  const ws = useRef(null);

  let first = useRef(false);
  const url = 'https://api.pro.coinbase.com';

  return (
    <div className="App">

    </div>
  );
}

export default App;
