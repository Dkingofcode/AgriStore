import React,{ useState } from 'react';
import reactLogo from './assets/react.svg';
//import viteLogo from '/vite.svg';
import './App.css';
import AgriStoreNigeria from './Agristore';

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <AgriStoreNigeria />
       </div> 
    </>
  )
}

export default App;



