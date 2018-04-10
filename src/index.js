/**
 * JS存储
 */

import { isObject, isArray, isString } from "tf-type";
import Cookie from "tf-cookie";

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
var checkStorage = function(s) {
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
    isSessionAble = checkStorage(sessionStorage);
    isLocalAble = checkStorage(localStorage);
} catch (e) {
    isSessionAble = false;
    isLocalAble = false;
}

// window.name缓存，和localStorage及sessionStorage行为保持一致
var nameStore = {
    // 刷新数据
    _flush: function(data) {
        data && (window.name = JSON.stringify(data));
    },
    getAll: function() {
        try {
            return (this.data = parseJSON(window.name || "{}"));
        } catch (e) {
            return (this.data = {});
        }
    },
    setItem: function(key, value) {
        var data = this.data || this.getAll();
        if (!isObject(data)) {
            data = {};
        }
        data[key] = value;
        this._flush(data);
    },
    getItem: function(key) {
        var data = this.data || this.getAll();
        if (isObject(data)) {
            return data[key];
        }
    },
    removeItem: function(key) {
        var data = this.data || this.getAll();
        if (isObject(data)) {
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
var Storage = function(type, nameSpace) {
    type = type || "session";
    nameSpace = nameSpace || "STORAGE_NAMESPACE";

    var MAX = 40, // 最大尝试次数
        COUNT = 0, // 计数
        TIME = 1000 * 60 * 60 * 24, // 一天时间
        storageTpye = {
            local: function(key) {
                return isLocalAble // localStorage存储，如果不支持该存储方式，会启用cookie
                    ? [
                          parseJSON(localStorage.getItem(key) || "{}"),
                          localStorage
                      ]
                    : [parseJSON(Cookie.getItem(key) || "{}"), Cookie];
            },
            session: function(key) {
                // session级缓存，sessionStorage -> window.name 逐步兼容
                return isSessionAble
                    ? [
                          parseJSON(sessionStorage.getItem(key) || "{}"),
                          sessionStorage
                      ]
                    : this.name(key);
            },
            name: function(key) {
                // 也是session级缓存，但是只用window.name存储
                return [parseJSON(nameStore.getItem(key) || "{}"), nameStore];
            },
            storage: function(key) {
                // localStorage -> sessionStorage -> window.name 逐步兼容
                return isLocalAble
                    ? [
                          parseJSON(localStorage.getItem(key) || "{}"),
                          localStorage
                      ]
                    : this.session(key);
            },
            cookie: function(key) {
                return [parseJSON(Cookie.getItem(key) || "{}"), Cookie];
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
    var setItem = function(key, value) {
        COUNT = MAX; //重置
        storageData[key] = { v: value, t: +new Date() };
        _flush();
    };

    // 获取存储数据
    var getItem = function(key) {
        var value = storageData[key],
            vv = value && value.v;

        return isObject(vv)
            ? Object.assign({}, vv)
            : isArray(vv) ? Object.assign([], vv) : vv;
    };

    // 移除存储数据
    var removeItem = function(key) {
        COUNT = MAX; //重置
        delete storageData[key];
        _flush();
    };

    // 清除所有的数据, except排除一些项不清除
    var clear = function(excepts) {
        excepts = excepts || [];

        var obj = {},
            temp;

        if (isString(excepts)) {
            excepts = excepts.split(",");
        }

        excepts.forEach(function(v) {
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
    var getAll = function(extend) {
        return extend ? Object.assign({}, storageData) : storageData;
    };

    // 刷入缓存数据
    var _flush = function() {
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
    var _deleteByTime = function() {
        var old,
            key,
            v,
            now = +new Date();

        for (var k in storageData) {
            v = storageData[k];
            if (old) {
                if (now - old.t >= TIME) return false;
                else if (old.t > v.t) {
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

export {
    isSessionAble,
    isLocalAble,
    checkStorage,
    localS,
    nameS,
    sessionS,
    cookieS
};
