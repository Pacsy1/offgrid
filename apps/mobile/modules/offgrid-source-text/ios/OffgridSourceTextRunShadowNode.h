#pragma once

#include <react/renderer/components/OffgridSourceTextSpec/EventEmitters.h>
#include <react/renderer/components/OffgridSourceTextSpec/Props.h>
#include <react/renderer/components/OffgridSourceTextSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {
extern const char OffgridSourceTextRunComponentName[];

using OffgridSourceTextRunShadowNode =
    ConcreteViewShadowNode<OffgridSourceTextRunComponentName, OffgridSourceTextRunProps,
                           OffgridSourceTextRunEventEmitter, OffgridSourceTextRunState>;
} // namespace facebook::react
