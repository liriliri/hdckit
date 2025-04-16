# hdckit

[![NPM version][npm-image]][npm-url]
[![License][license-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/hdckit?style=flat-square 
[npm-url]: https://npmjs.org/package/hdckit
[license-image]: https://img.shields.io/npm/l/hdckit?style=flat-square

基于 Node.js 实现的鸿蒙 HDC 客户端。

## 安装

你可以在 npm 上获取它。

```bash
npm install hdckit --save
```

## 使用

```javascript
import Hdc from 'hdckit'

const client = Hdc.createClient()

;(async () => {
  const targets = await client.listTargets()
  if (targets.length > 0) {
    const target = await client.getTarget(targets[0])
    const parameters = await target.getParameters()
    console.log(parameters['const.product.name'])
  }
})()
```