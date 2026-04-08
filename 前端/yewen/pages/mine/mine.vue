<template>
  <view class="mine-page">
    <!-- 用户信息头部 -->
    <view class="user-header" @click="editProfile">
      <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
      <view class="user-info">
        <view class="nickname-row">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="edit-icon">✎</text>
        </view>
        <text class="username">ID: {{ userInfo.userId }}</text>
        <text class="bio">{{ userInfo.bio || '点击编辑个人简介' }}</text>
      </view>
    </view>

    <!-- 统计数据卡片 -->
    <view class="stats-cards">
      <view class="stat-card" @click="goToDiagnosisRecords">
        <text class="stat-num">{{ diagnosisCount }}</text>
        <text class="stat-label">诊断记录</text>
      </view>
      <view class="stat-card" @click="goToCropManage">
        <text class="stat-num">{{ cropCount }}</text>
        <text class="stat-label">我的作物</text>
      </view>
      <view class="stat-card" @click="goToCommunity">
        <text class="stat-num">{{ postCount }}</text>
        <text class="stat-label">发布动态</text>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <!-- 账户安全组 -->
      <view class="menu-group">
        <view class="menu-group-title">账户管理</view>
        <view class="menu-item" @click="goToAccountSecurity">
          <view class="menu-left">
            <text class="menu-icon">🔐</text>
            <text class="menu-label">账号与安全</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="editProfile">
          <view class="menu-left">
            <text class="menu-icon">👤</text>
            <text class="menu-label">个人资料编辑</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 消息与反馈组 -->
      <view class="menu-group">
        <view class="menu-group-title">通知与反馈</view>
        <view class="menu-item" @click="goToNotificationSettings">
          <view class="menu-left">
            <text class="menu-icon">🔔</text>
            <text class="menu-label">消息通知设置</text>
          </view>
          <view class="menu-right">
            <text class="menu-status">{{ notificationStatus ? '已开启' : '已关闭' }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
        <view class="menu-item" @click="goToFeedback">
          <view class="menu-left">
            <text class="menu-icon">💬</text>
            <text class="menu-label">意见反馈</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 我的农场组 -->
      <view class="menu-group">
        <view class="menu-group-title">我的农场</view>
        <view class="menu-item" @click="goToCropManage">
          <view class="menu-left">
            <text class="menu-icon">🌾</text>
            <text class="menu-label">作物管理</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToDiagnosisRecords">
          <view class="menu-left">
            <text class="menu-icon">📋</text>
            <text class="menu-label">诊断记录</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 其他 -->
      <view class="menu-group">
        <view class="menu-item" @click="goToAbout">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-label">关于我们</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item logout-item" @click="handleLogout">
          <view class="menu-left">
            <text class="menu-icon">🚪</text>
            <text class="menu-label">退出登录</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>病虫害识别助手 v2.0.0</text>
    </view>

    <!-- 个人资料编辑弹窗 -->
    <view class="modal-mask" v-if="showProfileModal" @click="showProfileModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>编辑个人资料</text>
          <text class="close-btn" @click="showProfileModal = false">✕</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="form-item">
            <text class="form-label">头像</text>
            <view class="avatar-upload" @click="changeAvatar">
              <image class="avatar-preview" :src="tempUserInfo.avatar" mode="aspectFill"></image>
              <text class="upload-hint">点击更换</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input class="form-input" v-model="tempUserInfo.nickname" placeholder="请输入昵称" />
          </view>
          <view class="form-item">
            <text class="form-label">个人简介</text>
            <textarea class="form-textarea" v-model="tempUserInfo.bio" placeholder="介绍一下自己吧" maxlength="100" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="tempUserInfo.phone" placeholder="绑定手机号" type="number" />
          </view>
          <view class="form-item">
            <text class="form-label">所在地区</text>
            <picker mode="region" @change="onRegionChange">
              <view class="form-picker">{{ tempUserInfo.region || '请选择地区' }}</view>
            </picker>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="cancel-btn" @click="showProfileModal = false">取消</view>
          <view class="save-btn" @click="saveProfile">保存</view>
        </view>
      </view>
    </view>

    <!-- 消息通知设置弹窗 -->
    <view class="modal-mask" v-if="showNotificationModal" @click="showNotificationModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>消息通知设置</text>
          <text class="close-btn" @click="showNotificationModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="setting-item">
            <text>推送通知</text>
            <switch :checked="notificationSettings.push" @change="e => notificationSettings.push = e.detail.value" color="#2c5e2a" />
          </view>
          <view class="setting-item">
            <text>病害预警</text>
            <switch :checked="notificationSettings.alert" @change="e => notificationSettings.alert = e.detail.value" color="#2c5e2a" />
          </view>
          <view class="setting-item">
            <text>农友圈互动</text>
            <switch :checked="notificationSettings.community" @change="e => notificationSettings.community = e.detail.value" color="#2c5e2a" />
          </view>
          <view class="setting-item">
            <text>系统通知</text>
            <switch :checked="notificationSettings.system" @change="e => notificationSettings.system = e.detail.value" color="#2c5e2a" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="save-btn" @click="saveNotificationSettings">保存设置</view>
        </view>
      </view>
    </view>

    <!-- 作物管理弹窗 -->
    <view class="modal-mask" v-if="showCropModal" @click="showCropModal = false">
      <view class="modal-content large-modal" @click.stop>
        <view class="modal-header">
          <text>🌾 我的作物</text>
          <text class="close-btn" @click="showCropModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="crop-add-btn" @click="addCrop">
            <text>+ 添加作物</text>
          </view>
          <view class="crop-list">
            <view v-for="(crop, idx) in cropList" :key="idx" class="crop-item">
              <view class="crop-info">
                <text class="crop-icon">{{ getCropIcon(crop.name) }}</text>
                <view class="crop-detail">
                  <text class="crop-name">{{ crop.name }}</text>
                  <text class="crop-area">种植面积: {{ crop.area }} 亩</text>
                  <text class="crop-date">种植时间: {{ crop.plantDate }}</text>
                </view>
              </view>
              <view class="crop-actions">
                <text class="crop-edit" @click.stop="editCrop(crop, idx)">编辑</text>
                <text class="crop-delete" @click.stop="deleteCrop(idx)">删除</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="save-btn" @click="showCropModal = false">完成</view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑作物弹窗 -->
    <view class="modal-mask" v-if="showAddCropModal" @click="showAddCropModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>{{ editingCropIndex !== null ? '编辑作物' : '添加作物' }}</text>
          <text class="close-btn" @click="showAddCropModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">作物名称</text>
            <picker :range="commonCrops" @change="e => tempCrop.name = commonCrops[e.detail.value]">
              <view class="form-picker">{{ tempCrop.name || '请选择作物' }}</view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">种植面积(亩)</text>
            <input class="form-input" v-model="tempCrop.area" type="digit" placeholder="请输入面积" />
          </view>
          <view class="form-item">
            <text class="form-label">种植时间</text>
            <picker mode="date" @change="e => tempCrop.plantDate = e.detail.value">
              <view class="form-picker">{{ tempCrop.plantDate || '请选择日期' }}</view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">种植地点</text>
            <input class="form-input" v-model="tempCrop.location" placeholder="如：江苏省-南京市" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @click="showAddCropModal = false">取消</view>
          <view class="save-btn" @click="saveCrop">保存</view>
        </view>
      </view>
    </view>

    <!-- 诊断记录弹窗 -->
    <view class="modal-mask" v-if="showDiagnosisModal" @click="showDiagnosisModal = false">
      <view class="modal-content large-modal" @click.stop>
        <view class="modal-header">
          <text>📋 诊断记录</text>
          <text class="close-btn" @click="showDiagnosisModal = false">✕</text>
        </view>
        <scroll-view scroll-y class="modal-body" :style="{ maxHeight: '60vh' }">
          <view v-if="diagnosisRecords.length === 0" class="empty-state">
            <text>暂无诊断记录</text>
            <text class="empty-hint">点击首页拍照识别添加记录</text>
          </view>
          <view v-for="record in diagnosisRecords" :key="record.id" class="diagnosis-item" @click="viewDiagnosisDetail(record)">
            <image class="diagnosis-thumb" :src="record.thumbnail" mode="aspectFill"></image>
            <view class="diagnosis-info">
              <text class="diagnosis-name">{{ record.diseaseName }}</text>
              <text class="diagnosis-date">{{ record.diagnosisDate }}</text>
              <view class="diagnosis-status" :class="record.status === '已防治' ? 'treated' : 'pending'">
                {{ record.status }}
              </view>
            </view>
            <text class="diagnosis-arrow">›</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="save-btn" @click="showDiagnosisModal = false">关闭</view>
        </view>
      </view>
    </view>

    <!-- 意见反馈弹窗 -->
    <view class="modal-mask" v-if="showFeedbackModal" @click="showFeedbackModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>意见反馈</text>
          <text class="close-btn" @click="showFeedbackModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">反馈类型</text>
            <picker :range="feedbackTypes" @change="e => feedbackData.type = feedbackTypes[e.detail.value]">
              <view class="form-picker">{{ feedbackData.type || '请选择类型' }}</view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">反馈内容</text>
            <textarea class="form-textarea" v-model="feedbackData.content" placeholder="请详细描述您的问题或建议..." maxlength="300" />
          </view>
          <view class="form-item">
            <text class="form-label">联系方式</text>
            <input class="form-input" v-model="feedbackData.contact" placeholder="手机号/微信号（选填）" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @click="showFeedbackModal = false">取消</view>
          <view class="save-btn" @click="submitFeedback">提交</view>
        </view>
      </view>
    </view>

    <!-- 账号与安全弹窗 -->
    <view class="modal-mask" v-if="showSecurityModal" @click="showSecurityModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text>账号与安全</text>
          <text class="close-btn" @click="showSecurityModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="security-item" @click="changePassword">
            <text>修改密码</text>
            <text class="security-arrow">›</text>
          </view>
          <view class="security-item" @click="bindPhone">
            <text>绑定手机号</text>
            <text class="security-status">{{ userInfo.phone ? '已绑定' : '未绑定' }}</text>
            <text class="security-arrow">›</text>
          </view>
          <view class="security-item" @click="bindWechat">
            <text>绑定微信</text>
            <text class="security-status">{{ userInfo.wechatBind ? '已绑定' : '未绑定' }}</text>
            <text class="security-arrow">›</text>
          </view>
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
      // 用户信息
      userInfo: {
        avatar: 'https://picsum.photos/id/64/200/200',
        nickname: '智慧农场主',
        userId: 'FARMER_' + Math.floor(Math.random() * 10000),
        bio: '热爱农业，科技兴农🌱',
        phone: '',
        wechatBind: false
      },
      
      // 统计数据
      diagnosisCount: 0,
      cropCount: 0,
      postCount: 0,
      
      // 通知设置
      notificationStatus: true,
      notificationSettings: {
        push: true,
        alert: true,
        community: true,
        system: true
      },
      
      // 作物列表
      cropList: [],
      commonCrops: ['水稻', '小麦', '玉米', '大豆', '蔬菜', '果树', '棉花', '油菜'],
      
      // 诊断记录
      diagnosisRecords: [],
      
      // 弹窗控制
      showProfileModal: false,
      showNotificationModal: false,
      showCropModal: false,
      showAddCropModal: false,
      showDiagnosisModal: false,
      showFeedbackModal: false,
      showSecurityModal: false,
      
      // 临时数据
      tempUserInfo: {},
      tempCrop: { name: '', area: '', plantDate: '', location: '' },
      editingCropIndex: null,
      
      // 反馈数据
      feedbackTypes: ['功能建议', 'Bug反馈', '内容问题', '合作咨询', '其他'],
      feedbackData: { type: '', content: '', contact: '' }
    }
  },
  
  onLoad() {
    this.loadUserData()
    this.loadStatistics()
    this.loadDiagnosisRecords()
    this.loadCrops()
  },
  
  onShow() {
    // 每次显示页面刷新数据
    this.loadStatistics()
    this.loadDiagnosisRecords()
  },
  
  methods: {
    // 加载用户数据
    loadUserData() {
      const savedUser = uni.getStorageSync('user_info')
      if (savedUser) {
        this.userInfo = { ...this.userInfo, ...savedUser }
      }
    },
    
    // 保存用户数据
    saveUserData() {
      uni.setStorageSync('user_info', this.userInfo)
    },
    
    // 加载统计数据
    loadStatistics() {
      const records = uni.getStorageSync('plant_records') || []
      this.diagnosisCount = records.length
      
      const crops = uni.getStorageSync('my_crops') || []
      this.cropCount = crops.length
      this.cropList = crops
      
      // 从农友圈统计发布数量（模拟）
      this.postCount = uni.getStorageSync('user_posts') || Math.floor(Math.random() * 20) + 5
    },
    
    // 加载诊断记录
    loadDiagnosisRecords() {
      const records = uni.getStorageSync('plant_records') || []
      this.diagnosisRecords = records.slice(0, 10)
    },
    
    // 加载作物列表
    loadCrops() {
      const crops = uni.getStorageSync('my_crops') || []
      if (crops.length === 0) {
        // 模拟默认作物
        this.cropList = [
          { name: '水稻', area: '50', plantDate: '2026-03-15', location: '江苏省-南京市' },
          { name: '小麦', area: '30', plantDate: '2026-02-20', location: '江苏省-南京市' }
        ]
        this.saveCrops()
      } else {
        this.cropList = crops
      }
    },
    
    saveCrops() {
      uni.setStorageSync('my_crops', this.cropList)
      this.cropCount = this.cropList.length
    },
    
    getCropIcon(cropName) {
      const icons = { '水稻': '🌾', '小麦': '🌾', '玉米': '🌽', '大豆': '🫘', '蔬菜': '🥬', '果树': '🍎', '棉花': '🌿', '油菜': '🌼' }
      return icons[cropName] || '🌱'
    },
    
    // 个人资料编辑
    editProfile() {
      this.tempUserInfo = { ...this.userInfo }
      this.showProfileModal = true
    },
    
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.tempUserInfo.avatar = res.tempFilePaths[0]
        }
      })
    },
    
    onRegionChange(e) {
      this.tempUserInfo.region = e.detail.value.join(' ')
    },
    
    saveProfile() {
      this.userInfo = { ...this.tempUserInfo }
      this.saveUserData()
      this.showProfileModal = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    
    // 账号与安全
    goToAccountSecurity() {
      this.showSecurityModal = true
    },
    
    changePassword() {
      uni.showModal({
        title: '修改密码',
        content: '该功能将跳转至密码修改页面',
        confirmText: '去修改',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '演示模式，暂不跳转', icon: 'none' })
          }
        }
      })
    },
    
    bindPhone() {
      uni.showModal({
        title: '绑定手机号',
        content: '请输入手机号',
        editable: true,
        placeholderText: '请输入11位手机号',
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.phone = res.content
            this.saveUserData()
            uni.showToast({ title: '绑定成功', icon: 'success' })
            this.showSecurityModal = false
          }
        }
      })
    },
    
    bindWechat() {
      uni.showToast({ title: '微信绑定（演示模式）', icon: 'none' })
    },
    
    // 消息通知设置
    goToNotificationSettings() {
      this.showNotificationModal = true
    },
    
    saveNotificationSettings() {
      this.notificationStatus = this.notificationSettings.push
      uni.setStorageSync('notification_settings', this.notificationSettings)
      this.showNotificationModal = false
      uni.showToast({ title: '设置已保存', icon: 'success' })
    },
    
    // 意见反馈
    goToFeedback() {
      this.feedbackData = { type: '', content: '', contact: '' }
      this.showFeedbackModal = true
    },
    
    submitFeedback() {
      if (!this.feedbackData.content) {
        uni.showToast({ title: '请填写反馈内容', icon: 'none' })
        return
      }
      const feedbacks = uni.getStorageSync('feedbacks') || []
      feedbacks.push({
        ...this.feedbackData,
        time: new Date().toLocaleString(),
        userId: this.userInfo.userId
      })
      uni.setStorageSync('feedbacks', feedbacks)
      this.showFeedbackModal = false
      uni.showToast({ title: '感谢您的反馈！', icon: 'success' })
    },
    
    // 作物管理
    goToCropManage() {
      this.showCropModal = true
    },
    
    addCrop() {
      this.tempCrop = { name: '', area: '', plantDate: '', location: '' }
      this.editingCropIndex = null
      this.showAddCropModal = true
    },
    
    editCrop(crop, index) {
      this.tempCrop = { ...crop }
      this.editingCropIndex = index
      this.showAddCropModal = true
    },
    
    saveCrop() {
      if (!this.tempCrop.name || !this.tempCrop.area) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      if (this.editingCropIndex !== null) {
        this.cropList[this.editingCropIndex] = { ...this.tempCrop }
      } else {
        this.cropList.push({ ...this.tempCrop })
      }
      this.saveCrops()
      this.showAddCropModal = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    
    deleteCrop(index) {
      uni.showModal({
        title: '确认删除',
        content: `确定删除「${this.cropList[index].name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.cropList.splice(index, 1)
            this.saveCrops()
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    },
    
    // 诊断记录
    goToDiagnosisRecords() {
      this.showDiagnosisModal = true
    },
    
    viewDiagnosisDetail(record) {
      uni.showModal({
        title: record.diseaseName,
        content: `作物：${record.cropName}\n诊断日期：${record.diagnosisDate}\n严重程度：${record.severity}\n防治建议：${record.solution || '建议咨询植保专家'}`,
        showCancel: false
      })
    },
    
    // 其他功能
    goToCommunity() {
      uni.switchTab({ url: '/pages/community/community' })
    },
    
    goToAbout() {
      uni.showModal({
        title: '关于我们',
        content: '病虫害识别助手 v2.0.0\n\n一款专注于农业病虫害识别与防治的智能工具，助力智慧农业发展。\n\n客服邮箱：support@agriai.com',
        showCancel: false
      })
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        confirmColor: '#e74c3c',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态
            uni.removeStorageSync('is_login')
            uni.removeStorageSync('user_info')
            uni.removeStorageSync('saved_account')
            
            uni.showToast({ title: '已退出', icon: 'success' })
            
            // 重置用户信息为默认值
            this.userInfo = {
              avatar: 'https://picsum.photos/id/64/200/200',
              nickname: '智慧农场主',
              userId: 'FARMER_' + Math.floor(Math.random() * 10000),
              bio: '热爱农业，科技兴农🌱',
              phone: '',
              wechatBind: false
            }
            
            // 跳转到登录页
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/login' })
            }, 500)
          }
        }
      })
    },
    
    // 悬浮机器人
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
.mine-page {
  min-height: 100vh;
  background: #f5f7f0;
  padding-bottom: 30px;
  position: relative;
}

/* 用户头部 */
.user-header {
  background: linear-gradient(135deg, #2c5e2a, #3a7a36);
  padding: 40px 20px 30px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 0 0 32px 32px;
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  
  .user-info {
    flex: 1;
    
    .nickname-row {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .nickname {
        font-size: 20px;
        font-weight: bold;
        color: white;
      }
      
      .edit-icon {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
      }
    }
    
    .username {
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      display: block;
      margin: 4px 0;
    }
    
    .bio {
      font-size: 12px;
      color: rgba(255,255,255,0.8);
    }
  }
}

/* 统计数据卡片 */
.stats-cards {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-top: -20px;
  
  .stat-card {
    flex: 1;
    background: white;
    border-radius: 20px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    
    .stat-num {
      font-size: 24px;
      font-weight: bold;
      color: #2c5e2a;
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: #8a9a7a;
      margin-top: 4px;
    }
  }
}

/* 菜单列表 */
.menu-list {
  padding: 20px 16px;
}

.menu-group {
  background: white;
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  
  .menu-group-title {
    padding: 12px 16px;
    background: #f8faf3;
    font-size: 13px;
    color: #8a9a7a;
    font-weight: 500;
  }
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0e8;
  
  &:last-child {
    border-bottom: none;
  }
  
  .menu-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .menu-icon {
      font-size: 20px;
    }
    
    .menu-label {
      font-size: 15px;
      color: #333;
    }
  }
  
  .menu-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .menu-status {
      font-size: 12px;
      color: #8a9a7a;
    }
  }
  
  .menu-arrow {
    font-size: 18px;
    color: #ccc;
  }
  
  &.logout-item {
    .menu-label {
      color: #e74c3c;
    }
  }
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #bbb;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 85%;
  max-height: 80vh;
  background: white;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  
  &.large-modal {
    width: 90%;
    max-height: 85vh;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 18px;
  
  .close-btn {
    font-size: 24px;
    color: #999;
  }
}

.modal-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
  
  .cancel-btn {
    flex: 1;
    padding: 10px;
    text-align: center;
    background: #f5f7f0;
    border-radius: 40px;
    color: #666;
  }
  
  .save-btn {
    flex: 2;
    padding: 10px;
    text-align: center;
    background: #2c5e2a;
    color: white;
    border-radius: 40px;
  }
}

/* 表单样式 */
.form-item {
  margin-bottom: 16px;
  
  .form-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    display: block;
  }
  
  .form-input {
    width: 100%;
    padding: 12px;
    background: #f5f7f0;
    border-radius: 12px;
    font-size: 14px;
  }
  
  .form-textarea {
    width: 100%;
    padding: 12px;
    background: #f5f7f0;
    border-radius: 12px;
    font-size: 14px;
    min-height: 100px;
  }
  
  .form-picker {
    padding: 12px;
    background: #f5f7f0;
    border-radius: 12px;
    font-size: 14px;
    color: #333;
  }
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .avatar-preview {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
  
  .upload-hint {
    font-size: 12px;
    color: #2c5e2a;
  }
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0e8;
}

/* 作物列表 */
.crop-add-btn {
  padding: 12px;
  text-align: center;
  background: #f5f7f0;
  border-radius: 40px;
  margin-bottom: 16px;
  color: #2c5e2a;
  font-weight: 500;
}

.crop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8faf3;
  border-radius: 16px;
  margin-bottom: 10px;
  
  .crop-info {
    display: flex;
    gap: 12px;
    align-items: center;
    
    .crop-icon {
      font-size: 32px;
    }
    
    .crop-detail {
      .crop-name {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        display: block;
      }
      
      .crop-area, .crop-date {
        font-size: 11px;
        color: #999;
        display: block;
      }
    }
  }
  
  .crop-actions {
    display: flex;
    gap: 12px;
    
    .crop-edit {
      color: #2c5e2a;
      font-size: 13px;
    }
    
    .crop-delete {
      color: #e74c3c;
      font-size: 13px;
    }
  }
}

/* 诊断记录 */
.diagnosis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8faf3;
  border-radius: 16px;
  margin-bottom: 10px;
  
  .diagnosis-thumb {
    width: 50px;
    height: 50px;
    border-radius: 12px;
  }
  
  .diagnosis-info {
    flex: 1;
    
    .diagnosis-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      display: block;
    }
    
    .diagnosis-date {
      font-size: 11px;
      color: #999;
      display: block;
    }
    
    .diagnosis-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 10px;
      margin-top: 4px;
      
      &.treated {
        background: #d4edda;
        color: #155724;
      }
      
      &.pending {
        background: #fff3cd;
        color: #856404;
      }
    }
  }
  
  .diagnosis-arrow {
    font-size: 18px;
    color: #ccc;
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  
  .empty-hint {
    font-size: 12px;
    color: #bbb;
    margin-top: 8px;
    display: block;
  }
}

/* 安全设置 */
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0e8;
  
  .security-status {
    font-size: 12px;
    color: #999;
  }
  
  .security-arrow {
    font-size: 16px;
    color: #ccc;
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