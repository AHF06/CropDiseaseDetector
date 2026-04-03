from flask import request, current_app
from app.utils.response import success, error
from app.utils.file_utils import save_upload_file
from app.models.base import db
from app.models.detection_record import DetectionRecord
from app.services.detection_service import DetectionService
from app.services.weather_service import get_weather_service
from app.services.llm_service import generate_advice  # 新增
import json


def register_upload_routes(app):
    
    @app.route('/api/upload', methods=['POST'])
    def upload_image():
        """图片上传并识别接口"""
        # 1. 获取参数
        if 'file' not in request.files:
            return error('请选择要上传的图片', 400)
        
        file = request.files['file']
        user_id = request.form.get('user_id', 0, type=int)
        crop_type = request.form.get('crop_type', 'rice')
        lat = request.form.get('lat')
        lon = request.form.get('lon')
        
        # 2. 保存文件
        relative_path, absolute_path = save_upload_file(file)
        
        if relative_path is None:
            return error('不支持的文件格式', 400)
        
        # 3. 执行病害识别
        detection_service = DetectionService()
        result = detection_service.recognize(absolute_path, crop_type)
        
        # 4. 提取识别结果
        if result['success']:
            detections = result['detections']
            annotated_path = result.get('annotated_path')
            
            if detections:
                main_disease = detections[0]['label']
                confidence = detections[0]['confidence']
            else:
                main_disease = '未检测到病害'
                confidence = 0.0
        else:
            detections = []
            annotated_path = None
            main_disease = f'识别失败: {result["error_msg"]}'
            confidence = 0.0
        
        # 5. 获取天气和地区信息
        location_weather = {}
        if lat and lon:
            try:
                weather_service = get_weather_service()
                weather_result = weather_service.get_weather_and_location(float(lat), float(lon))
                if weather_result.get('success'):
                    location_weather = {
                        'city': weather_result.get('city'),
                        'province': weather_result.get('province'),
                        'weather': weather_result.get('weather'),
                        'temperature': weather_result.get('temperature'),
                        'humidity': weather_result.get('humidity'),
                        'wind': weather_result.get('wind')
                    }
            except Exception as e:
                print(f"⚠️ 天气服务异常: {e}")
        
        # 6. 生成AI建议（如果有病害）
        ai_advice = None
        if main_disease and main_disease != '未检测到病害' and '失败' not in main_disease:
            try:
                # 提取天气信息
                weather_info = {
                    'weather': location_weather.get('weather'),
                    'temperature': location_weather.get('temperature'),
                    'humidity': location_weather.get('humidity')
                } if location_weather else None
                
                location_info = {
                    'city': location_weather.get('city'),
                    'province': location_weather.get('province')
                } if location_weather else None
                
                advice_result = generate_advice(
                    crop_type=crop_type,
                    disease_name=main_disease,
                    confidence=confidence,
                    weather_info=weather_info,
                    location_info=location_info
                )
                
                if advice_result['success']:
                    ai_advice = advice_result['advice']
                else:
                    ai_advice = f"AI建议生成失败: {advice_result['error']}"
                    print(f"⚠️ {ai_advice}")
            except Exception as e:
                ai_advice = f"AI服务暂时不可用: {str(e)}"
                print(f"⚠️ {ai_advice}")
        
        # 7. 转换标注图路径
        annotated_relative_path = None
        if annotated_path:
            base_dir = current_app.config.get('BASE_DIR', '')
            if annotated_path.startswith(base_dir):
                annotated_relative_path = annotated_path[len(base_dir)+1:].replace('\\', '/')
            else:
                annotated_relative_path = annotated_path.replace('\\', '/')
        
        # 8. 保存到数据库
        record = DetectionRecord(
            user_id=user_id,
            image_path=relative_path,
            annotated_image_path=annotated_relative_path,
            crop_type=crop_type,
            disease_name=main_disease,
            confidence=confidence,
            bbox_info=json.dumps(detections, ensure_ascii=False) if detections else None,
            weather_info=json.dumps(location_weather, ensure_ascii=False) if location_weather else None,
            ai_advice=ai_advice  # 新增：保存AI建议
        )
        db.session.add(record)
        db.session.commit()
        
        # 9. 生成URL
        base_url = app.config.get('API_BASE_URL', 'http://localhost:5000')
        image_url = f"{base_url}/{relative_path}".replace('\\', '/')
        annotated_url = f"{base_url}/{annotated_relative_path}".replace('\\', '/') if annotated_relative_path else None
        
        # 10. 返回结果
        return success({
            'record_id': record.id,
            'image_url': image_url,
            'annotated_image_url': annotated_url,
            'crop_type': crop_type,
            'disease_name': main_disease,
            'confidence': confidence,
            'detections': detections,
            'location_weather': location_weather,
            'ai_advice': ai_advice  # 返回AI建议
        }, '识别成功')