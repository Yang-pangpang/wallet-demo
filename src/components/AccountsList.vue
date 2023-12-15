<script setup lang="ts">
import { ref, defineProps} from 'vue'
import showStr from '@/utils/utils.js'

const props = defineProps(['walletInfo'])

const activeNames = ref([]);

</script>
 
<template>
<div class="accountsList">
  <van-collapse v-model="activeNames">
  <van-collapse-item :title="showStr(item.address)"  icon="user-o" v-for="item in props.walletInfo.value" :key="item.id" :name="item.id">
    <van-space size="2rem">
      Balance: {{item.balance}}
</van-space>
  <br>
  <br>
   <van-space size="2rem">
    <van-button small type="success" @click="transfer">transfer</van-button>
    <van-button  small type="danger">show privateKey</van-button>
   </van-space>
  </van-collapse-item>
</van-collapse>
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
</style>
