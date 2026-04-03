import requests
import json
from flask import current_app


class LLMService:
    """大模型服务 - 生成农业建议"""
    
    def __init__(self):
        self.base_url = None
        self.model = None
        
    def _get_config(self):
        if self.base_url is None:
            self.base_url = current_app.config.get('LLM_BASE_URL', 'http://localhost:11434')
            self.model = current_app.config.get('LLM_MODEL', 'qwen2.5')
        return self.base_url, self.model
    
    def generate_advice(self, crop_type, disease_name, confidence, weather_info, location_info):
        """
        生成防治建议
        
        参数:
            crop_type: 作物类型
            disease_name: 病害名称
            confidence: 置信度
            weather_info: 天气信息 {'weather': '晴', 'temperature': '22', 'humidity': '65'}
            location_info: 地区信息 {'city': '武汉市', 'province': '湖北省'}
        
        返回:
            {
                'success': bool,
                'advice': str,      # 建议文本
                'error': str        # 错误信息
            }
        """
        base_url, model = self._get_config()
        
        # 构建 prompt
        prompt = self._build_prompt(crop_type, disease_name, confidence, weather_info, location_info)
        
        # Ollama API 格式
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一位经验丰富的农业病害防治专家。请用通俗易懂的语言给出防治建议，回答要简洁实用，适合农民朋友阅读。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False,
            "temperature": 0.7
        }
        
        try:
            # Ollama API 地址
            api_url = f"{base_url}/api/chat"
            
            response = requests.post(api_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                advice = result.get('message', {}).get('content', '')
                return {
                    'success': True,
                    'advice': advice,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'advice': None,
                    'error': f"LLM请求失败: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'advice': None,
                'error': "AI服务响应超时，请稍后重试"
            }
        except Exception as e:
            return {
                'success': False,
                'advice': None,
                'error': f"AI服务异常: {str(e)}"
            }
    
    def _build_prompt(self, crop_type, disease_name, confidence, weather_info, location_info):
        """构建提示词"""
        
        # 处理天气信息
        weather_text = "未知"
        temp_text = "未知"
        humidity_text = "未知"
        
        if weather_info:
            weather_text = weather_info.get('weather', '未知')
            temp_text = weather_info.get('temperature', '未知')
            humidity_text = weather_info.get('humidity', '未知')
        
        # 处理地区信息
        city_text = location_info.get('city', '未知') if location_info else '未知'
        
        prompt = f"""请根据以下信息，为农民提供专业的病害防治建议：

【基本信息】
- 作物类型：{crop_type}
- 病害名称：{disease_name}
- 识别置信度：{int(confidence * 100)}%

【环境信息】
- 地区：{city_text}
- 天气状况：{weather_text}
- 当前温度：{temp_text}℃
- 空气湿度：{humidity_text}%

请提供以下内容：
1. 病害简述：这种病害的主要特征和危害
2. 防治措施：2-3条具体可行的防治方法（包括农业防治和化学防治）
3. 天气建议：结合当前天气给出操作建议
4. 注意事项：用药安全或日常管理提醒

要求：
- 语言通俗易懂
- 建议要具体实用
- 控制在300字以内"""
        
        return prompt


# 单例
_llm_service = None

def get_llm_service():
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def generate_advice(crop_type, disease_name, confidence, weather_info=None, location_info=None):
    """便捷函数：生成防治建议"""
    service = get_llm_service()
    return service.generate_advice(crop_type, disease_name, confidence, weather_info, location_info)