Pod::Spec.new do |s|
  s.name = 'OffgridVoiceTranscription'
  s.version = '1.0.0'
  s.summary = 'Local recording conversion for Offgrid dictation.'
  s.author = 'Offgrid'
  s.homepage = 'https://t3tools.com'
  s.platform = :ios, '18.0'
  s.source = { :path => '.' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.swift'
  s.frameworks = 'AudioToolbox'
end
