from flask import request
from app.utils.response import success, error
from app.services.weather_service import get_weather_service


def register_weather_routes(app):
    
    @app.route('/api/weather', methods=['GET'])
    def get_weather():
        """
        获取天气信息接口
        
        参数:
            lat: 纬度
            lon: 经度
            
        返回:
            {
                'city': '武汉市',
                'weather': '晴',
                'temperature': '15~25℃',
                'tips': '农业建议'
            }
        """
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return error('缺少经纬度参数', 400)
        
        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return error('经纬度格式错误', 400)
        
        weather_service = get_weather_service()
        result = weather_service.get_weather_by_location(lat, lon)
        
        if not result.get('success'):
            return error(result.get('error', '获取天气失败'), 500)
        
        return success({
            'city': result.get('city'),
            'weather': result.get('weather'),
            'temperature': result.get('temperature'),
            'humidity': result.get('humidity'),
            'wind': result.get('wind'),
            'wind_power': result.get('wind_power'),
            'tomorrow_weather': result.get('tomorrow_weather'),
            'tomorrow_temp': result.get('tomorrow_temp'),
            'tips': result.get('tips'),
            'update_time': result.get('update_time')
        })
    
    @app.route('/api/weather/summary', methods=['GET'])
    def get_weather_summary():
        """
        获取天气摘要（简洁版）
        
        参数:
            lat: 纬度
            lon: 经度
        """
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not lat or not lon:
            return error('缺少经纬度参数', 400)
        
        weather_service = get_weather_service()
        result = weather_service.get_weather_summary(lat, lon)
        
        if not result.get('success'):
            return error(result.get('error', '获取天气失败'), 500)
        
        return success({
            'summary': result.get('summary'),
            'detail': result.get('detail')
        })