<template>
  <view class="ai-chat-page">
    <!-- 头部导航栏 -->
    <view class="chat-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-center">
        <view class="robot-avatar-small">
          <text class="robot-icon">🤖</text>
          <text class="robot-hat-small">🎩</text>
        </view>
        <view class="robot-info">
          <text class="robot-name">农小智</text>
          <text class="robot-status">在线 · 随时为您服务</text>
        </view>
      </view>
      <view class="header-right">
        <text class="menu-icon" @click="showMenu">⋯</text>
      </view>
    </view>

    <!-- 聊天消息列表 -->
    <scroll-view 
      class="chat-messages" 
      scroll-y 
      :scroll-into-view="scrollToView"
      scroll-with-animation
      @scrolltoupper="loadMoreHistory"
    >
      <!-- 加载更多历史记录 -->
      <view v-if="hasMoreHistory" class="load-history">
        <text>上拉加载更多历史记录...</text>
      </view>

      <!-- 欢迎消息 -->
      <view v-if="messages.length === 0" class="welcome-message">
        <view class="welcome-icon">🌾</view>
        <text class="welcome-title">您好，农场主！</text>
        <text class="welcome-desc">我是您的专属AI农技助手「农小智」</text>
        <text class="welcome-tip">我可以帮您：</text>
        <view class="welcome-actions">
          <view class="welcome-btn" @click="quickAsk('识别病虫害')">🔍 识别病虫害</view>
          <view class="welcome-btn" @click="quickAsk('防治方法')">🌿 防治方法</view>
          <view class="welcome-btn" @click="quickAsk('农药使用')">🧪 农药使用</view>
          <view class="welcome-btn" @click="quickAsk('种植技术')">🌱 种植技术</view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view 
        v-for="(msg, idx) in messages" 
        :key="idx" 
        :id="'msg-' + idx"
        class="message-row"
        :class="msg.role"
      >
        <!-- AI 消息 -->
        <view v-if="msg.role === 'assistant'" class="message-avatar">
          <text class="avatar-icon">🤖</text>
        </view>
        <view class="message-bubble" :class="msg.role">
          <!-- 打字效果 -->
          <text v-if="msg.isTyping" class="typing-indicator">
            <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
          </text>
          <text v-else class="message-text">{{ msg.content }}</text>
        </view>
        <!-- 用户消息 -->
        <view v-if="msg.role === 'user'" class="message-avatar user-avatar">
          <text class="avatar-icon">👤</text>
        </view>
      </view>

      <!-- 加载提示 -->
      <view v-if="isLoading" class="message-row assistant">
        <view class="message-avatar">
          <text class="avatar-icon">🤖</text>
        </view>
        <view class="message-bubble assistant loading-bubble">
          <text class="loading-text">正在思考...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷回复栏 -->
    <scroll-view scroll-x class="quick-replies" v-if="quickReplies.length > 0">
      <view 
        v-for="reply in quickReplies" 
        :key="reply"
        class="quick-reply"
        @click="sendQuickReply(reply)"
      >
        {{ reply }}
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="chat-input-bar">
      <view class="input-left">
        <view class="input-icon" @click="showImagePicker">
          <text>📷</text>
        </view>
        <view class="input-icon" @click="showVoiceInput">
          <text>🎤</text>
        </view>
      </view>
      <view class="input-container">
        <input 
          v-model="inputText" 
          class="chat-input" 
          placeholder="输入您的问题..."
          confirm-type="send"
          @confirm="sendMessage"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />
      </view>
      <view class="send-btn" @click="sendMessage">
        <text>发送</text>
      </view>
    </view>

    <!-- 功能菜单弹窗 -->
    <view class="menu-modal" v-if="showMenuModal" @click="showMenuModal = false">
      <view class="menu-popup" @click.stop>
        <view class="menu-item" @click="clearHistory">
          <text>🗑️</text>
          <text>清空对话</text>
        </view>
        <view class="menu-item" @click="shareChat">
          <text>📤</text>
          <text>分享对话</text>
        </view>
        <view class="menu-item" @click="goToFeedback">
          <text>💬</text>
          <text>意见反馈</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 消息列表
      messages: [],
      inputText: '',
      isLoading: false,
      scrollToView: '',
      
      // 历史记录
      hasMoreHistory: false,
      historyPage: 1,
      
      // UI状态
      showMenuModal: false,
      
      // 快捷回复
      quickReplies: [],
      
      // AI配置
      aiName: '农小智',
      
      // 知识库（模拟）
      knowledgeBase: {
        '稻瘟病': '稻瘟病是由稻瘟病菌引起的水稻病害。防治方法：1. 选用抗病品种；2. 合理施肥，避免偏施氮肥；3. 发病初期喷施三环唑、稻瘟灵等药剂，间隔7-10天一次，连续2-3次。',
        '玉米螟': '玉米螟是玉米的主要害虫。防治方法：1. 释放赤眼蜂进行生物防治；2. 使用Bt制剂或氯虫苯甲酰胺等药剂；3. 及时清理田间秸秆，减少越冬虫源。',
        '小麦锈病': '小麦锈病分为条锈、叶锈和秆锈。防治方法：1. 种植抗病品种；2. 发病初期喷施戊唑醇、烯唑醇等三唑类药剂；3. 加强田间管理，合理排灌。',
        '白粉病': '白粉病主要危害小麦、瓜类等。防治方法：1. 选用抗病品种；2. 发病初期喷施三唑酮、醚菌酯等；3. 注意通风透光，降低湿度。',
        '蚜虫': '蚜虫防治方法：1. 使用黄板诱杀；2. 喷施吡虫啉、啶虫脒等药剂；3. 保护瓢虫、食蚜蝇等天敌。',
        '农药使用': '农药使用注意事项：1. 对症下药，选择登记药剂；2. 严格按推荐剂量使用，不随意加大浓度；3. 注意轮换用药，防止抗性；4. 遵守安全间隔期；5. 做好个人防护。',
        '有机种植': '有机种植要点：1. 使用有机肥替代化肥；2. 采用生物防治替代化学农药；3. 轮作休耕，保持土壤健康；4. 种植绿肥，增加土壤有机质。',
        '施肥技巧': '科学施肥技巧：1. 测土配方，按需施肥；2. 有机无机配合；3. 基肥追肥结合；4. 氮磷钾平衡；5. 微量元素补充；6. 避免过量施用。'
      }
    }
  },
  
  onLoad() {
    this.loadHistory()
    this.addWelcomeMessage()
  },
  
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载历史对话
    loadHistory() {
      const savedHistory = uni.getStorageSync('ai_chat_history')
      if (savedHistory && savedHistory.length > 0) {
        this.messages = savedHistory
      }
    },
    
    // 保存对话历史
    saveHistory() {
      // 只保存最近50条消息
      const toSave = this.messages.slice(-50)
      uni.setStorageSync('ai_chat_history', toSave)
    },
    
    // 添加欢迎消息
    addWelcomeMessage() {
      if (this.messages.length === 0) {
        // 不自动添加，让欢迎卡片显示
      }
    },
    
    // 发送消息
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text) return
      
      // 添加用户消息
      this.addMessage('user', text)
      this.inputText = ''
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 获取AI回复
      this.isLoading = true
      
      // 模拟AI思考延迟
      setTimeout(() => {
        const reply = this.getAIResponse(text)
        this.addMessage('assistant', reply)
        this.isLoading = false
        this.scrollToBottom()
        this.saveHistory()
        
        // 根据回复内容生成快捷回复
        this.generateQuickReplies(text, reply)
      }, 800)
    },
    
    // 添加消息
    addMessage(role, content) {
      this.messages.push({
        role: role,
        content: content,
        time: new Date().getTime(),
        isTyping: false
      })
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollToView = 'msg-' + (this.messages.length - 1)
      })
    },
    
    // AI回复逻辑
    getAIResponse(question) {
      const lowerQuestion = question.toLowerCase()
      
      // 匹配知识库
      for (const [key, value] of Object.entries(this.knowledgeBase)) {
        if (lowerQuestion.includes(key.toLowerCase())) {
          return value
        }
      }
      
      // 问候类
      if (lowerQuestion.includes('你好') || lowerQuestion.includes('您好')) {
        return '您好！我是农小智，您的专属AI农技助手。请问有什么可以帮助您的吗？🌾'
      }
      
      if (lowerQuestion.includes('谢谢')) {
        return '不客气！很高兴能帮到您。如果还有其他问题，随时问我哦！🌱'
      }
      
      // 天气相关
      if (lowerQuestion.includes('天气')) {
        return '我正在获取您所在地区的天气信息...\n\n温馨提示：建议您打开手机定位，我可以为您提供更精准的农业气象服务。🌤️'
      }
      
      // 识别相关
      if (lowerQuestion.includes('识别') || lowerQuestion.includes('什么病')) {
        return '要识别病虫害，建议您：\n1. 拍摄清晰的病害部位照片\n2. 返回首页点击「拍照识别病害」\n3. 上传照片即可获得AI诊断结果\n\n您也可以描述一下具体症状，我来帮您初步分析。'
      }
      
      // 默认回复
      const defaultReplies = [
        '收到您的问题了！我正在努力学习农业知识中。建议您返回首页使用「拍照识别」功能，或者更详细地描述一下问题症状，我来帮您分析。🌾',
        '感谢您的提问！关于这个问题，建议您提供更多细节，比如作物种类、发病部位、症状特征等，这样我能给出更准确的建议。',
        '我是您的AI助手农小智。如果您遇到具体的病虫害问题，可以使用拍照识别功能，或者描述症状我来帮您分析。'
      ]
      
      return defaultReplies[Math.floor(Math.random() * defaultReplies.length)]
    },
    
    // 生成快捷回复
    generateQuickReplies(question, answer) {
      // 根据上下文生成快捷回复
      if (answer.includes('拍照识别')) {
        this.quickReplies = ['去拍照识别', '描述症状', '查看防治方法']
      } else if (answer.includes('防治')) {
        this.quickReplies = ['用什么药', '怎么预防', '什么时候防治']
      } else {
        this.quickReplies = ['识别病虫害', '防治方法', '农药使用', '种植技术']
      }
      
      // 3秒后清空快捷回复
      setTimeout(() => {
        if (this.quickReplies.length > 0) {
          this.quickReplies = []
        }
      }, 5000)
    },
    
    // 快捷回复
    sendQuickReply(reply) {
      this.inputText = reply
      this.sendMessage()
    },
    
    // 快速提问
    quickAsk(type) {
      this.inputText = type
      this.sendMessage()
    },
    
    // 图片选择
    showImagePicker() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.addMessage('user', '[图片]')
          this.isLoading = true
          setTimeout(() => {
            this.addMessage('assistant', '收到您的图片！我正在分析中...\n\n根据图片特征，建议您返回首页使用「拍照识别」功能获取更准确的诊断结果。')
            this.isLoading = false
            this.scrollToBottom()
          }, 1500)
        }
      })
    },
    
    // 语音输入（演示）
    showVoiceInput() {
      uni.showToast({
        title: '语音功能开发中',
        icon: 'none'
      })
    },
    
    // 清空历史
    clearHistory() {
      uni.showModal({
        title: '清空对话',
        content: '确定要清空所有聊天记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = []
            this.saveHistory()
            this.showMenuModal = false
            uni.showToast({ title: '已清空', icon: 'success' })
          }
        }
      })
    },
    
    // 分享对话
    shareChat() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    // 意见反馈
    goToFeedback() {
      this.showMenuModal = false
      uni.switchTab({
        url: '/pages/mine/mine'
      })
      setTimeout(() => {
        uni.showToast({ title: '请在「我的-意见反馈」中提交', icon: 'none' })
      }, 500)
    },
    
    // 加载更多历史
    loadMoreHistory() {
      if (this.hasMoreHistory) {
        // 加载更多历史消息
        this.hasMoreHistory = false
      }
    },
    
    onInputFocus() {
      this.scrollToBottom()
    },
    
    onInputBlur() {
      // 输入框失焦时滚动到底部
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    },
    
    showMenu() {
      this.showMenuModal = true
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  width: 100%;
  height: 100vh;
  background: #f5f7f0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 头部导航栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  color: white;
  
  .header-left {
    width: 44px;
    
    .back-icon {
      font-size: 28px;
      font-weight: bold;
    }
  }
  
  .header-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    
    .robot-avatar-small {
      position: relative;
      width: 44px;
      height: 44px;
      background: #f7cd5c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .robot-icon {
        font-size: 28px;
      }
      
      .robot-hat-small {
        position: absolute;
        top: -6px;
        left: 18px;
        font-size: 14px;
        transform: rotate(-15deg);
      }
    }
    
    .robot-info {
      .robot-name {
        font-size: 18px;
        font-weight: bold;
        display: block;
      }
      
      .robot-status {
        font-size: 11px;
        opacity: 0.8;
      }
    }
  }
  
  .header-right {
    width: 44px;
    text-align: right;
    
    .menu-icon {
      font-size: 22px;
    }
  }
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.load-history {
  text-align: center;
  padding: 10px;
  font-size: 12px;
  color: #999;
}

/* 欢迎消息 */
.welcome-message {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  
  .welcome-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
  }
  
  .welcome-title {
    font-size: 20px;
    font-weight: bold;
    color: #2c5e2a;
    display: block;
    margin-bottom: 8px;
  }
  
  .welcome-desc {
    font-size: 14px;
    color: #666;
    display: block;
    margin-bottom: 16px;
  }
  
  .welcome-tip {
    font-size: 13px;
    color: #999;
    display: block;
    margin-bottom: 12px;
  }
  
  .welcome-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    
    .welcome-btn {
      padding: 8px 16px;
      background: #f0f5ea;
      border-radius: 30px;
      font-size: 13px;
      color: #2c5e2a;
    }
  }
}

/* 消息行 */
.message-row {
  display: flex;
  margin-bottom: 16px;
  
  &.user {
    justify-content: flex-end;
  }
  
  &.assistant {
    justify-content: flex-start;
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
  
  &.user-avatar {
    background: #e3f2fd;
    margin-right: 0;
    margin-left: 10px;
  }
  
  .avatar-icon {
    font-size: 22px;
  }
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.5;
  
  &.user {
    background: #2c5e2a;
    color: white;
    border-bottom-right-radius: 4px;
  }
  
  &.assistant {
    background: white;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
}

.message-text {
  word-break: break-all;
  white-space: pre-wrap;
}

/* 打字动画 */
.typing-indicator {
  display: inline-flex;
  gap: 4px;
  
  .dot {
    animation: blink 1.4s infinite;
    font-size: 20px;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes blink {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.loading-bubble {
  background: #e8e8e8;
  
  .loading-text {
    font-size: 13px;
    color: #999;
  }
}

/* 快捷回复栏 */
.quick-replies {
  white-space: nowrap;
  padding: 8px 12px;
  background: transparent;
  
  .quick-reply {
    display: inline-block;
    padding: 6px 16px;
    background: white;
    border-radius: 30px;
    margin-right: 10px;
    font-size: 13px;
    color: #2c5e2a;
    border: 1px solid #e0e0e0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
}

/* 底部输入栏 */
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0e8;
  padding-bottom: calc(12px + constant(safe-area-inset-bottom));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.input-left {
  display: flex;
  gap: 12px;
  
  .input-icon {
    width: 36px;
    height: 36px;
    background: #f5f7f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
}

.input-container {
  flex: 1;
  
  .chat-input {
    width: 100%;
    padding: 10px 16px;
    background: #f5f7f0;
    border-radius: 30px;
    font-size: 15px;
  }
}

.send-btn {
  padding: 8px 20px;
  background: #2c5e2a;
  color: white;
  border-radius: 30px;
  font-weight: 500;
}

/* 菜单弹窗 */
.menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  padding: 60px 16px 0 0;
}

.menu-popup {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  overflow: hidden;
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0e8;
    font-size: 14px;
    
    &:last-child {
      border-bottom: none;
    }
    
    text:first-child {
      font-size: 18px;
    }
  }
}
</style>