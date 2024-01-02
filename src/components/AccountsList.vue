<script setup lang="ts">
import { ref, watchEffect } from 'vue';
// @ts-ignore
import showStr from '@/utils/utils.js';
// @ts-ignore
import { web3 } from '@/web3/web3';
import { showToast } from 'vant';
// @ts-ignore
import Tx from 'ethereumjs-tx'

interface itemInterface {
  address: string,
  balan: string,
  balance: number,
  id: number,
  privateKey: string,
  password: string
}

const props = defineProps(['walletInfo']);
const wallet = ref<Array<itemInterface>>([]);
const privatekeyShow = ref(false);
const passwordValue = ref('');
const privateKeyStatus = ref(false);
const sendStatus = ref(false);
const transferShow = ref(false);
const sendAddress = ref('');
const sendAmount = ref('');
const isSend = ref(false);
// 监听父传过来的钱包
watchEffect(() => {
  const wallets = props.walletInfo.value;
  wallet.value = wallets
  if (wallets) {
    getAddressBalance(wallets)
  }
})

const activeNames = ref([]);

// click show privatekey will show item info
const showWalletInfo = ref<itemInterface>();
const privateKeyShow = ref('');
const showWalletPrivateKey = (wallet: itemInterface) => {
  showWalletInfo.value = wallet;
  privateKeyShow.value = wallet.privateKey;
  privatekeyShow.value = true;
}
// 发起转账
const transfer = (wallet: itemInterface) => {
  showWalletInfo.value = wallet;
  transferShow.value = true
}
// 根据钱包地址获取余额
const getAddressBalance = (wallet: Array<itemInterface>) => {
  if(wallet) {
    wallet.map((item: itemInterface) => {
    web3.eth.getBalance(item.address).then(async (result: string) => {
      item.balance = await web3.utils.fromWei(result, 'ether')
    })
  })
  }
 
}
const showPrivateKey = () => {
  if (passwordValue.value === '') {
    showToast('password cannot be empty ')
  } else if (showWalletInfo.value?.password !== passwordValue.value) {
    showToast('password error')
  } else {
    privateKeyStatus.value = true;
  }
}
const sendconfirm = () => {
  if (passwordValue.value === '') {
    showToast('password cannot be empty ')
  } else if (showWalletInfo.value?.password !== passwordValue.value) {
    showToast('password error')
  } else {
    sendStatus.value = true;
  }
}
const send = async () => {
  if (sendAddress.value === '') {
    showToast('address cannot be empty ')
  } else if (sendAmount.value === '') {
    showToast('amount cannot be empty ')
  } else {
    //  build send params
    isSend.value = true;
    // 获取转账的次数
    const _nonce = await web3.eth.getTransactionCount(showWalletInfo.value?.address)
    // 转账金额转换，以wei为单位
    const _amount = await web3.utils.toWei(sendAmount.value, 'ether')
    // 获取转装所需要的gas费用
    const _gasPrice = await web3.eth.getGasPrice();
    console.log('______gasPrice', _gasPrice)
    let rawTx = {
      from: showWalletInfo.value?.address,
      to: sendAddress.value,
      gasPrice: _gasPrice,
      value: _amount,
      noice: _nonce,
      data: '0x00000'
    }
    console.log('send params', rawTx)
    // 转化私钥
    // @ts-ignore
    const _privateKey = Buffer.from(showWalletInfo.value?.privateKey, 'hex');
    // const _privateKey = await web3.eth.accounts.privateKeyToAccount(showWalletInfo.value?.privateKey);
    
    console.log('---privateKey---', _privateKey)
    // gas估算
    const gas = await web3.eth.estimateGas(rawTx);
    // @ts-ignore
    rawTx.gas = gas;
    console.log('---rawTx，计算了gas---', rawTx)
    // ethereumjs-tx 实现私钥加密
    let tx = new Tx(rawTx)
    tx.sign(_privateKey)
    // // 生成serializedTx
    const serializedTx = await tx.serialize()
    console.log('---serializedTx---', serializedTx)

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash',(hash:string)=>{
      console.log('---hash---', hash);
      closeOverlay();
      isSend.value= false;
      getAddressBalance(props.walletInfo.value)
    })

  }

}
const closeOverlay = () => {
  privatekeyShow.value = false;
  privateKeyStatus.value = false;
  sendStatus.value = false;
  passwordValue.value = '';
  transferShow.value = false;
  sendAddress.value = '';
  sendAmount.value = ''
}
</script>
 
<template>
  <div class="accountsList">
    <van-collapse v-model="activeNames">
      <van-collapse-item :title="showStr(item.address)" icon="user-o" v-for="item in wallet" :key="item.id"
        :name="item.id">
        <van-space size="2rem">
          Balance: <span class="number">{{ item.balance }}</span>
        </van-space>
        <br>
        <br>
        <van-space size="2rem">
          <van-button small type="success" @click="transfer(item)">transfer</van-button>
          <van-button small type="danger" @click="showWalletPrivateKey(item)">privateKey</van-button>
        </van-space>
      </van-collapse-item>
    </van-collapse>

    <van-overlay :show="privatekeyShow" @click="closeOverlay">
      <div class="wrapper">
        <div class="block" @click.stop v-if="!privateKeyStatus">
          <span class="address">{{ showStr(showWalletInfo?.address) }}</span>
          <br>
          <van-cell-group inset>
            <van-field class="ipt" v-model="passwordValue" type="password" placeholder="please input your password" />
          </van-cell-group>
          <br>
          <div class="warning">
            <van-icon name="warning" color="red" size="20" />
            WARNING: Do not disclose this private key. Anyone with your private key can steal any assets held in your
            account.
          </div>
          <div class="footer">
            <van-button plain size="small" type="primary" @click="closeOverlay">cancel</van-button>
            <van-button plain type="danger" size="small" @click="showPrivateKey">show privatekey</van-button>
          </div>

        </div>
        <div class="block" @click.stop v-if="privateKeyStatus">
          <van-field class="textareawrap" v-model="privateKeyShow" type="textarea" rows="3" maxlength="100" autosize
            show-word-limit />
        </div>
      </div>
    </van-overlay>
    <!-- transfer dialog -->
    <van-overlay :show="transferShow" @click="closeOverlay">
      <div class="wrapper">
        <div class="block" @click.stop v-if="!sendStatus">
          <span>Password</span>
          <van-cell-group inset>
            <van-field class="ipt" v-model="passwordValue" type="password" placeholder="please input your password" />
          </van-cell-group>
          <div class="footer">
            <van-button plain size="small" type="primary" @click="closeOverlay">cancel</van-button>
            <van-button plain type="danger" size="small" @click="sendconfirm">confirm</van-button>
          </div>
        </div>
        <div class="block" @click.stop v-if="sendStatus">
          <span>Send to:</span>
          <van-field class="textareawrap" v-model="sendAddress" placeholder="Enter public key or ENS name" />
          <van-field class="textareawrap" v-model="sendAmount" placeholder="please input send amount" />
          <div class="footer">
            <van-button plain type="primary" @click="closeOverlay">cancel</van-button>
            <van-button plain type="danger" @click="send">send</van-button>
          </div>
        </div>

      </div>
    </van-overlay>
    <!-- mask -->
  <van-overlay :show="isSend">
  <div class="wrapper">
    <van-loading color="#07c160" size="48" vertical>Wait for monment...</van-loading>
  </div>
</van-overlay>
  </div>
</template>
 
<style scoped lang="less">
.accountsList {
  margin-top: 20px;
  box-sizing: border-box;
  border: 1px solid #cccccc;
  border-radius: 12px;
  overflow: hidden;
}

.address {
  display: flex;
  align-items: center;
}

.custom-title {
  margin-right: 6px;
  display: flex;
  align-items: center;
}

.number {
  font-size: 16px;
  font-weight: bold;
}

.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.block {
  width: 350px;
  padding: 24px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
}

.address {
  width: 180px;
  height: 40px;
  color: #0376c9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  background-color: #e6f2fa;
  border-radius: 20px;
}

.ipt {
  border: 1px solid #cccccc;
  border-radius: 10px;
}

.warning {
  width: 300px;
  padding: 10px;
  background-color: #fbebed;
  border-radius: 12px;
}

.footer {
  margin-top: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.textareawrap {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
