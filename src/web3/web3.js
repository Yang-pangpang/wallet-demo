import Web3 from 'web3'
import { RPC_SERVER } from '@/web3/constant.js'

// 实例化web3
 export const web3 = new Web3(Web3.givenProvider || RPC_SERVER);