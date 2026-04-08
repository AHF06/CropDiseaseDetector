"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 背景图片路径
      bgImage: "https://images.pexels.com/photos/162240/barn-rural-nature-grange-162240.jpeg?auto=compress&cs=tinysrgb&w=800",
      greetingText: "早安，农场主",
      scrollHeight: 0,
      // 天气数据
      weatherIcon: "☀️",
      weatherTemp: 22,
      weatherDesc: "晴",
      currentLocation: "南京市",
      weatherHumidity: 65,
      weatherRainfall: 0,
      weatherWindSpeed: 8,
      weatherUV: 3,
      weatherVisibility: 15,
      weatherTip: "今日天气晴朗，适合田间作业，注意防晒",
      // 弹窗控制
      showWeatherModal: false,
      recentRecords: [
        {
          id: 1,
          name: "水稻稻瘟病",
          date: "2026-04-01",
          severity: "严重",
          thumbnail: "https://picsum.photos/id/33/100/100"
        },
        {
          id: 2,
          name: "小麦条锈病",
          date: "2026-03-30",
          severity: "中等",
          thumbnail: "https://picsum.photos/id/32/100/100"
        },
        {
          id: 3,
          name: "玉米螟危害",
          date: "2026-03-28",
          severity: "轻度",
          thumbnail: "https://picsum.photos/id/31/100/100"
        }
      ]
    };
  },
  onLoad() {
    this.setGreeting();
    this.calcScrollHeight();
    this.getLocation();
    this.getWeather();
  },
  onShow() {
    this.checkLoginStatus();
    this.checkSyncData();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      const userInfo = common_vendor.index.getStorageSync("user_info");
      if (!isLogin || !userInfo) {
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/login/login"
          });
        }, 100);
        return;
      }
    },
    // 获取定位
    getLocation() {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          this.getCityName(res.latitude, res.longitude);
        },
        fail: () => {
          this.currentLocation = "南京市";
          this.getWeather();
        }
      });
    },
    // 根据经纬度获取城市名
    getCityName(latitude, longitude) {
      this.currentLocation = "南京市";
      this.getWeather();
    },
    // 获取天气数据
    getWeather() {
      const weathers = [
        { icon: "☀️", temp: 28, desc: "晴", humidity: 45, rainfall: 0, windSpeed: 8, uv: 8, visibility: 20, tip: "天气晴朗，适合田间作业，注意防晒" },
        { icon: "🌤️", temp: 24, desc: "晴转多云", humidity: 55, rainfall: 0, windSpeed: 10, uv: 6, visibility: 18, tip: "天气较好，适合喷洒农药" },
        { icon: "☁️", temp: 20, desc: "多云", humidity: 65, rainfall: 0, windSpeed: 12, uv: 4, visibility: 15, tip: "多云天气，注意田间通风" },
        { icon: "🌧️", temp: 18, desc: "小雨", humidity: 85, rainfall: 15, windSpeed: 10, uv: 2, visibility: 8, tip: "有降雨，不适合露天作业，注意排水" },
        { icon: "⛈️", temp: 26, desc: "雷阵雨", humidity: 90, rainfall: 35, windSpeed: 15, uv: 3, visibility: 5, tip: "雷雨天气，暂停田间作业，注意安全" }
      ];
      const randomIndex = Math.floor(Math.random() * weathers.length);
      const weather = weathers[randomIndex];
      this.weatherIcon = weather.icon;
      this.weatherTemp = weather.temp;
      this.weatherDesc = weather.desc;
      this.weatherHumidity = weather.humidity;
      this.weatherRainfall = weather.rainfall;
      this.weatherWindSpeed = weather.windSpeed;
      this.weatherUV = weather.uv;
      this.weatherVisibility = weather.visibility;
      this.weatherTip = weather.tip;
    },
    // 刷新天气
    refreshWeather() {
      common_vendor.index.showToast({ title: "正在刷新天气...", icon: "none" });
      setTimeout(() => {
        this.getWeather();
        common_vendor.index.showToast({ title: "天气已更新", icon: "success" });
      }, 1e3);
    },
    // 显示天气详情
    showWeatherDetail() {
      this.showWeatherModal = true;
    },
    setGreeting() {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 6)
        this.greetingText = "凌晨好，农场主";
      else if (hour < 12)
        this.greetingText = "早安，农场主";
      else if (hour < 18)
        this.greetingText = "下午好，农场主";
      else
        this.greetingText = "晚上好，农场主";
    },
    calcScrollHeight() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      const tabBarHeight = 50;
      this.scrollHeight = systemInfo.windowHeight - tabBarHeight;
    },
    loadSyncData() {
      const syncList = common_vendor.index.getStorageSync("sync_diseases") || [];
      if (syncList.length > 0) {
        const syncRecords = syncList.slice(0, 3).map((item) => ({
          id: item.id,
          name: item.description.substring(0, 20) + (item.description.length > 20 ? "..." : ""),
          date: item.time.split(" ")[0],
          severity: "待诊断",
          thumbnail: "https://picsum.photos/id/20/100/100",
          isSync: true,
          originalDesc: item.description
        }));
        this.recentRecords = [...syncRecords, ...this.recentRecords].slice(0, 5);
      }
    },
    checkSyncData() {
      const syncList = common_vendor.index.getStorageSync("sync_diseases") || [];
      if (syncList.length > 0) {
        const lastSync = syncList[0];
        const lastCheckTime = common_vendor.index.getStorageSync("last_sync_check") || 0;
        if (lastSync.id > lastCheckTime) {
          common_vendor.index.showToast({
            title: `📋 来自农友圈：${lastSync.description.substring(0, 15)}...`,
            icon: "none",
            duration: 2500
          });
          common_vendor.index.setStorageSync("last_sync_check", lastSync.id);
          this.loadSyncData();
        }
      }
    },
    // 打开相机拍照识别
    openCamera() {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      if (!isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再使用拍照识别功能",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "识别中...", mask: true });
          setTimeout(() => {
            common_vendor.index.hideLoading();
            const resultData = {
              imageUrl: tempFilePath,
              diseaseName: "稻瘟病",
              latinName: "Pyricularia oryzae",
              confidence: 94,
              severity: "中度",
              pathogen: "稻瘟病菌 (Pyricularia oryzae Cavara)",
              harmPart: "叶片、叶鞘、节、穗颈",
              conditions: "高温高湿、多雨天气、氮肥过量、田间郁闭",
              agriculturalControl: [
                "选用抗病品种，如湘晚籼13号、Y两优1号等",
                "合理施肥，增施磷钾肥，避免偏施氮肥",
                "科学灌水，浅水勤灌，适时晒田",
                "及时处理病稻草，减少初侵染源"
              ],
              chemicalControl: [
                "发病初期喷施75%三环唑可湿性粉剂2000-3000倍液",
                "或40%稻瘟灵乳油800-1000倍液",
                "或30%苯甲·嘧菌酯悬浮剂1500倍液",
                "间隔7-10天一次，连续2-3次"
              ],
              notes: [
                "注意轮换用药，防止产生抗药性",
                "遵守安全间隔期，收获前30天停止用药",
                "施药时做好个人防护",
                "雨后及时排水，降低田间湿度"
              ],
              similarDiseases: [
                { name: "稻胡麻斑病", difference: "病斑为椭圆形褐色斑，边缘黄色，中间灰白色" },
                { name: "稻叶枯病", difference: "病斑从叶尖向下扩展，呈灰白色，边缘波浪状" }
              ]
            };
            common_vendor.index.navigateTo({
              url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}&imageUrl=${encodeURIComponent(tempFilePath)}`
            });
          }, 1500);
        },
        fail: () => {
          common_vendor.index.showToast({ title: "拍照失败，请重试", icon: "none" });
        }
      });
    },
    formatDate(date) {
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    },
    handleMacroWarning() {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      if (!isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后查看宏观预警",
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
        url: "/pages/warning/warning"
      });
    },
    viewRecordDetail(item) {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      if (!isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后查看记录详情",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }
          }
        });
        return;
      }
      if (item.isSync && item.originalDesc) {
        common_vendor.index.showModal({
          title: "同步病情",
          content: item.originalDesc,
          confirmText: "开始诊断",
          success: (res) => {
            if (res.confirm) {
              this.openCamera();
            }
          }
        });
      } else {
        common_vendor.index.navigateTo({
          url: `/pages/history/detail?id=${item.id}`
        });
      }
    },
    gotoHistory() {
      const isLogin = common_vendor.index.getStorageSync("is_login");
      if (!isLogin) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后查看植保档案",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }
          }
        });
        return;
      }
      common_vendor.index.switchTab({
        url: "/pages/history/history"
      });
    },
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
    a: $data.bgImage,
    b: common_vendor.t($data.greetingText),
    c: common_vendor.t($data.weatherIcon),
    d: common_vendor.t($data.weatherTemp),
    e: common_vendor.t($data.weatherDesc),
    f: common_vendor.t($data.currentLocation),
    g: common_vendor.o((...args) => $options.showWeatherDetail && $options.showWeatherDetail(...args), "7f"),
    h: common_vendor.o((...args) => $options.handleMacroWarning && $options.handleMacroWarning(...args), "26"),
    i: common_vendor.o((...args) => $options.openCamera && $options.openCamera(...args), "83"),
    j: common_vendor.o((...args) => $options.gotoHistory && $options.gotoHistory(...args), "fa"),
    k: $data.recentRecords.length > 0
  }, $data.recentRecords.length > 0 ? {
    l: common_vendor.f($data.recentRecords, (item, idx, i0) => {
      return {
        a: item.thumbnail,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.date),
        d: common_vendor.t(item.severity),
        e: common_vendor.n(item.severity === "严重" ? "severe" : "mild"),
        f: idx,
        g: common_vendor.o(($event) => $options.viewRecordDetail(item), idx)
      };
    })
  } : {
    m: common_vendor.o((...args) => $options.gotoHistory && $options.gotoHistory(...args), "17")
  }, {
    n: $data.scrollHeight + "px",
    o: common_vendor.o((...args) => $options.openAssistant && $options.openAssistant(...args), "de"),
    p: $data.showWeatherModal
  }, $data.showWeatherModal ? {
    q: common_vendor.o(($event) => $data.showWeatherModal = false, "f5"),
    r: common_vendor.t($data.weatherIcon),
    s: common_vendor.t($data.weatherTemp),
    t: common_vendor.t($data.weatherDesc),
    v: common_vendor.t($data.currentLocation),
    w: common_vendor.t($data.weatherHumidity),
    x: common_vendor.t($data.weatherRainfall),
    y: common_vendor.t($data.weatherWindSpeed),
    z: common_vendor.t($data.weatherUV),
    A: common_vendor.t($data.weatherVisibility),
    B: common_vendor.t($data.weatherTip),
    C: common_vendor.o((...args) => $options.refreshWeather && $options.refreshWeather(...args), "ee"),
    D: common_vendor.o(() => {
    }, "80"),
    E: common_vendor.o(($event) => $data.showWeatherModal = false, "40")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
