import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { ethers } from "ethers";
import contractAbi from "./utils/contractABI.json";

// Adapters
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

const clientId = process.env.REACT_APP_CLIENT_ID!
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS!
const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

export const Callback = () => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [torusPlugin, setTorusPlugin] =
    useState<TorusWalletConnectorPlugin | null>(null);

  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthNoModal({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881",
          },
          web3AuthNetwork: "testnet",
          useCoreKitKey: false,
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

        // adding metamask adapter
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881",
            rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });
        // we can change the above settings using this function
        metamaskAdapter.setAdapterSettings({
          sessionTime: 86400, // 1 day in seconds
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881",
            rpcTarget: "https://rpc.ankr.com/polygon_mumbai", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
          web3AuthNetwork: "testnet",
        });

        // it will add/update  the metamask adapter in to web3auth class
        web3auth.configureAdapter(metamaskAdapter);

        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {},
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
        setTorusPlugin(torusPlugin);
        await web3auth.addPlugin(torusPlugin);

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
    init();
  }, []);

  const connect = async () => {
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
          domain: "https://auth-dev.su-pay.jp/"
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
    navigate("/")
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

  const safeMint = async () => {
    try {
      if (provider) {
        const web3authprovider = new ethers.providers.Web3Provider(provider);
        const signer = web3authprovider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let tx = await contract.safeMint();
        const receipt = await tx.wait();

        // トランザクションが問題なく実行されたか確認します。
        if (receipt.status === 1) {
          console.log(
            "SBT minted! https://mumbai.polygonscan.com/tx/" + tx.hash
          );
        } else {
          alert("Transaction failed! Please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
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
        <div>
          <button className="card" onClick={safeMint}>
            Mint
          </button>
        </div>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={connect} className="card">
      Wollet connect
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{" "}
        & Sinhto
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
      </footer>
    </div>
  );
}

