"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 原始数据
      allRecords: [],
      // 筛选相关
      searchKeyword: "",
      activeFilter: "all",
      filterCrop: "",
      filterSeverity: "",
      startDate: "",
      endDate: "",
      dateFilter: "all",
      tempStartDate: "",
      tempEndDate: "",
      // UI状态
      showFilterDrawer: false,
      showDatePicker: false,
      showReport: false,
      loading: false,
      hasMore: true,
      page: 1,
      pageSize: 10,
      listHeight: 0,
      // 报告数据
      reportData: {},
      heatmapData: [],
      monthlyTrend: [],
      diseaseRanking: [],
      // 常量
      defaultThumb: "https://picsum.photos/id/15/100/100",
      crops: ["水稻", "小麦", "玉米", "大豆", "蔬菜", "果树"]
    };
  },
  computed: {
    totalCount() {
      return this.allRecords.length;
    },
    treatedCount() {
      return this.allRecords.filter((r) => r.status === "已防治").length;
    },
    untreatedCount() {
      return this.allRecords.filter((r) => r.status === "待防治").length;
    },
    dateFilterText() {
      if (this.dateFilter === "week")
        return "最近一周";
      if (this.dateFilter === "month")
        return "最近一月";
      if (this.startDate && this.endDate)
        return `${this.startDate}~${this.endDate}`;
      return "日期筛选";
    },
    filteredRecords() {
      let records = [...this.allRecords];
      if (this.searchKeyword) {
        records = records.filter(
          (r) => r.diseaseName.includes(this.searchKeyword) || r.cropName.includes(this.searchKeyword)
        );
      }
      if (this.activeFilter !== "all") {
        records = records.filter((r) => r.status === this.activeFilter);
      }
      if (this.filterCrop) {
        records = records.filter((r) => r.cropName === this.filterCrop);
      }
      if (this.filterSeverity) {
        records = records.filter((r) => r.severity === this.filterSeverity);
      }
      if (this.startDate && this.endDate) {
        records = records.filter((r) => r.diagnosisDate >= this.startDate && r.diagnosisDate <= this.endDate);
      } else if (this.dateFilter === "week") {
        const weekAgo = /* @__PURE__ */ new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split("T")[0];
        records = records.filter((r) => r.diagnosisDate >= weekAgoStr);
      } else if (this.dateFilter === "month") {
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStr = monthAgo.toISOString().split("T")[0];
        records = records.filter((r) => r.diagnosisDate >= monthAgoStr);
      }
      return records;
    },
    maxCount() {
      return Math.max(...this.monthlyTrend.map((m) => m.count), 1);
    },
    maxDiseaseCount() {
      return Math.max(...this.diseaseRanking.map((d) => d.count), 1);
    }
  },
  onLoad() {
    this.initData();
    this.calcListHeight();
  },
  onShow() {
    this.loadRecordsFromStorage();
  },
  methods: {
    calcListHeight() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      this.listHeight = systemInfo.windowHeight - 280;
    },
    initData() {
      this.loadRecordsFromStorage();
    },
    loadRecordsFromStorage() {
      const stored = common_vendor.index.getStorageSync("plant_records") || [];
      if (stored.length > 0) {
        this.allRecords = stored;
      } else {
        this.generateMockData();
      }
    },
    generateMockData() {
      const diseases = ["稻瘟病", "小麦条锈病", "玉米大斑病", "白粉病", "蚜虫危害", "纹枯病", "赤霉病"];
      const crops = ["水稻", "小麦", "玉米", "大豆", "蔬菜"];
      const severities = ["轻度", "中等", "严重"];
      const weathers = ["晴", "多云", "小雨", "阴"];
      const statuses = ["待防治", "已防治"];
      const mockRecords = [];
      for (let i = 0; i < 25; i++) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        const dateStr = date.toISOString().split("T")[0];
        mockRecords.push({
          id: Date.now() + i,
          diseaseName: diseases[Math.floor(Math.random() * diseases.length)],
          cropName: crops[Math.floor(Math.random() * crops.length)],
          diagnosisDate: dateStr,
          weather: weathers[Math.floor(Math.random() * weathers.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          thumbnail: `https://picsum.photos/id/${20 + i}/100/100`,
          solution: "建议使用三环唑，间隔7天喷施一次",
          location: "华东区"
        });
      }
      mockRecords.sort((a, b) => b.diagnosisDate.localeCompare(a.diagnosisDate));
      this.allRecords = mockRecords;
      this.saveToStorage();
    },
    saveToStorage() {
      common_vendor.index.setStorageSync("plant_records", this.allRecords);
    },
    // 删除记录（带确认弹窗）
    deleteRecord(item) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除「${item.diseaseName}」的诊断记录吗？删除后无法恢复。`,
        confirmColor: "#e74c3c",
        success: (res) => {
          if (res.confirm) {
            const index = this.allRecords.findIndex((r) => r.id === item.id);
            if (index !== -1) {
              this.allRecords.splice(index, 1);
              this.saveToStorage();
              common_vendor.index.showToast({ title: "已删除", icon: "success" });
            }
          }
        }
      });
    },
    // 标记已防治/待防治
    markTreated(item) {
      const newStatus = item.status === "已防治" ? "待防治" : "已防治";
      item.status = newStatus;
      this.saveToStorage();
      common_vendor.index.showToast({
        title: newStatus === "已防治" ? "已标记为防治完成" : "已标记为待防治",
        icon: "success"
      });
    },
    viewDetail(item) {
      common_vendor.index.showModal({
        title: item.diseaseName,
        content: `作物：${item.cropName}
诊断日期：${item.diagnosisDate}
天气：${item.weather}
严重程度：${item.severity}
防治建议：${item.solution || "建议咨询植保专家"}`,
        confirmText: "编辑",
        cancelText: "关闭",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "编辑功能开发中", icon: "none" });
          }
        }
      });
    },
    setFilter(type) {
      this.activeFilter = type;
    },
    handleSearch() {
    },
    resetFilters() {
      this.filterCrop = "";
      this.filterSeverity = "";
      this.startDate = "";
      this.endDate = "";
      this.dateFilter = "all";
      this.showFilterDrawer = false;
    },
    applyFilters() {
      this.showFilterDrawer = false;
    },
    setQuickDate(type) {
      const today = /* @__PURE__ */ new Date();
      if (type === "week") {
        const weekAgo = /* @__PURE__ */ new Date();
        weekAgo.setDate(today.getDate() - 7);
        this.tempStartDate = weekAgo.toISOString().split("T")[0];
        this.tempEndDate = today.toISOString().split("T")[0];
      } else if (type === "month") {
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        this.tempStartDate = monthAgo.toISOString().split("T")[0];
        this.tempEndDate = today.toISOString().split("T")[0];
      } else {
        this.tempStartDate = "";
        this.tempEndDate = "";
      }
      this.dateFilter = type;
    },
    confirmDateFilter() {
      if (this.tempStartDate && this.tempEndDate) {
        this.startDate = this.tempStartDate;
        this.endDate = this.tempEndDate;
        this.dateFilter = "custom";
      } else {
        this.startDate = "";
        this.endDate = "";
      }
      this.showDatePicker = false;
    },
    generateReport() {
      const records = this.allRecords;
      this.reportData = {
        total: records.length,
        treated: records.filter((r) => r.status === "已防治").length,
        untreated: records.filter((r) => r.status === "待防治").length
      };
      const diseaseMap = /* @__PURE__ */ new Map();
      records.forEach((record) => {
        const key = `${record.cropName}-${record.diseaseName}`;
        if (!diseaseMap.has(key)) {
          diseaseMap.set(key, { crop: record.cropName, disease: record.diseaseName, count: 0 });
        }
        diseaseMap.get(key).count++;
      });
      const diseaseList = Array.from(diseaseMap.values());
      const heatRows = [];
      for (let i = 0; i < diseaseList.length; i += 4) {
        heatRows.push(diseaseList.slice(i, i + 4));
      }
      this.heatmapData = heatRows;
      const monthMap = /* @__PURE__ */ new Map();
      records.forEach((record) => {
        const month = record.diagnosisDate.substring(0, 7);
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
      });
      this.monthlyTrend = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })).slice(-6);
      const diseaseCountMap = /* @__PURE__ */ new Map();
      records.forEach((record) => {
        diseaseCountMap.set(record.diseaseName, (diseaseCountMap.get(record.diseaseName) || 0) + 1);
      });
      this.diseaseRanking = Array.from(diseaseCountMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
      this.showReport = true;
    },
    getHeatClass(count) {
      if (count >= 5)
        return "heat-high";
      if (count >= 3)
        return "heat-mid";
      if (count >= 1)
        return "heat-low";
      return "heat-none";
    },
    getSeverityClass(severity) {
      if (severity === "严重")
        return "severity-severe";
      if (severity === "中等")
        return "severity-mid";
      return "severity-mild";
    },
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.hasMore = false;
        }, 500);
      }
    },
    shareReport() {
      common_vendor.index.showToast({ title: "报告已保存到相册", icon: "success" });
    },
    // 悬浮机器人点击事件 - 跳转到AI助手页面
    openAssistant() {
      common_vendor.index.navigateTo({
        url: "/pages/ai/ai"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.totalCount),
    b: common_vendor.o(($event) => _ctx.showStats = true, "2b"),
    c: common_vendor.t($options.treatedCount),
    d: common_vendor.o(($event) => _ctx.showStats = true, "f6"),
    e: common_vendor.t($options.untreatedCount),
    f: common_vendor.o(($event) => _ctx.showStats = true, "7c"),
    g: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args), "49"),
    h: $data.searchKeyword,
    i: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value, "6c"),
    j: common_vendor.o(($event) => $data.showFilterDrawer = true, "6c"),
    k: $data.activeFilter === "all" ? 1 : "",
    l: common_vendor.o(($event) => $options.setFilter("all"), "a7"),
    m: $data.activeFilter === "待防治" ? 1 : "",
    n: common_vendor.o(($event) => $options.setFilter("待防治"), "ea"),
    o: $data.activeFilter === "已防治" ? 1 : "",
    p: common_vendor.o(($event) => $options.setFilter("已防治"), "b5"),
    q: common_vendor.t($options.dateFilterText),
    r: $data.dateFilter !== "all" ? 1 : "",
    s: common_vendor.o(($event) => $data.showDatePicker = true, "00"),
    t: $options.filteredRecords.length === 0
  }, $options.filteredRecords.length === 0 ? {} : {}, {
    v: common_vendor.f($options.filteredRecords, (item, k0, i0) => {
      return {
        a: item.thumbnail || $data.defaultThumb,
        b: common_vendor.t(item.diseaseName),
        c: common_vendor.t(item.status),
        d: common_vendor.n(item.status === "已防治" ? "treated-badge" : "pending-badge"),
        e: common_vendor.t(item.cropName),
        f: common_vendor.t(item.diagnosisDate),
        g: common_vendor.t(item.weather || "晴"),
        h: common_vendor.t(item.severity),
        i: common_vendor.n($options.getSeverityClass(item.severity)),
        j: common_vendor.o(($event) => $options.viewDetail(item), item.id),
        k: common_vendor.t(item.status === "已防治" ? "取消防治" : "标记防治"),
        l: common_vendor.o(($event) => $options.markTreated(item), item.id),
        m: common_vendor.o(($event) => $options.deleteRecord(item), item.id),
        n: item.id,
        o: item.status === "已防治" ? 1 : ""
      };
    }),
    w: $data.hasMore
  }, $data.hasMore ? {
    x: common_vendor.t($data.loading ? "加载中..." : "上拉加载更多")
  } : {}, {
    y: $data.listHeight + "px",
    z: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "9e"),
    A: common_vendor.o((...args) => $options.generateReport && $options.generateReport(...args), "a3"),
    B: $data.showFilterDrawer
  }, $data.showFilterDrawer ? {
    C: common_vendor.o(($event) => $data.showFilterDrawer = false, "e3"),
    D: common_vendor.f($data.crops, (crop, k0, i0) => {
      return {
        a: common_vendor.t(crop),
        b: crop,
        c: $data.filterCrop === crop ? 1 : "",
        d: common_vendor.o(($event) => $data.filterCrop = crop, crop)
      };
    }),
    E: $data.filterCrop === "" ? 1 : "",
    F: common_vendor.o(($event) => $data.filterCrop = "", "d8"),
    G: common_vendor.f(["轻度", "中等", "严重"], (level, k0, i0) => {
      return {
        a: common_vendor.t(level),
        b: level,
        c: $data.filterSeverity === level ? 1 : "",
        d: common_vendor.o(($event) => $data.filterSeverity = level, level)
      };
    }),
    H: $data.filterSeverity === "" ? 1 : "",
    I: common_vendor.o(($event) => $data.filterSeverity = "", "4e"),
    J: $data.startDate,
    K: common_vendor.o(($event) => $data.startDate = $event.detail.value, "16"),
    L: $data.endDate,
    M: common_vendor.o(($event) => $data.endDate = $event.detail.value, "22"),
    N: common_vendor.o((...args) => $options.resetFilters && $options.resetFilters(...args), "b7"),
    O: common_vendor.o((...args) => $options.applyFilters && $options.applyFilters(...args), "f3"),
    P: common_vendor.o(() => {
    }, "6a"),
    Q: common_vendor.o(($event) => $data.showFilterDrawer = false, "01")
  } : {}, {
    R: $data.showDatePicker
  }, $data.showDatePicker ? {
    S: common_vendor.o(($event) => $data.showDatePicker = false, "3d"),
    T: common_vendor.o(($event) => $options.setQuickDate("week"), "a9"),
    U: common_vendor.o(($event) => $options.setQuickDate("month"), "db"),
    V: common_vendor.o(($event) => $options.setQuickDate("all"), "93"),
    W: $data.tempStartDate,
    X: common_vendor.o(($event) => $data.tempStartDate = $event.detail.value, "9d"),
    Y: $data.tempEndDate,
    Z: common_vendor.o(($event) => $data.tempEndDate = $event.detail.value, "aa"),
    aa: common_vendor.o((...args) => $options.confirmDateFilter && $options.confirmDateFilter(...args), "c4"),
    ab: common_vendor.o(() => {
    }, "ae"),
    ac: common_vendor.o(($event) => $data.showDatePicker = false, "30")
  } : {}, {
    ad: $data.showReport
  }, $data.showReport ? {
    ae: common_vendor.o(($event) => $data.showReport = false, "d5"),
    af: common_vendor.t($data.reportData.total),
    ag: common_vendor.t($data.reportData.treated),
    ah: common_vendor.t($data.reportData.untreated),
    ai: common_vendor.f($data.heatmapData, (row, idx, i0) => {
      return {
        a: common_vendor.f(row, (cell, cidx, i1) => {
          return {
            a: common_vendor.t(cell.name),
            b: common_vendor.t(cell.count),
            c: cidx,
            d: common_vendor.n($options.getHeatClass(cell.count))
          };
        }),
        b: 100 / row.length + "%",
        c: idx
      };
    }),
    aj: common_vendor.f($data.monthlyTrend, (month, k0, i0) => {
      return {
        a: month.count / $options.maxCount * 120 + "px",
        b: common_vendor.t(month.name),
        c: month.name
      };
    }),
    ak: common_vendor.f($data.diseaseRanking, (item, idx, i0) => {
      return {
        a: common_vendor.t(idx + 1),
        b: common_vendor.t(item.name),
        c: item.count / $options.maxDiseaseCount * 150 + "px",
        d: common_vendor.t(item.count),
        e: idx
      };
    }),
    al: common_vendor.o((...args) => $options.shareReport && $options.shareReport(...args), "92"),
    am: common_vendor.o(() => {
    }, "76"),
    an: common_vendor.o(($event) => $data.showReport = false, "3e")
  } : {}, {
    ao: common_vendor.o((...args) => $options.openAssistant && $options.openAssistant(...args), "8e")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b2d018fa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/history.js.map
