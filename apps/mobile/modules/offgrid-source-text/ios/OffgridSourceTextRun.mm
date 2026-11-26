#import "OffgridSourceTextRun.h"
#import <React/RCTFabricComponentsPlugins.h>
#import "OffgridSourceTextRunComponentDescriptor.h"
#import <react/renderer/components/OffgridSourceTextSpec/Props.h>
#import <react/renderer/components/OffgridSourceTextSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface OffgridSourceTextRun () <RCTT3SourceTextRunViewProtocol>

@end

@implementation OffgridSourceTextRun {
  NSString *_text;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      OffgridSourceTextRunComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const OffgridSourceTextRunProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<OffgridSourceTextRunProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<OffgridSourceTextRunProps const>(props);

  if (newViewProps.text != oldViewProps.text) {
    NSString *text = [NSString stringWithUTF8String:newViewProps.text.c_str()];
    _text = text;
  }

  [super updateProps:props oldProps:oldProps];
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

Class<RCTComponentViewProtocol> OffgridSourceTextRunCls(void) {
  return OffgridSourceTextRun.class;
}

@end
