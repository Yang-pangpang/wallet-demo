<script setup lang="ts">
import { ref, defineProps } from 'vue'
import showStr from '@/utils/utils.js'

const props = defineProps(['walletInfo'])
console.log('props',JSON.stringify(props.walletInfo))

const activeNames = ref(['1']);
const showMore = (id: string[]) => {
  console.log(id)
  return {activeNames:id}
}
</script>
 
<template>
<div class="accountsList" v-if="props.walletInfo">
  <van-collapse v-model="activeNames" accordion>
  <van-collapse-item :title="showStr(item.address)"  icon="user-o" v-for="item in props.walletInfo.value" :key="item.id" @click="showMore(item.id)">
    技术无非就是那些开发它的人的共同灵魂。
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
