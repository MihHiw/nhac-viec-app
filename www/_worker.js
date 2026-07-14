export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Nếu yêu cầu tải file APK
    if (url.pathname.endsWith('.apk')) {
      const response = await env.ASSETS.fetch(request);
      
      // Nếu file tồn tại, dán lại Thẻ căn cước chuẩn cho Android
      if (response.status === 200) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'application/vnd.android.package-archive');
        newHeaders.set('Content-Disposition', 'attachment; filename="NhacViec.apk"');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
      return response;
    }
    
    // Nếu là các file bình thường (HTML, CSS, JS), cứ trả về bình thường
    return env.ASSETS.fetch(request);
  }
};
