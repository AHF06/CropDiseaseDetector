from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from app.config import config_map, Config
from app.models.base import db
from app.utils.response import error, success
from app.utils.exceptions import BusinessException


def create_app(config_name='default'):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 加载配置
    config_class = config_map.get(config_name, Config)
    app.config.from_object(config_class)
    
    # 创建必要的目录
    os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
    os.makedirs(Config.ANNOTATED_DIR, exist_ok=True)
    
    # 初始化扩展
    CORS(app, supports_credentials=True)
    db.init_app(app)
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
        print('✅ 数据库初始化完成')
    
    # ========== 全局异常处理 ==========
    
    @app.errorhandler(BusinessException)
    def handle_business_exception(e):
        return error(e.message, e.code)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return error(e.description, e.code)
    
    @app.errorhandler(Exception)
    def handle_general_exception(e):
        app.logger.error(f'未处理的异常: {e}', exc_info=True)
        return error('服务器内部错误', 500)
    
    # ========== 健康检查接口 ==========
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return success({'status': 'ok', 'message': '服务运行正常'})
    
        # ========== 注册路由 ==========
    from app.api.upload import register_upload_routes
    register_upload_routes(app)

    # 注册天气路由
    from app.api.weather import register_weather_routes
    register_weather_routes(app)

    # 注册历史路由
    from app.api.history import register_history_routes  
    register_history_routes(app)  

    # 注册聊天路由
    from app.api.chat import register_chat_routes  
    register_chat_routes(app)  

    # 注册社交路由
    from app.api.social import register_social_routes  
    register_social_routes(app)  
    
    # ========== 静态文件服务 ==========
    
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        from flask import send_from_directory
        return send_from_directory('static', filename)
    
    return app


# 修复：导入 os 模块
import os