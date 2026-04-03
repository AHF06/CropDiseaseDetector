import requests
from flask import current_app


class WeatherService:
    """天气服务类 - 为AI提供上下文信息"""
    
    def __init__(self):
        self.api_key = None
        
    def _get_api_key(self):
        if self.api_key is None:
            self.api_key = current_app.config.get('AMAP_API_KEY', '')
        return self.api_key
    
    def get_weather_and_location(self, lat, lon):
        """
        根据经纬度获取天气和地区信息（用于AI上下文）
        
        参数:
            lat: 纬度
            lon: 经度
            
        返回:
            {
                'success': bool,
                'city': str,        # 城市名
                'province': str,    # 省份
                'weather': str,     # 天气状况（如：晴、多云、小雨）
                'temperature': str, # 当前温度（或温度范围）
                'humidity': str,    # 湿度
                'wind': str         # 风力
            }
        """
        api_key = self._get_api_key()
        
        if not api_key:
            return {
                'success': False,
                'error': '未配置高德API Key'
            }
        
        try:
            # 1. 通过经纬度获取城市信息
            geo_url = "https://restapi.amap.com/v3/geocode/regeo"
            geo_params = {
                "key": api_key,
                "location": f"{lon},{lat}",
                "extensions": "base"
            }
            
            geo_resp = requests.get(geo_url, params=geo_params, timeout=5)
            geo_data = geo_resp.json()
            
            if geo_data.get('status') != '1':
                return {
                    'success': False,
                    'error': f"地理编码失败: {geo_data.get('info', '未知错误')}"
                }
            
            # 提取城市信息
            address_component = geo_data.get('regeocode', {}).get('addressComponent', {})
            city = address_component.get('city', '')
            province = address_component.get('province', '')
            
            # 直辖市处理（如北京、上海）
            if not city:
                city = province
            
            # 获取adcode用于天气查询
            adcode = address_component.get('adcode', '')
            
            # 2. 获取天气信息
            weather_url = "https://restapi.amap.com/v3/weather/weatherInfo"
            weather_params = {
                "key": api_key,
                "city": adcode,
                "extensions": "base",  # base=实时天气，all=预报
                "output": "json"
            }
            
            weather_resp = requests.get(weather_url, params=weather_params, timeout=5)
            weather_data = weather_resp.json()
            
            if weather_data.get('status') != '1':
                return {
                    'success': False,
                    'city': city,
                    'province': province,
                    'weather': '未知',
                    'temperature': '未知',
                    'humidity': '未知',
                    'wind': '未知'
                }
            
            # 提取实时天气
            lives = weather_data.get('lives', [])
            if lives:
                live = lives[0]
                return {
                    'success': True,
                    'city': live.get('city', city),
                    'province': province,
                    'weather': live.get('weather', '未知'),
                    'temperature': live.get('temperature', '未知'),
                    'humidity': live.get('humidity', '未知'),
                    'wind': live.get('winddirection', '未知') + live.get('windpower', '') + '级'
                }
            else:
                return {
                    'success': False,
                    'city': city,
                    'province': province,
                    'weather': '未知',
                    'temperature': '未知',
                    'humidity': '未知',
                    'wind': '未知'
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': '请求超时'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


# 单例
_weather_service = None

def get_weather_service():
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service