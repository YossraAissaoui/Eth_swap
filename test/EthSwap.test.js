const Token = artifacts.require("Token")
const EthSwap = artifacts.require("EthSwap")

require('chai')
  .use(require('chai-as-promised'))
  .should()

	function tokens(n){
		return web3.utils.toWei(n,'ether');
	}

	contract('EthSwap',([deployer, investor])=>{
		let token,ethSwap

		before( async()=> {
			token = await Token.new()
			ethSwap = await EthSwap.new(token.address)
            //Transfer all the tokens to Ethswap (1 million)
			await token.transfer(ethSwap.address, tokens('1000000'))
		})

        describe('Token deployment', async() =>{
	        it('contract has a name', async () =>{
            const name = await token.name()
		    assert.equal(name, 'DApp Token')
	        })
	    })

        describe('EthSwap deployment', async() =>{
	      it('contract has a name', async () =>{
		    const name = await ethSwap.name()
		    assert.equal(name, 'EthSwap Instant Exchange') 
		  }) 
	      it('contract has tokens', async() =>{
			let balance = await token.balanceOf(ethSwap.address)
			assert.equal(balance.toString(), tokens('1000000'))
		  })
        })

        describe('buyTokens()', async () =>{
          let result

	      before( async()=>{
		    //purchased tokens before each example
		    result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1','ether')})
		  })

          it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () =>{
			
			//check if investor receive token after purchase
	        let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))
            
			// Check ethSwap balance after purchase
			let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)

            assert.equal(ethSwapBalance.toString(), tokens('999900'))

            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)

            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))
            
			//check logs
			const event = result.logs[0].args
            assert.equal(event.account, investor)

			assert.equal(event.token, token.address)

			assert.equal(event.amount.toString(), tokens('100').toString())

			assert.equal(event.rate.toString(), '100')
		  })

	    })

		describe('sellTokens()', async () =>{

			let result
	
			before( async()=>{
				//investor must approve token before purchase
				await token.approve(ethSwap.address, tokens('100'), { from: investor})

				//sell the token
				result = await ethSwap.sellTokens(tokens('100'), { from: investor})
		
			})

			it('Allows user to instantly sell tokens to ethswap at a fixed price', async () =>{
				//check if investor token after purchase
				let investorBalance = await token.balanceOf(investor)
				assert.equal(investorBalance.toString(), tokens('0'))

				// Check ethSwap balance after purchase
				let ethSwapBalance
				ethSwapBalance = await token.balanceOf(ethSwap.address)
      
				assert.equal(ethSwapBalance.toString(), tokens('1000000'))
      
				ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      
				assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))
				

				//check logs to ensure events was emitted with correct data
				const event = result.logs[0].args
				assert.equal(event.account, investor)

				assert.equal(event.token, token.address)

				assert.equal(event.amount.toString(), tokens('100').toString())

				assert.equal(event.rate.toString(), '100')

				//failure test: investors can't sell more tokens than they have
				await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;

			})

		})

	})

