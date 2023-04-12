import { useEffect, useState } from "react";
import "./App.css";
// import RPC from './ethersRPC' // for using ethers.js
// import RPC from "./web3RPC"; // for using web3.js
import { Link } from 'react-router-dom';

const houzinURL = process.env.REACT_APP_HOUZIN_URL!

export const App = () => {
  const [authEndpoint, setAuthEndpoint] = useState();

  useEffect(() => {
    const init = async () => {
      const res = await fetch(houzinURL + "/supay/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setAuthEndpoint(data?.data.sinhto_url);
      console.log(authEndpoint);
    };

    init();
  }, []);

  const login = (
    <Link to={authEndpoint!}>
      sinhto Login
    </Link>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{" "}
        & ReactJS Example using Auth01
      </h1>

      {/* <button onClick={login} className="card">
        Login
      </button> */}

      <div className="card">{login}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/examples/tree/main/web-no-modal-sdk/custom-authentication/auth0-react-no-modal-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
