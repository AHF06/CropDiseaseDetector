"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      resultData: {
        imageUrl: "",
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
      },
      showToast: false,
      toastText: "",
      showVoiceTip: true,
      isSpeaking: false,
      speechSynth: null,
      utterance: null
    };
  },
  onLoad(options) {
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.resultData = { ...this.resultData, ...data };
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/result/result.vue:223", "解析数据失败", e);
      }
    }
    if (options.imageUrl) {
      this.resultData.imageUrl = decodeURIComponent(options.imageUrl);
    }
    if (!this.resultData.imageUrl) {
      this.resultData.imageUrl = "https://picsum.photos/id/15/400/400";
    }
    this.initSpeech();
    setTimeout(() => {
      this.voiceBroadcast();
    }, 500);
  },
  onUnload() {
    this.stopVoice();
  },
  methods: {
    // 初始化语音合成
    initSpeech() {
      if (window.speechSynthesis) {
        this.speechSynth = window.speechSynthesis;
      } else {
        common_vendor.index.__f__("log", "at pages/result/result.vue:256", "当前浏览器不支持语音合成");
        this.showVoiceTip = false;
      }
    },
    // 构建播报文本
    buildBroadcastText() {
      const data = this.resultData;
      let text = `识别结果：${data.diseaseName}，`;
      text += `置信度百分之${data.confidence}，`;
      text += `严重程度${data.severity}。`;
      text += `病原菌：${data.pathogen}。`;
      text += `危害部位：${data.harmPart}。`;
      text += `发病条件：${data.conditions}。`;
      text += `防治建议：`;
      if (data.agriculturalControl && data.agriculturalControl.length > 0) {
        text += `农业防治方面，${data.agriculturalControl.join("；")}。`;
      }
      if (data.chemicalControl && data.chemicalControl.length > 0) {
        text += `化学防治方面，${data.chemicalControl.join("；")}。`;
      }
      if (data.notes && data.notes.length > 0) {
        text += `注意事项：${data.notes.join("；")}。`;
      }
      return text;
    },
    // 语音播报
    voiceBroadcast() {
      if (!this.speechSynth) {
        common_vendor.index.showToast({ title: "当前浏览器不支持语音播报", icon: "none" });
        return;
      }
      this.stopVoice();
      const text = this.buildBroadcastText();
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = "zh-CN";
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1;
      this.utterance.volume = 1;
      const voices = this.speechSynth.getVoices();
      const zhVoice = voices.find((voice) => voice.lang.includes("zh"));
      if (zhVoice) {
        this.utterance.voice = zhVoice;
      }
      this.utterance.onstart = () => {
        this.isSpeaking = true;
        this.showVoiceTip = false;
        common_vendor.index.__f__("log", "at pages/result/result.vue:322", "开始语音播报");
      };
      this.utterance.onend = () => {
        this.isSpeaking = false;
        common_vendor.index.__f__("log", "at pages/result/result.vue:327", "语音播报结束");
      };
      this.utterance.onerror = (event) => {
        common_vendor.index.__f__("error", "at pages/result/result.vue:331", "语音播报错误", event);
        this.isSpeaking = false;
        common_vendor.index.showToast({ title: "语音播报失败", icon: "none" });
      };
      this.speechSynth.speak(this.utterance);
      common_vendor.index.showToast({ title: "开始语音播报", icon: "none", duration: 1e3 });
    },
    // 停止语音播报
    stopVoice() {
      if (this.speechSynth) {
        this.speechSynth.cancel();
        this.isSpeaking = false;
      }
    },
    // 返回上一页
    goBack() {
      this.stopVoice();
      common_vendor.index.navigateBack();
    },
    getConfidenceClass(confidence) {
      if (confidence >= 85)
        return "high";
      if (confidence >= 60)
        return "medium";
      return "low";
    },
    getSeverityClass(severity) {
      if (severity === "严重")
        return "severe";
      if (severity === "中度")
        return "moderate";
      return "mild";
    },
    saveRecord() {
      const existingRecords = common_vendor.index.getStorageSync("plant_records") || [];
      const newRecord = {
        id: Date.now(),
        diseaseName: this.resultData.diseaseName,
        cropName: this.resultData.cropName || "水稻",
        diagnosisDate: this.formatDate(/* @__PURE__ */ new Date()),
        weather: this.getCurrentWeather(),
        severity: this.resultData.severity,
        status: "待防治",
        thumbnail: this.resultData.imageUrl,
        solution: this.resultData.chemicalControl.join("；"),
        location: "当前位置"
      };
      existingRecords.unshift(newRecord);
      common_vendor.index.setStorageSync("plant_records", existingRecords);
      this.showToastMessage("已保存到植保档案");
    },
    formatDate(date) {
      const Y = date.getFullYear();
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      return `${Y}-${M}-${D}`;
    },
    getCurrentWeather() {
      const weathers = ["晴", "多云", "阴", "小雨"];
      return weathers[Math.floor(Math.random() * weathers.length)];
    },
    consultExpert() {
      common_vendor.index.showModal({
        title: "联系专家",
        content: "是否要联系植保专家进行进一步诊断？",
        confirmText: "联系专家",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "正在为您连接专家...", icon: "none" });
          }
        }
      });
    },
    shareResult() {
      common_vendor.index.showShareMenu({
        withShareTicket: true,
        success: () => {
          common_vendor.index.showToast({ title: "分享面板已打开", icon: "none" });
        }
      });
    },
    showToastMessage(message) {
      this.toastText = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 2e3);
    }
  },
  onShareAppMessage() {
    return {
      title: `我的作物识别结果：${this.resultData.diseaseName}`,
      path: "/pages/index/index",
      imageUrl: this.resultData.imageUrl
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "2e"),
    b: common_vendor.o((...args) => $options.voiceBroadcast && $options.voiceBroadcast(...args), "77"),
    c: common_vendor.o((...args) => $options.shareResult && $options.shareResult(...args), "02"),
    d: $data.showVoiceTip
  }, $data.showVoiceTip ? {
    e: common_vendor.o((...args) => $options.voiceBroadcast && $options.voiceBroadcast(...args), "f2")
  } : {}, {
    f: $data.resultData.imageUrl,
    g: common_vendor.t($data.resultData.confidence),
    h: common_vendor.n($options.getConfidenceClass($data.resultData.confidence)),
    i: common_vendor.t($data.resultData.diseaseName),
    j: common_vendor.t($data.resultData.severity),
    k: common_vendor.n($options.getSeverityClass($data.resultData.severity)),
    l: common_vendor.t($data.resultData.latinName),
    m: common_vendor.t($data.resultData.pathogen),
    n: common_vendor.t($data.resultData.harmPart),
    o: common_vendor.t($data.resultData.conditions),
    p: common_vendor.f($data.resultData.agriculturalControl, (item, idx, i0) => {
      return {
        a: common_vendor.t(item),
        b: idx
      };
    }),
    q: common_vendor.f($data.resultData.chemicalControl, (item, idx, i0) => {
      return {
        a: common_vendor.t(item),
        b: idx
      };
    }),
    r: common_vendor.f($data.resultData.notes, (item, idx, i0) => {
      return {
        a: common_vendor.t(item),
        b: idx
      };
    }),
    s: $data.resultData.similarDiseases && $data.resultData.similarDiseases.length > 0
  }, $data.resultData.similarDiseases && $data.resultData.similarDiseases.length > 0 ? {
    t: common_vendor.f($data.resultData.similarDiseases, (item, idx, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.difference),
        c: idx
      };
    })
  } : {}, {
    v: common_vendor.o((...args) => $options.saveRecord && $options.saveRecord(...args), "94"),
    w: common_vendor.o((...args) => $options.voiceBroadcast && $options.voiceBroadcast(...args), "8d"),
    x: common_vendor.o((...args) => $options.consultExpert && $options.consultExpert(...args), "c1"),
    y: $data.isSpeaking
  }, $data.isSpeaking ? {
    z: common_vendor.o((...args) => $options.stopVoice && $options.stopVoice(...args), "3c")
  } : {}, {
    A: $data.showToast
  }, $data.showToast ? {
    B: common_vendor.t($data.toastText)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b615976f"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/result/result.js.map
