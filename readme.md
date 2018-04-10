### JS 存储封装

API 和 localStorage 保持一致，包装存储类型：localStorage、cookie、sessionStorage、window.name

> localS：localStorage 存储，如果不支持该存储方式，会启用 cookie

> sessionS: session 级缓存，sessionStorage -> window.name 逐步兼容

> nameS: 也是 session 级缓存，但是只用 window.name 存储

```javascript
import {
    isSessionAble,
    isLocalAble,
    checkStorage,
    localS,
    nameS,
    sessionS
} from "tf-store";

// true或false 浏览器是否支持sessionStorage存储
console.log(isSessionAble);

// nameS、sessionS使用和localS一样
localS.setItem("obj", { a: "aa" });
localS.getItem("obj");
localS.getAll();
localS.clear();
localS.removeItem("obj");
```
