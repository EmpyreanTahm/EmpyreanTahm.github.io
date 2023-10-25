# E
<script setup lang="ts">
import GaugeChart from './components/GaugeChart.vue'
import { ref } from 'vue'
const gaugeData = ref([
    {
      value: 80,
      name: 'Rating'
    }
  ])
</script>

![Node-eventloop-order](/Node-eventloop-order.png)
## 基本使用

<GaugeChart :gaugeData="gaugeData" :height="500" />

::: details Show Code

```vue
<script setup lang="ts">
import GaugeChart from './components/GaugeChart.vue'
import { ref } from 'vue'
const gaugeData = ref([
    {
      value: 80,
      name: 'Rating'
    }
  ])
</script>
<template>
  <GaugeChart :gaugeData="gaugeData" :height="500" />
</template>
```

:::
