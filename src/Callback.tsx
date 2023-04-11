import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import "./App.css";
// import RPC from './ethersRPC' // for using ethers.js
import RPC from "./web3RPC"; // for using web3.js
// Plugins
// import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";

const clientId = process.env.REACT_APP_CLIENT_ID!

const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

export const Callback = () => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  // const [torusPlugin, setTorusPlugin] =
  //   useState<TorusWalletConnectorPlugin | null>(null);

  const query = useQuery();

  const init = async () => {
    try {
      const web3auth = new Web3AuthNoModal({
        clientId,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x137",
        },
        web3AuthNetwork: "testnet",
        // useCoreKitKey: false,
        useCoreKitKey: true,
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          clientId,
          // uxMode: "popup",
          loginConfig: {
            jwt: {
              verifier: "custom-sinhto-testnet",
              typeOfLogin: "jwt",
              clientId,
            },
          },
        },
      });
      web3auth.configureAdapter(openloginAdapter);
      
      // const torusPlugin = new TorusWalletConnectorPlugin({
      //   torusWalletOpts: {},
      //   walletInitOptions: {
      //     whiteLabel: {
      //       theme: { isDark: true, colors: { primary: "#00a8ff" } },
      //       logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      //       logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
      //     },
      //     useWalletConnect: true,
      //     enableLogging: true,
      //   },
      // });
      // setTorusPlugin(torusPlugin);
      // await web3auth.addPlugin(torusPlugin);

      setWeb3auth(web3auth);

      await web3auth.init();
      if (web3auth.provider) {
        setProvider(web3auth.provider);
      }
      console.log("init completed");
      
    } catch (error) {
      console.log(error);
      
      console.error(error);
    }
  };

  const login = async () => {
    await init();
    console.log("initialized");
    

    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "jwt",
        extraLoginOptions: {
          // domain: "https://shahbaz-torus.us.auth0.com",
          verifierIdField: "sub",
          id_token: query.get("token"),
          domain: "https://hirosekakeru.github.io/"
          // connection: "google-oauth2", // Use this to skip Auth0 Modal for Google login.
        },
      }
    );
    setProvider(web3authProvider);
    console.log("setProvider completed");
    
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{" "}
        & ReactJS Example using Auth01
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
      </footer>
    </div>
  );
}

