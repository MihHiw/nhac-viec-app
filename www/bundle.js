(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var createCapacitorPlatforms, initPlatforms, CapacitorPlatforms, addPlatform, setPlatform, ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, Plugins, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      createCapacitorPlatforms = (win) => {
        const defaultPlatformMap = /* @__PURE__ */ new Map();
        defaultPlatformMap.set("web", { name: "web" });
        const capPlatforms = win.CapacitorPlatforms || {
          currentPlatform: { name: "web" },
          platforms: defaultPlatformMap
        };
        const addPlatform2 = (name, platform) => {
          capPlatforms.platforms.set(name, platform);
        };
        const setPlatform2 = (name) => {
          if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
          }
        };
        capPlatforms.addPlatform = addPlatform2;
        capPlatforms.setPlatform = setPlatform2;
        return capPlatforms;
      };
      initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
      CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      addPlatform = CapacitorPlatforms.addPlatform;
      setPlatform = CapacitorPlatforms.setPlatform;
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins2 = cap.Plugins = cap.Plugins || {};
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== "web";
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => {
          var _a2;
          return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
        };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
          return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = /* @__PURE__ */ new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a2, _b2;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
              }
            } else if (impl) {
              return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins2[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([
              ...Object.keys(jsImplementations),
              ...pluginHeader ? [platform] : []
            ])
          });
          return proxy;
        };
        const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      Plugins = Capacitor.Plugins;
      WebPlugin = class {
        constructor(config) {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
          if (config) {
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
          }
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          this.listeners[eventName].splice(index, 1);
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/definitions.js
  var Weekday;
  var init_definitions = __esm({
    "node_modules/@capacitor/local-notifications/dist/esm/definitions.js"() {
      (function(Weekday2) {
        Weekday2[Weekday2["Sunday"] = 1] = "Sunday";
        Weekday2[Weekday2["Monday"] = 2] = "Monday";
        Weekday2[Weekday2["Tuesday"] = 3] = "Tuesday";
        Weekday2[Weekday2["Wednesday"] = 4] = "Wednesday";
        Weekday2[Weekday2["Thursday"] = 5] = "Thursday";
        Weekday2[Weekday2["Friday"] = 6] = "Friday";
        Weekday2[Weekday2["Saturday"] = 7] = "Saturday";
      })(Weekday || (Weekday = {}));
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    LocalNotificationsWeb: () => LocalNotificationsWeb
  });
  var LocalNotificationsWeb;
  var init_web = __esm({
    "node_modules/@capacitor/local-notifications/dist/esm/web.js"() {
      init_dist();
      LocalNotificationsWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.pending = [];
          this.deliveredNotifications = [];
          this.hasNotificationSupport = () => {
            if (!("Notification" in window) || !Notification.requestPermission) {
              return false;
            }
            if (Notification.permission !== "granted") {
              try {
                new Notification("");
              } catch (e) {
                if (e.name == "TypeError") {
                  return false;
                }
              }
            }
            return true;
          };
        }
        async getDeliveredNotifications() {
          const deliveredSchemas = [];
          for (const notification of this.deliveredNotifications) {
            const deliveredSchema = {
              title: notification.title,
              id: parseInt(notification.tag),
              body: notification.body
            };
            deliveredSchemas.push(deliveredSchema);
          }
          return {
            notifications: deliveredSchemas
          };
        }
        async removeDeliveredNotifications(delivered) {
          for (const toRemove of delivered.notifications) {
            const found = this.deliveredNotifications.find((n) => n.tag === String(toRemove.id));
            found === null || found === void 0 ? void 0 : found.close();
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !found);
          }
        }
        async removeAllDeliveredNotifications() {
          for (const notification of this.deliveredNotifications) {
            notification.close();
          }
          this.deliveredNotifications = [];
        }
        async createChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async deleteChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async listChannels() {
          throw this.unimplemented("Not implemented on web.");
        }
        async schedule(options) {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          for (const notification of options.notifications) {
            this.sendNotification(notification);
          }
          return {
            notifications: options.notifications.map((notification) => ({
              id: notification.id
            }))
          };
        }
        async getPending() {
          return {
            notifications: this.pending
          };
        }
        async registerActionTypes() {
          throw this.unimplemented("Not implemented on web.");
        }
        async cancel(pending) {
          this.pending = this.pending.filter((notification) => !pending.notifications.find((n) => n.id === notification.id));
        }
        async areEnabled() {
          const { display } = await this.checkPermissions();
          return {
            value: display === "granted"
          };
        }
        async changeExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async checkExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async requestPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(await Notification.requestPermission());
          return { display };
        }
        async checkPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(Notification.permission);
          return { display };
        }
        transformNotificationPermission(permission) {
          switch (permission) {
            case "granted":
              return "granted";
            case "denied":
              return "denied";
            default:
              return "prompt";
          }
        }
        sendPending() {
          var _a;
          const toRemove = [];
          const now = (/* @__PURE__ */ new Date()).getTime();
          for (const notification of this.pending) {
            if (((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) && notification.schedule.at.getTime() <= now) {
              this.buildNotification(notification);
              toRemove.push(notification);
            }
          }
          this.pending = this.pending.filter((notification) => !toRemove.find((n) => n === notification));
        }
        sendNotification(notification) {
          var _a;
          if ((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) {
            const diff = notification.schedule.at.getTime() - (/* @__PURE__ */ new Date()).getTime();
            this.pending.push(notification);
            setTimeout(() => {
              this.sendPending();
            }, diff);
            return;
          }
          this.buildNotification(notification);
        }
        buildNotification(notification) {
          const localNotification = new Notification(notification.title, {
            body: notification.body,
            tag: String(notification.id)
          });
          localNotification.addEventListener("click", this.onClick.bind(this, notification), false);
          localNotification.addEventListener("show", this.onShow.bind(this, notification), false);
          localNotification.addEventListener("close", () => {
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !this);
          }, false);
          this.deliveredNotifications.push(localNotification);
          return localNotification;
        }
        onClick(notification) {
          const data = {
            actionId: "tap",
            notification
          };
          this.notifyListeners("localNotificationActionPerformed", data);
        }
        onShow(notification) {
          this.notifyListeners("localNotificationReceived", notification);
        }
      };
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/index.js
  var LocalNotifications;
  var init_esm = __esm({
    "node_modules/@capacitor/local-notifications/dist/esm/index.js"() {
      init_dist();
      init_definitions();
      LocalNotifications = registerPlugin("LocalNotifications", {
        web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.LocalNotificationsWeb())
      });
    }
  });

  // www/app.js
  var require_app = __commonJS({
    "www/app.js"() {
      init_dist();
      init_esm();
      var STORE_KEY = "nhacoi_tasks_v1";
      var CHAT_KEY = "nhacoi_chat_v1";
      function loadTasks() {
        try {
          return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
        } catch (e) {
          return [];
        }
      }
      function saveTasks(t) {
        localStorage.setItem(STORE_KEY, JSON.stringify(t));
      }
      function loadChat() {
        try {
          return JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
        } catch (e) {
          return [];
        }
      }
      function saveChat(c) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(c));
      }
      var tasks = loadTasks();
      var chatLog = loadChat();
      var WEEKDAYS = {
        "ch\u1EE7 nh\u1EADt": 0,
        "cn": 0,
        "th\u1EE9 2": 1,
        "th\u1EE9 hai": 1,
        "th\u1EE9 3": 2,
        "th\u1EE9 ba": 2,
        "th\u1EE9 4": 3,
        "th\u1EE9 t\u01B0": 3,
        "th\u1EE9 5": 4,
        "th\u1EE9 n\u0103m": 4,
        "th\u1EE9 6": 5,
        "th\u1EE9 s\xE1u": 5,
        "th\u1EE9 7": 6,
        "th\u1EE9 b\u1EA3y": 6
      };
      var MONTH_NAMES = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
      function parseDate(text) {
        const now = /* @__PURE__ */ new Date();
        const t = text.toLowerCase();
        if (/\bhôm nay\b/.test(t)) return startOfDay(now);
        if (/\bngày mốt\b|\bmốt\b/.test(t)) return addDays(now, 2);
        if (/\bngày mai\b|\bmai\b/.test(t)) return addDays(now, 1);
        if (/\bhôm qua\b/.test(t)) return startOfDay(now);
        let m = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
        if (m) {
          let d = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1;
          let y = m[3] ? m[3].length === 2 ? 2e3 + parseInt(m[3], 10) : parseInt(m[3], 10) : now.getFullYear();
          let candidate = new Date(y, mo, d);
          if (!m[3] && candidate < startOfDay(now)) candidate.setFullYear(y + 1);
          return startOfDay(candidate);
        }
        m = t.match(/\bngày (\d{1,2})\b/);
        if (m) {
          let d = parseInt(m[1], 10);
          let candidate = new Date(now.getFullYear(), now.getMonth(), d);
          if (candidate < startOfDay(now)) candidate.setMonth(candidate.getMonth() + 1);
          return startOfDay(candidate);
        }
        for (const key in WEEKDAYS) {
          if (t.includes(key)) {
            const target = WEEKDAYS[key];
            let d = addDays(now, (target - now.getDay() + 7) % 7 || 7);
            if (/tuần sau|tuần tới/.test(t)) d = addDays(d, 7);
            else {
              const diff = (target - now.getDay() + 7) % 7;
              d = diff === 0 ? startOfDay(now) : addDays(now, diff);
            }
            return startOfDay(d);
          }
        }
        return null;
      }
      function parseTime(text) {
        const t = text.toLowerCase();
        let m = t.match(/(\d{1,2})[h:](\d{2})?/);
        if (!m) return null;
        let h = parseInt(m[1], 10);
        let min = m[2] ? parseInt(m[2], 10) : 0;
        if (/chiều/.test(t) && h < 12) h += 12;
        else if (/tối/.test(t) && h < 12) h += 12;
        else if (/khuya/.test(t) && h < 12) h += 12;
        else if (/trưa/.test(t) && h < 12) h = 12;
        if (h > 23) h = 23;
        return { h, m: min };
      }
      function startOfDay(d) {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
      }
      function addDays(d, n) {
        const x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
      }
      function formatDateFull(d) {
        const days = ["CN", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7"];
        return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      }
      function cleanLabel(text) {
        let s = text;
        s = s.replace(/\b(hôm nay|ngày mai|mai|ngày mốt|mốt|hôm qua)\b/gi, "");
        s = s.replace(/\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?/g, "");
        s = s.replace(/\bngày \d{1,2}\b/gi, "");
        s = s.replace(/\b(thứ 2|thứ hai|thứ 3|thứ ba|thứ 4|thứ tư|thứ 5|thứ năm|thứ 6|thứ sáu|thứ 7|thứ bảy|chủ nhật|cn)\b(\s*tuần sau|\s*tuần tới)?/gi, "");
        s = s.replace(/\d{1,2}[h:]\d{0,2}\s*(sáng|chiều|tối|khuya|trưa)?/gi, "");
        s = s.replace(/\blúc\b|\bvào\b/gi, "");
        s = s.replace(/\s{2,}/g, " ").trim();
        s = s.replace(/^[,\.\-–\s]+|[,\.\-–\s]+$/g, "");
        if (s.length === 0) s = text.trim();
        return s.charAt(0).toUpperCase() + s.slice(1);
      }
      var chatEl = document.getElementById("chat");
      var todayStrip = document.getElementById("today-strip");
      var todayList = todayStrip.querySelector(".today-list");
      function renderEmptyHintIfNeeded() {
        if (chatLog.length === 0) {
          chatEl.innerHTML = `<div class="empty-hint">\u{1F44B} Ch\xE0o b\u1EA1n! C\u1EE9 g\xF5 vi\u1EC7c c\u1EA7n l\xE0m theo c\xE1ch t\u1EF1 nhi\xEAn, m\xECnh s\u1EBD t\u1EF1 hi\u1EC3u ng\xE0y gi\u1EDD.<br><br>
    <b>V\xED d\u1EE5:</b><br>"mai tui c\u1EA7n h\u1ECDp l\xFAc 9h"<br>"20/7 n\u1ED9p b\xE1o c\xE1o"<br>"th\u1EE9 6 \u0111i kh\xE1m r\u0103ng l\xFAc 3h chi\u1EC1u"</div>`;
        }
      }
      function addBubble(role, text, time) {
        const wrap = document.createElement("div");
        wrap.className = "msg " + role;
        wrap.innerHTML = `<div class="bubble"></div><div class="time"></div>`;
        wrap.querySelector(".bubble").textContent = text;
        wrap.querySelector(".time").textContent = time;
        chatEl.appendChild(wrap);
      }
      function addTicket(task) {
        const wrap = document.createElement("div");
        wrap.className = "ticket" + (task.done ? " done" : "");
        wrap.dataset.id = task.id;
        const d = new Date(task.date);
        wrap.innerHTML = `
    <div class="stub"><div class="d">${String(d.getDate()).padStart(2, "0")}</div><div class="m">${MONTH_NAMES[d.getMonth()]}</div></div>
    <div class="body">
      <div class="txt">${escapeHtml(task.label)}</div>
      <div class="meta">${formatDateFull(d)}${task.time ? " \xB7 " + String(task.time.h).padStart(2, "0") + ":" + String(task.time.m).padStart(2, "0") : ""}</div>
      <div class="actions">
        <button class="done-btn">${task.done ? "\u21BA Ch\u01B0a xong" : "\u2713 Xong r\u1ED3i"}</button>
        <button class="del-btn">\u2715 Xo\xE1</button>
      </div>
    </div>`;
        chatEl.appendChild(wrap);
        wrap.querySelector(".done-btn").onclick = () => toggleDone(task.id);
        wrap.querySelector(".del-btn").onclick = () => deleteTask(task.id);
      }
      function escapeHtml(s) {
        return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      }
      function nowHHMM() {
        const n = /* @__PURE__ */ new Date();
        return String(n.getHours()).padStart(2, "0") + ":" + String(n.getMinutes()).padStart(2, "0");
      }
      function fullRender() {
        chatEl.innerHTML = "";
        renderEmptyHintIfNeeded();
        chatLog.forEach((entry) => {
          if (entry.kind === "bubble") addBubble(entry.role, entry.text, entry.time);
          else if (entry.kind === "ticket") {
            const task = tasks.find((x) => x.id === entry.taskId);
            if (task) addTicket(task);
          }
        });
        chatEl.scrollTop = chatEl.scrollHeight;
        renderTodayStrip();
      }
      function renderTodayStrip() {
        const today = tasks.filter((t) => isSameDay(new Date(t.date), /* @__PURE__ */ new Date()));
        if (today.length === 0) {
          todayStrip.classList.remove("show");
          return;
        }
        today.sort((a, b) => (a.time ? a.time.h * 60 + a.time.m : 1e9) - (b.time ? b.time.h * 60 + b.time.m : 1e9));
        todayList.innerHTML = today.map((t) => `
    <div class="today-item ${t.done ? "done" : ""}">
      <span class="t">${t.time ? String(t.time.h).padStart(2, "0") + ":" + String(t.time.m).padStart(2, "0") : "\u2014"}</span>
      <span class="txt">${escapeHtml(t.label)}</span>
    </div>`).join("");
        todayStrip.classList.add("show");
      }
      function toggleDone(id) {
        const task = tasks.find((x) => x.id === id);
        if (!task) return;
        task.done = !task.done;
        saveTasks(tasks);
        fullRender();
      }
      function deleteTask(id) {
        tasks = tasks.filter((x) => x.id !== id);
        chatLog = chatLog.filter((e) => !(e.kind === "ticket" && e.taskId === id));
        saveTasks(tasks);
        saveChat(chatLog);
        fullRender();
      }
      var input = document.getElementById("msg-input");
      var sendBtn = document.getElementById("send-btn");
      function handleSend() {
        const text = input.value.trim();
        if (!text) return;
        chatLog.push({ kind: "bubble", role: "user", text, time: nowHHMM() });
        addBubble("user", text, nowHHMM());
        input.value = "";
        autoGrow();
        let date = parseDate(text);
        const usedDefaultDate = !date;
        if (!date) date = startOfDay(/* @__PURE__ */ new Date());
        const time = parseTime(text);
        const label = cleanLabel(text);
        const task = {
          id: "t" + Date.now() + Math.random().toString(36).slice(2, 6),
          label,
          date: date.toISOString(),
          time,
          done: false,
          notified: false
        };
        tasks.push(task);
        saveTasks(tasks);
        let botText = usedDefaultDate ? `M\xECnh ch\u01B0a th\u1EA5y ng\xE0y c\u1EE5 th\u1EC3 n\xEAn \u0111\xE3 ghi cho h\xF4m nay nh\xE9. B\u1EA1n nh\u1EAFn l\u1EA1i k\xE8m ng\xE0y n\u1EBFu m\xECnh hi\u1EC3u sai \u{1F447}` : `\u0110\xE3 ghi nh\u1EDB cho b\u1EA1n r\u1ED3i \u{1F447}`;
        chatLog.push({ kind: "bubble", role: "bot", text: botText, time: nowHHMM() });
        addBubble("bot", botText, nowHHMM());
        chatLog.push({ kind: "ticket", taskId: task.id });
        addTicket(task);
        saveChat(chatLog);
        chatEl.scrollTop = chatEl.scrollHeight;
        renderTodayStrip();
      }
      sendBtn.onclick = handleSend;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
      function autoGrow() {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 100) + "px";
      }
      input.addEventListener("input", autoGrow);
      var notifBtn = document.getElementById("notif-btn");
      async function checkNotifPerm() {
        if (Capacitor.isNative) {
          const perm = await LocalNotifications.checkPermissions();
          return perm.display === "granted";
        } else if ("Notification" in window) {
          return Notification.permission === "granted";
        }
        return false;
      }
      async function requestNotifPerm() {
        if (Capacitor.isNative) {
          const perm = await LocalNotifications.requestPermissions();
          return perm.display === "granted";
        } else if ("Notification" in window) {
          const perm = await Notification.requestPermission();
          return perm === "granted";
        }
        return false;
      }
      async function setupLockScreenChannel() {
        if (Capacitor.isNative) {
          try {
            await LocalNotifications.createChannel({
              id: "nhac_oi_alerts",
              name: "Nh\u1EAFc Vi\u1EC7c",
              description: "Nh\u1EAFc nh\u1EDF c\xF4ng vi\u1EC7c, chu\xF4ng & rung tr\xEAn m\xE0n h\xECnh kho\xE1",
              importance: 5,
              visibility: 1,
              vibration: true
            });
          } catch (e) {
            console.error("Error creating channel:", e);
          }
        }
      }
      var stringToId = (s) => Math.abs(s.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0));
      async function syncNativeNotifications() {
        if (!Capacitor.isNative) return;
        const granted = await checkNotifPerm();
        if (!granted) return;
        try {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
          }
        } catch (e) {
        }
        const now = /* @__PURE__ */ new Date();
        const toSchedule = [];
        tasks.forEach((t) => {
          if (t.done) return;
          if (!t.time) return;
          const d = new Date(t.date);
          d.setHours(t.time.h, t.time.m, 0, 0);
          if (d.getTime() > now.getTime()) {
            toSchedule.push({
              title: "\u23F0 " + t.label,
              body: `\u0110\u1EBFn gi\u1EDD r\u1ED3i (${String(t.time.h).padStart(2, "0")}:${String(t.time.m).padStart(2, "0")})`,
              id: stringToId(t.id),
              schedule: { at: d, allowWhileIdle: true },
              channelId: "nhac_oi_alerts"
            });
          }
        });
        if (toSchedule.length > 0) {
          await LocalNotifications.schedule({ notifications: toSchedule });
        }
      }
      var oldSaveTasks = saveTasks;
      saveTasks = (t) => {
        oldSaveTasks(t);
        syncNativeNotifications();
      };
      async function fireNotification(title, body) {
        if (Capacitor.isNative) {
          await LocalNotifications.schedule({
            notifications: [
              {
                title,
                body,
                id: Math.floor(Math.random() * 1e6),
                schedule: { at: new Date(Date.now() + 100) },
                channelId: "nhac_oi_alerts"
              }
            ]
          });
        } else if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: "icon-192.svg" });
        }
      }
      async function fireWebNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: "icon-192.svg" });
        }
      }
      async function refreshNotifBtn() {
        const granted = await checkNotifPerm();
        if (granted) {
          notifBtn.textContent = "\u{1F514} \u0110\xE3 b\u1EADt nh\u1EAFc";
          notifBtn.classList.add("on");
          setupLockScreenChannel();
          syncNativeNotifications();
        } else {
          notifBtn.textContent = "\u{1F514} B\u1EADt nh\u1EAFc";
          notifBtn.classList.remove("on");
        }
      }
      notifBtn.onclick = async () => {
        const granted = await requestNotifPerm();
        refreshNotifBtn();
        if (granted) {
          setupLockScreenChannel();
          fireNotification("Nh\u1EAFc \u01A0i", "\u0110\xE3 b\u1EADt nh\u1EAFc vi\u1EC7c! M\xECnh s\u1EBD t\u1EF1 b\xE1o ngay c\u1EA3 khi b\u1EA1n \u0111\xF3ng app.");
        }
      };
      refreshNotifBtn();
      async function checkDueTasksWeb() {
        if (Capacitor.isNative) return;
        const granted = await checkNotifPerm();
        if (!granted) return;
        const now = /* @__PURE__ */ new Date();
        tasks.forEach((t) => {
          if (t.done || t.notified) return;
          const d = new Date(t.date);
          if (!isSameDay(d, now)) return;
          if (!t.time) {
            return;
          }
          const dueMinutes = t.time.h * 60 + t.time.m;
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (nowMinutes >= dueMinutes) {
            const late = nowMinutes - dueMinutes > 3;
            const title = "\u23F0 " + t.label;
            const body = (late ? "Tr\u1EC5 m\u1EA5t r\u1ED3i, l\u1EBD ra l\xE0 " : "\u0110\u1EBFn gi\u1EDD r\u1ED3i (") + String(t.time.h).padStart(2, "0") + ":" + String(t.time.m).padStart(2, "0") + (late ? "" : ")");
            fireWebNotification(title, body);
            t.notified = true;
            saveTasks(tasks);
          }
        });
      }
      setInterval(checkDueTasksWeb, 3e4);
      checkDueTasksWeb();
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkDueTasksWeb();
      });
      (async function greetIfNewDay() {
        const lastOpen = localStorage.getItem("nhacoi_last_open");
        const todayKey = (/* @__PURE__ */ new Date()).toDateString();
        if (lastOpen !== todayKey) {
          localStorage.setItem("nhacoi_last_open", todayKey);
          const todays = tasks.filter((t) => isSameDay(new Date(t.date), /* @__PURE__ */ new Date()) && !t.done);
          const granted = await checkNotifPerm();
          if (todays.length > 0 && granted) {
            const title = "Nh\u1EAFc \u01A0i \u2014 h\xF4m nay c\xF3 " + todays.length + " vi\u1EC7c";
            const body = todays.slice(0, 3).map((t) => t.label).join(", ");
            fireNotification(title, body);
          }
        }
      })();
      fullRender();
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("sw.js").catch(() => {
          });
        });
      }
    }
  });
  require_app();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
