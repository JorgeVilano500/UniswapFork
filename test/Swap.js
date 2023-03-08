const { expect } = require("chai")
require("dotenv").config()

const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

const toEther = (n) => {
  return Number(ethers.utils.formatUnits(n.toString(), 'ether')).toFixed(2)
}

describe("Swap", function () {
  describe("Goerli Fork Swap", () => {
    // goerli uniswap 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
    // goerli weth token 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6

    const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    const WETH_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

    const UNI = new ethers.Contract(UNI_ADDRESS, IERC20.abi)
    const WETH = new ethers.Contract(WETH_ADDRESS, IERC20.abi)

    // swap details 
    const PATH = [UNI_ADDRESS, WETH_ADDRESS]
    const FEE = 3000 // fee is 0.3%
    const AMOUNT = ethers.utils.parseUnits('1000000', 'ether')

    let account 
    let swapper

    beforeEach(async () => {
      // to fork the network

      await network.provider.request({
        method: 'hardhat_reset', 
        params: [
          {
            forking: {
              jsonRpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
              // will tell which block to freeze on to. make sure that the v3 contract is available after certain blocks
              blockNumber: 8446620
            }
          }
        ]
      })
      // find top holders of the token you want to do 
      const UNLOCKED_ACCOUNT = '0x41653c7d61609D856f29355E404F310Ec4142Cfb'

      await hre.network.provider.request({
        method: 'hardhat_impersonateAccount', 
        params: [UNLOCKED_ACCOUNT] // this can be an array of accounts we want to impersonate.
      })

      // to get the signer of the account for transactions 
      account = await hre.ethers.getSigner(UNLOCKED_ACCOUNT)

      const SWAP_ROUTER ='0xE592427A0AEce92De3Edee1F18E0157C05861564'

      const Swapper = await ethers.getContractFactory('Swapper');
      
      swapper = await Swapper.deploy(SWAP_ROUTER)


    })

    it("Successfully Swaps", async () => {
      const uniBalanceBefore = await UNI.connect(account).balanceOf(account.address);
      const wethBalanceBefore = await WETH.connect(account).balanceOf(account.address);

      console.log(`\nUNI Balance Before Swap: ${toEther(uniBalanceBefore)}`)
      console.log(`WETH Balance Before Swap: ${toEther(wethBalanceBefore)}\n`)

      await UNI.connect(account).approve(swapper.address, AMOUNT)
      await swapper.connect(account).swap(PATH, FEE, AMOUNT)
      
      const uniBalanceAfter = await UNI.connect(account).balanceOf(account.address);
      const wethBalanceAfter = await WETH.connect(account).balanceOf(account.address)

      console.log(`UNI Balance After: ${toEther(uniBalanceAfter)}`)
      console.log(`WETH Balance After: ${toEther(wethBalanceAfter)}`)

      expect(uniBalanceAfter).to.be.lessThan(uniBalanceBefore)
      expect(wethBalanceAfter).to.be.greaterThan(wethBalanceBefore)

    })
  })

  describe("Mainnet Fork Swap", () => {
    // get the token addreses 
    const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    // for any erc20 coin you can do the interface to interact with it 
    const DAI = new ethers.Contract(DAI_ADDRESS, IERC20.abi)
    const WETH = new ethers.Contract(WETH_ADDRESS, IERC20.abi)

    // setup swap details and params 
    const PATH = [DAI_ADDRESS, WETH_ADDRESS]
    const FEE = 3000;
    const AMOUNT = ethers.utils.parseUnits('1000000', 'ether') // will be $1,000,000 in DAI

    let account
    let swapper


    beforeEach(async () => {
      // TODO: fill me in
      await network.provider.request({
        method: 'hardhat_reset', 
        params: [
        {
          forking: {
            jsonRpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
            blockNumber: 16572390,
          }
        }
        ]
      })
      // impersonate the signer
      const UNLOCKED_ACCOUNT = '0xd68B6e9fC4eab0f041C5D2bF1EE7c4fD87d4e99f'
      await hre.network.provider.request({
        method: 'hardhat_impersonateAccount', 
        params: [UNLOCKED_ACCOUNT]
      })

      account = await hre.ethers.getSigner(UNLOCKED_ACCOUNT)

      // deploy swapper from uniswap
      const SWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

      const Swapper = await ethers.getContractFactory('Swapper')
      swapper = await Swapper.deploy(SWAP_ROUTER)

    })

    it("Successfully Swaps", async () => {
      // TODO: fill me in

      const daiBalanceBefore = await DAI.connect(account).balanceOf(account.address)
      const wethBalanceBefore = await WETH.connect(account).balanceOf(account.address)

      console.log(`\nDAI Balance Before: ${toEther(daiBalanceBefore)}`)
      console.log(`WETH Balance Before: ${toEther(wethBalanceBefore)}\n`)

      await DAI.connect(account).approve(swapper.address, AMOUNT)
      await swapper.connect(account).swap(PATH, FEE, AMOUNT)

      const daiBalanceAfter = await DAI.connect(account).balanceOf(account.address)
      const wethBalanceAfter = await WETH.connect(account).balanceOf(account.address)

      console.log(`DAI Balance After: ${toEther(daiBalanceAfter)}`)
      console.log(`WETH Balance After: ${toEther(wethBalanceAfter)}\n`)

      expect(daiBalanceAfter).to.be.lessThan(daiBalanceBefore)
      expect(wethBalanceAfter).to.be.greaterThan(wethBalanceBefore)

    })
  })

  describe('Polygon Fork Swap', () => {
    // get token address instances on polygon network
    const DAI_POLYGON_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    const WMATIC_ADDRESS = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'

    const DAI = new ethers.Contract(DAI_POLYGON_ADDRESS, IERC20.abi); 
    const WMATIC = new ethers.Contract(WMATIC_ADDRESS, IERC20.abi)

    // setup swap details
    const PATH = [DAI_POLYGON_ADDRESS, WMATIC_ADDRESS]
    const FEE = 3000
    const AMOUNT = ethers.utils.parseUnits('10000', 'ether') // $10,000 in DAI to WMATIC

    let account 
    let swapper 

    beforeEach(async () => {

      // fork the network 
      await network.provider.request({
        method: 'hardhat_reset', 
        params: [
          {
            forking: {
              jsonRpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
              blockNumber: 16572390,
            }
          }
        ]
      })

      // then unlock an account
      const UNLOCK_ACCOUNT = '0x604981db0c06ea1b37495265eda4619c8eb95a3d'

      await hre.network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [UNLOCK_ACCOUNT],
      })

      account = await hre.ethers.getSigner(UNLOCK_ACCOUNT)

      // deploy swapper 

      const SWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'

      const Swapper = await ethers.getContractFactory('Swapper')
      swapper = await Swapper.deploy(SWAP_ROUTER)
    })

    it('Successfully Swaps', async () => {
      const daiBalanceBefore = await DAI.connect(account).balanceOf(account.address);
      const wmaticBalanceBefore = await WMATIC.connect(account).balanceOf(account.address);

      console.log(`\nDAI Balance Before: ${toEther(daiBalanceBefore)}`)
      console.log(`WMATIC Balance before: ${toEther(wmaticBalanceBefore)}`)

      await DAI.connect(account).approve(swapper.address, AMOUNT)
      await swapper.connect(account).swap(PATH, FEE, AMOUNT)

      const daiBalanceAfter = await DAI.connect(account).balanceOf(account.address);
      const wmaticBalanceAfter = await WMATIC.connect(account).balanceOf(account.address);

      console.log(`DAI Balance After: ${toEther(daiBalanceAfter)}`)
      console.log(`WMatic Balance After: ${toEther(wmaticBalanceAfter)}`)

      expect(daiBalanceAfter).to.be.lessThan(daiBalanceBefore)
      expect(wmaticBalanceAfter).to.be.greaterThan(wmaticBalanceBefore)

    })

  } );
})
