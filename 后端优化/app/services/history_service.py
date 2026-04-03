from app.models.detection_record import DetectionRecord
from app.models.base import db
from sqlalchemy import desc


class HistoryService:
    """历史记录服务"""
    
    def get_list(self, user_id, page=1, page_size=10, crop_type=None, disease_name=None):
        """
        获取历史记录列表
        
        参数:
            user_id: 用户ID
            page: 页码（从1开始）
            page_size: 每页数量
            crop_type: 作物类型筛选（可选）
            disease_name: 病害名称筛选（可选）
        
        返回:
            {
                'total': 总数,
                'page': 当前页,
                'page_size': 每页数量,
                'pages': 总页数,
                'items': 记录列表
            }
        """
        # 构建查询
        query = DetectionRecord.query.filter_by(user_id=user_id)
        
        # 筛选条件
        if crop_type:
            query = query.filter(DetectionRecord.crop_type.like(f'%{crop_type}%'))
        
        if disease_name:
            query = query.filter(DetectionRecord.disease_name.like(f'%{disease_name}%'))
        
        # 按创建时间倒序
        query = query.order_by(desc(DetectionRecord.created_at))
        
        # 分页
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return {
            'total': pagination.total,
            'page': page,
            'page_size': page_size,
            'pages': pagination.pages,
            'items': pagination.items
        }
    
    def get_detail(self, record_id, user_id):
        """
        获取单条记录详情
        
        参数:
            record_id: 记录ID
            user_id: 用户ID（用于权限验证）
        
        返回:
            记录对象 或 None
        """
        return DetectionRecord.query.filter_by(id=record_id, user_id=user_id).first()
    
    def delete_record(self, record_id, user_id):
        """
        删除记录
        
        参数:
            record_id: 记录ID
            user_id: 用户ID（用于权限验证）
        
        返回:
            (success, message)
        """
        record = DetectionRecord.query.filter_by(id=record_id, user_id=user_id).first()
        
        if not record:
            return False, '记录不存在或无权删除'
        
        try:
            db.session.delete(record)
            db.session.commit()
            return True, '删除成功'
        except Exception as e:
            db.session.rollback()
            return False, f'删除失败: {str(e)}'
    
    def get_statistics(self, user_id):
        """
        获取用户统计信息
        
        参数:
            user_id: 用户ID
        
        返回:
            {
                'total_count': 总识别次数,
                'crop_stats': {作物类型: 次数},
                'disease_stats': {病害名称: 次数},
                'recent_count': 最近7天次数
            }
        """
        from datetime import datetime, timedelta
        
        # 总次数
        total_count = DetectionRecord.query.filter_by(user_id=user_id).count()
        
        # 作物统计
        from sqlalchemy import func
        crop_stats = db.session.query(
            DetectionRecord.crop_type, 
            func.count(DetectionRecord.id)
        ).filter_by(user_id=user_id).group_by(DetectionRecord.crop_type).all()
        crop_stats_dict = {crop: count for crop, count in crop_stats}
        
        # 病害统计（排除'未检测到病害'）
        disease_stats = db.session.query(
            DetectionRecord.disease_name, 
            func.count(DetectionRecord.id)
        ).filter_by(user_id=user_id).filter(
            DetectionRecord.disease_name != '未检测到病害'
        ).group_by(DetectionRecord.disease_name).all()
        disease_stats_dict = {disease: count for disease, count in disease_stats}
        
        # 最近7天次数
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_count = DetectionRecord.query.filter_by(user_id=user_id).filter(
            DetectionRecord.created_at >= seven_days_ago
        ).count()
        
        return {
            'total_count': total_count,
            'crop_stats': crop_stats_dict,
            'disease_stats': disease_stats_dict,
            'recent_count': recent_count
        }


# 单例
_history_service = None

def get_history_service():
    global _history_service
    if _history_service is None:
        _history_service = HistoryService()
    return _history_service