#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface OffgridSourceTextManager : RCTViewManager
@end

@implementation OffgridSourceTextManager

RCT_EXPORT_MODULE(OffgridSourceText)

- (UIView *)view {
  return [[UIView alloc] init];
}

@end

@interface OffgridSourceTextRunManager : RCTViewManager
@end

@implementation OffgridSourceTextRunManager

RCT_EXPORT_MODULE(OffgridSourceTextRun)

- (UIView *)view {
  return nil;
}

@end
