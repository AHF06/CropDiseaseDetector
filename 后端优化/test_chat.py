import requests
import time

BASE_URL = "http://localhost:5000"
SESSION_ID = "test_user_001"  # 模拟用户会话

print("=" * 60)
print("💬 AI对话模块测试")
print("=" * 60)

# ========== 1. 测试快速提问列表 ==========
print("\n1️⃣ 获取快速提问列表")
url = f"{BASE_URL}/api/chat/quick-questions"
response = requests.get(url)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    questions = result.get('data', {}).get('questions', [])
    print(f"✅ 成功 - 共 {len(questions)} 个快速提问")
    for q in questions[:3]:
        print(f"   - {q}")
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 2. 测试单轮对话 ==========
print("\n2️⃣ 测试AI对话（单轮）")
url = f"{BASE_URL}/api/chat/send"
payload = {
    "session_id": SESSION_ID,
    "message": "水稻稻瘟病怎么防治？"
}
response = requests.post(url, json=payload)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    reply = result.get('data', {}).get('reply', '')
    print(f"✅ AI回复:")
    print(f"   {reply[:150]}...")
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 3. 测试多轮对话（上下文） ==========
print("\n3️⃣ 测试多轮对话（记住上下文）")
time.sleep(1)

# 第二轮：追问
payload2 = {
    "session_id": SESSION_ID,
    "message": "我刚才问的是什么病害？"
}
response2 = requests.post(url, json=payload2)
print(f"状态码: {response2.status_code}")
result2 = response2.json()
if result2.get('code') == 200:
    reply2 = result2.get('data', {}).get('reply', '')
    print(f"✅ AI回复（应该记得是稻瘟病）:")
    print(f"   {reply2[:150]}...")
else:
    print(f"❌ 失败: {result2.get('message')}")

# ========== 4. 测试无关问题引导 ==========
print("\n4️⃣ 测试无关问题（应该引导回农业话题）")
time.sleep(1)

payload3 = {
    "session_id": SESSION_ID,
    "message": "今天天气真好，推荐个电影吧"
}
response3 = requests.post(url, json=payload3)
print(f"状态码: {response3.status_code}")
result3 = response3.json()
if result3.get('code') == 200:
    reply3 = result3.get('data', {}).get('reply', '')
    print(f"✅ AI回复（应该引导回农业）:")
    print(f"   {reply3[:150]}...")
else:
    print(f"❌ 失败: {result3.get('message')}")

# ========== 5. 测试会话信息 ==========
print("\n5️⃣ 获取会话信息")
url = f"{BASE_URL}/api/chat/session-info"
params = {"session_id": SESSION_ID}
response = requests.get(url, params=params)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    info = result.get('data', {})
    print(f"✅ 成功")
    print(f"   消息数量: {info.get('message_count', 0)}")
    print(f"   最大历史: {info.get('max_history', 0)}")
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 6. 测试清空会话 ==========
print("\n6️⃣ 清空会话历史")
url = f"{BASE_URL}/api/chat/clear"
payload4 = {"session_id": SESSION_ID}
response = requests.post(url, json=payload4)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    print(f"✅ 清空成功: {result.get('message')}")
    
    # 验证清空
    response2 = requests.get(f"{BASE_URL}/api/chat/session-info", params={"session_id": SESSION_ID})
    info2 = response2.json()
    msg_count = info2.get('data', {}).get('message_count', 0)
    print(f"   验证: 清空后消息数量为 {msg_count}")
else:
    print(f"❌ 失败: {result.get('message')}")

print("\n" + "=" * 60)
print("✅ 测试完成")
print("=" * 60)