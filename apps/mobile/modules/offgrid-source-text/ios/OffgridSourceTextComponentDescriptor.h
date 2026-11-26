#pragma once

#include "OffgridSourceTextShadowNode.h"

#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {
using OffgridSourceTextComponentDescriptor =
    ConcreteComponentDescriptor<OffgridSourceTextShadowNode>;

void OffgridSourceTextSpec_registerComponentDescriptorsFromCodegen(
    std::shared_ptr<const ComponentDescriptorProviderRegistry> registry);
} // namespace facebook::react
