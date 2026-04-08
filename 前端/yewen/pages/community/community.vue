<template>
  <view class="community-page">
    <!-- 顶部发布栏 -->
    <view class="publish-bar">
      <view class="publish-tabs">
        <view 
          class="publish-tab" 
          :class="{ active: publishType === 'experience' }"
          @click="publishType = 'experience'"
        >
          <text class="tab-icon">📝</text>
          <text>发经验</text>
        </view>
        <view 
          class="publish-tab" 
          :class="{ active: publishType === 'question' }"
          @click="publishType = 'question'"
        >
          <text class="tab-icon">❓</text>
          <text>提问题</text>
        </view>
      </view>
      
      <!-- 话题标签选择 -->
      <view class="topic-selector" v-if="showTopicSelector">
        <scroll-view scroll-x class="topic-scroll">
          <view 
            v-for="tag in hotTopics" 
            :key="tag"
            class="topic-tag"
            :class="{ active: selectedTopic === tag }"
            @click="selectedTopic = tag"
          >
            #{{ tag }}
          </view>
        </scroll-view>
      </view>
      
      <!-- 发布输入框 -->
      <view class="publish-input-area">
        <textarea 
          v-model="publishContent" 
          class="publish-textarea"
          :placeholder="publishType === 'experience' ? '分享你的种植经验...' : '描述你遇到的病虫害问题...'"
          maxlength="500"
          auto-height
        />
        <view class="publish-actions">
          <view class="image-upload" @click="chooseImage">
            <text>📷</text>
            <text class="upload-text">配图</text>
          </view>
          <view class="publish-btn" @click="doPublish">发布</view>
        </view>
      </view>
      
      <!-- 预览图片 -->
      <view class="preview-images" v-if="uploadImages.length > 0">
        <view v-for="(img, idx) in uploadImages" :key="idx" class="preview-img-item">
          <image :src="img" mode="aspectFill" class="preview-img"></image>
          <view class="remove-img" @click="removeImage(idx)">✕</view>
        </view>
      </view>
    </view>

    <!-- 单列帖子列表（从上往下） -->
    <view class="post-list">
      <view 
        v-for="item in allPosts" 
        :key="item.id" 
        class="post-card"
        :class="item.type === 'experience' ? 'experience-card' : 'question-card'"
        @click="viewPostDetail(item)"
      >
        <view class="card-header">
          <view class="user-info">
            <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
            <view class="user-detail">
              <text class="username">{{ item.username }}</text>
              <text class="time">{{ item.time }}</text>
            </view>
          </view>
          <view class="type-badge" :class="item.type === 'experience' ? 'experience-badge' : 'question-badge'">
            <text>{{ item.type === 'experience' ? '🌾 经验分享' : '❓ 求助问答' }}</text>
          </view>
        </view>
        
        <view class="card-content">
          <text class="content-text">{{ item.content }}</text>
          <view class="question-tags" v-if="item.tags && item.tags.length > 0">
            <text v-for="tag in item.tags" :key="tag" class="question-tag">#{{ tag }}</text>
          </view>
          <image 
            v-if="item.images && item.images[0]" 
            class="content-image" 
            :src="item.images[0]" 
            mode="aspectFill"
            @click.stop="previewImage(item.images[0])"
          ></image>
        </view>
        
        <view class="card-footer">
          <view class="action-btn" @click.stop="toggleLike(item)">
            <text class="action-icon">{{ item.isLiked ? '❤️' : '🤍' }}</text>
            <text>{{ item.likes }}</text>
          </view>
          <view class="action-btn" @click.stop="toggleComment(item)">
            <text class="action-icon">💬</text>
            <text>{{ item.comments }}</text>
          </view>
          <view class="action-btn meet-btn" @click.stop="meetToo(item)">
            <text class="action-icon">🤝</text>
            <text>我也遇到了</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text>{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
    </view>
    <view class="no-more" v-else>
      <text>✨ 已经到底了 ~</text>
    </view>

    <!-- 评论弹窗 -->
    <view class="comment-modal" v-if="showCommentModal" @click.self="closeCommentModal">
      <view class="modal-content">
        <view class="modal-header">
          <text>评论</text>
          <text class="close-btn" @click="closeCommentModal">✕</text>
        </view>
        <scroll-view class="comment-list" scroll-y>
          <view v-for="(comment, idx) in currentComments" :key="idx" class="comment-item">
            <text class="comment-user">{{ comment.user }}：</text>
            <text>{{ comment.content }}</text>
          </view>
        </scroll-view>
        <view class="comment-input-area">
          <input 
            v-model="commentInput" 
            class="comment-input" 
            placeholder="写评论..."
            confirm-type="send"
            @confirm="sendComment"
          />
          <view class="send-btn" @click="sendComment">发送</view>
        </view>
      </view>
    </view>

    <!-- 悬浮机器人 -->
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
      // 发布相关
      publishType: 'experience',
      publishContent: '',
      selectedTopic: '',
      uploadImages: [],
      showTopicSelector: false,
      
      // 热门话题
      hotTopics: ['稻瘟病', '玉米螟', '小麦锈病', '蚜虫防治', '有机种植', '施肥技巧'],
      
      // 帖子数据（单列列表）
      allPosts: [],
      
      // 分页
      page: 1,
      pageSize: 10,
      hasMore: true,
      loadingMore: false,
      
      // 评论弹窗
      showCommentModal: false,
      currentPost: null,
      currentComments: [],
      commentInput: ''
    }
  },
  
  onLoad() {
    this.loadPosts()
  },
  
  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMore()
    }
  },
  
  methods: {
    loadPosts() {
      this.loadingMore = true
      setTimeout(() => {
        const newPosts = this.generateMockPosts()
        if (this.page === 1) {
          this.allPosts = newPosts
        } else {
          this.allPosts = [...this.allPosts, ...newPosts]
        }
        this.hasMore = newPosts.length === this.pageSize
        this.loadingMore = false
      }, 500)
    },
    
    loadMore() {
      this.page++
      this.loadPosts()
    },
    
    generateMockPosts() {
      const experiences = [
        { content: '水稻稻瘟病防治经验分享：发现病斑及时喷施三环唑，间隔7天再喷一次，效果很好！', tags: ['稻瘟病'], likes: 45, comments: 12 },
        { content: '玉米螟防治小妙招：释放赤眼蜂卵卡，生物防治效果显著，减少农药使用。', tags: ['玉米螟'], likes: 32, comments: 8 },
        { content: '小麦锈病识别技巧：叶片上有铁锈色粉末状孢子堆，初期用戊唑醇防治。', tags: ['小麦锈病'], likes: 28, comments: 5 },
        { content: '果园有机种植心得：坚持使用农家肥，果树抗病性明显增强。', tags: ['有机种植'], likes: 56, comments: 23 },
        { content: '番茄晚疫病防治：发现病叶及时摘除，喷施代森锰锌，注意通风降湿。', tags: ['番茄', '晚疫病'], likes: 38, comments: 11 }
      ]
      
      const questions = [
        { content: '求助！番茄叶片卷曲发黄，背面有白色小虫，这是什么病害？', tags: ['番茄', '虫害'], likes: 18, comments: 7 },
        { content: '请问专家，苹果树叶子边缘焦枯是怎么回事？用了多菌灵效果不明显。', tags: ['苹果', '病害'], likes: 24, comments: 11 },
        { content: '玉米苗期叶片有黄白色条纹，是缺素还是病害？求诊断方法。', tags: ['玉米', '苗期'], likes: 15, comments: 4 },
        { content: '大棚黄瓜霜霉病反复发作，有没有特效药推荐？', tags: ['黄瓜', '霜霉病'], likes: 31, comments: 9 },
        { content: '水稻抽穗期遇到连续阴雨，如何预防稻曲病？', tags: ['水稻', '稻曲病'], likes: 22, comments: 6 }
      ]
      
      const mockData = []
      const avatars = [
        'https://picsum.photos/id/64/100/100',
        'https://picsum.photos/id/65/100/100', 
        'https://picsum.photos/id/66/100/100',
        'https://picsum.photos/id/67/100/100',
        'https://picsum.photos/id/68/100/100'
      ]
      const usernames = ['稻香农人', '智慧农场主', '绿色田园', '丰收在望', '植保达人', '田间守望者', '生态农人']
      
      for (let i = 0; i < this.pageSize; i++) {
        // 交替生成经验和问题，让列表更丰富
        const isExp = i % 2 === 0
        const data = isExp ? experiences[i % experiences.length] : questions[i % questions.length]
        
        mockData.push({
          id: Date.now() + i + this.page * 100,
          type: isExp ? 'experience' : 'question',
          username: usernames[Math.floor(Math.random() * usernames.length)],
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
          time: `${Math.floor(Math.random() * 24)}小时前`,
          content: data.content,
          tags: data.tags,
          images: Math.random() > 0.6 ? ['https://picsum.photos/id/15/400/300'] : [],
          likes: data.likes + Math.floor(Math.random() * 20),
          comments: data.comments + Math.floor(Math.random() * 10),
          isLiked: false
        })
      }
      
      return mockData
    },
    
    doPublish() {
      if (!this.publishContent.trim()) {
        uni.showToast({ title: '请输入内容', icon: 'none' })
        return
      }
      
      const newPost = {
        id: Date.now(),
        type: this.publishType,
        username: '我',
        avatar: 'https://picsum.photos/id/100/100/100',
        time: '刚刚',
        content: this.publishContent,
        tags: this.selectedTopic ? [this.selectedTopic] : [],
        images: this.uploadImages,
        likes: 0,
        comments: 0,
        isLiked: false
      }
      
      this.allPosts.unshift(newPost)
      
      this.publishContent = ''
      this.uploadImages = []
      this.selectedTopic = ''
      
      uni.showToast({ title: '发布成功', icon: 'success' })
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.uploadImages.length,
        success: (res) => {
          this.uploadImages = [...this.uploadImages, ...res.tempFilePaths]
        }
      })
    },
    
    removeImage(index) {
      this.uploadImages.splice(index, 1)
    },
    
    toggleLike(post) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
      uni.showToast({ title: post.isLiked ? '点赞成功' : '取消点赞', icon: 'none' })
    },
    
    toggleComment(post) {
      this.currentPost = post
      this.currentComments = [
        { user: '热心农友', content: '感谢分享，很有帮助！' },
        { user: '植保专家', content: '补充一点：注意轮换用药防止抗性。' }
      ]
      this.showCommentModal = true
    },
    
    sendComment() {
      if (!this.commentInput.trim()) return
      this.currentComments.push({
        user: '我',
        content: this.commentInput
      })
      this.currentPost.comments++
      this.commentInput = ''
      uni.showToast({ title: '评论成功', icon: 'success' })
    },
    
    closeCommentModal() {
      this.showCommentModal = false
      this.currentPost = null
      this.commentInput = ''
    },
    
    meetToo(post) {
      uni.showModal({
        title: '同步病情',
        content: `是否将「${post.content.substring(0, 30)}...」同步到诊断页，方便后续识别和记录？`,
        confirmText: '同步',
        success: (res) => {
          if (res.confirm) {
            const syncData = {
              id: Date.now(),
              description: post.content,
              tags: post.tags,
              source: 'community',
              time: new Date().toLocaleString()
            }
            let history = uni.getStorageSync('sync_diseases') || []
            history.unshift(syncData)
            uni.setStorageSync('sync_diseases', history)
            
            uni.showToast({ 
              title: '已同步到诊断页', 
              icon: 'success',
              duration: 2000
            })
            
            setTimeout(() => {
              uni.switchTab({ url: '/pages/index/index' })
            }, 1500)
          }
        }
      })
    },
    
    viewPostDetail(post) {
      uni.showModal({
        title: post.type === 'experience' ? '经验详情' : '问题详情',
        content: post.content,
        showCancel: false
      })
    },
    
    previewImage(url) {
      uni.previewImage({ urls: [url] })
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
.community-page {
  min-height: 100vh;
  background: #f5f7f0;
  padding-bottom: 20px;
  position: relative;
}

/* 发布栏样式 */
.publish-bar {
  background: white;
  margin: 12px;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.publish-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8ecdf;
  padding-bottom: 12px;
}

.publish-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 40px;
  background: #f5f7f0;
  color: #6b7c5e;
  transition: all 0.2s;
  
  .tab-icon {
    font-size: 18px;
  }
  
  &.active {
    background: #2c5e2a;
    color: white;
  }
}

.topic-selector {
  margin-bottom: 12px;
}

.topic-scroll {
  white-space: nowrap;
  display: flex;
  gap: 10px;
}

.topic-tag {
  display: inline-block;
  padding: 6px 16px;
  background: #f0f3e8;
  border-radius: 30px;
  font-size: 13px;
  color: #5a6e4a;
  margin-right: 10px;
  
  &.active {
    background: #2c5e2a;
    color: white;
  }
}

.publish-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background: #f8faf3;
  border-radius: 16px;
  font-size: 14px;
}

.publish-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #eef3e6;
  border-radius: 30px;
  font-size: 14px;
}

.publish-btn {
  padding: 8px 24px;
  background: #2c5e2a;
  color: white;
  border-radius: 30px;
  font-weight: 600;
}

.preview-images {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.preview-img-item {
  position: relative;
  width: 70px;
  height: 70px;
  
  .preview-img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
  
  .remove-img {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    background: red;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
}

/* 单列帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}

.experience-card {
  border-left: 4px solid #4caf50;
}

.question-card {
  border-left: 4px solid #ff9800;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
  
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
  
  .user-detail {
    display: flex;
    flex-direction: column;
    
    .username {
      font-weight: 600;
      font-size: 15px;
      color: #333;
    }
    
    .time {
      font-size: 11px;
      color: #999;
    }
  }
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.experience-badge {
  background: #e8f5e9;
  color: #2e7d32;
}

.question-badge {
  background: #fff3e0;
  color: #ef6c00;
}

.card-content {
  .content-text {
    font-size: 15px;
    line-height: 1.5;
    color: #333;
  }
  
  .content-image {
    width: 100%;
    max-height: 240px;
    border-radius: 12px;
    margin-top: 12px;
  }
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  
  .question-tag {
    font-size: 11px;
    padding: 4px 12px;
    background: #f0f3e8;
    border-radius: 20px;
    color: #5a6e4a;
  }
}

.card-footer {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0e8;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #888;
  padding: 6px 16px;
  border-radius: 30px;
  background: #fafbf6;
  
  .action-icon {
    font-size: 18px;
  }
  
  &.meet-btn {
    background: #eef3e6;
    color: #2c5e2a;
  }
}

.load-more, .no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
}

/* 评论弹窗 */
.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  
  .close-btn {
    font-size: 20px;
    cursor: pointer;
  }
}

.comment-list {
  flex: 1;
  max-height: 50vh;
  padding: 12px;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  
  .comment-user {
    font-weight: 600;
    color: #2c5e2a;
  }
}

.comment-input-area {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eee;
  gap: 10px;
  
  .comment-input {
    flex: 1;
    padding: 10px;
    background: #f5f7f0;
    border-radius: 30px;
    font-size: 14px;
  }
  
  .send-btn {
    padding: 10px 20px;
    background: #2c5e2a;
    color: white;
    border-radius: 30px;
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