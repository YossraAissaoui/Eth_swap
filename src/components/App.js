import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  // we need to do that before html 
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

    /* a new function that import all the data in the application that we need, 
    that's currently stored on the blockchain*/
    async loadBlockchainData() {
    //Changing the calling for window web 3 to short word web3
    const web3 = window.web3

    //Fetch the account from Metamask
    const accounts = await web3.eth.getAccounts()
    //Store account/ blockchain data in React's state object 
    this.setState({account: accounts[0]})
    //Fetch the account's Ether balance with web3.
    const ethBalance = await web3.eth.getBalance(this.state.account)
    //Store the account's balance to the React state.
    this.setState({ ethBalance })

    
    // Load Token
    // Javascript smart contract
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }
    // Whenever the contracts are finished loading, we set React's state to loading = false. 
    //We'll show a loader any time the app is loading.
    //after finish loading will show the main content.
    this.setState({ loading: false })
  }

  async loadWeb3() {
    //if you have modern dapp browser run this
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    //or if you have legacy dapp browser run this
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    //if you don't have MetaMask installed show alert
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  //This is the function that run whenever the component is created
  constructor(props) {
    super(props)
    this.state = {
      //default state
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    //if it is loading (loading=True)show the loader
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
    //if it's not loading (loading=False) show the content
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;