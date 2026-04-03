import json
from flask import current_app
from app.services.model_manager import ModelManager


class DetectionService:
    """病害识别服务"""
    
    def __init__(self):
        self.model_manager = ModelManager()
    
    def recognize(self, image_path: str, crop_type: str):
        """
        识别图片中的病害
        
        参数:
            image_path: 图片的绝对路径
            crop_type: 作物类型 (rice/corn/tomato/strawberry)
        
        返回:
            {
                'success': bool,
                'detections': list,  # 检测结果列表
                'annotated_path': str,  # 标注图路径
                'error_msg': str     # 错误信息（如果失败）
            }
        """
        try:
            # 获取模型
            predictor = self.model_manager.get_model(crop_type)
            
            # 调用模型预测
            result = predictor.predict(image_path)
            
            if not result.get('success'):
                return {
                    'success': False,
                    'detections': [],
                    'annotated_path': None,
                    'error_msg': result.get('error_msg', '识别失败')
                }
            
            # 提取检测结果
            detections = result.get('detections', [])
            
            # 格式化输出
            formatted_detections = []
            for det in detections:
                formatted_detections.append({
                    'label': det.get('label', 'unknown'),
                    'confidence': det.get('confidence', 0),
                    'box': det.get('box', [])  # [x1, y1, x2, y2]
                })
            
            # 获取标注图路径
            annotated_path = result.get('annotated_path', None)
            
            return {
                'success': True,
                'detections': formatted_detections,
                'annotated_path': annotated_path,
                'error_msg': None
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'detections': [],
                'annotated_path': None,
                'error_msg': str(e)
            }