from flask import request, current_app
from app.utils.response import success, error
from app.services.history_service import get_history_service


def register_history_routes(app):
    
    @app.route('/api/history/list', methods=['GET'])
    def get_history_list():
        """
        获取历史记录列表
        
        参数:
            user_id: 用户ID（必填）
            page: 页码（默认1）
            page_size: 每页数量（默认10）
            crop_type: 作物类型筛选（可选）
            disease_name: 病害名称筛选（可选）
        """
        user_id = request.args.get('user_id', type=int)
        
        if user_id is None:
            return error('缺少用户ID', 400)
        
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        crop_type = request.args.get('crop_type')
        disease_name = request.args.get('disease_name')
        
        # 限制每页最大数量
        if page_size > 50:
            page_size = 50
        
        service = get_history_service()
        result = service.get_list(user_id, page, page_size, crop_type, disease_name)
        
        # 转换记录为字典
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        items = [item.to_dict(base_url) for item in result['items']]
        
        return success({
            'total': result['total'],
            'page': result['page'],
            'page_size': result['page_size'],
            'pages': result['pages'],
            'items': items
        })
    
    @app.route('/api/history/detail/<int:record_id>', methods=['GET'])
    def get_history_detail(record_id):
        """
        获取单条记录详情
        
        参数:
            user_id: 用户ID（必填）
        """
        user_id = request.args.get('user_id', type=int)
        
        if user_id is None:
            return error('缺少用户ID', 400)
        
        service = get_history_service()
        record = service.get_detail(record_id, user_id)
        
        if not record:
            return error('记录不存在', 404)
        
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        return success(record.to_dict(base_url))
    
    @app.route('/api/history/delete/<int:record_id>', methods=['DELETE'])
    def delete_history_record(record_id):
        """
        删除记录
        
        参数:
            user_id: 用户ID（必填，用于权限验证）
        """
        user_id = request.args.get('user_id', type=int)
        
        if user_id is None:
            return error('缺少用户ID', 400)
        
        service = get_history_service()
        success_flag, message = service.delete_record(record_id, user_id)
        
        if success_flag:
            return success(None, message)
        else:
            return error(message, 400)
    
    @app.route('/api/history/statistics', methods=['GET'])
    def get_history_statistics():
        """
        获取用户统计信息
        
        参数:
            user_id: 用户ID（必填）
        """
        user_id = request.args.get('user_id', type=int)
        
        if user_id is None:
            return error('缺少用户ID', 400)
        
        service = get_history_service()
        statistics = service.get_statistics(user_id)
        
        return success(statistics)
    
    @app.route('/api/history/batch-delete', methods=['POST'])
    def batch_delete_records():
        """
        批量删除记录
        
        参数:
            user_id: 用户ID（必填）
            record_ids: 记录ID列表（必填）
        """
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        user_id = data.get('user_id')
        record_ids = data.get('record_ids', [])
        
        if user_id is None:
            return error('缺少用户ID', 400)
        
        if not record_ids:
            return error('请选择要删除的记录', 400)
        
        service = get_history_service()
        success_count = 0
        fail_count = 0
        
        for record_id in record_ids:
            success_flag, _ = service.delete_record(record_id, user_id)
            if success_flag:
                success_count += 1
            else:
                fail_count += 1
        
        return success({
            'success_count': success_count,
            'fail_count': fail_count
        }, f'成功删除{success_count}条记录')