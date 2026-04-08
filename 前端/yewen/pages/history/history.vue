<template>
  <view class="history-page">
    <!-- 顶部统计栏 -->
    <view class="stats-bar">
      <view class="stat-item" @click="showStats = true">
        <text class="stat-num">{{ totalCount }}</text>
        <text class="stat-label">总记录数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="showStats = true">
        <text class="stat-num">{{ treatedCount }}</text>
        <text class="stat-label">已防治</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="showStats = true">
        <text class="stat-num">{{ untreatedCount }}</text>
        <text class="stat-label">待处理</text>
      </view>
    </view>

    <!-- 搜索筛选栏 -->
    <view class="search-bar">
      <view class="search-input-area">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          class="search-input" 
          placeholder="搜索病害名、作物名..."
          @confirm="handleSearch"
        />
      </view>
      <view class="filter-btn" @click="showFilterDrawer = true">
        <text class="filter-icon">⚙️</text>
      </view>
    </view>

    <!-- 快速筛选标签 -->
    <scroll-view scroll-x class="filter-tags">
      <view 
        class="tag" 
        :class="{ active: activeFilter === 'all' }"
        @click="setFilter('all')"
      >全部</view>
      <view 
        class="tag" 
        :class="{ active: activeFilter === '待防治' }"
        @click="setFilter('待防治')"
      >待防治</view>
      <view 
        class="tag" 
        :class="{ active: activeFilter === '已防治' }"
        @click="setFilter('已防治')"
      >已防治</view>
      <view 
        class="tag date-tag" 
        :class="{ active: dateFilter !== 'all' }"
        @click="showDatePicker = true"
      >
        {{ dateFilterText }}
      </view>
    </scroll-view>

    <!-- 记录列表 -->
    <scroll-view 
      scroll-y 
      class="record-list"
      :style="{ height: listHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <view v-if="filteredRecords.length === 0" class="empty-state">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无植保档案记录</text>
        <text class="empty-hint">点击首页拍照识别，添加第一条记录</text>
      </view>

      <!-- 卡片列表 -->
      <view 
        v-for="item in filteredRecords" 
        :key="item.id" 
        class="record-card"
        :class="{ treated: item.status === '已防治' }"
      >
        <view class="card-content" @click="viewDetail(item)">
          <view class="card-left">
            <image 
              class="thumbnail" 
              :src="item.thumbnail || defaultThumb" 
              mode="aspectFill"
            ></image>
          </view>
          <view class="card-middle">
            <view class="disease-name">
              {{ item.diseaseName }}
              <view class="status-badge" :class="item.status === '已防治' ? 'treated-badge' : 'pending-badge'">
                {{ item.status }}
              </view>
            </view>
            <view class="crop-name">🌾 {{ item.cropName }}</view>
            <view class="date-weather">
              <text class="date">📅 {{ item.diagnosisDate }}</text>
              <text class="weather">☀️ {{ item.weather || '晴' }}</text>
            </view>
          </view>
          <view class="card-right">
            <view class="severity" :class="getSeverityClass(item.severity)">
              {{ item.severity }}
            </view>
          </view>
        </view>
        
        <!-- 卡片底部按钮：标记防治 + 删除 -->
        <view class="card-actions">
          <view class="action-btn treat-btn" @click="markTreated(item)">
            <text class="btn-icon">✅</text>
            <text>{{ item.status === '已防治' ? '取消防治' : '标记防治' }}</text>
          </view>
          <view class="action-btn delete-btn" @click="deleteRecord(item)">
            <text class="btn-icon">🗑️</text>
            <text>删除</text>
          </view>
        </view>
      </view>

      <view class="load-more" v-if="hasMore">
        <text>{{ loading ? '加载中...' : '上拉加载更多' }}</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn report-btn" @click="generateReport">
        <text>📊 生成报告</text>
      </view>
    </view>

    <!-- 筛选抽屉 -->
    <view class="drawer-mask" v-if="showFilterDrawer" @click="showFilterDrawer = false">
      <view class="drawer-content" @click.stop>
        <view class="drawer-header">
          <text>高级筛选</text>
          <text class="close-btn" @click="showFilterDrawer = false">✕</text>
        </view>
        <view class="drawer-body">
          <view class="filter-section">
            <text class="filter-label">作物名</text>
            <view class="filter-options">
              <view 
                v-for="crop in crops" 
                :key="crop"
                class="option"
                :class="{ active: filterCrop === crop }"
                @click="filterCrop = crop"
              >{{ crop }}</view>
              <view 
                class="option"
                :class="{ active: filterCrop === '' }"
                @click="filterCrop = ''"
              >全部</view>
            </view>
          </view>
          <view class="filter-section">
            <text class="filter-label">病害等级</text>
            <view class="filter-options">
              <view 
                v-for="level in ['轻度', '中等', '严重']" 
                :key="level"
                class="option"
                :class="{ active: filterSeverity === level }"
                @click="filterSeverity = level"
              >{{ level }}</view>
              <view 
                class="option"
                :class="{ active: filterSeverity === '' }"
                @click="filterSeverity = ''"
              >全部</view>
            </view>
          </view>
          <view class="filter-section">
            <text class="filter-label">日期范围</text>
            <view class="date-range">
              <input type="date" v-model="startDate" placeholder="开始日期" />
              <text> 至 </text>
              <input type="date" v-model="endDate" placeholder="结束日期" />
            </view>
          </view>
        </view>
        <view class="drawer-footer">
          <view class="reset-btn" @click="resetFilters">重置</view>
          <view class="confirm-btn" @click="applyFilters">确定</view>
        </view>
      </view>
    </view>

    <!-- 日期选择器弹窗 -->
    <view class="drawer-mask" v-if="showDatePicker" @click="showDatePicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text>选择日期范围</text>
          <text class="close-btn" @click="showDatePicker = false">✕</text>
        </view>
        <view class="picker-body">
          <view class="quick-options">
            <view class="quick-option" @click="setQuickDate('week')">最近一周</view>
            <view class="quick-option" @click="setQuickDate('month')">最近一月</view>
            <view class="quick-option" @click="setQuickDate('all')">全部</view>
          </view>
          <input type="date" v-model="tempStartDate" placeholder="开始日期" />
          <input type="date" v-model="tempEndDate" placeholder="结束日期" />
        </view>
        <view class="picker-footer">
          <view class="confirm-btn" @click="confirmDateFilter">确认</view>
        </view>
      </view>
    </view>

    <!-- 报告弹窗（热力图） -->
    <view class="report-modal" v-if="showReport" @click="showReport = false">
      <view class="report-content" @click.stop>
        <view class="report-header">
          <text>📊 植保报告</text>
          <text class="close-btn" @click="showReport = false">✕</text>
        </view>
        <scroll-view scroll-y class="report-body">
          <view class="report-summary">
            <view class="summary-item">
              <text class="summary-num">{{ reportData.total }}</text>
              <text>总记录数</text>
            </view>
            <view class="summary-item">
              <text class="summary-num">{{ reportData.treated }}</text>
              <text>已防治</text>
            </view>
            <view class="summary-item">
              <text class="summary-num">{{ reportData.untreated }}</text>
              <text>待处理</text>
            </view>
          </view>

          <view class="heatmap-section">
            <text class="section-title">🔥 病虫害发生热力图</text>
            <view class="heatmap-grid">
              <view class="heatmap-row" v-for="(row, idx) in heatmapData" :key="idx">
                <view 
                  v-for="(cell, cidx) in row" 
                  :key="cidx"
                  class="heatmap-cell"
                  :class="getHeatClass(cell.count)"
                  :style="{ width: (100 / row.length) + '%' }"
                >
                  <text class="cell-label">{{ cell.name }}</text>
                  <text class="cell-count">{{ cell.count }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="trend-section">
            <text class="section-title">📈 月度发生趋势</text>
            <view class="trend-bars">
              <view v-for="month in monthlyTrend" :key="month.name" class="trend-item">
                <view class="trend-bar" :style="{ height: (month.count / maxCount) * 120 + 'px' }"></view>
                <text class="trend-label">{{ month.name }}</text>
              </view>
            </view>
          </view>

          <view class="ranking-section">
            <text class="section-title">🏆 高频病害排行</text>
            <view v-for="(item, idx) in diseaseRanking" :key="idx" class="ranking-item">
              <text class="rank">{{ idx + 1 }}</text>
              <text class="disease-name">{{ item.name }}</text>
              <view class="rank-bar" :style="{ width: (item.count / maxDiseaseCount) * 150 + 'px' }"></view>
              <text class="rank-count">{{ item.count }}次</text>
            </view>
          </view>
        </scroll-view>
        <view class="report-footer">
          <view class="share-btn" @click="shareReport">分享报告</view>
        </view>
      </view>
    </view>

    <!-- 右下角悬浮AI助手 -->
    <view class="floating-robot" @click="openAssistant">
      <text class="robot-avatar">🤖</text>
      <text class="robot-hat">🎩</text>
      <view class="breath-ring"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 原始数据
      allRecords: [],
      
      // 筛选相关
      searchKeyword: '',
      activeFilter: 'all',
      filterCrop: '',
      filterSeverity: '',
      startDate: '',
      endDate: '',
      dateFilter: 'all',
      tempStartDate: '',
      tempEndDate: '',
      
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
      defaultThumb: 'https://picsum.photos/id/15/100/100',
      crops: ['水稻', '小麦', '玉米', '大豆', '蔬菜', '果树']
    }
  },
  
  computed: {
    totalCount() {
      return this.allRecords.length
    },
    treatedCount() {
      return this.allRecords.filter(r => r.status === '已防治').length
    },
    untreatedCount() {
      return this.allRecords.filter(r => r.status === '待防治').length
    },
    dateFilterText() {
      if (this.dateFilter === 'week') return '最近一周'
      if (this.dateFilter === 'month') return '最近一月'
      if (this.startDate && this.endDate) return `${this.startDate}~${this.endDate}`
      return '日期筛选'
    },
    filteredRecords() {
      let records = [...this.allRecords]
      
      if (this.searchKeyword) {
        records = records.filter(r => 
          r.diseaseName.includes(this.searchKeyword) || 
          r.cropName.includes(this.searchKeyword)
        )
      }
      
      if (this.activeFilter !== 'all') {
        records = records.filter(r => r.status === this.activeFilter)
      }
      
      if (this.filterCrop) {
        records = records.filter(r => r.cropName === this.filterCrop)
      }
      
      if (this.filterSeverity) {
        records = records.filter(r => r.severity === this.filterSeverity)
      }
      
      if (this.startDate && this.endDate) {
        records = records.filter(r => r.diagnosisDate >= this.startDate && r.diagnosisDate <= this.endDate)
      } else if (this.dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoStr = weekAgo.toISOString().split('T')[0]
        records = records.filter(r => r.diagnosisDate >= weekAgoStr)
      } else if (this.dateFilter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        const monthAgoStr = monthAgo.toISOString().split('T')[0]
        records = records.filter(r => r.diagnosisDate >= monthAgoStr)
      }
      
      return records
    },
    maxCount() {
      return Math.max(...this.monthlyTrend.map(m => m.count), 1)
    },
    maxDiseaseCount() {
      return Math.max(...this.diseaseRanking.map(d => d.count), 1)
    }
  },
  
  onLoad() {
    this.initData()
    this.calcListHeight()
  },
  
  onShow() {
    this.loadRecordsFromStorage()
  },
  
  methods: {
    calcListHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.listHeight = systemInfo.windowHeight - 280
    },
    
    initData() {
      this.loadRecordsFromStorage()
    },
    
    loadRecordsFromStorage() {
      const stored = uni.getStorageSync('plant_records') || []
      if (stored.length > 0) {
        this.allRecords = stored
      } else {
        this.generateMockData()
      }
    },
    
    generateMockData() {
      const diseases = ['稻瘟病', '小麦条锈病', '玉米大斑病', '白粉病', '蚜虫危害', '纹枯病', '赤霉病']
      const crops = ['水稻', '小麦', '玉米', '大豆', '蔬菜']
      const severities = ['轻度', '中等', '严重']
      const weathers = ['晴', '多云', '小雨', '阴']
      const statuses = ['待防治', '已防治']
      
      const mockRecords = []
      for (let i = 0; i < 25; i++) {
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 60))
        const dateStr = date.toISOString().split('T')[0]
        
        mockRecords.push({
          id: Date.now() + i,
          diseaseName: diseases[Math.floor(Math.random() * diseases.length)],
          cropName: crops[Math.floor(Math.random() * crops.length)],
          diagnosisDate: dateStr,
          weather: weathers[Math.floor(Math.random() * weathers.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          thumbnail: `https://picsum.photos/id/${20 + i}/100/100`,
          solution: '建议使用三环唑，间隔7天喷施一次',
          location: '华东区'
        })
      }
      mockRecords.sort((a, b) => b.diagnosisDate.localeCompare(a.diagnosisDate))
      this.allRecords = mockRecords
      this.saveToStorage()
    },
    
    saveToStorage() {
      uni.setStorageSync('plant_records', this.allRecords)
    },
    
    // 删除记录（带确认弹窗）
    deleteRecord(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除「${item.diseaseName}」的诊断记录吗？删除后无法恢复。`,
        confirmColor: '#e74c3c',
        success: (res) => {
          if (res.confirm) {
            const index = this.allRecords.findIndex(r => r.id === item.id)
            if (index !== -1) {
              this.allRecords.splice(index, 1)
              this.saveToStorage()
              uni.showToast({ title: '已删除', icon: 'success' })
            }
          }
        }
      })
    },
    
    // 标记已防治/待防治
    markTreated(item) {
      const newStatus = item.status === '已防治' ? '待防治' : '已防治'
      item.status = newStatus
      this.saveToStorage()
      uni.showToast({ 
        title: newStatus === '已防治' ? '已标记为防治完成' : '已标记为待防治', 
        icon: 'success' 
      })
    },
    
    viewDetail(item) {
      uni.showModal({
        title: item.diseaseName,
        content: `作物：${item.cropName}\n诊断日期：${item.diagnosisDate}\n天气：${item.weather}\n严重程度：${item.severity}\n防治建议：${item.solution || '建议咨询植保专家'}`,
        confirmText: '编辑',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '编辑功能开发中', icon: 'none' })
          }
        }
      })
    },
    
    setFilter(type) {
      this.activeFilter = type
    },
    
    handleSearch() {},
    
    resetFilters() {
      this.filterCrop = ''
      this.filterSeverity = ''
      this.startDate = ''
      this.endDate = ''
      this.dateFilter = 'all'
      this.showFilterDrawer = false
    },
    
    applyFilters() {
      this.showFilterDrawer = false
    },
    
    setQuickDate(type) {
      const today = new Date()
      if (type === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        this.tempStartDate = weekAgo.toISOString().split('T')[0]
        this.tempEndDate = today.toISOString().split('T')[0]
      } else if (type === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(today.getMonth() - 1)
        this.tempStartDate = monthAgo.toISOString().split('T')[0]
        this.tempEndDate = today.toISOString().split('T')[0]
      } else {
        this.tempStartDate = ''
        this.tempEndDate = ''
      }
      this.dateFilter = type
    },
    
    confirmDateFilter() {
      if (this.tempStartDate && this.tempEndDate) {
        this.startDate = this.tempStartDate
        this.endDate = this.tempEndDate
        this.dateFilter = 'custom'
      } else {
        this.startDate = ''
        this.endDate = ''
      }
      this.showDatePicker = false
    },
    
    generateReport() {
      const records = this.allRecords
      
      this.reportData = {
        total: records.length,
        treated: records.filter(r => r.status === '已防治').length,
        untreated: records.filter(r => r.status === '待防治').length
      }
      
      const diseaseMap = new Map()
      records.forEach(record => {
        const key = `${record.cropName}-${record.diseaseName}`
        if (!diseaseMap.has(key)) {
          diseaseMap.set(key, { crop: record.cropName, disease: record.diseaseName, count: 0 })
        }
        diseaseMap.get(key).count++
      })
      
      const diseaseList = Array.from(diseaseMap.values())
      const heatRows = []
      for (let i = 0; i < diseaseList.length; i += 4) {
        heatRows.push(diseaseList.slice(i, i + 4))
      }
      this.heatmapData = heatRows
      
      const monthMap = new Map()
      records.forEach(record => {
        const month = record.diagnosisDate.substring(0, 7)
        monthMap.set(month, (monthMap.get(month) || 0) + 1)
      })
      this.monthlyTrend = Array.from(monthMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count }))
        .slice(-6)
      
      const diseaseCountMap = new Map()
      records.forEach(record => {
        diseaseCountMap.set(record.diseaseName, (diseaseCountMap.get(record.diseaseName) || 0) + 1)
      })
      this.diseaseRanking = Array.from(diseaseCountMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      
      this.showReport = true
    },
    
    getHeatClass(count) {
      if (count >= 5) return 'heat-high'
      if (count >= 3) return 'heat-mid'
      if (count >= 1) return 'heat-low'
      return 'heat-none'
    },
    
    getSeverityClass(severity) {
      if (severity === '严重') return 'severity-severe'
      if (severity === '中等') return 'severity-mid'
      return 'severity-mild'
    },
    
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.hasMore = false
        }, 500)
      }
    },
    
    shareReport() {
      uni.showToast({ title: '报告已保存到相册', icon: 'success' })
    },
    
    // 悬浮机器人点击事件 - 跳转到AI助手页面
    openAssistant() {
      uni.navigateTo({
        url: '/pages/ai/ai'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.history-page {
  min-height: 100vh;
  background: #f5f7f0;
  padding-bottom: 20px;
  position: relative;
}

.stats-bar {
  display: flex;
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  margin: 12px;
  border-radius: 28px;
  padding: 16px 0;
  color: white;
}

.stat-item {
  flex: 1;
  text-align: center;
  
  .stat-num {
    font-size: 28px;
    font-weight: bold;
    display: block;
  }
  
  .stat-label {
    font-size: 12px;
    opacity: 0.9;
  }
}

.stat-divider {
  width: 1px;
  background: rgba(255,255,255,0.3);
}

.search-bar {
  display: flex;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.search-input-area {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 40px;
  padding: 10px 16px;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .search-icon {
    font-size: 18px;
  }
  
  .search-input {
    flex: 1;
    font-size: 14px;
  }
}

.filter-btn {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filter-tags {
  white-space: nowrap;
  padding: 0 12px;
  margin-bottom: 16px;
  
  .tag {
    display: inline-block;
    padding: 6px 16px;
    background: white;
    border-radius: 30px;
    margin-right: 10px;
    font-size: 13px;
    color: #6b7c5e;
    
    &.active {
      background: #2c5e2a;
      color: white;
    }
  }
}

.record-list {
  padding: 0 12px;
}

.record-card {
  background: white;
  border-radius: 20px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  &.treated {
    opacity: 0.75;
    background: #f0f5ea;
  }
}

.card-content {
  display: flex;
  padding: 14px;
  gap: 12px;
}

.card-left {
  .thumbnail {
    width: 70px;
    height: 70px;
    border-radius: 16px;
  }
}

.card-middle {
  flex: 1;
  
  .disease-name {
    font-weight: 700;
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .crop-name {
    font-size: 13px;
    color: #6b7c5e;
    margin: 4px 0;
  }
  
  .date-weather {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #999;
  }
}

.card-right {
  align-items: flex-end;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  
  .severity {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
  }
  
  .severity-severe {
    background: #ffebee;
    color: #c62828;
  }
  
  .severity-mid {
    background: #fff3e0;
    color: #ef6c00;
  }
  
  .severity-mild {
    background: #e8f5e9;
    color: #2e7d32;
  }
}

.status-badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 500;
}

.treated-badge {
  background: #d4edda;
  color: #155724;
}

.pending-badge {
  background: #fff3cd;
  color: #856404;
}

/* 卡片底部按钮区域 */
.card-actions {
  display: flex;
  border-top: 1px solid #f0f0e8;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    font-size: 13px;
    font-weight: 500;
    
    .btn-icon {
      font-size: 16px;
    }
    
    &.treat-btn {
      background: #f8faf3;
      color: #2c5e2a;
      border-right: 1px solid #f0f0e8;
    }
    
    &.delete-btn {
      background: #fef5f5;
      color: #e74c3c;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 64px;
    display: block;
  }
  
  .empty-text {
    font-size: 16px;
    color: #999;
    margin-top: 16px;
    display: block;
  }
  
  .empty-hint {
    font-size: 12px;
    color: #bbb;
    margin-top: 8px;
    display: block;
  }
}

.load-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}

.bottom-actions {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: transparent;
  
  .report-btn {
    background: linear-gradient(135deg, #2c5e2a, #3a7a36);
    color: white;
    padding: 14px;
    border-radius: 40px;
    text-align: center;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(44, 94, 42, 0.3);
  }
}

/* 抽屉样式 */
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.drawer-content, .picker-content {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.drawer-header, .picker-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}

.drawer-body, .picker-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 20px;
  
  .filter-label {
    font-weight: 600;
    margin-bottom: 10px;
    display: block;
  }
  
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .option {
      padding: 6px 16px;
      background: #f5f7f0;
      border-radius: 30px;
      font-size: 13px;
      
      &.active {
        background: #2c5e2a;
        color: white;
      }
    }
  }
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  
  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
  }
}

.drawer-footer, .picker-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
  
  .reset-btn {
    flex: 1;
    padding: 12px;
    text-align: center;
    background: #f5f7f0;
    border-radius: 40px;
  }
  
  .confirm-btn {
    flex: 2;
    padding: 12px;
    text-align: center;
    background: #2c5e2a;
    color: white;
    border-radius: 40px;
  }
}

.quick-options {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  .quick-option {
    flex: 1;
    padding: 8px;
    text-align: center;
    background: #f5f7f0;
    border-radius: 30px;
  }
}

/* 报告弹窗 */
.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-content {
  width: 90%;
  max-height: 85vh;
  background: white;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
}

.report-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 700;
  font-size: 18px;
}

.report-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.report-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  .summary-item {
    flex: 1;
    text-align: center;
    padding: 12px;
    background: #f5f7f0;
    border-radius: 16px;
    
    .summary-num {
      font-size: 24px;
      font-weight: bold;
      color: #2c5e2a;
      display: block;
    }
  }
}

.heatmap-section, .trend-section, .ranking-section {
  margin-bottom: 24px;
  
  .section-title {
    font-weight: 600;
    margin-bottom: 12px;
    display: block;
  }
}

.heatmap-grid {
  background: #f5f7f0;
  border-radius: 16px;
  overflow: hidden;
}

.heatmap-row {
  display: flex;
}

.heatmap-cell {
  padding: 12px 4px;
  text-align: center;
  border: 0.5px solid #ddd;
  
  .cell-label {
    font-size: 11px;
    display: block;
  }
  
  .cell-count {
    font-size: 14px;
    font-weight: bold;
    display: block;
  }
  
  &.heat-high { background: #d32f2f; color: white; }
  &.heat-mid { background: #ff9800; color: white; }
  &.heat-low { background: #ffeb3b; color: #333; }
  &.heat-none { background: #e0e0e0; color: #999; }
}

.trend-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 160px;
  padding: 12px 0;
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  
  .trend-bar {
    width: 30px;
    background: linear-gradient(to top, #2c5e2a, #52b788);
    border-radius: 8px 8px 0 0;
    transition: height 0.3s;
  }
  
  .trend-label {
    font-size: 10px;
    margin-top: 8px;
  }
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  .rank {
    width: 30px;
    font-weight: bold;
    color: #2c5e2a;
  }
  
  .disease-name {
    flex: 1;
    font-size: 14px;
  }
  
  .rank-bar {
    height: 8px;
    background: #52b788;
    border-radius: 4px;
  }
  
  .rank-count {
    width: 50px;
    font-size: 12px;
    color: #666;
  }
}

.report-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  
  .share-btn {
    background: #2c5e2a;
    color: white;
    padding: 12px;
    text-align: center;
    border-radius: 40px;
    font-weight: 600;
  }
}

/* 悬浮机器人 */
.floating-robot {
  position: fixed;
  bottom: 70px;
  right: 18px;
  width: 64px;
  height: 64px;
  background: #f7cd5c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
  z-index: 999;
  cursor: pointer;
  border: 2px solid #fff2cf;
}

.robot-avatar {
  font-size: 42px;
  position: relative;
  top: 2px;
}

.robot-hat {
  position: absolute;
  top: -12px;
  left: 20px;
  font-size: 20px;
  transform: rotate(-12deg);
}

.breath-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(247, 205, 92, 0.4);
  animation: breathe 2s infinite;
  z-index: -1;
}

@keyframes breathe {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.28);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

.floating-robot:active {
  transform: scale(0.92);
}
</style>