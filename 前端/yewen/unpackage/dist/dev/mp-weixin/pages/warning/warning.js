"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 预警类型：weather（天气预警）/ region（地区预警）
      warningType: "weather",
      // 当前区域
      currentRegion: "east",
      regions: [
        { id: "east", name: "华东地区", center: "南京" },
        { id: "south", name: "华南地区", center: "广州" },
        { id: "north", name: "华北地区", center: "北京" },
        { id: "central", name: "华中地区", center: "武汉" },
        { id: "west", name: "西部地区", center: "成都" },
        { id: "northeast", name: "东北地区", center: "沈阳" }
      ],
      // 天气数据
      currentWeather: {
        icon: "☁️",
        temp: 22,
        desc: "多云",
        location: "南京市",
        humidity: 78,
        rainfall: 12.5,
        windSpeed: 8
      },
      // 天气风险
      weatherRisk: {
        level: "中风险",
        description: "当前温湿度条件适宜病害发生，未来3天有降雨，需注意防治"
      },
      // 地区风险
      regionRisk: {
        level: "中风险",
        description: "该地区近期稻瘟病发生较多，建议加强田间巡查"
      },
      // 地区信息
      regionInfo: {
        mainCrops: "水稻、小麦、玉米",
        historyRate: "稻瘟病发病率15%"
      },
      // 天气预警列表
      weatherWarningList: [],
      // 地区预警列表
      regionWarningList: [],
      // 气象因素
      weatherFactors: [],
      // 天气防控建议
      weatherAdvice: [],
      // 地区防控建议
      regionAdvice: [],
      // 更新时间
      updateTime: "",
      // 选中的预警
      selectedAlert: null
    };
  },
  computed: {
    currentRegionName() {
      const region = this.regions.find((r) => r.id === this.currentRegion);
      return region ? region.name : "华东地区";
    }
  },
  onLoad() {
    this.updateTime = this.formatTime(/* @__PURE__ */ new Date());
    this.loadAllData();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    formatTime(date) {
      const M = (date.getMonth() + 1).toString().padStart(2, "0");
      const D = date.getDate().toString().padStart(2, "0");
      const h = date.getHours().toString().padStart(2, "0");
      const m = date.getMinutes().toString().padStart(2, "0");
      return `${M}-${D} ${h}:${m}`;
    },
    switchWarningType(type) {
      this.warningType = type;
      common_vendor.index.showToast({ title: type === "weather" ? "天气预警" : "地区预警", icon: "none" });
    },
    switchRegion(regionId) {
      this.currentRegion = regionId;
      this.loadRegionData();
      common_vendor.index.showToast({ title: this.regions.find((r) => r.id === regionId).name, icon: "none" });
    },
    refreshData() {
      common_vendor.index.showToast({ title: "正在更新数据...", icon: "none" });
      setTimeout(() => {
        this.loadAllData();
        this.updateTime = this.formatTime(/* @__PURE__ */ new Date());
        common_vendor.index.showToast({ title: "更新成功", icon: "success" });
      }, 1e3);
    },
    loadAllData() {
      this.loadWeatherData();
      this.loadWeatherWarningList();
      this.loadWeatherFactors();
      this.loadWeatherAdvice();
      this.loadRegionData();
    },
    loadWeatherData() {
      const weathers = [
        { icon: "☀️", temp: 28, desc: "晴", humidity: 45, rainfall: 0, windSpeed: 8, risk: "低风险", descText: "天气晴朗干燥，病虫害发生风险较低" },
        { icon: "☁️", temp: 22, desc: "多云", humidity: 65, rainfall: 5, windSpeed: 10, risk: "低风险", descText: "天气条件一般，需注意常规监测" },
        { icon: "🌧️", temp: 18, desc: "小雨", humidity: 85, rainfall: 25, windSpeed: 12, risk: "中风险", descText: "持续降雨，田间湿度大，病害发生风险增加" },
        { icon: "⛈️", temp: 26, desc: "雷阵雨", humidity: 90, rainfall: 45, windSpeed: 15, risk: "高风险", descText: "高温高湿天气，病虫害爆发风险高，需立即防治" }
      ];
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
      this.currentWeather = {
        ...randomWeather,
        location: "南京市"
      };
      this.weatherRisk = {
        level: randomWeather.risk,
        description: randomWeather.descText
      };
    },
    loadWeatherWarningList() {
      this.weatherWarningList = [
        {
          id: 1,
          level: "高风险",
          diseaseName: "稻瘟病",
          shortDesc: "持续降雨+高湿环境，爆发风险高",
          weatherIcon: "🌧️",
          weatherCondition: "连续降雨",
          features: "叶片梭形病斑，边缘褐色中央灰白色，穗颈瘟导致白穗",
          treatment: "喷施三环唑或稻瘟灵，间隔7天一次，连续2-3次",
          notes: "抢晴施药，雨后及时补喷，避免偏施氮肥"
        },
        {
          id: 2,
          level: "中风险",
          diseaseName: "小麦赤霉病",
          shortDesc: "抽穗扬花期遇雨，感染风险增加",
          weatherIcon: "🌧️",
          weatherCondition: "阴雨天气",
          features: "穗部粉红色霉层，籽粒干瘪",
          treatment: "喷施戊唑醇、氰烯菌酯，雨后及时补喷",
          notes: "注意抽穗期天气预报，提前预防"
        },
        {
          id: 3,
          level: "中风险",
          diseaseName: "玉米螟",
          shortDesc: "温度回升，成虫活动增加",
          weatherIcon: "☀️",
          weatherCondition: "温度回升",
          features: "心叶蛀孔，叶片排孔，玉米穗受害",
          treatment: "释放赤眼蜂，或喷施氯虫苯甲酰胺",
          notes: "抓住心叶期和抽穗期防治"
        },
        {
          id: 4,
          level: "低风险",
          diseaseName: "白粉病",
          shortDesc: "湿度适中，风险较低",
          weatherIcon: "☁️",
          weatherCondition: "多云",
          features: "叶片白色粉状霉层",
          treatment: "喷施三唑酮、醚菌酯",
          notes: "保持通风透光"
        }
      ];
    },
    loadWeatherFactors() {
      const h = this.currentWeather.humidity;
      const r = this.currentWeather.rainfall;
      const t = this.currentWeather.temp;
      this.weatherFactors = [
        { name: "温度", value: `${t}°C`, impact: t > 25 ? "positive" : t < 15 ? "negative" : "neutral", impactText: t > 25 ? "↑ 促进发病" : t < 15 ? "↓ 抑制发病" : "→ 影响中性" },
        { name: "湿度", value: `${h}%`, impact: h > 80 ? "positive" : h < 60 ? "negative" : "neutral", impactText: h > 80 ? "↑ 促进发病" : h < 60 ? "↓ 抑制发病" : "→ 影响中性" },
        { name: "降雨", value: `${r}mm`, impact: r > 20 ? "positive" : r < 5 ? "negative" : "neutral", impactText: r > 20 ? "↑ 促进发病" : r < 5 ? "↓ 抑制发病" : "→ 影响中性" },
        { name: "风速", value: `${this.currentWeather.windSpeed}km/h`, impact: this.currentWeather.windSpeed > 15 ? "positive" : "neutral", impactText: this.currentWeather.windSpeed > 15 ? "↑ 促进传播" : "→ 影响中性" }
      ];
    },
    loadWeatherAdvice() {
      const level = this.weatherRisk.level;
      if (level === "高风险") {
        this.weatherAdvice = [
          { icon: "🚨", text: "立即组织施药防治，控制病害扩散" },
          { icon: "📊", text: "加密田间巡查，每日记录病害发展情况" },
          { icon: "💧", text: "雨后及时排水，降低田间湿度" },
          { icon: "💊", text: "选择高效低毒药剂，轮换使用防抗性" }
        ];
      } else if (level === "中风险") {
        this.weatherAdvice = [
          { icon: "⚠️", text: "做好预防性施药准备" },
          { icon: "👀", text: "每3天巡查一次，发现中心病株立即处理" },
          { icon: "🌾", text: "加强水肥管理，增施磷钾肥增强抗性" },
          { icon: "📱", text: "关注未来3天天气预报，提前防范" }
        ];
      } else {
        this.weatherAdvice = [
          { icon: "✅", text: "做好常规田间管理" },
          { icon: "📝", text: "定期巡查，做好监测记录" },
          { icon: "🔔", text: "关注天气变化，及时接收预警" }
        ];
      }
    },
    loadRegionData() {
      const regionData = {
        east: {
          risk: { level: "中风险", description: "近期稻瘟病发生较多，建议加强田间巡查" },
          info: { mainCrops: "水稻、小麦、玉米", historyRate: "稻瘟病发病率15%" },
          list: [
            { id: 1, level: "中风险", diseaseName: "稻瘟病", shortDesc: "近期发病较多，需加强防治", location: "江苏、浙江、安徽", features: "叶片梭形病斑，穗颈瘟", treatment: "喷施三环唑、稻瘟灵", notes: "注意水肥管理，避免偏施氮肥" },
            { id: 2, level: "低风险", diseaseName: "小麦赤霉病", shortDesc: "发生较少，常规监测即可", location: "江苏北部", features: "穗部霉变", treatment: "戊唑醇防治", notes: "关注抽穗期天气" }
          ],
          advice: [
            { icon: "🌾", text: "加强水稻田间巡查，发现病斑及时处理" },
            { icon: "💊", text: "准备三环唑等防治药剂" },
            { icon: "💧", text: "合理灌水，适时晒田" }
          ]
        },
        south: {
          risk: { level: "高风险", description: "高温高湿，稻飞虱、稻瘟病爆发风险高" },
          info: { mainCrops: "水稻、甘蔗、水果", historyRate: "稻飞虱发生率30%" },
          list: [
            { id: 1, level: "高风险", diseaseName: "稻飞虱", shortDesc: "迁入量大，需立即防治", location: "广东、广西", features: "稻株基部大量飞虱", treatment: "喷施吡蚜酮、烯啶虫胺", notes: "轮换用药防抗性" },
            { id: 2, level: "高风险", diseaseName: "稻瘟病", shortDesc: "持续降雨，爆发风险高", location: "广东、福建", features: "穗颈瘟导致白穗", treatment: "三环唑+稻瘟灵", notes: "抢晴施药" }
          ],
          advice: [
            { icon: "🚨", text: "立即组织防治，控制虫口密度" },
            { icon: "💊", text: "准备吡蚜酮、三环唑等药剂" },
            { icon: "📊", text: "加密监测，每日巡查" }
          ]
        },
        north: {
          risk: { level: "低风险", description: "天气干燥，病虫害发生较少" },
          info: { mainCrops: "小麦、玉米", historyRate: "蚜虫发生率8%" },
          list: [
            { id: 1, level: "低风险", diseaseName: "小麦蚜虫", shortDesc: "发生较少，常规监测", location: "河北、山东", features: "叶片背面蚜虫", treatment: "吡虫啉喷雾", notes: "保护天敌" }
          ],
          advice: [
            { icon: "✅", text: "做好常规田间管理" },
            { icon: "👀", text: "定期巡查，注意蚜虫发生" }
          ]
        },
        central: {
          risk: { level: "中风险", description: "近期降雨频繁，小麦赤霉病风险增加" },
          info: { mainCrops: "水稻、小麦、油菜", historyRate: "赤霉病发病率12%" },
          list: [
            { id: 1, level: "中风险", diseaseName: "小麦赤霉病", shortDesc: "抽穗期遇雨，风险增加", location: "湖北、湖南", features: "穗部霉变", treatment: "戊唑醇防治", notes: "雨后及时施药" }
          ],
          advice: [
            { icon: "⚠️", text: "关注抽穗期天气预报" },
            { icon: "💊", text: "准备戊唑醇等防治药剂" }
          ]
        },
        west: {
          risk: { level: "低风险", description: "气候干燥，病虫害发生较少" },
          info: { mainCrops: "小麦、玉米、水果", historyRate: "锈病发生率5%" },
          list: [
            { id: 1, level: "低风险", diseaseName: "小麦锈病", shortDesc: "发生较少", location: "四川、陕西", features: "叶片条状锈斑", treatment: "三唑类药剂", notes: "常规监测" }
          ],
          advice: [
            { icon: "✅", text: "做好常规监测" },
            { icon: "💧", text: "注意灌溉管理" }
          ]
        },
        northeast: {
          risk: { level: "中风险", description: "低温高湿，玉米大斑病风险增加" },
          info: { mainCrops: "玉米、大豆、水稻", historyRate: "大斑病发病率10%" },
          list: [
            { id: 1, level: "中风险", diseaseName: "玉米大斑病", shortDesc: "低温高湿易发病", location: "辽宁、吉林", features: "叶片长梭形病斑", treatment: "吡唑醚菌酯", notes: "加强田间排水" }
          ],
          advice: [
            { icon: "🌾", text: "加强田间排水，降低湿度" },
            { icon: "💊", text: "准备吡唑醚菌酯等药剂" }
          ]
        }
      };
      const data = regionData[this.currentRegion];
      if (data) {
        this.regionRisk = data.risk;
        this.regionInfo = data.info;
        this.regionWarningList = data.list;
        this.regionAdvice = data.advice;
      }
    },
    getRiskClass(level) {
      const classes = { "高风险": "risk-high", "中风险": "risk-medium", "低风险": "risk-low" };
      return classes[level] || "risk-low";
    },
    getRiskIcon(level) {
      const icons = { "高风险": "🔴", "中风险": "🟠", "低风险": "🟢" };
      return icons[level] || "🟢";
    },
    getWarningItemClass(level) {
      const classes = { "高风险": "item-high", "中风险": "item-medium", "低风险": "item-low" };
      return classes[level] || "item-low";
    },
    getLevelBadgeClass(level) {
      const classes = { "高风险": "badge-high", "中风险": "badge-medium", "低风险": "badge-low" };
      return classes[level] || "badge-low";
    },
    viewAlertDetail(alert) {
      this.selectedAlert = alert;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "bc"),
    b: common_vendor.o((...args) => $options.refreshData && $options.refreshData(...args), "1a"),
    c: $data.warningType === "weather" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchWarningType("weather"), "74"),
    e: $data.warningType === "region" ? 1 : "",
    f: common_vendor.o(($event) => $options.switchWarningType("region"), "b3"),
    g: $data.warningType === "weather"
  }, $data.warningType === "weather" ? {
    h: common_vendor.t($data.currentWeather.icon),
    i: common_vendor.t($data.currentWeather.temp),
    j: common_vendor.t($data.currentWeather.desc),
    k: common_vendor.t($data.currentWeather.location),
    l: common_vendor.t($data.currentWeather.humidity),
    m: common_vendor.t($data.currentWeather.rainfall),
    n: common_vendor.t($data.currentWeather.windSpeed),
    o: common_vendor.t($options.getRiskIcon($data.weatherRisk.level)),
    p: common_vendor.t($data.weatherRisk.level),
    q: common_vendor.t($data.weatherRisk.description),
    r: common_vendor.n($options.getRiskClass($data.weatherRisk.level)),
    s: common_vendor.f($data.weatherFactors, (factor, k0, i0) => {
      return {
        a: common_vendor.t(factor.name),
        b: common_vendor.t(factor.value),
        c: common_vendor.t(factor.impactText),
        d: common_vendor.n(factor.impact),
        e: factor.name
      };
    }),
    t: common_vendor.t($data.updateTime),
    v: common_vendor.f($data.weatherWarningList, (alert, k0, i0) => {
      return {
        a: common_vendor.t(alert.level),
        b: common_vendor.n($options.getLevelBadgeClass(alert.level)),
        c: common_vendor.t(alert.diseaseName),
        d: common_vendor.t(alert.shortDesc),
        e: common_vendor.t(alert.weatherIcon),
        f: common_vendor.t(alert.weatherCondition),
        g: alert.id,
        h: common_vendor.n($options.getWarningItemClass(alert.level)),
        i: common_vendor.o(($event) => $options.viewAlertDetail(alert), alert.id)
      };
    }),
    w: common_vendor.f($data.weatherAdvice, (advice, idx, i0) => {
      return {
        a: common_vendor.t(advice.icon),
        b: common_vendor.t(advice.text),
        c: idx
      };
    })
  } : {
    x: common_vendor.f($data.regions, (region, k0, i0) => {
      return {
        a: common_vendor.t(region.name),
        b: region.id,
        c: $data.currentRegion === region.id ? 1 : "",
        d: common_vendor.o(($event) => $options.switchRegion(region.id), region.id)
      };
    }),
    y: common_vendor.t($options.getRiskIcon($data.regionRisk.level)),
    z: common_vendor.t($options.currentRegionName),
    A: common_vendor.t($data.regionRisk.level),
    B: common_vendor.t($data.regionRisk.description),
    C: common_vendor.n($options.getRiskClass($data.regionRisk.level)),
    D: common_vendor.t($data.regionInfo.mainCrops),
    E: common_vendor.t($data.regionInfo.historyRate),
    F: common_vendor.t($data.regionRisk.level),
    G: common_vendor.n($options.getRiskClass($data.regionRisk.level)),
    H: common_vendor.t($options.currentRegionName),
    I: common_vendor.t($data.updateTime),
    J: common_vendor.f($data.regionWarningList, (alert, k0, i0) => {
      return {
        a: common_vendor.t(alert.level),
        b: common_vendor.n($options.getLevelBadgeClass(alert.level)),
        c: common_vendor.t(alert.diseaseName),
        d: common_vendor.t(alert.shortDesc),
        e: common_vendor.t(alert.location),
        f: alert.id,
        g: common_vendor.n($options.getWarningItemClass(alert.level)),
        h: common_vendor.o(($event) => $options.viewAlertDetail(alert), alert.id)
      };
    }),
    K: common_vendor.f($data.regionAdvice, (advice, idx, i0) => {
      return {
        a: common_vendor.t(advice.icon),
        b: common_vendor.t(advice.text),
        c: idx
      };
    })
  }, {
    L: $data.selectedAlert
  }, $data.selectedAlert ? {
    M: common_vendor.o(($event) => $data.selectedAlert = null, "51"),
    N: common_vendor.t($data.selectedAlert.features),
    O: common_vendor.t($data.selectedAlert.treatment),
    P: common_vendor.t($data.selectedAlert.notes),
    Q: common_vendor.o(() => {
    }, "be"),
    R: common_vendor.o(($event) => $data.selectedAlert = null, "cb")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4e882ad5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/warning/warning.js.map
