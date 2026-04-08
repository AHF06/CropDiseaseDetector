"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 登录类型
      loginType: "password",
      // password / code
      // 密码登录表单
      loginForm: {
        phone: "",
        password: ""
      },
      // 验证码登录表单
      codeForm: {
        phone: "",
        code: ""
      },
      // UI状态
      showPassword: false,
      rememberMe: false,
      agreeProtocol: true,
      codeCountdown: 0
    };
  },
  onLoad() {
    this.loadSavedAccount();
  },
  methods: {
    // 加载保存的账号
    loadSavedAccount() {
      const saved = common_vendor.index.getStorageSync("saved_account");
      if (saved && saved.phone) {
        this.loginForm.phone = saved.phone;
        this.loginForm.password = saved.password;
        this.rememberMe = true;
      }
    },
    // 保存账号
    saveAccount() {
      if (this.rememberMe) {
        common_vendor.index.setStorageSync("saved_account", {
          phone: this.loginForm.phone,
          password: this.loginForm.password
        });
      } else {
        common_vendor.index.removeStorageSync("saved_account");
      }
    },
    // 密码登录
    handleLogin() {
      if (!this.loginForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号/用户名", icon: "none" });
        return;
      }
      if (!this.loginForm.password) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      if (!this.agreeProtocol) {
        common_vendor.index.showToast({ title: "请同意用户协议", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中...", mask: true });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        if (this.loginForm.phone && this.loginForm.password) {
          const userInfo = {
            userId: "USER_" + Date.now(),
            nickname: "农场主",
            phone: this.loginForm.phone,
            avatar: "https://picsum.photos/id/64/200/200",
            loginTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          common_vendor.index.setStorageSync("user_info", userInfo);
          common_vendor.index.setStorageSync("is_login", true);
          this.saveAccount();
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/index/index" });
          }, 500);
        } else {
          common_vendor.index.showToast({ title: "账号或密码错误", icon: "none" });
        }
      }, 1e3);
    },
    // 验证码登录
    handleCodeLogin() {
      if (!this.codeForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!this.codeForm.code) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      if (!this.agreeProtocol) {
        common_vendor.index.showToast({ title: "请同意用户协议", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中...", mask: true });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        if (this.codeForm.code === "123456") {
          const userInfo = {
            userId: "USER_" + Date.now(),
            nickname: "农场主",
            phone: this.codeForm.phone,
            avatar: "https://picsum.photos/id/64/200/200",
            loginTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          common_vendor.index.setStorageSync("user_info", userInfo);
          common_vendor.index.setStorageSync("is_login", true);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/index/index" });
          }, 500);
        } else {
          common_vendor.index.showToast({ title: "验证码错误", icon: "none" });
        }
      }, 1e3);
    },
    // 发送验证码
    sendCode() {
      if (this.codeCountdown > 0)
        return;
      if (!this.codeForm.phone) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.codeForm.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
      common_vendor.index.__f__("log", "at pages/login/login.vue:307", "验证码：123456");
      this.codeCountdown = 60;
      const timer = setInterval(() => {
        this.codeCountdown--;
        if (this.codeCountdown <= 0) {
          clearInterval(timer);
        }
      }, 1e3);
    },
    // 忘记密码
    forgotPassword() {
      common_vendor.index.showModal({
        title: "找回密码",
        content: "请联系客服或使用验证码登录",
        confirmText: "去验证码登录",
        success: (res) => {
          if (res.confirm) {
            this.loginType = "code";
          }
        }
      });
    },
    // 微信登录
    wechatLogin() {
      common_vendor.index.showToast({ title: "微信登录开发中", icon: "none" });
    },
    // QQ登录
    qqLogin() {
      common_vendor.index.showToast({ title: "QQ登录开发中", icon: "none" });
    },
    // 指纹登录
    fingerprintLogin() {
      common_vendor.index.showToast({ title: "指纹登录开发中", icon: "none" });
    },
    // 注册
    goToRegister() {
      common_vendor.index.showToast({ title: "注册功能开发中", icon: "none" });
    },
    // 显示协议
    showProtocol(type) {
      const title = type === "user" ? "用户协议" : "隐私政策";
      const content = type === "user" ? "欢迎使用病虫害识别助手！本应用致力于为用户提供专业的病虫害识别与防治建议服务。用户在使用本服务时应遵守相关法律法规，不得利用本服务进行任何违法活动。本应用对识别结果仅供参考，具体防治请咨询专业农技人员。" : "我们重视您的隐私保护。我们会收集您的设备信息、使用记录等以提供更好的服务。我们不会将您的个人信息出售给第三方。详细信息请查看完整版隐私政策。";
      common_vendor.index.showModal({
        title,
        content,
        showCancel: false,
        confirmText: "我知道了"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loginType === "password" ? 1 : "",
    b: common_vendor.o(($event) => $data.loginType = "password", "48"),
    c: $data.loginType === "code" ? 1 : "",
    d: common_vendor.o(($event) => $data.loginType = "code", "28"),
    e: $data.loginType === "password"
  }, $data.loginType === "password" ? common_vendor.e({
    f: $data.loginForm.phone,
    g: common_vendor.o(($event) => $data.loginForm.phone = $event.detail.value, "a3"),
    h: $data.showPassword ? "text" : "password",
    i: $data.loginForm.password,
    j: common_vendor.o(($event) => $data.loginForm.password = $event.detail.value, "43"),
    k: common_vendor.t($data.showPassword ? "👁️" : "👁️‍🗨️"),
    l: common_vendor.o(($event) => $data.showPassword = !$data.showPassword, "16"),
    m: $data.rememberMe
  }, $data.rememberMe ? {} : {}, {
    n: $data.rememberMe ? 1 : "",
    o: common_vendor.o(($event) => $data.rememberMe = !$data.rememberMe, "7e"),
    p: common_vendor.o((...args) => $options.forgotPassword && $options.forgotPassword(...args), "bc"),
    q: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args), "73")
  }) : {
    r: $data.codeForm.phone,
    s: common_vendor.o(($event) => $data.codeForm.phone = $event.detail.value, "27"),
    t: $data.codeForm.code,
    v: common_vendor.o(($event) => $data.codeForm.code = $event.detail.value, "4a"),
    w: common_vendor.t($data.codeCountdown > 0 ? `${$data.codeCountdown}s后重试` : "获取验证码"),
    x: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "4e"),
    y: $data.codeCountdown > 0 ? 1 : "",
    z: common_vendor.o((...args) => $options.handleCodeLogin && $options.handleCodeLogin(...args), "64")
  }, {
    A: common_vendor.o((...args) => $options.wechatLogin && $options.wechatLogin(...args), "82"),
    B: common_vendor.o((...args) => $options.qqLogin && $options.qqLogin(...args), "4b"),
    C: common_vendor.o((...args) => $options.fingerprintLogin && $options.fingerprintLogin(...args), "02"),
    D: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args), "5a"),
    E: $data.agreeProtocol
  }, $data.agreeProtocol ? {} : {}, {
    F: $data.agreeProtocol ? 1 : "",
    G: common_vendor.o(($event) => $data.agreeProtocol = !$data.agreeProtocol, "e6"),
    H: common_vendor.o(($event) => $options.showProtocol("user"), "88"),
    I: common_vendor.o(($event) => $options.showProtocol("privacy"), "b5")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
