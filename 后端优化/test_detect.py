import requests

# 基础配置
BASE_URL = "http://localhost:5000"
USER_ID = 1  # 改成你的用户ID

print("=" * 60)
print("📋 历史记录模块测试")
print("=" * 60)

# ========== 1. 测试获取历史记录列表 ==========
print("\n1️⃣ 获取历史记录列表")
url = f"{BASE_URL}/api/history/list"
params = {
    "user_id": USER_ID,
    "page": 1,
    "page_size": 10
}
response = requests.get(url, params=params)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    data = result.get('data', {})
    print(f"✅ 成功 - 共 {data.get('total', 0)} 条记录，当前第 {data.get('page')} 页")
    items = data.get('items', [])
    if items:
        print(f"   最新记录: ID={items[0].get('id')}, 病害={items[0].get('disease_name')}")
    else:
        print("   暂无记录")
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 2. 测试获取单条详情 ==========
print("\n2️⃣ 获取单条记录详情")
# 先获取最新一条记录的ID
if items:
    record_id = items[0].get('id')
    url = f"{BASE_URL}/api/history/detail/{record_id}"
    params = {"user_id": USER_ID}
    response = requests.get(url, params=params)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        data = result.get('data', {})
        print(f"✅ 成功")
        print(f"   ID: {data.get('id')}")
        print(f"   作物: {data.get('crop_type')}")
        print(f"   病害: {data.get('disease_name')}")
        print(f"   置信度: {data.get('confidence')}")
        print(f"   时间: {data.get('created_at')}")
        if data.get('ai_advice'):
            print(f"   AI建议: {data.get('ai_advice')[:50]}...")
    else:
        print(f"❌ 失败: {result.get('message')}")
else:
    print("⚠️ 没有记录，跳过详情测试")

# ========== 3. 测试统计信息 ==========
print("\n3️⃣ 获取用户统计信息")
url = f"{BASE_URL}/api/history/statistics"
params = {"user_id": USER_ID}
response = requests.get(url, params=params)
print(f"状态码: {response.status_code}")
result = response.json()
if result.get('code') == 200:
    data = result.get('data', {})
    print(f"✅ 成功")
    print(f"   总识别次数: {data.get('total_count', 0)}")
    print(f"   最近7天: {data.get('recent_count', 0)}次")
    print(f"   作物统计: {data.get('crop_stats', {})}")
    print(f"   病害统计: {data.get('disease_stats', {})}")
else:
    print(f"❌ 失败: {result.get('message')}")

# ========== 4. 测试删除记录 ==========
print("\n4️⃣ 测试删除记录（谨慎！）")
# 找一个可以删除的记录（比如最后一条）
if items and len(items) > 0:
    # 获取最后一条记录的ID（最旧的）
    last_record_id = items[-1].get('id')
    print(f"   准备删除记录 ID={last_record_id}")
    
    url = f"{BASE_URL}/api/history/delete/{last_record_id}"
    params = {"user_id": USER_ID}
    response = requests.delete(url, params=params)
    print(f"状态码: {response.status_code}")
    result = response.json()
    if result.get('code') == 200:
        print(f"✅ 删除成功: {result.get('message')}")
        
        # 验证删除后列表数量
        url_list = f"{BASE_URL}/api/history/list"
        response2 = requests.get(url_list, params={"user_id": USER_ID, "page": 1, "page_size": 1})
        result2 = response2.json()
        new_total = result2.get('data', {}).get('total', 0)
        print(f"   验证: 删除后剩余 {new_total} 条记录")
    else:
        print(f"❌ 删除失败: {result.get('message')}")
else:
    print("⚠️ 没有记录，跳过删除测试")

print("\n" + "=" * 60)
print("✅ 测试完成")
print("=" * 60)