#pragma once

#include "OffgridSourceTextRunShadowNode.h"

#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {
using OffgridSourceTextRunComponentDescriptor =
    ConcreteComponentDescriptor<OffgridSourceTextRunShadowNode>;

void OffgridSourceTextRunSpec_registerComponentDescriptorsFromCodegen(
    std::shared_ptr<const ComponentDescriptorProviderRegistry> registry);
} // namespace facebook::react
