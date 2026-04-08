"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 发布相关
      publishType: "experience",
      publishContent: "",
      selectedTopic: "",
      uploadImages: [],
      showTopicSelector: false,
      // 热门话题
      hotTopics: ["稻瘟病", "玉米螟", "小麦锈病", "蚜虫防治", "有机种植", "施肥技巧"],
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
      commentInput: ""
    };
  },
  onLoad() {
    this.loadPosts();
  },
  onReachBottom() {
    if (this.hasMore && !this.loadingMore) {
      this.loadMore();
    }
  },
  methods: {
    loadPosts() {
      this.loadingMore = true;
      setTimeout(() => {
        const newPosts = this.generateMockPosts();
        if (this.page === 1) {
          this.allPosts = newPosts;
        } else {
          this.allPosts = [...this.allPosts, ...newPosts];
        }
        this.hasMore = newPosts.length === this.pageSize;
        this.loadingMore = false;
      }, 500);
    },
    loadMore() {
      this.page++;
      this.loadPosts();
    },
    generateMockPosts() {
      const experiences = [
        { content: "水稻稻瘟病防治经验分享：发现病斑及时喷施三环唑，间隔7天再喷一次，效果很好！", tags: ["稻瘟病"], likes: 45, comments: 12 },
        { content: "玉米螟防治小妙招：释放赤眼蜂卵卡，生物防治效果显著，减少农药使用。", tags: ["玉米螟"], likes: 32, comments: 8 },
        { content: "小麦锈病识别技巧：叶片上有铁锈色粉末状孢子堆，初期用戊唑醇防治。", tags: ["小麦锈病"], likes: 28, comments: 5 },
        { content: "果园有机种植心得：坚持使用农家肥，果树抗病性明显增强。", tags: ["有机种植"], likes: 56, comments: 23 },
        { content: "番茄晚疫病防治：发现病叶及时摘除，喷施代森锰锌，注意通风降湿。", tags: ["番茄", "晚疫病"], likes: 38, comments: 11 }
      ];
      const questions = [
        { content: "求助！番茄叶片卷曲发黄，背面有白色小虫，这是什么病害？", tags: ["番茄", "虫害"], likes: 18, comments: 7 },
        { content: "请问专家，苹果树叶子边缘焦枯是怎么回事？用了多菌灵效果不明显。", tags: ["苹果", "病害"], likes: 24, comments: 11 },
        { content: "玉米苗期叶片有黄白色条纹，是缺素还是病害？求诊断方法。", tags: ["玉米", "苗期"], likes: 15, comments: 4 },
        { content: "大棚黄瓜霜霉病反复发作，有没有特效药推荐？", tags: ["黄瓜", "霜霉病"], likes: 31, comments: 9 },
        { content: "水稻抽穗期遇到连续阴雨，如何预防稻曲病？", tags: ["水稻", "稻曲病"], likes: 22, comments: 6 }
      ];
      const mockData = [];
      const avatars = [
        "https://picsum.photos/id/64/100/100",
        "https://picsum.photos/id/65/100/100",
        "https://picsum.photos/id/66/100/100",
        "https://picsum.photos/id/67/100/100",
        "https://picsum.photos/id/68/100/100"
      ];
      const usernames = ["稻香农人", "智慧农场主", "绿色田园", "丰收在望", "植保达人", "田间守望者", "生态农人"];
      for (let i = 0; i < this.pageSize; i++) {
        const isExp = i % 2 === 0;
        const data = isExp ? experiences[i % experiences.length] : questions[i % questions.length];
        mockData.push({
          id: Date.now() + i + this.page * 100,
          type: isExp ? "experience" : "question",
          username: usernames[Math.floor(Math.random() * usernames.length)],
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
          time: `${Math.floor(Math.random() * 24)}小时前`,
          content: data.content,
          tags: data.tags,
          images: Math.random() > 0.6 ? ["https://picsum.photos/id/15/400/300"] : [],
          likes: data.likes + Math.floor(Math.random() * 20),
          comments: data.comments + Math.floor(Math.random() * 10),
          isLiked: false
        });
      }
      return mockData;
    },
    doPublish() {
      if (!this.publishContent.trim()) {
        common_vendor.index.showToast({ title: "请输入内容", icon: "none" });
        return;
      }
      const newPost = {
        id: Date.now(),
        type: this.publishType,
        username: "我",
        avatar: "https://picsum.photos/id/100/100/100",
        time: "刚刚",
        content: this.publishContent,
        tags: this.selectedTopic ? [this.selectedTopic] : [],
        images: this.uploadImages,
        likes: 0,
        comments: 0,
        isLiked: false
      };
      this.allPosts.unshift(newPost);
      this.publishContent = "";
      this.uploadImages = [];
      this.selectedTopic = "";
      common_vendor.index.showToast({ title: "发布成功", icon: "success" });
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 3 - this.uploadImages.length,
        success: (res) => {
          this.uploadImages = [...this.uploadImages, ...res.tempFilePaths];
        }
      });
    },
    removeImage(index) {
      this.uploadImages.splice(index, 1);
    },
    toggleLike(post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      common_vendor.index.showToast({ title: post.isLiked ? "点赞成功" : "取消点赞", icon: "none" });
    },
    toggleComment(post) {
      this.currentPost = post;
      this.currentComments = [
        { user: "热心农友", content: "感谢分享，很有帮助！" },
        { user: "植保专家", content: "补充一点：注意轮换用药防止抗性。" }
      ];
      this.showCommentModal = true;
    },
    sendComment() {
      if (!this.commentInput.trim())
        return;
      this.currentComments.push({
        user: "我",
        content: this.commentInput
      });
      this.currentPost.comments++;
      this.commentInput = "";
      common_vendor.index.showToast({ title: "评论成功", icon: "success" });
    },
    closeCommentModal() {
      this.showCommentModal = false;
      this.currentPost = null;
      this.commentInput = "";
    },
    meetToo(post) {
      common_vendor.index.showModal({
        title: "同步病情",
        content: `是否将「${post.content.substring(0, 30)}...」同步到诊断页，方便后续识别和记录？`,
        confirmText: "同步",
        success: (res) => {
          if (res.confirm) {
            const syncData = {
              id: Date.now(),
              description: post.content,
              tags: post.tags,
              source: "community",
              time: (/* @__PURE__ */ new Date()).toLocaleString()
            };
            let history = common_vendor.index.getStorageSync("sync_diseases") || [];
            history.unshift(syncData);
            common_vendor.index.setStorageSync("sync_diseases", history);
            common_vendor.index.showToast({
              title: "已同步到诊断页",
              icon: "success",
              duration: 2e3
            });
            setTimeout(() => {
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            }, 1500);
          }
        }
      });
    },
    viewPostDetail(post) {
      common_vendor.index.showModal({
        title: post.type === "experience" ? "经验详情" : "问题详情",
        content: post.content,
        showCancel: false
      });
    },
    previewImage(url) {
      common_vendor.index.previewImage({ urls: [url] });
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
    a: $data.publishType === "experience" ? 1 : "",
    b: common_vendor.o(($event) => $data.publishType = "experience", "2f"),
    c: $data.publishType === "question" ? 1 : "",
    d: common_vendor.o(($event) => $data.publishType = "question", "53"),
    e: $data.showTopicSelector
  }, $data.showTopicSelector ? {
    f: common_vendor.f($data.hotTopics, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag,
        c: $data.selectedTopic === tag ? 1 : "",
        d: common_vendor.o(($event) => $data.selectedTopic = tag, tag)
      };
    })
  } : {}, {
    g: $data.publishType === "experience" ? "分享你的种植经验..." : "描述你遇到的病虫害问题...",
    h: $data.publishContent,
    i: common_vendor.o(($event) => $data.publishContent = $event.detail.value, "8e"),
    j: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "8a"),
    k: common_vendor.o((...args) => $options.doPublish && $options.doPublish(...args), "c4"),
    l: $data.uploadImages.length > 0
  }, $data.uploadImages.length > 0 ? {
    m: common_vendor.f($data.uploadImages, (img, idx, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.removeImage(idx), idx),
        c: idx
      };
    })
  } : {}, {
    n: common_vendor.f($data.allPosts, (item, k0, i0) => {
      return common_vendor.e({
        a: item.avatar,
        b: common_vendor.t(item.username),
        c: common_vendor.t(item.time),
        d: common_vendor.t(item.type === "experience" ? "🌾 经验分享" : "❓ 求助问答"),
        e: common_vendor.n(item.type === "experience" ? "experience-badge" : "question-badge"),
        f: common_vendor.t(item.content),
        g: item.tags && item.tags.length > 0
      }, item.tags && item.tags.length > 0 ? {
        h: common_vendor.f(item.tags, (tag, k1, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        i: item.images && item.images[0]
      }, item.images && item.images[0] ? {
        j: item.images[0],
        k: common_vendor.o(($event) => $options.previewImage(item.images[0]), item.id)
      } : {}, {
        l: common_vendor.t(item.isLiked ? "❤️" : "🤍"),
        m: common_vendor.t(item.likes),
        n: common_vendor.o(($event) => $options.toggleLike(item), item.id),
        o: common_vendor.t(item.comments),
        p: common_vendor.o(($event) => $options.toggleComment(item), item.id),
        q: common_vendor.o(($event) => $options.meetToo(item), item.id),
        r: item.id,
        s: common_vendor.n(item.type === "experience" ? "experience-card" : "question-card"),
        t: common_vendor.o(($event) => $options.viewPostDetail(item), item.id)
      });
    }),
    o: $data.hasMore
  }, $data.hasMore ? {
    p: common_vendor.t($data.loadingMore ? "加载中..." : "上拉加载更多")
  } : {}, {
    q: $data.showCommentModal
  }, $data.showCommentModal ? {
    r: common_vendor.o((...args) => $options.closeCommentModal && $options.closeCommentModal(...args), "a5"),
    s: common_vendor.f($data.currentComments, (comment, idx, i0) => {
      return {
        a: common_vendor.t(comment.user),
        b: common_vendor.t(comment.content),
        c: idx
      };
    }),
    t: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "c6"),
    v: $data.commentInput,
    w: common_vendor.o(($event) => $data.commentInput = $event.detail.value, "a3"),
    x: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "2a"),
    y: common_vendor.o((...args) => $options.closeCommentModal && $options.closeCommentModal(...args), "7e")
  } : {}, {
    z: common_vendor.o((...args) => $options.openAssistant && $options.openAssistant(...args), "d4")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
