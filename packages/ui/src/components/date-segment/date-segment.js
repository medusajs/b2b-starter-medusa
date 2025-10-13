"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateSegment = void 0;
var React = require("react");
var react_aria_1 = require("react-aria");
var clx_1 = require("@/utils/clx");
var DateSegment = function (_a) {
    var segment = _a.segment, state = _a.state;
    var ref = React.useRef(null);
    var segmentProps = (0, react_aria_1.useDateSegment)(segment, state, ref).segmentProps;
    var isComma = segment.type === "literal" && segment.text === ", ";
    /**
     * We render an empty span with a margin to maintain the correct spacing
     * between date and time segments.
     */
    if (isComma) {
        return <span className="mx-1"/>;
    }
    return (
    /**
     * We wrap the segment in a span to prevent the segment from being
     * focused when the user clicks outside of the component.
     *
     * See: https://github.com/adobe/react-spectrum/issues/3164
     */
    <span>
      <div ref={ref} className={(0, clx_1.clx)("transition-fg outline-none", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
            "text-ui-fg-muted uppercase": segment.isPlaceholder,
            "text-ui-fg-muted": !segment.isEditable && !state.value,
        })} {...segmentProps}>
        {segment.text}
      </div>
    </span>);
};
exports.DateSegment = DateSegment;
