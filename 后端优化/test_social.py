import requests
import time

BASE_URL = "http://localhost:5000"
USER_ID = 1  # 测试用户ID

print("=" * 60)
print("🌾 农友圈模块测试")
print("=" * 60)

# ========== 1. 发布帖子 ==========
print("\n1️⃣ 发布帖子")
url = f"{BASE_URL}/api/social/post"
payload = {
    "user_id": USER_ID,
    "content": "今天发现水稻有稻瘟病迹象，及时打了药，希望能控制住！",
    "crop_type": "rice",
    "disease_name": "稻瘟病",
    "location": "武汉市黄陂区"
}
response = requests.post(url, json=payload)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    post_id = result.get('data', {}).get('post_id')
    print(f"✅ 发布成功 - 帖子ID: {post_id}")
else:
    print(f"❌ 失败: {result.get('message')}")
    post_id = None

# ========== 2. 获取帖子列表 ==========
print("\n2️⃣ 获取帖子列表")
url = f"{BASE_URL}/api/social/posts"
params = {"page": 1, "page_size": 10, "current_user": USER_ID}
response = requests.get(url, params=params)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    data = result.get('data', {})
    print(f"✅ 成功 - 共 {data.get('total', 0)} 条帖子")
    items = data.get('items', [])
    if items:
        print(f"   最新帖子: {items[0].get('content')[:50]}...")
        if not post_id:
            post_id = items[0].get('id')
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 3. 获取帖子详情 ==========
if post_id:
    print(f"\n3️⃣ 获取帖子详情 (ID={post_id})")
    url = f"{BASE_URL}/api/social/post/{post_id}"
    params = {"current_user": USER_ID}
    response = requests.get(url, params=params)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        data = result.get('data', {})
        print(f"✅ 成功")
        print(f"   内容: {data.get('content')[:50]}...")
        print(f"   点赞数: {data.get('like_count')}")
        print(f"   评论数: {data.get('comment_count')}")
        print(f"   是否点赞: {data.get('is_liked')}")
    else:
        print(f"❌ 失败: {result.get('message')}")

# ========== 4. 点赞帖子 ==========
if post_id:
    print(f"\n4️⃣ 点赞帖子 (ID={post_id})")
    url = f"{BASE_URL}/api/social/like"
    payload = {"post_id": post_id, "user_id": USER_ID}
    response = requests.post(url, json=payload)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        print(f"✅ {result.get('message')}")
    else:
        print(f"❌ 失败: {result.get('message')}")

# ========== 5. 添加评论 ==========
if post_id:
    print(f"\n5️⃣ 添加评论 (帖子ID={post_id})")
    url = f"{BASE_URL}/api/social/comment"
    payload = {
        "post_id": post_id,
        "user_id": USER_ID,
        "content": "加油！稻瘟病要早发现早治疗，三环唑效果不错。"
    }
    response = requests.post(url, json=payload)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        comment_id = result.get('data', {}).get('comment_id')
        print(f"✅ 评论成功 - 评论ID: {comment_id}")
    else:
        print(f"❌ 失败: {result.get('message')}")

# ========== 6. 获取评论列表 ==========
if post_id:
    print(f"\n6️⃣ 获取评论列表 (帖子ID={post_id})")
    url = f"{BASE_URL}/api/social/comments/{post_id}"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        data = result.get('data', {})
        print(f"✅ 成功 - 共 {data.get('total', 0)} 条评论")
        items = data.get('items', [])
        for item in items[:3]:
            print(f"   - {item.get('content')[:50]}")
    else:
        print(f"❌ 失败: {result.get('message')}")

# ========== 7. 按病害搜索帖子 ==========
print("\n7️⃣ 按病害搜索帖子")
url = f"{BASE_URL}/api/social/posts"
params = {"disease_name": "稻瘟病", "page": 1, "page_size": 5}
response = requests.get(url, params=params)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    data = result.get('data', {})
    print(f"✅ 成功 - 找到 {data.get('total', 0)} 条相关帖子")
else:
    print(f"❌ 失败: {result.get('message')}")

print("\n" + "=" * 60)
print("✅ 测试完成")
print("=" * 60)