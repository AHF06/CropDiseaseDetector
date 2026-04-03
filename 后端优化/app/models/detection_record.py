import json
from app.models.base import db, BaseModel


class DetectionRecord(BaseModel):
    """病虫害识别记录模型"""
    __tablename__ = 'detection_records'
    
    user_id = db.Column(db.Integer, nullable=False, default=0)
    image_path = db.Column(db.String(255), nullable=False)
    annotated_image_path = db.Column(db.String(255), nullable=True)
    crop_type = db.Column(db.String(50), nullable=False)
    disease_name = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    bbox_info = db.Column(db.Text, nullable=True)
    weather_info = db.Column(db.Text, nullable=True)
    ai_advice = db.Column(db.Text, nullable=True)
    
    def to_dict(self, base_url=''):
        """转换为字典，供API返回"""
        # 解析JSON字段
        bbox_data = []
        if self.bbox_info:
            try:
                bbox_data = json.loads(self.bbox_info)
            except:
                bbox_data = []
        
        weather_data = {}
        if self.weather_info:
            try:
                weather_data = json.loads(self.weather_info)
            except:
                weather_data = {}
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'image_url': f"{base_url}/{self.image_path}".replace('\\', '/') if self.image_path else None,
            'annotated_image_url': f"{base_url}/{self.annotated_image_path}".replace('\\', '/') if self.annotated_image_path else None,
            'crop_type': self.crop_type,
            'disease_name': self.disease_name,
            'confidence': round(self.confidence, 4),
            'detections': bbox_data,
            'weather_info': weather_data,
            'ai_advice': self.ai_advice,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def __repr__(self):
        return f'<DetectionRecord {self.id}: {self.crop_type}-{self.disease_name}>'