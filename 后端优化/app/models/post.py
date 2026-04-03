import json
from app.models.base import db, BaseModel
from datetime import datetime


class Post(BaseModel):
    """帖子模型"""
    __tablename__ = 'posts'
    
    user_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    images = db.Column(db.Text, nullable=True)  # JSON格式存储图片路径列表
    crop_type = db.Column(db.String(50), nullable=True)
    disease_name = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    like_count = db.Column(db.Integer, default=0)
    comment_count = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self, base_url='', current_user_id=None):
        """转换为字典"""
        # 解析图片列表
        images_list = []
        if self.images:
            try:
                images_list = json.loads(self.images)
                # 补全图片URL
                images_list = [f"{base_url}/{img}".replace('\\', '/') for img in images_list]
            except:
                images_list = []
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'images': images_list,
            'crop_type': self.crop_type,
            'disease_name': self.disease_name,
            'location': self.location,
            'like_count': self.like_count,
            'comment_count': self.comment_count,
            'is_liked': False,  # 需要单独设置
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class PostLike(db.Model):
    """点赞模型"""
    __tablename__ = 'post_likes'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    __table_args__ = (
        db.UniqueConstraint('post_id', 'user_id', name='uk_post_user'),
    )


class PostComment(BaseModel):
    """评论模型"""
    __tablename__ = 'post_comments'
    
    post_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    def to_dict(self, base_url=''):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }