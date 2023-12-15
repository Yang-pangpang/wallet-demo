<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { showNotify } from 'vant';
import * as bip39 from 'bip39'
import store2 from 'store2'
import { hdkey } from 'ethereumjs-wallet'
import AccountsList from '@/components/AccountsList.vue'

const createWallet = () => {
  isShow.value = true
}
const mnemonic = ref('')
const isShow = ref(false)
const password = ref('')
const confirmPassword = ref('')
const isMnemonic = ref(false)
const mnemonicWord = ref<string>('')
const isLoading =ref(false)
let walletInfo = reactive<Array>([])


onMounted(async () => {
      try {
        const result = await store2.get('walletData') || []
        walletInfo.value = result;
      } catch (error) {
        console.log(error);
      }
    });
const handleConfirm = () =>{
  console.log('本地是否有助记词',walletInfo.value)
  const emptyPasswordMessage = `Please input password`;
  const twoPasswordNotMatchMessage = `Two passwords don't match`;
  const passWordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  // 检查mnemonic是否正确初始化
  if(passWordValue === '' || confirmPasswordValue === '') {
    showNotify({ type: 'danger', message: emptyPasswordMessage })
  }else if(passWordValue !== confirmPasswordValue) {
    showNotify({ type: 'danger', message: twoPasswordNotMatchMessage})
  }
  
  
  const walletMnemonic = walletInfo && walletInfo.value && walletInfo.value[0] && walletInfo.value[0].mnemonic;
  if(walletMnemonic !== undefined) {
    console.log('有助记词',walletMnemonic)
    // 本地有助记词，直接拿去本地助记词创建账号信息 
    mnemonic.value = walletMnemonic;
    mnemonicClick();
  }else {
    // 如果本地没有就生成新的助记词
    const newMnemonic = bip39.generateMnemonic();
    mnemonic.value = newMnemonic;
    handleCancel();
    console.log('新的助记词',newMnemonic)
  }

}
const handleCancel = () =>{
  password.value = ''
  confirmPassword.value = ''
  mnemonicWord.value = ''
}

 const handleSaveClick = () => {
  isMnemonic.value = true
 }
const mnemonicClick = () =>{
  createWalletInfo()

  // console.log('对比',mnemonicWord.value)
  // console.log('====',mnemonic.value)
  // if(mnemonicWord.value == '') {
  //   showNotify({ type: 'danger', message: 'mnemonic word is empty' })
  // }else if( mnemonicWord.value.length < 12 || mnemonicWord.value !== mnemonic.value) {
  //   showNotify({ type: 'danger', message: 'mnemonic word is error' })
  // }else {
  //   createWalletInfo()
  // }
}
  // 通过私钥生成钱包账户
  const createWalletInfo = async() => {
    isLoading.value = true
      // 判断local是否有walleInfo存在，如果有则使用其原来的Id,没有就生成新的id
    const storeWallet = store2.get('walletData') || []
    const seed = await bip39.mnemonicToSeed(mnemonic.value)
    const hdWallet = hdkey.fromMasterSeed(seed)
    const addressIndex = storeWallet.length === 0 ? 0 : storeWallet.length + 1
    const keyPair = hdWallet.derivePath(`m/44'/60'/0'/0/${addressIndex}`)
    const wallet = keyPair.getWallet()
    const lowerCaseAddress = wallet.getAddressString()
    const CheckSumAddress = wallet.getChecksumAddressString()
    const privateKey = wallet.getPrivateKey().toString('hex')
    const keyStore = await wallet.toV3(password.value)
    let walletData: (string | number)[] = []
    const walletObj = {
      id:storeWallet.length,
      address: lowerCaseAddress,
      privateKey,
      CheckSumAddress,
      keyStore,
      mnemonic: mnemonic.value,
      balance: 0
    }
    walletData = [...storeWallet, walletObj]
    walletInfo.value = [...storeWallet, walletObj]
    console.log(walletData)
     // 生成对象先存储仔本地Local,注意正式环境中不能存仔本地
    store2('walletData', walletData)
    handleCancel()
    isLoading.value = false
    showNotify({ type: 'success', message: 'create wallet success' })
  }
</script>
<template>
<div>
<h1>WALLET-DEMO</h1>
<van-divider 
  :style="{ borderColor: '#1989fa'}"
/>

  <div class="container">
    <van-button  color="#9370DB" @click="createWallet">Create Wallet</van-button>
    <van-button type="success">Import Wallet</van-button>
   
  </div>
  <van-divider 
  :style="{ borderColor: '#1989fa'}"
/>
<div class="wrap" v-if="mnemonic">
  <div class="mnemonic-box">
  <h4>pleae copy this mnemonic to save:</h4>
  <p>{{ mnemonic }}</p>
</div>
  <van-button type="success" class="save" @click="handleSaveClick">I'm Save</van-button>
</div>
<van-dialog v-model:show="isShow" title="please setting your password" show-cancel-button confirmButtonText="confirm" cancelButtonText="cancel"  cancelButtonColor="#FF4040" confirmButtonColor="#07c160" @confirm="handleConfirm" @cancel="handleCancel">
    <van-cell-group inset>
  <van-field v-model="password" label="password" type="password" clearable placeholder="please input your password" />
</van-cell-group>
<van-cell-group inset>
  <van-field v-model="confirmPassword" label="confirm" type="password" clearable placeholder="please input your password again"/>
</van-cell-group>
</van-dialog>
    <!-- mnemonic dialog -->
<van-dialog v-model:show="isMnemonic" title="please input your mnemonic" show-cancel-button confirmButtonText="confirm" cancelButtonText="cancel"  cancelButtonColor="#FF4040" confirmButtonColor="#07c160" @confirm="mnemonicClick" @cancel="handleCancel">
    <van-cell-group inset>
  <van-field class="textareawrap" v-model="mnemonicWord"  type="textarea" rows="3"   maxlength="1000" autosize show-word-limit/>
</van-cell-group>
</van-dialog>

  <!-- mask -->
  <van-overlay :show="isLoading">
  <div class="wrapper">
    <van-loading color="#07c160" size="48" vertical>Wait for monment...</van-loading>
  </div>
</van-overlay>

<AccountsList :walletInfo="walletInfo"/>
</div>
</template>
 
<style scoped lang="less">
h1 {
  color: red;
  text-align: center;
}
.container {
  margin: 40px 0;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.mnemonic-box {
  border: 1px solid #07c160;
  border-radius: 12px;
  padding: 16px;
}
h4 {
  font-size: 20px;
  color: red;
}
p {
  margin-top: 30px;
  user-select: all;
  font-size: 28px;
  color: #9370DB;
}
.wrap {
  display: flex;
  flex-direction: column;
}
.save {
  margin-top: 30px;
}
.textareawrap {
  border: 1px solid #ccc;
  border-radius: 8px;
}
.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .block {
    width: 120px;
    height: 120px;
    background-color: #fff;
  }
</style>