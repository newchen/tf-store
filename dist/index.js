(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Store"] = factory();
	else
		root["Store"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cookieS = exports.sessionS = exports.nameS = exports.localS = exports.checkStorage = exports.isLocalAble = exports.isSessionAble = undefined;

var _tfType = __webpack_require__(1);

var _tfCookie = __webpack_require__(2);

var _tfCookie2 = _interopRequireDefault(_tfCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * JS存储
 */

function parseJSON(data) {
    if (!data || typeof data !== "string") {
        return data;
    }
    data = data.trim();

    try {
        data = JSON.parse(data);
    } catch (e) {
        data = new Function("return " + data)();
    }

    return data;
}

// =======================================存储支持==========================================
var checkStorage = function checkStorage(s) {
    var key = "CHECK_STOARGE_TEST",
        value;

    try {
        s.setItem(key, 1);
        value = s.getItem(key);
        s.removeItem(key);

        return value == 1;
    } catch (e) {
        return false;
    }
};

// 存储支持情况
var isSessionAble, isLocalAble;
try {
    exports.isSessionAble = isSessionAble = checkStorage(sessionStorage);
    exports.isLocalAble = isLocalAble = checkStorage(localStorage);
} catch (e) {
    exports.isSessionAble = isSessionAble = false;
    exports.isLocalAble = isLocalAble = false;
}

// window.name缓存，和localStorage及sessionStorage行为保持一致
var nameStore = {
    // 刷新数据
    _flush: function _flush(data) {
        data && (window.name = JSON.stringify(data));
    },
    getAll: function getAll() {
        try {
            return this.data = parseJSON(window.name || "{}");
        } catch (e) {
            return this.data = {};
        }
    },
    setItem: function setItem(key, value) {
        var data = this.data || this.getAll();
        if (!(0, _tfType.isObject)(data)) {
            data = {};
        }
        data[key] = value;
        this._flush(data);
    },
    getItem: function getItem(key) {
        var data = this.data || this.getAll();
        if ((0, _tfType.isObject)(data)) {
            return data[key];
        }
    },
    removeItem: function removeItem(key) {
        var data = this.data || this.getAll();
        if ((0, _tfType.isObject)(data)) {
            delete data[key];
            this._flush(data);
        }
    }
};

/**
 * 存储支持
 * @param  {String} type      可选，存储类型：local、cookie、session、name、storage，默认session
 * @param  {String} nameSpace 可选，命名空间，默认使用'STORAGE_NAMESPACE'命名空间
 */
var Storage = function Storage(type, nameSpace) {
    type = type || "session";
    nameSpace = nameSpace || "STORAGE_NAMESPACE";

    var MAX = 40,
        // 最大尝试次数
    COUNT = 0,
        // 计数
    TIME = 1000 * 60 * 60 * 24,
        // 一天时间
    storageTpye = {
        local: function local(key) {
            return isLocalAble // localStorage存储，如果不支持该存储方式，会启用cookie
            ? [parseJSON(localStorage.getItem(key) || "{}"), localStorage] : [parseJSON(_tfCookie2.default.getItem(key) || "{}"), _tfCookie2.default];
        },
        session: function session(key) {
            // session级缓存，sessionStorage -> window.name 逐步兼容
            return isSessionAble ? [parseJSON(sessionStorage.getItem(key) || "{}"), sessionStorage] : this.name(key);
        },
        name: function name(key) {
            // 也是session级缓存，但是只用window.name存储
            return [parseJSON(nameStore.getItem(key) || "{}"), nameStore];
        },
        storage: function storage(key) {
            // localStorage -> sessionStorage -> window.name 逐步兼容
            return isLocalAble ? [parseJSON(localStorage.getItem(key) || "{}"), localStorage] : this.session(key);
        },
        cookie: function cookie(key) {
            return [parseJSON(_tfCookie2.default.getItem(key) || "{}"), _tfCookie2.default];
        }
    };

    var temp, storage, storageData;
    temp = storageTpye[type](nameSpace);
    storageData = temp[0]; // 存储数据
    storage = temp[1]; // 存储方式

    /**
     * 设置存储数据
     * @param {[type]} key   键名
     * @param {[type]} value 键值
     */
    var setItem = function setItem(key, value) {
        COUNT = MAX; //重置
        storageData[key] = { v: value, t: +new Date() };
        _flush();
    };

    // 获取存储数据
    var getItem = function getItem(key) {
        var value = storageData[key],
            vv = value && value.v;

        return (0, _tfType.isObject)(vv) ? Object.assign({}, vv) : (0, _tfType.isArray)(vv) ? Object.assign([], vv) : vv;
    };

    // 移除存储数据
    var removeItem = function removeItem(key) {
        COUNT = MAX; //重置
        delete storageData[key];
        _flush();
    };

    // 清除所有的数据, except排除一些项不清除
    var clear = function clear(excepts) {
        excepts = excepts || [];

        var obj = {},
            temp;

        if ((0, _tfType.isString)(excepts)) {
            excepts = excepts.split(",");
        }

        excepts.forEach(function (v) {
            temp = storageData[v];
            if (temp) obj[v] = temp;
        });

        storageData = obj;
        _flush();
    };

    /**
     * 取得整段数据
     * @param  {Boolean} extend ，最好传入该参数为true，防止对返回的数据更改
     */
    var getAll = function getAll(extend) {
        return extend ? Object.assign({}, storageData) : storageData;
    };

    // 刷入缓存数据
    var _flush = function _flush() {
        var dataStr;

        try {
            dataStr = JSON.stringify(storageData);
        } catch (e) {
            console.log("JSON.stringify转化出错", storageData);
            throw new Error(e.message);
        }

        try {
            storage.setItem(nameSpace, dataStr);
        } catch (e) {
            COUNT--;
            if (COUNT >= 0) {
                _deleteByTime();
                _flush();
            } else {
                throw new Error("写入存储报错");
            }
        }
    };

    // 按时间删除
    var _deleteByTime = function _deleteByTime() {
        var old,
            key,
            v,
            now = +new Date();

        for (var k in storageData) {
            v = storageData[k];
            if (old) {
                if (now - old.t >= TIME) return false;else if (old.t > v.t) {
                    old = v;
                    key = k;
                }
            } else {
                old = v;
                key = k;
            }
        }

        old && delete storageData[key];
    };

    return {
        clear: clear,
        getAll: getAll,
        setItem: setItem,
        getItem: getItem,
        removeItem: removeItem
    };
};

var localS = Storage("local");
var cookieS = Storage("cookie");
var nameS = Storage("name");
var sessionS = Storage("session");

exports.isSessionAble = isSessionAble;
exports.isLocalAble = isLocalAble;
exports.checkStorage = checkStorage;
exports.localS = localS;
exports.nameS = nameS;
exports.sessionS = sessionS;
exports.cookieS = cookieS;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Type=t():e.Type=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";function r(e){return function(t){return Object.prototype.toString.call(t)==="[object "+e+"]"}}Object.defineProperty(t,"__esModule",{value:!0});var o=r("Object"),i=r("String"),u=Array.isArray||r("Array"),c=r("Function"),f=r("Number"),s=r("RegExp"),p=r("Date"),a=r("HTMLBodyElement"),l=r("Boolean");t.isType=r,t.isObject=o,t.isString=i,t.isArray=u,t.isFunction=c,t.isNumber=f,t.isRegExp=s,t.isDate=p,t.isElement=a,t.isBoolean=l}])});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Cookie=t():e.Cookie=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={setItem:function(e,t){var n=arguments[2],o=arguments[3],r=new Date;n?r.setTime(r.getTime()+1e3*n):r.setTime(r.getTime()+36e5),null==o&&(o=document.domain),e=e+"="+(null===t?"; ":encodeURIComponent(t)+"; "),document.cookie=e+"expires="+r.toUTCString()+"; path=/; domain="+o},getItem:function(e){if(0===document.cookie.length)return e?null:{};for(var t,n={},o=document.cookie.split("; "),r=0;r<o.length;r++){if(t=o[r].split("="),e&&t[0]==e)return decodeURIComponent(t[1]);n[t[0]]=decodeURIComponent(t[1])}return e?null:n},getAll:function(){return this.getItem()},removeItem:function(e){this.setItem(e,null,-1,arguments[1])},clear:function(){if(0!==document.cookie.length)for(var e,t=document.cookie.split("; "),n=0;n<t.length;n++)e=t[n].split("="),this.setItem(e[0],null,-1,arguments[0])}}}])});

/***/ })
/******/ ]);
});