<template>
  <view class="result-page">
    <!-- 头部导航栏 -->
    <view class="result-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <text class="header-title">识别结果</text>
      </view>
      <view class="header-right">
        <text class="voice-icon" @click="voiceBroadcast">🔊</text>
        <text class="share-icon" @click="shareResult">📤</text>
      </view>
    </view>

    <!-- 语音播报提示 -->
    <view class="voice-tip" v-if="showVoiceTip" @click="voiceBroadcast">
      <text class="voice-tip-icon">🔊</text>
      <text class="voice-tip-text">点击播放语音播报</text>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="result-content">
      <!-- 识别图片区域 -->
      <view class="image-section">
        <image class="diagnosis-image" :src="resultData.imageUrl" mode="aspectFill"></image>
        <view class="confidence-badge" :class="getConfidenceClass(resultData.confidence)">
          <text>识别置信度: {{ resultData.confidence }}%</text>
        </view>
      </view>

      <!-- 识别结果卡片 -->
      <view class="result-card">
        <view class="card-title">
          <text class="title-icon">🔍</text>
          <text class="title-text">识别结果</text>
        </view>
        <view class="disease-name">
          <text class="name">{{ resultData.diseaseName }}</text>
          <view class="severity-tag" :class="getSeverityClass(resultData.severity)">
            {{ resultData.severity }}
          </view>
        </view>
        <view class="disease-latin">
          <text>{{ resultData.latinName }}</text>
        </view>
      </view>

      <!-- 病害详情卡片 -->
      <view class="info-card">
        <view class="card-title">
          <text class="title-icon">📖</text>
          <text class="title-text">病害详情</text>
        </view>
        <view class="info-item">
          <text class="info-label">🔬 病原菌</text>
          <text class="info-value">{{ resultData.pathogen }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">🌿 危害部位</text>
          <text class="info-value">{{ resultData.harmPart }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">📈 发病条件</text>
          <text class="info-value">{{ resultData.conditions }}</text>
        </view>
      </view>

      <!-- 防治建议卡片 -->
      <view class="info-card treatment-card">
        <view class="card-title">
          <text class="title-icon">💊</text>
          <text class="title-text">防治建议</text>
        </view>
        
        <!-- 农业防治 -->
        <view class="treatment-section">
          <view class="section-title">
            <text class="section-icon">🌱</text>
            <text>农业防治</text>
          </view>
          <view class="treatment-list">
            <view v-for="(item, idx) in resultData.agriculturalControl" :key="idx" class="treatment-item">
              <text class="bullet">•</text>
              <text>{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 化学防治 -->
        <view class="treatment-section">
          <view class="section-title">
            <text class="section-icon">🧪</text>
            <text>化学防治</text>
          </view>
          <view class="treatment-list">
            <view v-for="(item, idx) in resultData.chemicalControl" :key="idx" class="treatment-item">
              <text class="bullet">•</text>
              <text>{{ item }}</text>
            </view>
          </view>
        </view>

        <!-- 注意事项 -->
        <view class="treatment-section">
          <view class="section-title">
            <text class="section-icon">⚠️</text>
            <text>注意事项</text>
          </view>
          <view class="treatment-list">
            <view v-for="(item, idx) in resultData.notes" :key="idx" class="treatment-item warning-item">
              <text class="bullet">!</text>
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 相似病害对比 -->
      <view class="info-card" v-if="resultData.similarDiseases && resultData.similarDiseases.length > 0">
        <view class="card-title">
          <text class="title-icon">🔄</text>
          <text class="title-text">相似病害对比</text>
        </view>
        <view class="similar-list">
          <view v-for="(item, idx) in resultData.similarDiseases" :key="idx" class="similar-item">
            <text class="similar-name">{{ item.name }}</text>
            <text class="similar-diff">{{ item.difference }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn save-btn" @click="saveRecord">
        <text>💾</text>
        <text>保存记录</text>
      </view>
      <view class="action-btn voice-btn" @click="voiceBroadcast">
        <text>🔊</text>
        <text>语音播报</text>
      </view>
      <view class="action-btn consult-btn" @click="consultExpert">
        <text>👨‍🌾</text>
        <text>咨询专家</text>
      </view>
    </view>

    <!-- 语音播报状态提示 -->
    <view class="voice-status" v-if="isSpeaking">
      <view class="voice-wave">
        <view class="wave"></view>
        <view class="wave"></view>
        <view class="wave"></view>
      </view>
      <text class="voice-status-text">正在语音播报...</text>
      <view class="voice-stop" @click="stopVoice">
        <text>⏹️</text>
      </view>
    </view>

    <!-- 保存成功弹窗 -->
    <view class="toast-message" v-if="showToast">
      <text>{{ toastText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      resultData: {
        imageUrl: '',
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
      },
      showToast: false,
      toastText: '',
      showVoiceTip: true,
      isSpeaking: false,
      speechSynth: null,
      utterance: null
    }
  },

  onLoad(options) {
    // 接收从拍照页面传递的数据
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data))
        this.resultData = { ...this.resultData, ...data }
      } catch (e) {
        console.log('解析数据失败', e)
      }
    }
    
    if (options.imageUrl) {
      this.resultData.imageUrl = decodeURIComponent(options.imageUrl)
    }
    
    if (!this.resultData.imageUrl) {
      this.resultData.imageUrl = 'https://picsum.photos/id/15/400/400'
    }
    
    // 初始化语音合成
    this.initSpeech()
    
    // 自动播报
    setTimeout(() => {
      this.voiceBroadcast()
    }, 500)
  },
  
  onUnload() {
    // 页面卸载时停止语音
    this.stopVoice()
  },

  methods: {
    // 初始化语音合成
    initSpeech() {
      // 检查浏览器是否支持语音合成
      if (window.speechSynthesis) {
        this.speechSynth = window.speechSynthesis
      } else {
        console.log('当前浏览器不支持语音合成')
        this.showVoiceTip = false
      }
    },
    
    // 构建播报文本
    buildBroadcastText() {
      const data = this.resultData
      let text = `识别结果：${data.diseaseName}，`
      text += `置信度百分之${data.confidence}，`
      text += `严重程度${data.severity}。`
      text += `病原菌：${data.pathogen}。`
      text += `危害部位：${data.harmPart}。`
      text += `发病条件：${data.conditions}。`
      text += `防治建议：`
      
      // 添加农业防治建议
      if (data.agriculturalControl && data.agriculturalControl.length > 0) {
        text += `农业防治方面，${data.agriculturalControl.join('；')}。`
      }
      
      // 添加化学防治建议
      if (data.chemicalControl && data.chemicalControl.length > 0) {
        text += `化学防治方面，${data.chemicalControl.join('；')}。`
      }
      
      // 添加注意事项
      if (data.notes && data.notes.length > 0) {
        text += `注意事项：${data.notes.join('；')}。`
      }
      
      return text
    },
    
    // 语音播报
    voiceBroadcast() {
      if (!this.speechSynth) {
        uni.showToast({ title: '当前浏览器不支持语音播报', icon: 'none' })
        return
      }
      
      // 停止当前正在播放的语音
      this.stopVoice()
      
      const text = this.buildBroadcastText()
      
      // 创建语音对象
      this.utterance = new SpeechSynthesisUtterance(text)
      
      // 设置语音参数
      this.utterance.lang = 'zh-CN'      // 中文
      this.utterance.rate = 0.9          // 语速（0.1-10）
      this.utterance.pitch = 1.0         // 音调（0-2）
      this.utterance.volume = 1.0        // 音量（0-1）
      
      // 选择中文语音（如果有的话）
      const voices = this.speechSynth.getVoices()
      const zhVoice = voices.find(voice => voice.lang.includes('zh'))
      if (zhVoice) {
        this.utterance.voice = zhVoice
      }
      
      // 事件监听
      this.utterance.onstart = () => {
        this.isSpeaking = true
        this.showVoiceTip = false
        console.log('开始语音播报')
      }
      
      this.utterance.onend = () => {
        this.isSpeaking = false
        console.log('语音播报结束')
      }
      
      this.utterance.onerror = (event) => {
        console.error('语音播报错误', event)
        this.isSpeaking = false
        uni.showToast({ title: '语音播报失败', icon: 'none' })
      }
      
      // 开始播报
      this.speechSynth.speak(this.utterance)
      
      uni.showToast({ title: '开始语音播报', icon: 'none', duration: 1000 })
    },
    
    // 停止语音播报
    stopVoice() {
      if (this.speechSynth) {
        this.speechSynth.cancel()
        this.isSpeaking = false
      }
    },

    // 返回上一页
    goBack() {
      this.stopVoice()
      uni.navigateBack()
    },

    getConfidenceClass(confidence) {
      if (confidence >= 85) return 'high'
      if (confidence >= 60) return 'medium'
      return 'low'
    },

    getSeverityClass(severity) {
      if (severity === '严重') return 'severe'
      if (severity === '中度') return 'moderate'
      return 'mild'
    },

    saveRecord() {
      const existingRecords = uni.getStorageSync('plant_records') || []
      
      const newRecord = {
        id: Date.now(),
        diseaseName: this.resultData.diseaseName,
        cropName: this.resultData.cropName || '水稻',
        diagnosisDate: this.formatDate(new Date()),
        weather: this.getCurrentWeather(),
        severity: this.resultData.severity,
        status: '待防治',
        thumbnail: this.resultData.imageUrl,
        solution: this.resultData.chemicalControl.join('；'),
        location: '当前位置'
      }
      
      existingRecords.unshift(newRecord)
      uni.setStorageSync('plant_records', existingRecords)
      
      this.showToastMessage('已保存到植保档案')
    },

    formatDate(date) {
      const Y = date.getFullYear()
      const M = (date.getMonth() + 1).toString().padStart(2, '0')
      const D = date.getDate().toString().padStart(2, '0')
      return `${Y}-${M}-${D}`
    },

    getCurrentWeather() {
      const weathers = ['晴', '多云', '阴', '小雨']
      return weathers[Math.floor(Math.random() * weathers.length)]
    },

    consultExpert() {
      uni.showModal({
        title: '联系专家',
        content: '是否要联系植保专家进行进一步诊断？',
        confirmText: '联系专家',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '正在为您连接专家...', icon: 'none' })
          }
        }
      })
    },

    shareResult() {
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          uni.showToast({ title: '分享面板已打开', icon: 'none' })
        }
      })
    },

    showToastMessage(message) {
      this.toastText = message
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 2000)
    }
  },

  onShareAppMessage() {
    return {
      title: `我的作物识别结果：${this.resultData.diseaseName}`,
      path: '/pages/index/index',
      imageUrl: this.resultData.imageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.result-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7f0;
  display: flex;
  flex-direction: column;
}

/* 头部导航栏 */
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  color: white;
  
  .header-left {
    width: 44px;
    .back-icon { font-size: 28px; font-weight: bold; }
  }
  
  .header-center {
    flex: 1;
    text-align: center;
    .header-title { font-size: 18px; font-weight: bold; }
  }
  
  .header-right {
    width: 80px;
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    
    .voice-icon, .share-icon {
      font-size: 22px;
    }
  }
}

/* 语音提示 */
.voice-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #e8f5e9;
  margin: 12px 16px 0;
  padding: 10px;
  border-radius: 30px;
  cursor: pointer;
  
  .voice-tip-icon {
    font-size: 18px;
  }
  
  .voice-tip-text {
    font-size: 13px;
    color: #2c5e2a;
  }
}

/* 内容区域 */
.result-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
}

/* 图片区域 */
.image-section {
  position: relative;
  margin-bottom: 16px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  .diagnosis-image {
    width: 100%;
    height: 280px;
    background: #e0e0e0;
  }
  
  .confidence-badge {
    position: absolute;
    bottom: 12px;
    right: 12px;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    
    &.high { background: #27ae60; }
    &.medium { background: #f39c12; }
    &.low { background: #e74c3c; }
  }
}

/* 卡片通用样式 */
.result-card, .info-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0e8;
  
  .title-icon { font-size: 20px; }
  .title-text { font-size: 16px; font-weight: 600; color: #333; }
}

.disease-name {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  .name {
    font-size: 22px;
    font-weight: bold;
    color: #2c5e2a;
  }
  
  .severity-tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    
    &.severe { background: #ffebee; color: #c62828; }
    &.moderate { background: #fff3e0; color: #ef6c00; }
    &.mild { background: #e8f5e9; color: #2e7d32; }
  }
}

.disease-latin {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.info-item {
  margin-bottom: 12px;
  
  .info-label {
    font-size: 14px;
    font-weight: 600;
    color: #555;
    display: block;
    margin-bottom: 4px;
  }
  
  .info-value {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }
}

.treatment-section {
  margin-bottom: 16px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    
    .section-icon { font-size: 18px; }
  }
  
  .treatment-list {
    padding-left: 12px;
    
    .treatment-item {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #555;
      line-height: 1.4;
      
      .bullet { color: #2c5e2a; font-weight: bold; }
      
      &.warning-item .bullet { color: #e74c3c; }
    }
  }
}

.similar-list {
  .similar-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0e8;
    
    .similar-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 4px;
    }
    
    .similar-diff { font-size: 12px; color: #999; }
  }
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1px solid #f0f0e8;
  padding: 12px 16px;
  padding-bottom: calc(12px + constant(safe-area-inset-bottom));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  gap: 12px;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 40px;
    font-size: 13px;
    font-weight: 500;
    
    &.save-btn { background: #2c5e2a; color: white; }
    &.voice-btn { background: #f0f5ea; color: #2c5e2a; }
    &.consult-btn { background: #f0f5ea; color: #2c5e2a; }
  }
}

/* 语音播报状态 */
.voice-status {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
  
  .voice-wave {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .wave {
      width: 4px;
      height: 16px;
      background: #2c5e2a;
      border-radius: 2px;
      animation: wave 0.8s ease-in-out infinite;
      
      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
  
  .voice-status-text {
    color: white;
    font-size: 14px;
  }
  
  .voice-stop {
    padding: 4px 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 30px;
    cursor: pointer;
  }
}

@keyframes wave {
  0%, 100% { height: 16px; }
  50% { height: 30px; }
}

/* 提示消息 */
.toast-message {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 14px;
  z-index: 1000;
}
</style>