"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 用户信息
      userInfo: {
        avatar: "https://picsum.photos/id/64/200/200",
        nickname: "智慧农场主",
        userId: "FARMER_" + Math.floor(Math.random() * 1e4),
        bio: "热爱农业，科技兴农🌱",
        phone: "",
        wechatBind: false
      },
      // 统计数据
      diagnosisCount: 0,
      cropCount: 0,
      postCount: 0,
      // 通知设置
      notificationStatus: true,
      notificationSettings: {
        push: true,
        alert: true,
        community: true,
        system: true
      },
      // 作物列表
      cropList: [],
      commonCrops: ["水稻", "小麦", "玉米", "大豆", "蔬菜", "果树", "棉花", "油菜"],
      // 诊断记录
      diagnosisRecords: [],
      // 弹窗控制
      showProfileModal: false,
      showNotificationModal: false,
      showCropModal: false,
      showAddCropModal: false,
      showDiagnosisModal: false,
      showFeedbackModal: false,
      showSecurityModal: false,
      // 临时数据
      tempUserInfo: {},
      tempCrop: { name: "", area: "", plantDate: "", location: "" },
      editingCropIndex: null,
      // 反馈数据
      feedbackTypes: ["功能建议", "Bug反馈", "内容问题", "合作咨询", "其他"],
      feedbackData: { type: "", content: "", contact: "" }
    };
  },
  onLoad() {
    this.loadUserData();
    this.loadStatistics();
    this.loadDiagnosisRecords();
    this.loadCrops();
  },
  onShow() {
    this.loadStatistics();
    this.loadDiagnosisRecords();
  },
  methods: {
    // 加载用户数据
    loadUserData() {
      const savedUser = common_vendor.index.getStorageSync("user_info");
      if (savedUser) {
        this.userInfo = { ...this.userInfo, ...savedUser };
      }
    },
    // 保存用户数据
    saveUserData() {
      common_vendor.index.setStorageSync("user_info", this.userInfo);
    },
    // 加载统计数据
    loadStatistics() {
      const records = common_vendor.index.getStorageSync("plant_records") || [];
      this.diagnosisCount = records.length;
      const crops = common_vendor.index.getStorageSync("my_crops") || [];
      this.cropCount = crops.length;
      this.cropList = crops;
      this.postCount = common_vendor.index.getStorageSync("user_posts") || Math.floor(Math.random() * 20) + 5;
    },
    // 加载诊断记录
    loadDiagnosisRecords() {
      const records = common_vendor.index.getStorageSync("plant_records") || [];
      this.diagnosisRecords = records.slice(0, 10);
    },
    // 加载作物列表
    loadCrops() {
      const crops = common_vendor.index.getStorageSync("my_crops") || [];
      if (crops.length === 0) {
        this.cropList = [
          { name: "水稻", area: "50", plantDate: "2026-03-15", location: "江苏省-南京市" },
          { name: "小麦", area: "30", plantDate: "2026-02-20", location: "江苏省-南京市" }
        ];
        this.saveCrops();
      } else {
        this.cropList = crops;
      }
    },
    saveCrops() {
      common_vendor.index.setStorageSync("my_crops", this.cropList);
      this.cropCount = this.cropList.length;
    },
    getCropIcon(cropName) {
      const icons = { "水稻": "🌾", "小麦": "🌾", "玉米": "🌽", "大豆": "🫘", "蔬菜": "🥬", "果树": "🍎", "棉花": "🌿", "油菜": "🌼" };
      return icons[cropName] || "🌱";
    },
    // 个人资料编辑
    editProfile() {
      this.tempUserInfo = { ...this.userInfo };
      this.showProfileModal = true;
    },
    changeAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["album"],
        success: (res) => {
          this.tempUserInfo.avatar = res.tempFilePaths[0];
        }
      });
    },
    onRegionChange(e) {
      this.tempUserInfo.region = e.detail.value.join(" ");
    },
    saveProfile() {
      this.userInfo = { ...this.tempUserInfo };
      this.saveUserData();
      this.showProfileModal = false;
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
    },
    // 账号与安全
    goToAccountSecurity() {
      this.showSecurityModal = true;
    },
    changePassword() {
      common_vendor.index.showModal({
        title: "修改密码",
        content: "该功能将跳转至密码修改页面",
        confirmText: "去修改",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "演示模式，暂不跳转", icon: "none" });
          }
        }
      });
    },
    bindPhone() {
      common_vendor.index.showModal({
        title: "绑定手机号",
        content: "请输入手机号",
        editable: true,
        placeholderText: "请输入11位手机号",
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.phone = res.content;
            this.saveUserData();
            common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
            this.showSecurityModal = false;
          }
        }
      });
    },
    bindWechat() {
      common_vendor.index.showToast({ title: "微信绑定（演示模式）", icon: "none" });
    },
    // 消息通知设置
    goToNotificationSettings() {
      this.showNotificationModal = true;
    },
    saveNotificationSettings() {
      this.notificationStatus = this.notificationSettings.push;
      common_vendor.index.setStorageSync("notification_settings", this.notificationSettings);
      this.showNotificationModal = false;
      common_vendor.index.showToast({ title: "设置已保存", icon: "success" });
    },
    // 意见反馈
    goToFeedback() {
      this.feedbackData = { type: "", content: "", contact: "" };
      this.showFeedbackModal = true;
    },
    submitFeedback() {
      if (!this.feedbackData.content) {
        common_vendor.index.showToast({ title: "请填写反馈内容", icon: "none" });
        return;
      }
      const feedbacks = common_vendor.index.getStorageSync("feedbacks") || [];
      feedbacks.push({
        ...this.feedbackData,
        time: (/* @__PURE__ */ new Date()).toLocaleString(),
        userId: this.userInfo.userId
      });
      common_vendor.index.setStorageSync("feedbacks", feedbacks);
      this.showFeedbackModal = false;
      common_vendor.index.showToast({ title: "感谢您的反馈！", icon: "success" });
    },
    // 作物管理
    goToCropManage() {
      this.showCropModal = true;
    },
    addCrop() {
      this.tempCrop = { name: "", area: "", plantDate: "", location: "" };
      this.editingCropIndex = null;
      this.showAddCropModal = true;
    },
    editCrop(crop, index) {
      this.tempCrop = { ...crop };
      this.editingCropIndex = index;
      this.showAddCropModal = true;
    },
    saveCrop() {
      if (!this.tempCrop.name || !this.tempCrop.area) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      if (this.editingCropIndex !== null) {
        this.cropList[this.editingCropIndex] = { ...this.tempCrop };
      } else {
        this.cropList.push({ ...this.tempCrop });
      }
      this.saveCrops();
      this.showAddCropModal = false;
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
    },
    deleteCrop(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定删除「${this.cropList[index].name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.cropList.splice(index, 1);
            this.saveCrops();
            common_vendor.index.showToast({ title: "已删除", icon: "success" });
          }
        }
      });
    },
    // 诊断记录
    goToDiagnosisRecords() {
      this.showDiagnosisModal = true;
    },
    viewDiagnosisDetail(record) {
      common_vendor.index.showModal({
        title: record.diseaseName,
        content: `作物：${record.cropName}
诊断日期：${record.diagnosisDate}
严重程度：${record.severity}
防治建议：${record.solution || "建议咨询植保专家"}`,
        showCancel: false
      });
    },
    // 其他功能
    goToCommunity() {
      common_vendor.index.switchTab({ url: "/pages/community/community" });
    },
    goToAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "病虫害识别助手 v2.0.0\n\n一款专注于农业病虫害识别与防治的智能工具，助力智慧农业发展。\n\n客服邮箱：support@agriai.com",
        showCancel: false
      });
    },
    // 退出登录
    handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        confirmColor: "#e74c3c",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("is_login");
            common_vendor.index.removeStorageSync("user_info");
            common_vendor.index.removeStorageSync("saved_account");
            common_vendor.index.showToast({ title: "已退出", icon: "success" });
            this.userInfo = {
              avatar: "https://picsum.photos/id/64/200/200",
              nickname: "智慧农场主",
              userId: "FARMER_" + Math.floor(Math.random() * 1e4),
              bio: "热爱农业，科技兴农🌱",
              phone: "",
              wechatBind: false
            };
            setTimeout(() => {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }, 500);
          }
        }
      });
    },
    // 悬浮机器人
    openAssistant() {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      if (!isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后使用AI助手",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/ai/ai"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatar,
    b: common_vendor.t($data.userInfo.nickname),
    c: common_vendor.t($data.userInfo.userId),
    d: common_vendor.t($data.userInfo.bio || "点击编辑个人简介"),
    e: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args), "c7"),
    f: common_vendor.t($data.diagnosisCount),
    g: common_vendor.o((...args) => $options.goToDiagnosisRecords && $options.goToDiagnosisRecords(...args), "f0"),
    h: common_vendor.t($data.cropCount),
    i: common_vendor.o((...args) => $options.goToCropManage && $options.goToCropManage(...args), "27"),
    j: common_vendor.t($data.postCount),
    k: common_vendor.o((...args) => $options.goToCommunity && $options.goToCommunity(...args), "35"),
    l: common_vendor.o((...args) => $options.goToAccountSecurity && $options.goToAccountSecurity(...args), "df"),
    m: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args), "a8"),
    n: common_vendor.t($data.notificationStatus ? "已开启" : "已关闭"),
    o: common_vendor.o((...args) => $options.goToNotificationSettings && $options.goToNotificationSettings(...args), "3e"),
    p: common_vendor.o((...args) => $options.goToFeedback && $options.goToFeedback(...args), "11"),
    q: common_vendor.o((...args) => $options.goToCropManage && $options.goToCropManage(...args), "ca"),
    r: common_vendor.o((...args) => $options.goToDiagnosisRecords && $options.goToDiagnosisRecords(...args), "7d"),
    s: common_vendor.o((...args) => $options.goToAbout && $options.goToAbout(...args), "96"),
    t: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args), "78"),
    v: $data.showProfileModal
  }, $data.showProfileModal ? {
    w: common_vendor.o(($event) => $data.showProfileModal = false, "6b"),
    x: $data.tempUserInfo.avatar,
    y: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args), "e7"),
    z: $data.tempUserInfo.nickname,
    A: common_vendor.o(($event) => $data.tempUserInfo.nickname = $event.detail.value, "d9"),
    B: $data.tempUserInfo.bio,
    C: common_vendor.o(($event) => $data.tempUserInfo.bio = $event.detail.value, "3d"),
    D: $data.tempUserInfo.phone,
    E: common_vendor.o(($event) => $data.tempUserInfo.phone = $event.detail.value, "fc"),
    F: common_vendor.t($data.tempUserInfo.region || "请选择地区"),
    G: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args), "e1"),
    H: common_vendor.o(($event) => $data.showProfileModal = false, "a5"),
    I: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args), "97"),
    J: common_vendor.o(() => {
    }, "c1"),
    K: common_vendor.o(($event) => $data.showProfileModal = false, "74")
  } : {}, {
    L: $data.showNotificationModal
  }, $data.showNotificationModal ? {
    M: common_vendor.o(($event) => $data.showNotificationModal = false, "54"),
    N: $data.notificationSettings.push,
    O: common_vendor.o((e) => $data.notificationSettings.push = e.detail.value, "19"),
    P: $data.notificationSettings.alert,
    Q: common_vendor.o((e) => $data.notificationSettings.alert = e.detail.value, "9a"),
    R: $data.notificationSettings.community,
    S: common_vendor.o((e) => $data.notificationSettings.community = e.detail.value, "92"),
    T: $data.notificationSettings.system,
    U: common_vendor.o((e) => $data.notificationSettings.system = e.detail.value, "b1"),
    V: common_vendor.o((...args) => $options.saveNotificationSettings && $options.saveNotificationSettings(...args), "47"),
    W: common_vendor.o(() => {
    }, "36"),
    X: common_vendor.o(($event) => $data.showNotificationModal = false, "1d")
  } : {}, {
    Y: $data.showCropModal
  }, $data.showCropModal ? {
    Z: common_vendor.o(($event) => $data.showCropModal = false, "b7"),
    aa: common_vendor.o((...args) => $options.addCrop && $options.addCrop(...args), "52"),
    ab: common_vendor.f($data.cropList, (crop, idx, i0) => {
      return {
        a: common_vendor.t($options.getCropIcon(crop.name)),
        b: common_vendor.t(crop.name),
        c: common_vendor.t(crop.area),
        d: common_vendor.t(crop.plantDate),
        e: common_vendor.o(($event) => $options.editCrop(crop, idx), idx),
        f: common_vendor.o(($event) => $options.deleteCrop(idx), idx),
        g: idx
      };
    }),
    ac: common_vendor.o(($event) => $data.showCropModal = false, "f7"),
    ad: common_vendor.o(() => {
    }, "8a"),
    ae: common_vendor.o(($event) => $data.showCropModal = false, "58")
  } : {}, {
    af: $data.showAddCropModal
  }, $data.showAddCropModal ? {
    ag: common_vendor.t($data.editingCropIndex !== null ? "编辑作物" : "添加作物"),
    ah: common_vendor.o(($event) => $data.showAddCropModal = false, "21"),
    ai: common_vendor.t($data.tempCrop.name || "请选择作物"),
    aj: $data.commonCrops,
    ak: common_vendor.o((e) => $data.tempCrop.name = $data.commonCrops[e.detail.value], "e7"),
    al: $data.tempCrop.area,
    am: common_vendor.o(($event) => $data.tempCrop.area = $event.detail.value, "9f"),
    an: common_vendor.t($data.tempCrop.plantDate || "请选择日期"),
    ao: common_vendor.o((e) => $data.tempCrop.plantDate = e.detail.value, "28"),
    ap: $data.tempCrop.location,
    aq: common_vendor.o(($event) => $data.tempCrop.location = $event.detail.value, "82"),
    ar: common_vendor.o(($event) => $data.showAddCropModal = false, "4f"),
    as: common_vendor.o((...args) => $options.saveCrop && $options.saveCrop(...args), "3b"),
    at: common_vendor.o(() => {
    }, "19"),
    av: common_vendor.o(($event) => $data.showAddCropModal = false, "cc")
  } : {}, {
    aw: $data.showDiagnosisModal
  }, $data.showDiagnosisModal ? common_vendor.e({
    ax: common_vendor.o(($event) => $data.showDiagnosisModal = false, "9e"),
    ay: $data.diagnosisRecords.length === 0
  }, $data.diagnosisRecords.length === 0 ? {} : {}, {
    az: common_vendor.f($data.diagnosisRecords, (record, k0, i0) => {
      return {
        a: record.thumbnail,
        b: common_vendor.t(record.diseaseName),
        c: common_vendor.t(record.diagnosisDate),
        d: common_vendor.t(record.status),
        e: common_vendor.n(record.status === "已防治" ? "treated" : "pending"),
        f: record.id,
        g: common_vendor.o(($event) => $options.viewDiagnosisDetail(record), record.id)
      };
    }),
    aA: common_vendor.o(($event) => $data.showDiagnosisModal = false, "51"),
    aB: common_vendor.o(() => {
    }, "ce"),
    aC: common_vendor.o(($event) => $data.showDiagnosisModal = false, "03")
  }) : {}, {
    aD: $data.showFeedbackModal
  }, $data.showFeedbackModal ? {
    aE: common_vendor.o(($event) => $data.showFeedbackModal = false, "d7"),
    aF: common_vendor.t($data.feedbackData.type || "请选择类型"),
    aG: $data.feedbackTypes,
    aH: common_vendor.o((e) => $data.feedbackData.type = $data.feedbackTypes[e.detail.value], "c7"),
    aI: $data.feedbackData.content,
    aJ: common_vendor.o(($event) => $data.feedbackData.content = $event.detail.value, "a0"),
    aK: $data.feedbackData.contact,
    aL: common_vendor.o(($event) => $data.feedbackData.contact = $event.detail.value, "2c"),
    aM: common_vendor.o(($event) => $data.showFeedbackModal = false, "de"),
    aN: common_vendor.o((...args) => $options.submitFeedback && $options.submitFeedback(...args), "0e"),
    aO: common_vendor.o(() => {
    }, "99"),
    aP: common_vendor.o(($event) => $data.showFeedbackModal = false, "c5")
  } : {}, {
    aQ: $data.showSecurityModal
  }, $data.showSecurityModal ? {
    aR: common_vendor.o(($event) => $data.showSecurityModal = false, "7b"),
    aS: common_vendor.o((...args) => $options.changePassword && $options.changePassword(...args), "83"),
    aT: common_vendor.t($data.userInfo.phone ? "已绑定" : "未绑定"),
    aU: common_vendor.o((...args) => $options.bindPhone && $options.bindPhone(...args), "0b"),
    aV: common_vendor.t($data.userInfo.wechatBind ? "已绑定" : "未绑定"),
    aW: common_vendor.o((...args) => $options.bindWechat && $options.bindWechat(...args), "82"),
    aX: common_vendor.o(() => {
    }, "6a"),
    aY: common_vendor.o(($event) => $data.showSecurityModal = false, "a0")
  } : {}, {
    aZ: common_vendor.o((...args) => $options.openAssistant && $options.openAssistant(...args), "07")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
