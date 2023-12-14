<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showNotify } from 'vant'
import * as bip39 from 'bip39'
import store2 from 'store2'
import { hdkey } from 'ethereumjs-wallet'
import AccountsList from '@/components/AccountsList.vue'
import { reactive } from 'vue'

const createWallet = () => {
  isShow.value = true
}
const mnemonic = ref('')
const isShow = ref(false)
const password = ref('')
const confirmPassword = ref('')
const isMnemonic = ref(false)
const mnemonicWord = ref<string>('')
const isLoading = ref(false)
let walletInfo = reactive<Array>([])


onMounted(async () => {
  try {
    const result = await store2.get('walletData') || []
    walletInfo.value = result;
    // console.log('===result', result)
  } catch (error) {
    console.log(error)
  }
})

const handleConfirm = () => {
  const emptyPasswordMessage = 'Please input password';
  const twoPasswordsNotMatchMessage = "Two passwords don't match";

  const passWordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;

  if (passWordValue === '' || confirmPasswordValue === '') {
    showNotify({ type: 'danger', message: emptyPasswordMessage });
  } else if (passWordValue !== confirmPasswordValue) {
    showNotify({ type: 'danger', message: twoPasswordsNotMatchMessage });
  }

  const walletMnemonic = walletInfo && walletInfo.value && walletInfo.value[0] && walletInfo.value[0].mnemonic;

  if (walletMnemonic !== undefined) {
    // 有助记词，直接复制生成账号信息
    mnemonic.value = walletMnemonic;
    mnemonicClick();
  } else {
    const newMnemonicValue = bip39.generateMnemonic();
    mnemonic.value = newMnemonicValue;
    handleCancel();
    console.log('新生成助记词', newMnemonicValue);
  }
};

const handleCancel = () => {
  password.value = ''
  confirmPassword.value = ''
  mnemonicWord.value = ''
}

const handleSaveClick = () => {
  isMnemonic.value = true
}

const mnemonicClick = () => {
  createWalletInfo();
  // console.log('对比', mnemonicWord.value)
  // console.log('====', mnemonic.value)
  // if (mnemonicWord.value == '') {
  //   showNotify({ type: 'danger', message: 'mnemonic word is empty' })
  // } else if (mnemonicWord.value.length < 12 || mnemonicWord.value !== mnemonic.value) {
  //   showNotify({ type: 'danger', message: 'mnemonic word is error' })
  // } else {
  //   createWalletInfo()
  // }
}

// 通过私钥生成钱包账户
const createWalletInfo = async () => {
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
    id: storeWallet.length,
    address: lowerCaseAddress,
    privateKey,
    CheckSumAddress,
    keyStore,
    mnemonic: mnemonic.value,
    balance: 0
  }
  walletData = [...storeWallet, walletObj]
  console.log(walletData)
  // 生成对象先存储仔本地Local,注意正式环境中不能存仔本地
  store2('walletData', walletData)
  handleCancel()
  isLoading.value = false
  showNotify({ type: 'success', message: 'create wallet success' })
}

</script>