Pod::Spec.new do |s|
  s.name = 'OffgridWebSocket'
  s.version = '1.0.0'
  s.summary = 'WebSocket client with permessage-deflate for Offgrid mobile.'
  s.description = 'React Native ships SocketRocket on iOS, which never negotiates compression. This module dials the Offgrid server through URLSessionWebSocketTask, which offers permessage-deflate on its own.'
  s.author = 'Offgrid'
  s.homepage = 'https://t3tools.com'
  s.platform = :ios, '18.0'
  s.source = { :path => '.' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.swift'
end
