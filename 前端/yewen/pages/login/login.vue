<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-blur"></view>
    </view>

    <!-- 顶部Logo区域 -->
    <view class="logo-section">
      <view class="logo-icon">
        <text class="logo-emoji">🌾</text>
      </view>
      <text class="app-name">病虫害识别助手</text>
      <text class="app-slogan">智慧农业 · 精准防控</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <!-- Tab切换 -->
      <view class="tab-bar">
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          密码登录
        </view>
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >
          验证码登录
        </view>
      </view>

      <!-- 密码登录表单 -->
      <view class="login-form" v-if="loginType === 'password'">
        <view class="input-group">
          <view class="input-icon">📱</view>
          <input 
            class="input-field" 
            v-model="loginForm.phone" 
            placeholder="手机号/用户名"
            type="text"
          />
        </view>
        <view class="input-group">
          <view class="input-icon">🔒</view>
          <input 
            class="input-field" 
            v-model="loginForm.password" 
            placeholder="密码"
            :type="showPassword ? 'text' : 'password'"
          />
          <view class="input-eye" @click="showPassword = !showPassword">
            <text>{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
        <view class="form-options">
          <view class="remember" @click="rememberMe = !rememberMe">
            <view class="checkbox" :class="{ checked: rememberMe }">
              <text v-if="rememberMe">✓</text>
            </view>
            <text>记住密码</text>
          </view>
          <text class="forgot" @click="forgotPassword">忘记密码？</text>
        </view>
        <button class="login-btn" @click="handleLogin">登 录</button>
      </view>

      <!-- 验证码登录表单 -->
      <view class="login-form" v-else>
        <view class="input-group">
          <view class="input-icon">📱</view>
          <input 
            class="input-field" 
            v-model="codeForm.phone" 
            placeholder="手机号"
            type="number"
          />
        </view>
        <view class="input-group">
          <view class="input-icon">📧</view>
          <input 
            class="input-field" 
            v-model="codeForm.code" 
            placeholder="验证码"
            type="number"
          />
          <view class="code-btn" @click="sendCode" :class="{ disabled: codeCountdown > 0 }">
            <text>{{ codeCountdown > 0 ? `${codeCountdown}s后重试` : '获取验证码' }}</text>
          </view>
        </view>
        <button class="login-btn" @click="handleCodeLogin">登 录</button>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="divider">
          <view class="line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="line"></view>
        </view>
        <view class="other-icons">
          <view class="icon-item" @click="wechatLogin">
            <text class="icon-emoji">💚</text>
            <text>微信</text>
          </view>
          <view class="icon-item" @click="qqLogin">
            <text class="icon-emoji">🐧</text>
            <text>QQ</text>
          </view>
          <view class="icon-item" @click="fingerprintLogin">
            <text class="icon-emoji">👆</text>
            <text>指纹</text>
          </view>
        </view>
      </view>

      <!-- 注册入口 -->
      <view class="register-link">
        <text>还没有账号？</text>
        <text class="link" @click="goToRegister">立即注册</text>
      </view>
    </view>

    <!-- 协议提示 -->
    <view class="agreement">
      <view class="checkbox small" :class="{ checked: agreeProtocol }" @click="agreeProtocol = !agreeProtocol">
        <text v-if="agreeProtocol">✓</text>
      </view>
      <text>登录即代表同意</text>
      <text class="link" @click="showProtocol('user')">《用户协议》</text>
      <text>和</text>
      <text class="link" @click="showProtocol('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 登录类型
      loginType: 'password', // password / code
      
      // 密码登录表单
      loginForm: {
        phone: '',
        password: ''
      },
      
      // 验证码登录表单
      codeForm: {
        phone: '',
        code: ''
      },
      
      // UI状态
      showPassword: false,
      rememberMe: false,
      agreeProtocol: true,
      codeCountdown: 0
    }
  },
  
  onLoad() {
    // 检查是否有保存的账号密码
    this.loadSavedAccount()
  },
  
  methods: {
    // 加载保存的账号
    loadSavedAccount() {
      const saved = uni.getStorageSync('saved_account')
      if (saved && saved.phone) {
        this.loginForm.phone = saved.phone
        this.loginForm.password = saved.password
        this.rememberMe = true
      }
    },
    
    // 保存账号
    saveAccount() {
      if (this.rememberMe) {
        uni.setStorageSync('saved_account', {
          phone: this.loginForm.phone,
          password: this.loginForm.password
        })
      } else {
        uni.removeStorageSync('saved_account')
      }
    },
    
    // 密码登录
    handleLogin() {
      // 验证表单
      if (!this.loginForm.phone) {
        uni.showToast({ title: '请输入手机号/用户名', icon: 'none' })
        return
      }
      if (!this.loginForm.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      if (!this.agreeProtocol) {
        uni.showToast({ title: '请同意用户协议', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '登录中...', mask: true })
      
      // 模拟登录请求
      setTimeout(() => {
        uni.hideLoading()
        
        // 模拟登录成功（演示环境，任意账号密码均可登录）
        // 实际开发中应调用后端接口验证
        if (this.loginForm.phone && this.loginForm.password) {
          // 保存登录状态
          const userInfo = {
            userId: 'USER_' + Date.now(),
            nickname: '农场主',
            phone: this.loginForm.phone,
            avatar: 'https://picsum.photos/id/64/200/200',
            loginTime: new Date().toISOString()
          }
          uni.setStorageSync('user_info', userInfo)
          uni.setStorageSync('is_login', true)
          
          // 保存账号（如果勾选了记住密码）
          this.saveAccount()
          
          uni.showToast({ title: '登录成功', icon: 'success' })
          
          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 500)
        } else {
          uni.showToast({ title: '账号或密码错误', icon: 'none' })
        }
      }, 1000)
    },
    
    // 验证码登录
    handleCodeLogin() {
      if (!this.codeForm.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      if (!this.codeForm.code) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      if (!this.agreeProtocol) {
        uni.showToast({ title: '请同意用户协议', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '登录中...', mask: true })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // 模拟验证码验证（演示环境，验证码为123456即可通过）
        if (this.codeForm.code === '123456') {
          const userInfo = {
            userId: 'USER_' + Date.now(),
            nickname: '农场主',
            phone: this.codeForm.phone,
            avatar: 'https://picsum.photos/id/64/200/200',
            loginTime: new Date().toISOString()
          }
          uni.setStorageSync('user_info', userInfo)
          uni.setStorageSync('is_login', true)
          
          uni.showToast({ title: '登录成功', icon: 'success' })
          
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 500)
        } else {
          uni.showToast({ title: '验证码错误', icon: 'none' })
        }
      }, 1000)
    },
    
    // 发送验证码
    sendCode() {
      if (this.codeCountdown > 0) return
      
      if (!this.codeForm.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.codeForm.phone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      
      // 模拟发送验证码（演示环境验证码为123456）
      console.log('验证码：123456')
      
      // 开始倒计时
      this.codeCountdown = 60
      const timer = setInterval(() => {
        this.codeCountdown--
        if (this.codeCountdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 忘记密码
    forgotPassword() {
      uni.showModal({
        title: '找回密码',
        content: '请联系客服或使用验证码登录',
        confirmText: '去验证码登录',
        success: (res) => {
          if (res.confirm) {
            this.loginType = 'code'
          }
        }
      })
    },
    
    // 微信登录
    wechatLogin() {
      uni.showToast({ title: '微信登录开发中', icon: 'none' })
    },
    
    // QQ登录
    qqLogin() {
      uni.showToast({ title: 'QQ登录开发中', icon: 'none' })
    },
    
    // 指纹登录
    fingerprintLogin() {
      uni.showToast({ title: '指纹登录开发中', icon: 'none' })
    },
    
    // 注册
    goToRegister() {
      uni.showToast({ title: '注册功能开发中', icon: 'none' })
    },
    
    // 显示协议
    showProtocol(type) {
      const title = type === 'user' ? '用户协议' : '隐私政策'
      const content = type === 'user' 
        ? '欢迎使用病虫害识别助手！本应用致力于为用户提供专业的病虫害识别与防治建议服务。用户在使用本服务时应遵守相关法律法规，不得利用本服务进行任何违法活动。本应用对识别结果仅供参考，具体防治请咨询专业农技人员。'
        : '我们重视您的隐私保护。我们会收集您的设备信息、使用记录等以提供更好的服务。我们不会将您的个人信息出售给第三方。详细信息请查看完整版隐私政策。'
      
      uni.showModal({
        title: title,
        content: content,
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c5e2a 0%, #4a9e46 50%, #2c5e2a 100%);
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.bg-blur {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-top: 80px;
  margin-bottom: 40px;
  z-index: 1;
}
.logo-icon {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.2);
  border-radius: 24px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}
.logo-emoji {
  font-size: 48px;
}
.app-name {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}
.app-slogan {
  display: block;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

/* 表单区域 */
.form-section {
  background: white;
  border-radius: 32px 32px 0 0;
  padding: 24px 20px 30px;
  margin-top: auto;
  z-index: 1;
}

/* Tab切换 */
.tab-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0e8;
}
.tab-item {
  font-size: 16px;
  font-weight: 500;
  color: #999;
  padding-bottom: 12px;
  position: relative;
}
.tab-item.active {
  color: #2c5e2a;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2c5e2a;
  border-radius: 2px;
}

/* 输入框 */
.input-group {
  display: flex;
  align-items: center;
  background: #f5f7f0;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.input-icon {
  font-size: 20px;
  margin-right: 12px;
}
.input-field {
  flex: 1;
  font-size: 15px;
  background: transparent;
}
.input-eye {
  padding: 4px 8px;
  font-size: 18px;
}
.code-btn {
  padding: 6px 12px;
  background: #2c5e2a;
  color: white;
  border-radius: 30px;
  font-size: 12px;
  white-space: nowrap;
}
.code-btn.disabled {
  background: #ccc;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
}
.checkbox.checked {
  background: #2c5e2a;
  border-color: #2c5e2a;
}
.forgot {
  color: #999;
  font-size: 13px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  color: white;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  margin-bottom: 20px;
}

/* 其他登录方式 */
.other-login {
  margin-top: 20px;
}
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.line {
  flex: 1;
  height: 1px;
  background: #f0f0e8;
}
.divider-text {
  font-size: 12px;
  color: #999;
}
.other-icons {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.icon-emoji {
  font-size: 28px;
}
.icon-item text:last-child {
  font-size: 12px;
  color: #666;
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}
.register-link .link {
  color: #2c5e2a;
  font-weight: 500;
  margin-left: 4px;
}

/* 协议 */
.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}
.agreement .link {
  color: #2c5e2a;
}
.checkbox.small {
  width: 14px;
  height: 14px;
  font-size: 10px;
}
</style>