import requests
import json
from flask import current_app
from datetime import datetime


class ChatService:
    """AI对话服务 - 支持多轮对话"""
    
    def __init__(self):
        self.base_url = None
        self.model = None
        self._sessions = {}  # 存储会话历史 {session_id: [messages]}
        self._max_history = 10  # 最多保留10条历史消息
    
    def _get_config(self):
        if self.base_url is None:
            self.base_url = current_app.config.get('LLM_BASE_URL', 'http://localhost:11434')
            self.model = current_app.config.get('LLM_MODEL', 'qwen2.5')
        return self.base_url, self.model
    
    def _get_system_prompt(self):
        """获取系统提示词"""
        return """你是一位专业的农业病害防治专家，名叫"农小智"。

你的特点：
1. 精通水稻、玉米、番茄、草莓等作物的病害防治
2. 了解农药使用、农业气象、种植管理知识
3. 回答要通俗易懂，适合农民朋友阅读
4. 回答简洁实用，控制在200字以内
5. 如果用户的问题与农业无关，礼貌地引导回农业话题

请用热情、亲切的语气回答用户问题。"""
    
    def chat(self, session_id, user_message):
        """
        对话接口
        
        参数:
            session_id: 会话ID（用于区分不同用户/对话）
            user_message: 用户发送的消息
        
        返回:
            {
                'success': bool,
                'reply': str,      # AI回复
                'error': str       # 错误信息
            }
        """
        base_url, model = self._get_config()
        
        # 获取或创建会话历史
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        
        # 构建消息列表
        messages = [
            {"role": "system", "content": self._get_system_prompt()}
        ]
        
        # 添加历史消息（限制数量）
        history = self._sessions[session_id][-self._max_history:]
        messages.extend(history)
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": user_message})
        
        # Ollama API 格式
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "temperature": 0.7
        }
        
        try:
            api_url = f"{base_url}/api/chat"
            response = requests.post(api_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                reply = result.get('message', {}).get('content', '')
                
                # 保存到历史
                self._sessions[session_id].append({"role": "user", "content": user_message})
                self._sessions[session_id].append({"role": "assistant", "content": reply})
                
                return {
                    'success': True,
                    'reply': reply,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'reply': None,
                    'error': f"AI服务请求失败: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'reply': None,
                'error': "AI服务响应超时，请稍后重试"
            }
        except Exception as e:
            return {
                'success': False,
                'reply': None,
                'error': f"AI服务异常: {str(e)}"
            }
    
    def clear_session(self, session_id):
        """清空会话历史"""
        if session_id in self._sessions:
            self._sessions[session_id] = []
            return True
        return False
    
    def get_session_info(self, session_id):
        """获取会话信息"""
        if session_id in self._sessions:
            return {
                'message_count': len(self._sessions[session_id]),
                'max_history': self._max_history
            }
        return None


# 单例
_chat_service = None

def get_chat_service():
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service


def chat_with_ai(session_id, user_message):
    """便捷函数：与AI对话"""
    service = get_chat_service()
    return service.chat(session_id, user_message)


def clear_chat_session(session_id):
    """便捷函数：清空会话"""
    service = get_chat_service()
    return service.clear_session(session_id)