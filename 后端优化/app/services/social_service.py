import json
from flask import current_app
from app.models.base import db
from app.models.post import Post, PostLike, PostComment
from sqlalchemy import desc, func


class SocialService:
    """农友圈服务"""
    
    def create_post(self, user_id, content, images=None, crop_type=None, 
                    disease_name=None, location=None):
        """发布帖子"""
        images_json = json.dumps(images, ensure_ascii=False) if images else None
        
        post = Post(
            user_id=user_id,
            content=content,
            images=images_json,
            crop_type=crop_type,
            disease_name=disease_name,
            location=location
        )
        post.save()
        return post
    
    def get_post_list(self, page=1, page_size=10, crop_type=None, disease_name=None, user_id=None):
        """获取帖子列表"""
        query = Post.query
        
        if crop_type:
            query = query.filter(Post.crop_type == crop_type)
        if disease_name:
            query = query.filter(Post.disease_name.like(f'%{disease_name}%'))
        if user_id:
            query = query.filter(Post.user_id == user_id)
        
        query = query.order_by(desc(Post.created_at))
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return {
            'total': pagination.total,
            'page': page,
            'page_size': page_size,
            'pages': pagination.pages,
            'items': pagination.items
        }
    
    def get_post_detail(self, post_id):
        """获取帖子详情"""
        return Post.query.get(post_id)
    
    def like_post(self, post_id, user_id):
        """点赞帖子"""
        # 检查是否已点赞
        existing = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
        if existing:
            return False, '已经点过赞了'
        
        # 添加点赞记录
        like = PostLike(post_id=post_id, user_id=user_id)
        db.session.add(like)
        
        # 更新帖子点赞数
        post = Post.query.get(post_id)
        if post:
            post.like_count += 1
        
        db.session.commit()
        return True, '点赞成功'
    
    def unlike_post(self, post_id, user_id):
        """取消点赞"""
        like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
        if not like:
            return False, '尚未点赞'
        
        db.session.delete(like)
        
        # 更新帖子点赞数
        post = Post.query.get(post_id)
        if post and post.like_count > 0:
            post.like_count -= 1
        
        db.session.commit()
        return True, '取消点赞成功'
    
    def check_liked(self, post_id, user_id):
        """检查用户是否点赞了帖子"""
        return PostLike.query.filter_by(post_id=post_id, user_id=user_id).first() is not None
    
    def add_comment(self, post_id, user_id, content):
        """添加评论"""
        comment = PostComment(post_id=post_id, user_id=user_id, content=content)
        db.session.add(comment)
        
        # 更新帖子评论数
        post = Post.query.get(post_id)
        if post:
            post.comment_count += 1
        
        db.session.commit()
        return comment
    
    def get_comments(self, post_id, page=1, page_size=20):
        """获取帖子的评论列表"""
        query = PostComment.query.filter_by(post_id=post_id).order_by(desc(PostComment.created_at))
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return {
            'total': pagination.total,
            'page': page,
            'page_size': page_size,
            'pages': pagination.pages,
            'items': pagination.items
        }
    
    def delete_post(self, post_id, user_id):
        """删除帖子（只能删除自己的）"""
        post = Post.query.filter_by(id=post_id, user_id=user_id).first()
        if not post:
            return False, '帖子不存在或无权删除'
        
        db.session.delete(post)
        db.session.commit()
        return True, '删除成功'
    
    def delete_comment(self, comment_id, user_id):
        """删除评论（只能删除自己的）"""
        comment = PostComment.query.filter_by(id=comment_id, user_id=user_id).first()
        if not comment:
            return False, '评论不存在或无权删除'
        
        post_id = comment.post_id
        
        db.session.delete(comment)
        
        # 更新帖子评论数
        post = Post.query.get(post_id)
        if post and post.comment_count > 0:
            post.comment_count -= 1
        
        db.session.commit()
        return True, '删除成功'


# 单例
_social_service = None

def get_social_service():
    global _social_service
    if _social_service is None:
        _social_service = SocialService()
    return _social_service