import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

class Config:
    """基础配置"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # 数据库
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'crop_detect_db')
    
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # 文件存储
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR = os.path.join(BASE_DIR, 'static')
    UPLOAD_DIR = os.path.join(STATIC_DIR, 'uploads')
    ANNOTATED_DIR = os.path.join(STATIC_DIR, 'annotated')
    
    # API 基础URL
    API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')

        # ========== 高德地图API ==========
    AMAP_API_KEY = os.getenv('AMAP_API_KEY', '')

        # ========== LLM 配置 ==========
    LLM_BASE_URL = os.getenv('LLM_BASE_URL', 'http://localhost:11434')
    LLM_MODEL = os.getenv('LLM_MODEL', 'qwen2.5')
    
    # 允许的图片格式
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}

        # ========== 模型配置 ==========
    WEIGHTS_DIR = os.getenv('WEIGHTS_DIR', 'weights')  # 权重文件目录
    
    # 支持的作物类型及对应的模型文件
    MODEL_FILES = {
        'rice': 'rice_best.pt',      # 水稻
        'corn': 'corn_best.pt',      # 玉米
        'tomato': 'tomato_best.pt',  # 番茄
        'strawberry': 'strawberry_best.pt'  # 草莓
    }
    
    # 默认作物类型
    DEFAULT_CROP = 'rice'


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    SQLALCHEMY_ECHO = False


# 配置映射
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}