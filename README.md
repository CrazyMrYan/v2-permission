# v2-permission

## 快速上手

### 引入

```javascript
import Vue from 'vue';
import permissions from 'v2-permission';

Vue.use(permissions, {
  // 权限 API
  getPermissionsApi: async () => fetch(`/api.json?t=${new Date().getTime()}`).then((res) => res.json()),
});
```

### 使用

```html
<!-- 同时存在多个权限 -->
<button v-permission="['orders::add', 'orders::update']">新增&编辑</button>

<!-- 单个校验 -->
<button v-permission="'orders::delete'">删除</button>
```

## API

### options

| 参数名                 | 类型         | 必填  | 描述                   |
| ------------------- | ---------- | --- | -------------------- |
| `getPermissionsApi` | `Function` | 是   | 获取权限的方法              |
| `checkPermission`   | `Function` | 否   | 检查权限的方法              |
| `name`              | `String`   | 否   | 自定义指令名称              |
| `className`         | `String`   | 否   | 自定义指令隐藏时添加的 class 名称 |

## 详细内容

### 期望接口返回值

> 如果接口不确定是否能够给你这种格式，你可以选择转一下，或者自己写一个checkPermission。

```json
{
    "orders": [
        "add",
        "update",
        "delete",
        "query",
        "detail",
        "enable",
        "disable"
    ]
}
```

### 自定义 checkPermission

> 你如果需要自定义需求，可以在 Use 时传入 `checkPermission`这样就会将内置的内容覆盖掉，注释如下，接受 value，返回 Boolean。

```js
/**
 * @name checkPermission
 * @param { String | Array } value 权限指令的 value
 * @returns { Boolean } 是否有权限
 */
```
