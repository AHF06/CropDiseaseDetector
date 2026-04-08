<template>
  <!-- 最外层的容器 -->
  <view class="page-container">
    <!-- 背景图片：铺满全屏，固定在底层 -->
    <image class="background-image" :src="bgImage" mode="aspectFill"></image>

    <!-- 主要内容区域：放在背景图片之上 -->
    <view class="content-wrapper">
      <!-- 可滚动主内容区 -->
      <scroll-view scroll-y class="main-scroll" :style="{ height: scrollHeight + 'px' }">
        <!-- Hero 区域 -->
        <view class="hero-section">
          <view class="hero-content">
            <view class="welcome-title">{{ greetingText }}</view>
            <view class="welcome-sub">病虫害识别助手 · 守护每一寸农田</view>
            
            <!-- 天气和定位 + 宏观预警入口 -->
            <view class="insight-row">
              <view class="insight-card weather-card" @click="showWeatherDetail">
                <view class="weather-icon-large">{{ weatherIcon }}</view>
                <view class="weather-temp-large">{{ weatherTemp }}°C</view>
                <view class="weather-desc-large">{{ weatherDesc }}</view>
                <view class="weather-location-large">📍 {{ currentLocation }}</view>
              </view>
              <view class="insight-card" @click="handleMacroWarning">
                <text class="insight-icon">⚠️</text>
                <text class="insight-label">宏观预警</text>
                <text class="insight-desc">区域病虫害动态</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 核心功能区 C位：巨型拍照识别按钮 -->
        <view class="camera-section">
          <view class="giant-camera-btn" @click="openCamera">
            <text class="camera-icon">📷</text>
            <text class="camera-text">拍照识别病害</text>
          </view>
        </view>

        <!-- 快速提示/示例 -->
        <view class="quick-tip">
          <text>🌾 常见病害：稻瘟病 · 小麦锈病 · 玉米大斑病 ｜ 点击相机快速识别</text>
        </view>

        <!-- 最近识别记录预览 -->
        <view class="recent-section">
          <view class="section-header">
            <text class="section-title">最近识别记录</text>
            <text class="section-more" @click="gotoHistory">查看全部 →</text>
          </view>
          <view class="record-list" v-if="recentRecords.length > 0">
            <view class="record-item" v-for="(item, idx) in recentRecords" :key="idx" @click="viewRecordDetail(item)">
              <image class="record-img" :src="item.thumbnail" mode="aspectFill"></image>
              <view class="record-info">
                <text class="record-name">{{ item.name }}</text>
                <text class="record-date">{{ item.date }}</text>
              </view>
              <view class="record-tag" :class="item.severity === '严重' ? 'severe' : 'mild'">{{ item.severity }}</view>
            </view>
          </view>
          <view class="empty-record" v-else @click="gotoHistory">
            <text>暂无识别记录，点击相机开始识别 🌱</text>
          </view>
        </view>
      </scroll-view>

      <!-- 悬浮机器人 -->
      <view class="floating-robot" @click="openAssistant">
        <text class="robot-avatar">🤖</text>
        <text class="robot-hat">🎩</text>
        <view class="breath-ring"></view>
      </view>
    </view>

    <!-- 天气详情弹窗 -->
    <view class="weather-modal" v-if="showWeatherModal" @click="showWeatherModal = false">
      <view class="weather-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">天气详情</text>
          <text class="modal-close" @click="showWeatherModal = false">✕</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="weather-main">
            <text class="weather-main-icon">{{ weatherIcon }}</text>
            <view class="weather-main-info">
              <text class="weather-main-temp">{{ weatherTemp }}°C</text>
              <text class="weather-main-desc">{{ weatherDesc }}</text>
            </view>
          </view>
          
          <view class="weather-detail-list">
            <view class="detail-item">
              <text class="detail-label">📍 位置</text>
              <text class="detail-value">{{ currentLocation }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">💧 湿度</text>
              <text class="detail-value">{{ weatherHumidity }}%</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">🌧️ 降雨量</text>
              <text class="detail-value">{{ weatherRainfall }}mm</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">🌬️ 风速</text>
              <text class="detail-value">{{ weatherWindSpeed }}km/h</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">🔆 紫外线</text>
              <text class="detail-value">{{ weatherUV }}级</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">👁️ 能见度</text>
              <text class="detail-value">{{ weatherVisibility }}km</text>
            </view>
          </view>
          
          <view class="weather-tip">
            <text class="tip-icon">💡</text>
            <text class="tip-text">{{ weatherTip }}</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="refresh-btn" @click="refreshWeather">刷新天气</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 背景图片路径
      bgImage: 'https://images.pexels.com/photos/162240/barn-rural-nature-grange-162240.jpeg?auto=compress&cs=tinysrgb&w=800',
      greetingText: '早安，农场主',
      scrollHeight: 0,
      
      // 天气数据
      weatherIcon: '☀️',
      weatherTemp: 22,
      weatherDesc: '晴',
      currentLocation: '南京市',
      weatherHumidity: 65,
      weatherRainfall: 0,
      weatherWindSpeed: 8,
      weatherUV: 3,
      weatherVisibility: 15,
      weatherTip: '今日天气晴朗，适合田间作业，注意防晒',
      
      // 弹窗控制
      showWeatherModal: false,
      
      recentRecords: [
        {
          id: 1,
          name: '水稻稻瘟病',
          date: '2026-04-01',
          severity: '严重',
          thumbnail: 'https://picsum.photos/id/33/100/100'
        },
        {
          id: 2,
          name: '小麦条锈病',
          date: '2026-03-30',
          severity: '中等',
          thumbnail: 'https://picsum.photos/id/32/100/100'
        },
        {
          id: 3,
          name: '玉米螟危害',
          date: '2026-03-28',
          severity: '轻度',
          thumbnail: 'https://picsum.photos/id/31/100/100'
        }
      ]
    }
  },
  
  onLoad() {
    this.setGreeting()
    this.calcScrollHeight()
    this.getLocation()
    this.getWeather()
  },
  
  onShow() {
    // 检查登录状态
    this.checkLoginStatus()
    // 检查农友圈同步数据
    this.checkSyncData()
  },
  
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const isLogin = uni.getStorageSync('is_login')
      const userInfo = uni.getStorageSync('user_info')
      
      if (!isLogin || !userInfo) {
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }, 100)
        return
      }
    },
    
    // 获取定位
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          // 获取到经纬度后，可以调用逆地理编码获取城市名
          this.getCityName(res.latitude, res.longitude)
        },
        fail: () => {
          // 定位失败，使用默认城市
          this.currentLocation = '南京市'
          this.getWeather()
        }
      })
    },
    
    // 根据经纬度获取城市名
    getCityName(latitude, longitude) {
      // 这里可以调用地图API逆地理编码
      // 演示使用模拟数据
      this.currentLocation = '南京市'
      this.getWeather()
    },
    
    // 获取天气数据
    getWeather() {
      // 模拟获取不同天气
      const weathers = [
        { icon: '☀️', temp: 28, desc: '晴', humidity: 45, rainfall: 0, windSpeed: 8, uv: 8, visibility: 20, tip: '天气晴朗，适合田间作业，注意防晒' },
        { icon: '🌤️', temp: 24, desc: '晴转多云', humidity: 55, rainfall: 0, windSpeed: 10, uv: 6, visibility: 18, tip: '天气较好，适合喷洒农药' },
        { icon: '☁️', temp: 20, desc: '多云', humidity: 65, rainfall: 0, windSpeed: 12, uv: 4, visibility: 15, tip: '多云天气，注意田间通风' },
        { icon: '🌧️', temp: 18, desc: '小雨', humidity: 85, rainfall: 15, windSpeed: 10, uv: 2, visibility: 8, tip: '有降雨，不适合露天作业，注意排水' },
        { icon: '⛈️', temp: 26, desc: '雷阵雨', humidity: 90, rainfall: 35, windSpeed: 15, uv: 3, visibility: 5, tip: '雷雨天气，暂停田间作业，注意安全' }
      ]
      
      const randomIndex = Math.floor(Math.random() * weathers.length)
      const weather = weathers[randomIndex]
      
      this.weatherIcon = weather.icon
      this.weatherTemp = weather.temp
      this.weatherDesc = weather.desc
      this.weatherHumidity = weather.humidity
      this.weatherRainfall = weather.rainfall
      this.weatherWindSpeed = weather.windSpeed
      this.weatherUV = weather.uv
      this.weatherVisibility = weather.visibility
      this.weatherTip = weather.tip
    },
    
    // 刷新天气
    refreshWeather() {
      uni.showToast({ title: '正在刷新天气...', icon: 'none' })
      setTimeout(() => {
        this.getWeather()
        uni.showToast({ title: '天气已更新', icon: 'success' })
      }, 1000)
    },
    
    // 显示天气详情
    showWeatherDetail() {
      this.showWeatherModal = true
    },
    
    setGreeting() {
      const hour = new Date().getHours()
      if (hour < 6) this.greetingText = '凌晨好，农场主'
      else if (hour < 12) this.greetingText = '早安，农场主'
      else if (hour < 18) this.greetingText = '下午好，农场主'
      else this.greetingText = '晚上好，农场主'
    },
    
    calcScrollHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const tabBarHeight = 50
      this.scrollHeight = systemInfo.windowHeight - tabBarHeight
    },
    
    loadSyncData() {
      const syncList = uni.getStorageSync('sync_diseases') || []
      if (syncList.length > 0) {
        const syncRecords = syncList.slice(0, 3).map(item => ({
          id: item.id,
          name: item.description.substring(0, 20) + (item.description.length > 20 ? '...' : ''),
          date: item.time.split(' ')[0],
          severity: '待诊断',
          thumbnail: 'https://picsum.photos/id/20/100/100',
          isSync: true,
          originalDesc: item.description
        }))
        this.recentRecords = [...syncRecords, ...this.recentRecords].slice(0, 5)
      }
    },
    
    checkSyncData() {
      const syncList = uni.getStorageSync('sync_diseases') || []
      if (syncList.length > 0) {
        const lastSync = syncList[0]
        const lastCheckTime = uni.getStorageSync('last_sync_check') || 0
        if (lastSync.id > lastCheckTime) {
          uni.showToast({
            title: `📋 来自农友圈：${lastSync.description.substring(0, 15)}...`,
            icon: 'none',
            duration: 2500
          })
          uni.setStorageSync('last_sync_check', lastSync.id)
          this.loadSyncData()
        }
      }
    },
    
    // 打开相机拍照识别
    openCamera() {
      const isLogin = uni.getStorageSync('is_login')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再使用拍照识别功能',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          uni.showLoading({ title: '识别中...', mask: true })
          
          setTimeout(() => {
            uni.hideLoading()
            
            const resultData = {
              imageUrl: tempFilePath,
              diseaseName: '稻瘟病',
              latinName: 'Pyricularia oryzae',
              confidence: 94,
              severity: '中度',
              pathogen: '稻瘟病菌 (Pyricularia oryzae Cavara)',
              harmPart: '叶片、叶鞘、节、穗颈',
              conditions: '高温高湿、多雨天气、氮肥过量、田间郁闭',
              agriculturalControl: [
                '选用抗病品种，如湘晚籼13号、Y两优1号等',
                '合理施肥，增施磷钾肥，避免偏施氮肥',
                '科学灌水，浅水勤灌，适时晒田',
                '及时处理病稻草，减少初侵染源'
              ],
              chemicalControl: [
                '发病初期喷施75%三环唑可湿性粉剂2000-3000倍液',
                '或40%稻瘟灵乳油800-1000倍液',
                '或30%苯甲·嘧菌酯悬浮剂1500倍液',
                '间隔7-10天一次，连续2-3次'
              ],
              notes: [
                '注意轮换用药，防止产生抗药性',
                '遵守安全间隔期，收获前30天停止用药',
                '施药时做好个人防护',
                '雨后及时排水，降低田间湿度'
              ],
              similarDiseases: [
                { name: '稻胡麻斑病', difference: '病斑为椭圆形褐色斑，边缘黄色，中间灰白色' },
                { name: '稻叶枯病', difference: '病斑从叶尖向下扩展，呈灰白色，边缘波浪状' }
              ]
            }
            
            uni.navigateTo({
              url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}&imageUrl=${encodeURIComponent(tempFilePath)}`
            })
          }, 1500)
        },
        fail: () => {
          uni.showToast({ title: '拍照失败，请重试', icon: 'none' })
        }
      })
    },
    
    formatDate(date) {
      const Y = date.getFullYear()
      const M = (date.getMonth() + 1).toString().padStart(2, '0')
      const D = date.getDate().toString().padStart(2, '0')
      return `${Y}-${M}-${D}`
    },
    
    handleMacroWarning() {
      const isLogin = uni.getStorageSync('is_login')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录后查看宏观预警',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      uni.navigateTo({
        url: '/pages/warning/warning'
      })
    },
    
    viewRecordDetail(item) {
      const isLogin = uni.getStorageSync('is_login')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录后查看记录详情',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      
      if (item.isSync && item.originalDesc) {
        uni.showModal({
          title: '同步病情',
          content: item.originalDesc,
          confirmText: '开始诊断',
          success: (res) => {
            if (res.confirm) {
              this.openCamera()
            }
          }
        })
      } else {
        uni.navigateTo({
          url: `/pages/history/detail?id=${item.id}`
        })
      }
    },
    
    gotoHistory() {
      const isLogin = uni.getStorageSync('is_login')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录后查看植保档案',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      uni.switchTab({
        url: '/pages/history/history'
      })
    },
    
    openAssistant() {
      const isLogin = uni.getStorageSync('is_login')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录后使用AI助手',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/login' })
            }
          }
        })
        return
      }
      uni.navigateTo({
        url: '/pages/ai/ai'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.88);
  overflow-y: auto;
}

.main-scroll {
  width: 100%;
  height: 100%;
}

/* Hero 区域 */
.hero-section {
  position: relative;
  border-radius: 0 0 32px 32px;
  overflow: hidden;
  margin-bottom: 20px;
  background-color: rgba(30, 45, 20, 0.3);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 40px 24px 32px 24px;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.welcome-sub {
  font-size: 0.9rem;
  opacity: 0.92;
  margin-top: 6px;
}

.insight-row {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.insight-card {
  background: rgba(255, 255, 245, 0.93);
  backdrop-filter: blur(8px);
  border-radius: 28px;
  padding: 12px 10px;
  flex: 1;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s;
  border: 1px solid rgba(255, 250, 200, 0.6);
}

.insight-card:active {
  transform: scale(0.96);
}

/* 天气卡片样式 */
.weather-card {
  text-align: center;
  padding: 10px;
}

.weather-icon-large {
  font-size: 36px;
  display: block;
}

.weather-temp-large {
  font-size: 24px;
  font-weight: bold;
  color: #2c5e2a;
  display: block;
  margin-top: 4px;
}

.weather-desc-large {
  font-size: 12px;
  color: #5a7048;
  display: block;
}

.weather-location-large {
  font-size: 11px;
  color: #8a9a7a;
  display: block;
  margin-top: 4px;
}

.insight-icon {
  font-size: 28px;
  display: block;
}

.insight-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #2c5e2a;
  margin-top: 4px;
}

.insight-desc {
  font-size: 0.65rem;
  color: #5a7048;
  margin-top: 2px;
}

/* 相机按钮 */
.camera-section {
  display: flex;
  justify-content: center;
  margin: 8px 0 12px;
}

.giant-camera-btn {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fff2bf, #ffe6a3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 3px solid #fffae6;
  cursor: pointer;
}

.giant-camera-btn:active {
  transform: scale(0.94);
}

.camera-icon {
  font-size: 70px;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.2));
}

.camera-text {
  font-size: 0.9rem;
  font-weight: 700;
  background: #2a6e2a;
  color: white;
  padding: 6px 16px;
  border-radius: 40px;
  margin-top: 8px;
}

.quick-tip {
  text-align: center;
  font-size: 0.7rem;
  color: #6e8656;
  background: #eef5e4;
  margin: 10px 20px;
  padding: 8px 12px;
  border-radius: 30px;
}

/* 最近记录 */
.recent-section {
  margin: 20px 16px 30px;
  background: #ffffffd9;
  border-radius: 28px;
  padding: 16px;
  backdrop-filter: blur(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0ecce;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c5e2a;
}

.section-more {
  font-size: 0.7rem;
  color: #7c9a60;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  background: #fefef7;
  border-radius: 20px;
  padding: 10px;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.record-img {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background-color: #ddd;
}

.record-info {
  flex: 1;
}

.record-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2f4d2d;
}

.record-date {
  font-size: 0.65rem;
  color: #8faa7a;
  display: block;
}

.record-tag {
  font-size: 0.65rem;
  padding: 4px 10px;
  border-radius: 20px;
  background: #f3f5e7;
  color: #5a6e4a;
}

.record-tag.severe {
  background: #ffedea;
  color: #c23d2b;
}

.empty-record {
  text-align: center;
  padding: 32px 0;
  color: #98af82;
  font-size: 0.8rem;
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
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.28); opacity: 0.2; }
  100% { transform: scale(1); opacity: 0.6; }
}

.floating-robot:active {
  transform: scale(0.92);
}

/* 天气弹窗 */
.weather-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-modal-content {
  width: 85%;
  max-height: 80vh;
  background: white;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0e8;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c5e2a;
}

.modal-close {
  font-size: 24px;
  color: #999;
}

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #f0f0e8;
}

.refresh-btn {
  padding: 12px;
  text-align: center;
  background: #2c5e2a;
  color: white;
  border-radius: 40px;
  font-weight: 600;
}

/* 天气详情样式 */
.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0e8;
}

.weather-main-icon {
  font-size: 64px;
}

.weather-main-info {
  text-align: center;
}

.weather-main-temp {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  display: block;
}

.weather-main-desc {
  font-size: 16px;
  color: #666;
}

.weather-detail-list {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f0;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.weather-tip {
  display: flex;
  gap: 8px;
  background: #e8f5e9;
  padding: 12px;
  border-radius: 16px;
}

.tip-icon {
  font-size: 18px;
}

.tip-text {
  flex: 1;
  font-size: 13px;
  color: #2c5e2a;
  line-height: 1.4;
}
</style>