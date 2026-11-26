#pragma once

#include <react/renderer/components/OffgridSourceTextSpec/EventEmitters.h>
#include <react/renderer/components/OffgridSourceTextSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>
#include <react/renderer/core/ShadowNode.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>

namespace facebook::react {

extern const char OffgridSourceTextComponentName[];

class OffgridSourceTextStateReal final {
public:
  AttributedString attributedString;
};

class OffgridSourceTextShadowNode final
    : public ConcreteViewShadowNode<OffgridSourceTextComponentName,
                                    OffgridSourceTextProps, OffgridSourceTextEventEmitter,
                                    OffgridSourceTextStateReal> {
public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  OffgridSourceTextShadowNode(const ShadowNode &sourceShadowNode,
                         const ShadowNodeFragment &fragment);

  static ShadowNodeTraits BaseTraits() {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  void layout(LayoutContext layoutContext) override;

  Size
  measureContent(const LayoutContext &layoutContext,
                 const LayoutConstraints &layoutConstraints) const override;

private:
  mutable AttributedString _attributedString;
};
} // namespace facebook::react
