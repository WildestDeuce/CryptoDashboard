import React, { useState, useEffect, useRef } from 'react';
import formatData from './utils';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {

  const [currencies, setCurrencies] = useState([]);
  const [pair, setPair] = useState('');
  const [price, setPrice] = useState('0.00');
  const [pastData, setPastData] = useState({});
  const webSocket = useRef(null);

  let first = useRef(false);
  const url = 'https://api.pro.coinbase.com';

  useEffect(() => {
    webSocket.current = new WebSocket('wss://ws-feed.pro.coinbase.com');

    let pairs = [];

    const apiCall = async () => {
      await fetch(url + '/products')
        .then((res) => res.json())
        .then((data) => (pairs = data));
      console.log('pairs', pairs);

      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === 'USD') {
          return pair;
        }
      });

      filtered = filtered.sort((a, b) => {
        if (a.base_currency < b.base_currency) {
          return -1;
        }
        if (a.base_currency > b.base_currency) {
          return 1;
        }
        return 0;
      });

      console.log(filtered);
      setCurrencies(filtered);

      first.current = true;
    };
    apiCall();
    //same as componentDidMount prevents infinite loop
  }, []);

  useEffect(() => {
    if (!first.current) {
      console.log('returning on first render');
      return;
    }

    console.log('running pair change');
    let message = {
      type: 'subscribe',
      product_ids: [pair],
      channels: ['ticker']
    };

    let jsonMessage = JSON.stringify(message);
    webSocket.current.send(jsonMessage);

    //granularity = number of seconds. This is a daily price chart.
    let historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`;

    const fetchHistoricalData = async () => {
      let dataArr = [];
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data) => (dataArr = data));
      console.log(dataArr);
      let formattedData = formatData(dataArr);
      setPastData(formattedData);
    };

    fetchHistoricalData();
    //whenever a price is updated in coinbase, receive a message
    webSocket.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      if (data.type !== 'ticker') {
        return;
      }
      //creates realtime dashboard effect for price of currency
      if (data.product_id === pair) {
        setPrice(data.price);
      }
    };
    //dependency array only runs when there is a pair to update
  }, [pair]);

  const handleSelect = (e) => {

    let unsubMessage = {
      type: 'unsubscribe',
      product_ids: [pair],
      channels: ['ticker']
    }
    let unsubscirbe = JSON.stringify(unsubMessage);

    webSocket.current.send(unsubscirbe);
    //activates effect hook listening for pair state change to get new values 
    setPair(e.target.value);
  };

  return (
    <div className='container'>
      {
        <select name='currency' value={pair} onChange={handleSelect}>
          {currencies.map((currency, index) => {
            return (
              <option key={index} value={currency.id}>
                {currency.display_name}
              </option>
            );
          })}
        </select>
      }
      <Dashboard price={price} data={pastData} />
    </div>
  );
}

export default App;
