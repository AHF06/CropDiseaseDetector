"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 消息列表
      messages: [],
      inputText: "",
      isLoading: false,
      scrollToView: "",
      // 历史记录
      hasMoreHistory: false,
      historyPage: 1,
      // UI状态
      showMenuModal: false,
      // 快捷回复
      quickReplies: [],
      // AI配置
      aiName: "农小智",
      // 知识库（模拟）
      knowledgeBase: {
        "稻瘟病": "稻瘟病是由稻瘟病菌引起的水稻病害。防治方法：1. 选用抗病品种；2. 合理施肥，避免偏施氮肥；3. 发病初期喷施三环唑、稻瘟灵等药剂，间隔7-10天一次，连续2-3次。",
        "玉米螟": "玉米螟是玉米的主要害虫。防治方法：1. 释放赤眼蜂进行生物防治；2. 使用Bt制剂或氯虫苯甲酰胺等药剂；3. 及时清理田间秸秆，减少越冬虫源。",
        "小麦锈病": "小麦锈病分为条锈、叶锈和秆锈。防治方法：1. 种植抗病品种；2. 发病初期喷施戊唑醇、烯唑醇等三唑类药剂；3. 加强田间管理，合理排灌。",
        "白粉病": "白粉病主要危害小麦、瓜类等。防治方法：1. 选用抗病品种；2. 发病初期喷施三唑酮、醚菌酯等；3. 注意通风透光，降低湿度。",
        "蚜虫": "蚜虫防治方法：1. 使用黄板诱杀；2. 喷施吡虫啉、啶虫脒等药剂；3. 保护瓢虫、食蚜蝇等天敌。",
        "农药使用": "农药使用注意事项：1. 对症下药，选择登记药剂；2. 严格按推荐剂量使用，不随意加大浓度；3. 注意轮换用药，防止抗性；4. 遵守安全间隔期；5. 做好个人防护。",
        "有机种植": "有机种植要点：1. 使用有机肥替代化肥；2. 采用生物防治替代化学农药；3. 轮作休耕，保持土壤健康；4. 种植绿肥，增加土壤有机质。",
        "施肥技巧": "科学施肥技巧：1. 测土配方，按需施肥；2. 有机无机配合；3. 基肥追肥结合；4. 氮磷钾平衡；5. 微量元素补充；6. 避免过量施用。"
      }
    };
  },
  onLoad() {
    this.loadHistory();
    this.addWelcomeMessage();
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载历史对话
    loadHistory() {
      const savedHistory = common_vendor.index.getStorageSync("ai_chat_history");
      if (savedHistory && savedHistory.length > 0) {
        this.messages = savedHistory;
      }
    },
    // 保存对话历史
    saveHistory() {
      const toSave = this.messages.slice(-50);
      common_vendor.index.setStorageSync("ai_chat_history", toSave);
    },
    // 添加欢迎消息
    addWelcomeMessage() {
      if (this.messages.length === 0)
        ;
    },
    // 发送消息
    async sendMessage() {
      const text = this.inputText.trim();
      if (!text)
        return;
      this.addMessage("user", text);
      this.inputText = "";
      this.scrollToBottom();
      this.isLoading = true;
      setTimeout(() => {
        const reply = this.getAIResponse(text);
        this.addMessage("assistant", reply);
        this.isLoading = false;
        this.scrollToBottom();
        this.saveHistory();
        this.generateQuickReplies(text, reply);
      }, 800);
    },
    // 添加消息
    addMessage(role, content) {
      this.messages.push({
        role,
        content,
        time: (/* @__PURE__ */ new Date()).getTime(),
        isTyping: false
      });
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollToView = "msg-" + (this.messages.length - 1);
      });
    },
    // AI回复逻辑
    getAIResponse(question) {
      const lowerQuestion = question.toLowerCase();
      for (const [key, value] of Object.entries(this.knowledgeBase)) {
        if (lowerQuestion.includes(key.toLowerCase())) {
          return value;
        }
      }
      if (lowerQuestion.includes("你好") || lowerQuestion.includes("您好")) {
        return "您好！我是农小智，您的专属AI农技助手。请问有什么可以帮助您的吗？🌾";
      }
      if (lowerQuestion.includes("谢谢")) {
        return "不客气！很高兴能帮到您。如果还有其他问题，随时问我哦！🌱";
      }
      if (lowerQuestion.includes("天气")) {
        return "我正在获取您所在地区的天气信息...\n\n温馨提示：建议您打开手机定位，我可以为您提供更精准的农业气象服务。🌤️";
      }
      if (lowerQuestion.includes("识别") || lowerQuestion.includes("什么病")) {
        return "要识别病虫害，建议您：\n1. 拍摄清晰的病害部位照片\n2. 返回首页点击「拍照识别病害」\n3. 上传照片即可获得AI诊断结果\n\n您也可以描述一下具体症状，我来帮您初步分析。";
      }
      const defaultReplies = [
        "收到您的问题了！我正在努力学习农业知识中。建议您返回首页使用「拍照识别」功能，或者更详细地描述一下问题症状，我来帮您分析。🌾",
        "感谢您的提问！关于这个问题，建议您提供更多细节，比如作物种类、发病部位、症状特征等，这样我能给出更准确的建议。",
        "我是您的AI助手农小智。如果您遇到具体的病虫害问题，可以使用拍照识别功能，或者描述症状我来帮您分析。"
      ];
      return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
    },
    // 生成快捷回复
    generateQuickReplies(question, answer) {
      if (answer.includes("拍照识别")) {
        this.quickReplies = ["去拍照识别", "描述症状", "查看防治方法"];
      } else if (answer.includes("防治")) {
        this.quickReplies = ["用什么药", "怎么预防", "什么时候防治"];
      } else {
        this.quickReplies = ["识别病虫害", "防治方法", "农药使用", "种植技术"];
      }
      setTimeout(() => {
        if (this.quickReplies.length > 0) {
          this.quickReplies = [];
        }
      }, 5e3);
    },
    // 快捷回复
    sendQuickReply(reply) {
      this.inputText = reply;
      this.sendMessage();
    },
    // 快速提问
    quickAsk(type) {
      this.inputText = type;
      this.sendMessage();
    },
    // 图片选择
    showImagePicker() {
      common_vendor.index.chooseImage({
        count: 1,
        sourceType: ["camera", "album"],
        success: (res) => {
          res.tempFilePaths[0];
          this.addMessage("user", "[图片]");
          this.isLoading = true;
          setTimeout(() => {
            this.addMessage("assistant", "收到您的图片！我正在分析中...\n\n根据图片特征，建议您返回首页使用「拍照识别」功能获取更准确的诊断结果。");
            this.isLoading = false;
            this.scrollToBottom();
          }, 1500);
        }
      });
    },
    // 语音输入（演示）
    showVoiceInput() {
      common_vendor.index.showToast({
        title: "语音功能开发中",
        icon: "none"
      });
    },
    // 清空历史
    clearHistory() {
      common_vendor.index.showModal({
        title: "清空对话",
        content: "确定要清空所有聊天记录吗？",
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.saveHistory();
            this.showMenuModal = false;
            common_vendor.index.showToast({ title: "已清空", icon: "success" });
          }
        }
      });
    },
    // 分享对话
    shareChat() {
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    },
    // 意见反馈
    goToFeedback() {
      this.showMenuModal = false;
      common_vendor.index.switchTab({
        url: "/pages/mine/mine"
      });
      setTimeout(() => {
        common_vendor.index.showToast({ title: "请在「我的-意见反馈」中提交", icon: "none" });
      }, 500);
    },
    // 加载更多历史
    loadMoreHistory() {
      if (this.hasMoreHistory) {
        this.hasMoreHistory = false;
      }
    },
    onInputFocus() {
      this.scrollToBottom();
    },
    onInputBlur() {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    },
    showMenu() {
      this.showMenuModal = true;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "8f"),
    b: common_vendor.o((...args) => $options.showMenu && $options.showMenu(...args), "39"),
    c: $data.hasMoreHistory
  }, $data.hasMoreHistory ? {} : {}, {
    d: $data.messages.length === 0
  }, $data.messages.length === 0 ? {
    e: common_vendor.o(($event) => $options.quickAsk("识别病虫害"), "91"),
    f: common_vendor.o(($event) => $options.quickAsk("防治方法"), "e4"),
    g: common_vendor.o(($event) => $options.quickAsk("农药使用"), "f7"),
    h: common_vendor.o(($event) => $options.quickAsk("种植技术"), "e0")
  } : {}, {
    i: common_vendor.f($data.messages, (msg, idx, i0) => {
      return common_vendor.e({
        a: msg.role === "assistant"
      }, msg.role === "assistant" ? {} : {}, {
        b: msg.isTyping
      }, msg.isTyping ? {} : {
        c: common_vendor.t(msg.content)
      }, {
        d: common_vendor.n(msg.role),
        e: msg.role === "user"
      }, msg.role === "user" ? {} : {}, {
        f: idx,
        g: "msg-" + idx,
        h: common_vendor.n(msg.role)
      });
    }),
    j: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    k: $data.scrollToView,
    l: common_vendor.o((...args) => $options.loadMoreHistory && $options.loadMoreHistory(...args), "0d"),
    m: $data.quickReplies.length > 0
  }, $data.quickReplies.length > 0 ? {
    n: common_vendor.f($data.quickReplies, (reply, k0, i0) => {
      return {
        a: common_vendor.t(reply),
        b: reply,
        c: common_vendor.o(($event) => $options.sendQuickReply(reply), reply)
      };
    })
  } : {}, {
    o: common_vendor.o((...args) => $options.showImagePicker && $options.showImagePicker(...args), "af"),
    p: common_vendor.o((...args) => $options.showVoiceInput && $options.showVoiceInput(...args), "be"),
    q: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args), "73"),
    r: common_vendor.o((...args) => $options.onInputFocus && $options.onInputFocus(...args), "a0"),
    s: common_vendor.o((...args) => $options.onInputBlur && $options.onInputBlur(...args), "fa"),
    t: $data.inputText,
    v: common_vendor.o(($event) => $data.inputText = $event.detail.value, "90"),
    w: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args), "7f"),
    x: $data.showMenuModal
  }, $data.showMenuModal ? {
    y: common_vendor.o((...args) => $options.clearHistory && $options.clearHistory(...args), "43"),
    z: common_vendor.o((...args) => $options.shareChat && $options.shareChat(...args), "98"),
    A: common_vendor.o((...args) => $options.goToFeedback && $options.goToFeedback(...args), "08"),
    B: common_vendor.o(() => {
    }, "c8"),
    C: common_vendor.o(($event) => $data.showMenuModal = false, "a5")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fdb58938"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ai/ai.js.map
