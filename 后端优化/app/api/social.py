from flask import request, current_app
from app.utils.response import success, error
from app.services.social_service import get_social_service
from app.utils.file_utils import save_upload_file
import json


def register_social_routes(app):
    
    # ========== 帖子相关 ==========
    
    @app.route('/api/social/post', methods=['POST'])
    def create_post():
        """发布帖子"""
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        user_id = data.get('user_id')
        content = data.get('content')
        
        if not user_id:
            return error('缺少用户ID', 400)
        if not content:
            return error('请输入帖子内容', 400)
        
        images = data.get('images', [])
        crop_type = data.get('crop_type')
        disease_name = data.get('disease_name')
        location = data.get('location')
        
        service = get_social_service()
        post = service.create_post(user_id, content, images, crop_type, disease_name, location)
        
        return success({'post_id': post.id}, '发布成功')
    
    @app.route('/api/social/upload-image', methods=['POST'])
    def upload_post_image():
        """上传帖子图片"""
        if 'file' not in request.files:
            return error('请选择图片', 400)
        
        file = request.files['file']
        relative_path, absolute_path = save_upload_file(file, subdir='social')
        
        if not relative_path:
            return error('图片保存失败', 500)
        
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        image_url = f"{base_url}/{relative_path}".replace('\\', '/')
        
        return success({'image_url': image_url, 'path': relative_path}, '上传成功')
    
    @app.route('/api/social/posts', methods=['GET'])
    def get_posts():
        """获取帖子列表"""
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        crop_type = request.args.get('crop_type')
        disease_name = request.args.get('disease_name')
        user_id = request.args.get('user_id', type=int)
        current_user = request.args.get('current_user', type=int)
        
        if page_size > 50:
            page_size = 50
        
        service = get_social_service()
        result = service.get_post_list(page, page_size, crop_type, disease_name, user_id)
        
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        items = []
        for post in result['items']:
            post_dict = post.to_dict(base_url)
            if current_user:
                post_dict['is_liked'] = service.check_liked(post.id, current_user)
            items.append(post_dict)
        
        return success({
            'total': result['total'],
            'page': result['page'],
            'page_size': result['page_size'],
            'pages': result['pages'],
            'items': items
        })
    
    @app.route('/api/social/post/<int:post_id>', methods=['GET'])
    def get_post_detail(post_id):
        """获取帖子详情"""
        service = get_social_service()
        post = service.get_post_detail(post_id)
        
        if not post:
            return error('帖子不存在', 404)
        
        current_user = request.args.get('current_user', type=int)
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        post_dict = post.to_dict(base_url)
        
        if current_user:
            post_dict['is_liked'] = service.check_liked(post_id, current_user)
        
        return success(post_dict)
    
    @app.route('/api/social/post/<int:post_id>', methods=['DELETE'])
    def delete_post(post_id):
        """删除帖子"""
        user_id = request.args.get('user_id', type=int)
        
        if not user_id:
            return error('缺少用户ID', 400)
        
        service = get_social_service()
        success_flag, message = service.delete_post(post_id, user_id)
        
        if success_flag:
            return success(None, message)
        else:
            return error(message, 400)
    
    # ========== 点赞相关 ==========
    
    @app.route('/api/social/like', methods=['POST'])
    def like_post():
        """点赞帖子"""
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        post_id = data.get('post_id')
        user_id = data.get('user_id')
        
        if not post_id or not user_id:
            return error('缺少必要参数', 400)
        
        service = get_social_service()
        success_flag, message = service.like_post(post_id, user_id)
        
        if success_flag:
            return success(None, message)
        else:
            return error(message, 400)
    
    @app.route('/api/social/unlike', methods=['POST'])
    def unlike_post():
        """取消点赞"""
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        post_id = data.get('post_id')
        user_id = data.get('user_id')
        
        if not post_id or not user_id:
            return error('缺少必要参数', 400)
        
        service = get_social_service()
        success_flag, message = service.unlike_post(post_id, user_id)
        
        if success_flag:
            return success(None, message)
        else:
            return error(message, 400)
    
    # ========== 评论相关 ==========
    
    @app.route('/api/social/comment', methods=['POST'])
    def add_comment():
        """添加评论"""
        data = request.get_json()
        
        if not data:
            return error('请求体不能为空', 400)
        
        post_id = data.get('post_id')
        user_id = data.get('user_id')
        content = data.get('content')
        
        if not post_id or not user_id:
            return error('缺少必要参数', 400)
        if not content:
            return error('请输入评论内容', 400)
        
        service = get_social_service()
        comment = service.add_comment(post_id, user_id, content)
        
        return success({'comment_id': comment.id}, '评论成功')
    
    @app.route('/api/social/comments/<int:post_id>', methods=['GET'])
    def get_comments(post_id):
        """获取评论列表"""
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        
        service = get_social_service()
        result = service.get_comments(post_id, page, page_size)
        
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        items = [item.to_dict(base_url) for item in result['items']]
        
        return success({
            'total': result['total'],
            'page': result['page'],
            'page_size': result['page_size'],
            'pages': result['pages'],
            'items': items
        })
    
    @app.route('/api/social/comment/<int:comment_id>', methods=['DELETE'])
    def delete_comment(comment_id):
        """删除评论"""
        user_id = request.args.get('user_id', type=int)
        
        if not user_id:
            return error('缺少用户ID', 400)
        
        service = get_social_service()
        success_flag, message = service.delete_comment(comment_id, user_id)
        
        if success_flag:
            return success(None, message)
        else:
            return error(message, 400)