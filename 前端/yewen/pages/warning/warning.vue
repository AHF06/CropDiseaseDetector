<template>
  <view class="warning-page">
    <!-- 头部导航栏 -->
    <view class="warning-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">病虫害预警</text>
      </view>
      <view class="header-right">
        <text class="refresh-icon" @click="refreshData">🔄</text>
      </view>
    </view>

    <!-- 预警类型切换 -->
    <view class="warning-type-switch">
      <view 
        class="type-btn" 
        :class="{ active: warningType === 'weather' }"
        @click="switchWarningType('weather')"
      >
        <text class="type-icon">🌤️</text>
        <text class="type-text">天气预警</text>
      </view>
      <view 
        class="type-btn" 
        :class="{ active: warningType === 'region' }"
        @click="switchWarningType('region')"
      >
        <text class="type-icon">🗺️</text>
        <text class="type-text">地区预警</text>
      </view>
    </view>

    <!-- ==================== 天气预警视图 ==================== -->
    <view v-if="warningType === 'weather'" class="weather-warning-view">
      <!-- 当前天气卡片 -->
      <view class="weather-card">
        <view class="weather-icon">
          <text>{{ currentWeather.icon }}</text>
        </view>
        <view class="weather-info">
          <text class="weather-temp">{{ currentWeather.temp }}°C</text>
          <text class="weather-desc">{{ currentWeather.desc }}</text>
          <text class="weather-location">📍 {{ currentWeather.location }}</text>
        </view>
        <view class="weather-detail">
          <text>💧 湿度 {{ currentWeather.humidity }}%</text>
          <text>🌧️ 降雨 {{ currentWeather.rainfall }}mm</text>
          <text>🌬️ 风速 {{ currentWeather.windSpeed }}km/h</text>
        </view>
      </view>

      <!-- 天气风险等级 -->
      <view class="risk-card" :class="getRiskClass(weatherRisk.level)">
        <view class="risk-header">
          <text class="risk-icon">{{ getRiskIcon(weatherRisk.level) }}</text>
          <text class="risk-title">天气风险评估</text>
        </view>
        <text class="risk-level">{{ weatherRisk.level }}</text>
        <text class="risk-desc">{{ weatherRisk.description }}</text>
      </view>

      <!-- 天气因素分析 -->
      <view class="factor-card">
        <view class="card-header">
          <text class="card-title">🌡️ 气象因素分析</text>
        </view>
        <view class="factor-list">
          <view class="factor-item" v-for="factor in weatherFactors" :key="factor.name">
            <text class="factor-name">{{ factor.name }}</text>
            <text class="factor-value">{{ factor.value }}</text>
            <text class="factor-impact" :class="factor.impact">{{ factor.impactText }}</text>
          </view>
        </view>
      </view>

      <!-- 天气预警列表 -->
      <view class="warning-list">
        <view class="list-header">
          <text class="list-title">⚠️ 天气相关预警</text>
          <text class="list-time">更新于 {{ updateTime }}</text>
        </view>
        <view 
          v-for="alert in weatherWarningList" 
          :key="alert.id"
          class="warning-item"
          :class="getWarningItemClass(alert.level)"
          @click="viewAlertDetail(alert)"
        >
          <view class="warning-left">
            <view class="warning-level-badge" :class="getLevelBadgeClass(alert.level)">
              {{ alert.level }}
            </view>
            <view class="warning-content">
              <text class="warning-name">{{ alert.diseaseName }}</text>
              <text class="warning-desc">{{ alert.shortDesc }}</text>
            </view>
          </view>
          <view class="warning-right">
            <text class="warning-weather">{{ alert.weatherIcon }} {{ alert.weatherCondition }}</text>
            <text class="warning-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 防控建议 -->
      <view class="advice-card">
        <view class="card-header">
          <text class="card-title">💊 天气相关防控建议</text>
        </view>
        <view class="advice-list">
          <view class="advice-item" v-for="(advice, idx) in weatherAdvice" :key="idx">
            <text class="advice-icon">{{ advice.icon }}</text>
            <text class="advice-text">{{ advice.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 地区预警视图 ==================== -->
    <view v-else class="region-warning-view">
      <!-- 区域选择器 -->
      <view class="region-selector">
        <scroll-view scroll-x class="region-scroll">
          <view 
            v-for="region in regions" 
            :key="region.id"
            class="region-tab"
            :class="{ active: currentRegion === region.id }"
            @click="switchRegion(region.id)"
          >
            {{ region.name }}
          </view>
        </scroll-view>
      </view>

      <!-- 地区风险等级 -->
      <view class="risk-card" :class="getRiskClass(regionRisk.level)">
        <view class="risk-header">
          <text class="risk-icon">{{ getRiskIcon(regionRisk.level) }}</text>
          <text class="risk-title">{{ currentRegionName }}风险评估</text>
        </view>
        <text class="risk-level">{{ regionRisk.level }}</text>
        <text class="risk-desc">{{ regionRisk.description }}</text>
      </view>

      <!-- 地区基本信息 -->
      <view class="region-info-card">
        <view class="info-row">
          <text class="info-label">🌾 主要作物</text>
          <text class="info-value">{{ regionInfo.mainCrops }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">📈 历史发病率</text>
          <text class="info-value">{{ regionInfo.historyRate }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">🔔 预警等级</text>
          <text class="info-value" :class="getRiskClass(regionRisk.level)">{{ regionRisk.level }}</text>
        </view>
      </view>

      <!-- 地区预警列表 -->
      <view class="warning-list">
        <view class="list-header">
          <text class="list-title">📍 {{ currentRegionName }}病虫害预警</text>
          <text class="list-time">更新于 {{ updateTime }}</text>
        </view>
        <view 
          v-for="alert in regionWarningList" 
          :key="alert.id"
          class="warning-item"
          :class="getWarningItemClass(alert.level)"
          @click="viewAlertDetail(alert)"
        >
          <view class="warning-left">
            <view class="warning-level-badge" :class="getLevelBadgeClass(alert.level)">
              {{ alert.level }}
            </view>
            <view class="warning-content">
              <text class="warning-name">{{ alert.diseaseName }}</text>
              <text class="warning-desc">{{ alert.shortDesc }}</text>
            </view>
          </view>
          <view class="warning-right">
            <text class="warning-location">{{ alert.location }}</text>
            <text class="warning-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 地区防控建议 -->
      <view class="advice-card">
        <view class="card-header">
          <text class="card-title">💊 地区防控建议</text>
        </view>
        <view class="advice-list">
          <view class="advice-item" v-for="(advice, idx) in regionAdvice" :key="idx">
            <text class="advice-icon">{{ advice.icon }}</text>
            <text class="advice-text">{{ advice.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="detail-modal" v-if="selectedAlert" @click="selectedAlert = null">
      <view class="detail-card" @click.stop>
        <view class="detail-header">
          <text class="detail-title">预警详情</text>
          <text class="detail-close" @click="selectedAlert = null">✕</text>
        </view>
        <scroll-view scroll-y class="detail-content">
          <view class="detail-section">
            <text class="section-title">🔍 病害特征</text>
            <text class="section-text">{{ selectedAlert.features }}</text>
          </view>
          <view class="detail-section">
            <text class="section-title">💊 防治建议</text>
            <text class="section-text">{{ selectedAlert.treatment }}</text>
          </view>
          <view class="detail-section">
            <text class="section-title">⚠️ 注意事项</text>
            <text class="section-text">{{ selectedAlert.notes }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 预警类型：weather（天气预警）/ region（地区预警）
      warningType: 'weather',
      
      // 当前区域
      currentRegion: 'east',
      regions: [
        { id: 'east', name: '华东地区', center: '南京' },
        { id: 'south', name: '华南地区', center: '广州' },
        { id: 'north', name: '华北地区', center: '北京' },
        { id: 'central', name: '华中地区', center: '武汉' },
        { id: 'west', name: '西部地区', center: '成都' },
        { id: 'northeast', name: '东北地区', center: '沈阳' }
      ],
      
      // 天气数据
      currentWeather: {
        icon: '☁️',
        temp: 22,
        desc: '多云',
        location: '南京市',
        humidity: 78,
        rainfall: 12.5,
        windSpeed: 8
      },
      
      // 天气风险
      weatherRisk: {
        level: '中风险',
        description: '当前温湿度条件适宜病害发生，未来3天有降雨，需注意防治'
      },
      
      // 地区风险
      regionRisk: {
        level: '中风险',
        description: '该地区近期稻瘟病发生较多，建议加强田间巡查'
      },
      
      // 地区信息
      regionInfo: {
        mainCrops: '水稻、小麦、玉米',
        historyRate: '稻瘟病发病率15%'
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
      updateTime: '',
      
      // 选中的预警
      selectedAlert: null
    }
  },
  
  computed: {
    currentRegionName() {
      const region = this.regions.find(r => r.id === this.currentRegion)
      return region ? region.name : '华东地区'
    }
  },
  
  onLoad() {
    this.updateTime = this.formatTime(new Date())
    this.loadAllData()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    formatTime(date) {
      const M = (date.getMonth() + 1).toString().padStart(2, '0')
      const D = date.getDate().toString().padStart(2, '0')
      const h = date.getHours().toString().padStart(2, '0')
      const m = date.getMinutes().toString().padStart(2, '0')
      return `${M}-${D} ${h}:${m}`
    },
    
    switchWarningType(type) {
      this.warningType = type
      uni.showToast({ title: type === 'weather' ? '天气预警' : '地区预警', icon: 'none' })
    },
    
    switchRegion(regionId) {
      this.currentRegion = regionId
      this.loadRegionData()
      uni.showToast({ title: this.regions.find(r => r.id === regionId).name, icon: 'none' })
    },
    
    refreshData() {
      uni.showToast({ title: '正在更新数据...', icon: 'none' })
      setTimeout(() => {
        this.loadAllData()
        this.updateTime = this.formatTime(new Date())
        uni.showToast({ title: '更新成功', icon: 'success' })
      }, 1000)
    },
    
    loadAllData() {
      this.loadWeatherData()
      this.loadWeatherWarningList()
      this.loadWeatherFactors()
      this.loadWeatherAdvice()
      this.loadRegionData()
    },
    
    loadWeatherData() {
      // 模拟不同天气
      const weathers = [
        { icon: '☀️', temp: 28, desc: '晴', humidity: 45, rainfall: 0, windSpeed: 8, risk: '低风险', descText: '天气晴朗干燥，病虫害发生风险较低' },
        { icon: '☁️', temp: 22, desc: '多云', humidity: 65, rainfall: 5, windSpeed: 10, risk: '低风险', descText: '天气条件一般，需注意常规监测' },
        { icon: '🌧️', temp: 18, desc: '小雨', humidity: 85, rainfall: 25, windSpeed: 12, risk: '中风险', descText: '持续降雨，田间湿度大，病害发生风险增加' },
        { icon: '⛈️', temp: 26, desc: '雷阵雨', humidity: 90, rainfall: 45, windSpeed: 15, risk: '高风险', descText: '高温高湿天气，病虫害爆发风险高，需立即防治' }
      ]
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)]
      this.currentWeather = {
        ...randomWeather,
        location: '南京市'
      }
      this.weatherRisk = {
        level: randomWeather.risk,
        description: randomWeather.descText
      }
    },
    
    loadWeatherWarningList() {
      this.weatherWarningList = [
        {
          id: 1,
          level: '高风险',
          diseaseName: '稻瘟病',
          shortDesc: '持续降雨+高湿环境，爆发风险高',
          weatherIcon: '🌧️',
          weatherCondition: '连续降雨',
          features: '叶片梭形病斑，边缘褐色中央灰白色，穗颈瘟导致白穗',
          treatment: '喷施三环唑或稻瘟灵，间隔7天一次，连续2-3次',
          notes: '抢晴施药，雨后及时补喷，避免偏施氮肥'
        },
        {
          id: 2,
          level: '中风险',
          diseaseName: '小麦赤霉病',
          shortDesc: '抽穗扬花期遇雨，感染风险增加',
          weatherIcon: '🌧️',
          weatherCondition: '阴雨天气',
          features: '穗部粉红色霉层，籽粒干瘪',
          treatment: '喷施戊唑醇、氰烯菌酯，雨后及时补喷',
          notes: '注意抽穗期天气预报，提前预防'
        },
        {
          id: 3,
          level: '中风险',
          diseaseName: '玉米螟',
          shortDesc: '温度回升，成虫活动增加',
          weatherIcon: '☀️',
          weatherCondition: '温度回升',
          features: '心叶蛀孔，叶片排孔，玉米穗受害',
          treatment: '释放赤眼蜂，或喷施氯虫苯甲酰胺',
          notes: '抓住心叶期和抽穗期防治'
        },
        {
          id: 4,
          level: '低风险',
          diseaseName: '白粉病',
          shortDesc: '湿度适中，风险较低',
          weatherIcon: '☁️',
          weatherCondition: '多云',
          features: '叶片白色粉状霉层',
          treatment: '喷施三唑酮、醚菌酯',
          notes: '保持通风透光'
        }
      ]
    },
    
    loadWeatherFactors() {
      const h = this.currentWeather.humidity
      const r = this.currentWeather.rainfall
      const t = this.currentWeather.temp
      
      this.weatherFactors = [
        { name: '温度', value: `${t}°C`, impact: t > 25 ? 'positive' : (t < 15 ? 'negative' : 'neutral'), impactText: t > 25 ? '↑ 促进发病' : (t < 15 ? '↓ 抑制发病' : '→ 影响中性') },
        { name: '湿度', value: `${h}%`, impact: h > 80 ? 'positive' : (h < 60 ? 'negative' : 'neutral'), impactText: h > 80 ? '↑ 促进发病' : (h < 60 ? '↓ 抑制发病' : '→ 影响中性') },
        { name: '降雨', value: `${r}mm`, impact: r > 20 ? 'positive' : (r < 5 ? 'negative' : 'neutral'), impactText: r > 20 ? '↑ 促进发病' : (r < 5 ? '↓ 抑制发病' : '→ 影响中性') },
        { name: '风速', value: `${this.currentWeather.windSpeed}km/h`, impact: this.currentWeather.windSpeed > 15 ? 'positive' : 'neutral', impactText: this.currentWeather.windSpeed > 15 ? '↑ 促进传播' : '→ 影响中性' }
      ]
    },
    
    loadWeatherAdvice() {
      const level = this.weatherRisk.level
      if (level === '高风险') {
        this.weatherAdvice = [
          { icon: '🚨', text: '立即组织施药防治，控制病害扩散' },
          { icon: '📊', text: '加密田间巡查，每日记录病害发展情况' },
          { icon: '💧', text: '雨后及时排水，降低田间湿度' },
          { icon: '💊', text: '选择高效低毒药剂，轮换使用防抗性' }
        ]
      } else if (level === '中风险') {
        this.weatherAdvice = [
          { icon: '⚠️', text: '做好预防性施药准备' },
          { icon: '👀', text: '每3天巡查一次，发现中心病株立即处理' },
          { icon: '🌾', text: '加强水肥管理，增施磷钾肥增强抗性' },
          { icon: '📱', text: '关注未来3天天气预报，提前防范' }
        ]
      } else {
        this.weatherAdvice = [
          { icon: '✅', text: '做好常规田间管理' },
          { icon: '📝', text: '定期巡查，做好监测记录' },
          { icon: '🔔', text: '关注天气变化，及时接收预警' }
        ]
      }
    },
    
    loadRegionData() {
      const regionData = {
        east: {
          risk: { level: '中风险', description: '近期稻瘟病发生较多，建议加强田间巡查' },
          info: { mainCrops: '水稻、小麦、玉米', historyRate: '稻瘟病发病率15%' },
          list: [
            { id: 1, level: '中风险', diseaseName: '稻瘟病', shortDesc: '近期发病较多，需加强防治', location: '江苏、浙江、安徽', features: '叶片梭形病斑，穗颈瘟', treatment: '喷施三环唑、稻瘟灵', notes: '注意水肥管理，避免偏施氮肥' },
            { id: 2, level: '低风险', diseaseName: '小麦赤霉病', shortDesc: '发生较少，常规监测即可', location: '江苏北部', features: '穗部霉变', treatment: '戊唑醇防治', notes: '关注抽穗期天气' }
          ],
          advice: [
            { icon: '🌾', text: '加强水稻田间巡查，发现病斑及时处理' },
            { icon: '💊', text: '准备三环唑等防治药剂' },
            { icon: '💧', text: '合理灌水，适时晒田' }
          ]
        },
        south: {
          risk: { level: '高风险', description: '高温高湿，稻飞虱、稻瘟病爆发风险高' },
          info: { mainCrops: '水稻、甘蔗、水果', historyRate: '稻飞虱发生率30%' },
          list: [
            { id: 1, level: '高风险', diseaseName: '稻飞虱', shortDesc: '迁入量大，需立即防治', location: '广东、广西', features: '稻株基部大量飞虱', treatment: '喷施吡蚜酮、烯啶虫胺', notes: '轮换用药防抗性' },
            { id: 2, level: '高风险', diseaseName: '稻瘟病', shortDesc: '持续降雨，爆发风险高', location: '广东、福建', features: '穗颈瘟导致白穗', treatment: '三环唑+稻瘟灵', notes: '抢晴施药' }
          ],
          advice: [
            { icon: '🚨', text: '立即组织防治，控制虫口密度' },
            { icon: '💊', text: '准备吡蚜酮、三环唑等药剂' },
            { icon: '📊', text: '加密监测，每日巡查' }
          ]
        },
        north: {
          risk: { level: '低风险', description: '天气干燥，病虫害发生较少' },
          info: { mainCrops: '小麦、玉米', historyRate: '蚜虫发生率8%' },
          list: [
            { id: 1, level: '低风险', diseaseName: '小麦蚜虫', shortDesc: '发生较少，常规监测', location: '河北、山东', features: '叶片背面蚜虫', treatment: '吡虫啉喷雾', notes: '保护天敌' }
          ],
          advice: [
            { icon: '✅', text: '做好常规田间管理' },
            { icon: '👀', text: '定期巡查，注意蚜虫发生' }
          ]
        },
        central: {
          risk: { level: '中风险', description: '近期降雨频繁，小麦赤霉病风险增加' },
          info: { mainCrops: '水稻、小麦、油菜', historyRate: '赤霉病发病率12%' },
          list: [
            { id: 1, level: '中风险', diseaseName: '小麦赤霉病', shortDesc: '抽穗期遇雨，风险增加', location: '湖北、湖南', features: '穗部霉变', treatment: '戊唑醇防治', notes: '雨后及时施药' }
          ],
          advice: [
            { icon: '⚠️', text: '关注抽穗期天气预报' },
            { icon: '💊', text: '准备戊唑醇等防治药剂' }
          ]
        },
        west: {
          risk: { level: '低风险', description: '气候干燥，病虫害发生较少' },
          info: { mainCrops: '小麦、玉米、水果', historyRate: '锈病发生率5%' },
          list: [
            { id: 1, level: '低风险', diseaseName: '小麦锈病', shortDesc: '发生较少', location: '四川、陕西', features: '叶片条状锈斑', treatment: '三唑类药剂', notes: '常规监测' }
          ],
          advice: [
            { icon: '✅', text: '做好常规监测' },
            { icon: '💧', text: '注意灌溉管理' }
          ]
        },
        northeast: {
          risk: { level: '中风险', description: '低温高湿，玉米大斑病风险增加' },
          info: { mainCrops: '玉米、大豆、水稻', historyRate: '大斑病发病率10%' },
          list: [
            { id: 1, level: '中风险', diseaseName: '玉米大斑病', shortDesc: '低温高湿易发病', location: '辽宁、吉林', features: '叶片长梭形病斑', treatment: '吡唑醚菌酯', notes: '加强田间排水' }
          ],
          advice: [
            { icon: '🌾', text: '加强田间排水，降低湿度' },
            { icon: '💊', text: '准备吡唑醚菌酯等药剂' }
          ]
        }
      }
      
      const data = regionData[this.currentRegion]
      if (data) {
        this.regionRisk = data.risk
        this.regionInfo = data.info
        this.regionWarningList = data.list
        this.regionAdvice = data.advice
      }
    },
    
    getRiskClass(level) {
      const classes = { '高风险': 'risk-high', '中风险': 'risk-medium', '低风险': 'risk-low' }
      return classes[level] || 'risk-low'
    },
    
    getRiskIcon(level) {
      const icons = { '高风险': '🔴', '中风险': '🟠', '低风险': '🟢' }
      return icons[level] || '🟢'
    },
    
    getWarningItemClass(level) {
      const classes = { '高风险': 'item-high', '中风险': 'item-medium', '低风险': 'item-low' }
      return classes[level] || 'item-low'
    },
    
    getLevelBadgeClass(level) {
      const classes = { '高风险': 'badge-high', '中风险': 'badge-medium', '低风险': 'badge-low' }
      return classes[level] || 'badge-low'
    },
    
    viewAlertDetail(alert) {
      this.selectedAlert = alert
    }
  }
}
</script>

<style lang="scss" scoped>
.warning-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7f0;
  padding-bottom: 20px;
}

/* 头部 */
.warning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  color: white;
  
  .header-left .back-icon { font-size: 28px; font-weight: bold; }
  .header-center { flex: 1; text-align: center; }
  .header-center .header-title { font-size: 18px; font-weight: bold; }
  .header-right .refresh-icon { font-size: 22px; }
}

/* 预警类型切换 */
.warning-type-switch {
  display: flex;
  gap: 16px;
  margin: 16px;
  background: white;
  border-radius: 50px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 40px;
    transition: all 0.3s;
    
    .type-icon { font-size: 20px; }
    .type-text { font-size: 14px; font-weight: 500; color: #666; }
    
    &.active {
      background: #2c5e2a;
      .type-text { color: white; }
    }
  }
}

/* 天气卡片 */
.weather-card {
  display: flex;
  align-items: center;
  background: white;
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 20px;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .weather-icon { font-size: 48px; }
  .weather-info { flex: 1; }
  .weather-temp { font-size: 28px; font-weight: bold; display: block; }
  .weather-desc { font-size: 14px; color: #666; }
  .weather-location { font-size: 12px; color: #999; }
  .weather-detail { text-align: right; font-size: 12px; color: #666; display: flex; flex-direction: column; gap: 4px; }
}

/* 风险卡片 */
.risk-card {
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 20px;
  
  &.risk-high { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); color: white; }
  &.risk-medium { background: linear-gradient(135deg, #ffa502, #e67e22); color: white; }
  &.risk-low { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; }
  
  .risk-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .risk-icon { font-size: 20px; }
    .risk-title { font-size: 14px; opacity: 0.9; }
  }
  
  .risk-level { font-size: 28px; font-weight: bold; display: block; margin-bottom: 8px; }
  .risk-desc { font-size: 13px; line-height: 1.4; opacity: 0.95; }
}

/* 地区信息卡片 */
.region-info-card {
  background: white;
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0e8;
    
    &:last-child { border-bottom: none; }
    
    .info-label { font-size: 14px; color: #666; }
    .info-value { font-size: 14px; font-weight: 500; color: #333; }
  }
}

/* 因素卡片 */
.factor-card {
  background: white;
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-header {
  margin-bottom: 12px;
  .card-title { font-size: 16px; font-weight: bold; color: #333; }
}

.factor-list {
  .factor-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f0;
    
    .factor-name { width: 70px; font-size: 14px; color: #666; }
    .factor-value { width: 70px; font-size: 14px; font-weight: 500; color: #333; }
    .factor-impact { flex: 1; text-align: right; font-size: 12px; }
    .factor-impact.positive { color: #e74c3c; }
    .factor-impact.negative { color: #27ae60; }
  }
}

/* 区域选择器 */
.region-selector { padding: 0 16px; margin-bottom: 16px; }
.region-scroll { white-space: nowrap; display: flex; gap: 10px; }
.region-tab {
  display: inline-block; padding: 8px 20px; background: white; border-radius: 30px;
  font-size: 14px; color: #666; box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  &.active { background: #2c5e2a; color: white; }
}

/* 预警列表 */
.warning-list {
  background: white;
  margin: 0 16px 16px;
  border-radius: 20px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8faf3;
  border-bottom: 1px solid #f0f0e8;
  
  .list-title { font-size: 14px; font-weight: 600; color: #333; }
  .list-time { font-size: 11px; color: #999; }
}

.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f0;
  cursor: pointer;
  
  &.item-high { background: #fff5f5; }
  &.item-medium { background: #fff8f0; }
  
  .warning-left {
    flex: 1;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .warning-level-badge {
    width: 60px;
    height: 28px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    
    &.badge-high { background: #e74c3c; color: white; }
    &.badge-medium { background: #e67e22; color: white; }
    &.badge-low { background: #27ae60; color: white; }
  }
  
  .warning-content {
    flex: 1;
    .warning-name { font-size: 15px; font-weight: 600; color: #333; display: block; }
    .warning-desc { font-size: 12px; color: #666; display: block; margin-top: 2px; }
  }
  
  .warning-right {
    text-align: right;
    .warning-weather, .warning-location { font-size: 12px; color: #999; display: block; }
    .warning-arrow { font-size: 18px; color: #ccc; margin-left: 8px; }
  }
}

/* 建议卡片 */
.advice-card {
  background: white;
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.advice-list {
  .advice-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f0;
    
    &:last-child { border-bottom: none; }
    
    .advice-icon { font-size: 20px; }
    .advice-text { flex: 1; font-size: 13px; color: #555; line-height: 1.4; }
  }
}

/* 详情弹窗 */
.detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.detail-card {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0e8;
  
  .detail-title { font-size: 18px; font-weight: bold; color: #2c5e2a; }
  .detail-close { font-size: 24px; color: #999; }
}

.detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
  
  .section-title { font-size: 15px; font-weight: 600; color: #333; display: block; margin-bottom: 8px; }
  .section-text { font-size: 14px; color: #666; line-height: 1.5; }
}
</style>
