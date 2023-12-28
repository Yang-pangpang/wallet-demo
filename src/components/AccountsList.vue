<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import showStr from '@/utils/utils.js';
import { web3 } from '@/web3/web3';
import type { FieldRuleValidator } from 'vant/lib/field/types';

interface itemInterface {
  address: string,
  balan: string,
  balance: number,
  id: number,
  privateKey: string,
  password:string
}

const props = defineProps(['walletInfo']);
const wallet = ref<Array<itemInterface>>([]);
const privatekeyShow = ref(false);
const passwordValue = ref('');
// 监听父传过来的钱包
watchEffect(() => {
  const wallets = props.walletInfo.value;
  wallet.value = wallets
  if (wallets) {
    getAddressBalance(wallets)
  }
})

const activeNames = ref([]);
// 发起转账
const transfer = () => {
  console.log('转账')
}
// click show privatekey will show item info
const showWalletInfo = ref<itemInterface>();
const showWalletPrivateKey = (wallet: itemInterface) => {
  showWalletInfo.value = wallet;
  privatekeyShow.value = true;
}
// 根据钱包地址获取余额
const getAddressBalance = (wallet: Array<itemInterface>) => {
  wallet.map((item: itemInterface) => {
    web3.eth.getBalance(item.address).then(async (result: string) => {
      item.balance = await web3.utils.fromWei(result, 'ether')
    })
  })
}
const passwordReg: FieldRuleValidator = (value) => {
  console.log(value)
  return new Promise((resolve, reject) => {
    // 在这里执行验证
    if (value !== showWalletInfo.value?.password) {
      reject(new Error('密码必须至少为8个字符'));
    } else {
      resolve(value);
    }
  });
};
</script>
 
<template>
  <div class="accountsList">
    <van-collapse v-model="activeNames">
      <van-collapse-item :title="showStr(item.address)" icon="user-o" v-for="item in wallet" :key="item.id"
        :name="item.id">
        <van-space size="2rem">
          Balance: {{ item.balance }}
        </van-space>
        <br>
        <br>
        <van-space size="2rem">
          <van-button small type="success" @click="transfer">transfer</van-button>
          <van-button small type="danger" @click="showWalletPrivateKey(item)">show privateKey</van-button>
        </van-space>
      </van-collapse-item>
    </van-collapse>

    <van-overlay :show="privatekeyShow" @click="privatekeyShow = false">
      <div class="wrapper">
        <div class="block" @click.stop>
          <span class="address">{{ showStr(showWalletInfo?.address) }}</span>
          <br>
          <van-cell-group inset>
            <van-field class="ipt" v-model="passwordValue" type="password" :rules="[{ required: true, validator: passwordReg, message: 'pawwsoed is error' }]"  placeholder="please input your password" />
          </van-cell-group>
          <br>
          <div class="warning">
            <van-icon name="warning"  color="red" size="20"/>
            警告：切勿泄露此私钥。任何拥有您私钥的人都可以窃取您账户中持有的任何资产。
          </div>
        </div>
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

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
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
</style>
