import os
import sys
from pathlib import Path


from flask import current_app
from predict.predictImg import ImagePredictor


class ModelManager:
    """单例模式管理多个作物模型，避免重复加载"""
    _instance = None
    _models = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def get_model(self, crop_type: str):
        """获取指定作物的模型（懒加载+缓存）"""
        # 从配置中获取模型文件名
        model_files = current_app.config.get('MODEL_FILES', {})
        weights_dir = current_app.config.get('WEIGHTS_DIR', 'weights')
        
        if crop_type not in model_files:
            raise ValueError(f"不支持的作物类型: {crop_type}，支持的类型: {list(model_files.keys())}")
        
        # 如果模型已加载，直接返回
        if crop_type in self._models:
            print(f"✅ 使用缓存的 {crop_type} 模型")
            return self._models[crop_type]
        
        # 构建模型路径
        model_filename = model_files[crop_type]
        model_path = os.path.join(weights_dir, model_filename)
        
        # 如果是相对路径，尝试多个可能的位置
        if not os.path.isabs(model_path):
            # 尝试在项目根目录下查找
            base_dir = current_app.config.get('BASE_DIR', '')
            possible_paths = [
                model_path,  # 相对路径
                os.path.join(base_dir, model_path),  # 在项目根目录下
                os.path.join(base_dir, model_filename),  # 在项目根目录下
                os.path.join(base_dir, model_path),  # 完整相对路径
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    model_path = path
                    break
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"模型文件不存在: {model_path}")
        
        print(f"🔄 加载 {crop_type} 模型: {model_path}")
        predictor = ImagePredictor(weights_path=model_path, kind=crop_type)
        self._models[crop_type] = predictor
        print(f"✅ {crop_type} 模型加载完成")
        
        return predictor
    
    def unload_model(self, crop_type: str):
        """卸载指定模型，释放内存"""
        if crop_type in self._models:
            del self._models[crop_type]
            print(f"🗑️ 已卸载 {crop_type} 模型")