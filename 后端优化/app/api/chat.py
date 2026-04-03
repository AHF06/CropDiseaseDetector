from flask import request, current_app
from app.utils.response import success, error
from app.services.chat_service import get_chat_service


def register_chat_routes(app):
    
    @app.route('/api/chat/send', methods=['POST'])
    def send_message():
        """
        发送消息（单轮/多轮对话）
        
        请求体:
            {
                "session_id": "user_123",  # 会话ID，用于区分不同用户
                "message": "稻瘟病怎么防治？"
            }
        
        返回:
            {
                "reply": "AI回复内容"
            }
        """
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        session_id = data.get('session_id')
        user_message = data.get('message')
        
        if not session_id:
            return error('缺少会话ID(session_id)', 400)
        
        if not user_message:
            return error('请输入消息内容', 400)
        
        # 限制消息长度
        if len(user_message) > 500:
            return error('消息内容不能超过500字', 400)
        
        chat_service = get_chat_service()
        result = chat_service.chat(session_id, user_message)
        
        if result['success']:
            return success({
                'reply': result['reply'],
                'session_id': session_id
            })
        else:
            return error(result['error'], 500)
    
    @app.route('/api/chat/clear', methods=['POST'])
    def clear_session():
        """
        清空会话历史
        
        请求体:
            {
                "session_id": "user_123"
            }
        """
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        session_id = data.get('session_id')
        
        if not session_id:
            return error('缺少会话ID(session_id)', 400)
        
        chat_service = get_chat_service()
        chat_service.clear_session(session_id)
        
        return success(None, '会话已清空')
    
    @app.route('/api/chat/session-info', methods=['GET'])
    def get_session_info():
        """
        获取会话信息
        
        参数:
            session_id: 会话ID
        """
        session_id = request.args.get('session_id')
        
        if not session_id:
            return error('缺少会话ID(session_id)', 400)
        
        chat_service = get_chat_service()
        info = chat_service.get_session_info(session_id)
        
        if info:
            return success(info)
        else:
            return success({'message_count': 0, 'max_history': 10})
    
    @app.route('/api/chat/quick-questions', methods=['GET'])
    def get_quick_questions():
        """
        获取快速提问列表（供前端展示）
        """
        questions = [
            "水稻稻瘟病怎么防治？",
            "玉米常见病害有哪些？",
            "最近下雨多，怎么预防病害？",
            "农药什么时候打效果最好？",
            "有机种植怎么防治病虫害？",
            "草莓白粉病用什么药？"
        ]
        return success({'questions': questions})