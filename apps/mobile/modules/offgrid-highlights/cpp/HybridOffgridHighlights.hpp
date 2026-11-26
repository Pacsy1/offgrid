#pragma once

#include "HybridOffgridHighlightsSpec.hpp"

namespace margelo::nitro::offgridhighlights {

class HybridOffgridHighlights : public HybridOffgridHighlightsSpec {
public:
  HybridOffgridHighlights() : HybridObject(TAG) {}

  std::optional<std::shared_ptr<ArrayBuffer>> tokenize(SourceText source,
                                                       double language) override;
};

} // namespace margelo::nitro::offgridhighlights
